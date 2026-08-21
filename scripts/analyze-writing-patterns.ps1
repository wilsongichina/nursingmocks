param(
  [Parameter(Mandatory = $true)]
  [string]$InputDocx,

  [string]$OutputDir = ".\tmp\writing-pattern-analysis"
)

$ErrorActionPreference = "Stop"

function Get-DocxParagraphs {
  param([string]$Path)

  Add-Type -AssemblyName System.IO.Compression

  $fs = [System.IO.File]::Open($Path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
  $zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Read, $false)

  try {
    $entry = $zip.GetEntry("word/document.xml")
    if (-not $entry) {
      $entry = $zip.GetEntry("word\document.xml")
    }
    if (-not $entry) {
      throw "Could not find Word document XML in $Path"
    }

    $reader = New-Object System.IO.StreamReader($entry.Open())
    $xmlText = $reader.ReadToEnd()
    $reader.Close()

    [xml]$xml = $xmlText
    $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

    $paragraphs = New-Object System.Collections.Generic.List[string]
    foreach ($p in $xml.SelectNodes("//w:body/w:p", $ns)) {
      $texts = New-Object System.Collections.Generic.List[string]
      foreach ($t in $p.SelectNodes(".//w:t", $ns)) {
        $texts.Add($t.InnerText)
      }

      $line = (($texts -join "") -replace "\s+", " ").Trim()
      if ($line) {
        $paragraphs.Add($line)
      }
    }

    return $paragraphs
  } finally {
    $zip.Dispose()
    $fs.Dispose()
  }
}

function Get-Words {
  param([string]$Text)

  return @([regex]::Matches($Text.ToLowerInvariant(), "\b[a-z][a-z']*\b") | ForEach-Object { $_.Value })
}

function Get-RiskLabel {
  param([int]$Score)

  if ($Score -ge 6) {
    return "High"
  }
  if ($Score -ge 3) {
    return "Medium"
  }
  return "Low"
}

function Convert-ToSnippet {
  param([string]$Text)

  $clean = ($Text -replace "\s+", " ").Trim()
  if ($clean.Length -gt 220) {
    return $clean.Substring(0, 217) + "..."
  }
  return $clean
}

$paragraphs = Get-DocxParagraphs -Path $InputDocx
$documentText = $paragraphs -join "`n"
$sentences = @([regex]::Split($documentText, "(?<=[.!?])\s+") | Where-Object { $_.Trim().Length -gt 0 })
$allWords = Get-Words -Text $documentText

$stopWords = @(
  "the", "and", "for", "that", "with", "this", "from", "are", "was", "you", "your", "will", "can", "has",
  "have", "not", "but", "they", "their", "into", "than", "then", "also", "when", "what", "which", "where",
  "how", "why", "who", "she", "him", "her", "his", "its", "our", "out", "all", "any", "each", "such",
  "more", "most", "some", "may", "use", "using", "about", "after", "before", "through", "within", "between",
  "because", "only", "one", "two", "three", "section", "page"
)

$topicTerms = @(
  "ati", "teas", "english", "language", "usage", "practice", "test", "questions", "question", "nursingmocks"
)

$llmPhrases = @(
  @{ phrase = "so you can"; reason = "common benefit connector"; weight = 2 },
  @{ phrase = "designed to help"; reason = "generic product-copy phrase"; weight = 4 },
  @{ phrase = "helps you"; reason = "generic benefit phrase"; weight = 2 },
  @{ phrase = "focused practice"; reason = "polished but generic education phrase"; weight = 2 },
  @{ phrase = "built for"; reason = "generic positioning phrase"; weight = 2 },
  @{ phrase = "this makes"; reason = "generic explanatory bridge"; weight = 2 },
  @{ phrase = "it is important"; reason = "common AI-style emphasis phrase"; weight = 4 },
  @{ phrase = "important to note"; reason = "common AI-style caveat phrase"; weight = 4 },
  @{ phrase = "not only"; reason = "balanced contrast formula"; weight = 2 },
  @{ phrase = "but also"; reason = "balanced contrast formula"; weight = 2 },
  @{ phrase = "in conclusion"; reason = "formulaic closing phrase"; weight = 5 },
  @{ phrase = "overall"; reason = "generic summary transition"; weight = 2 },
  @{ phrase = "furthermore"; reason = "formal transition often overused by LLMs"; weight = 3 },
  @{ phrase = "moreover"; reason = "formal transition often overused by LLMs"; weight = 3 },
  @{ phrase = "additionally"; reason = "formal transition often overused by LLMs"; weight = 2 },
  @{ phrase = "key component"; reason = "generic abstract phrase"; weight = 3 },
  @{ phrase = "strong foundation"; reason = "generic education phrase"; weight = 3 },
  @{ phrase = "students can"; reason = "common instructional benefit phrase"; weight = 2 },
  @{ phrase = "learners can"; reason = "common instructional benefit phrase"; weight = 2 }
)

$vagueTerms = @(
  "important", "essential", "comprehensive", "effective", "various", "several", "many", "key", "critical",
  "significant", "appropriate", "relevant", "helpful", "strong", "clear", "focused"
)

$ngramCounts = @{}
for ($size = 3; $size -le 8; $size++) {
  for ($i = 0; $i -le ($allWords.Count - $size); $i++) {
    $gramWords = @($allWords[$i..($i + $size - 1)])
    $nonStop = @($gramWords | Where-Object { $stopWords -notcontains $_ })
    if ($nonStop.Count -lt 2) {
      continue
    }

    $gram = $gramWords -join " "
    if (-not $ngramCounts.ContainsKey($gram)) {
      $ngramCounts[$gram] = 0
    }
    $ngramCounts[$gram] += 1
  }
}

$sequenceRows = New-Object System.Collections.Generic.List[object]
foreach ($entry in $ngramCounts.GetEnumerator() | Where-Object { $_.Value -ge 2 }) {
  $words = @($entry.Key -split " ")
  $topicWordCount = @($words | Where-Object { $topicTerms -contains $_ }).Count
  $vagueWordCount = @($words | Where-Object { $vagueTerms -contains $_ }).Count
  $score = 1
  $reasons = New-Object System.Collections.Generic.List[string]
  $reasons.Add("repeated $($entry.Value)x")

  if ($topicWordCount -ge 2) {
    $score += 1
    $reasons.Add("SEO/topic repetition")
  }
  if ($vagueWordCount -gt 0) {
    $score += 2
    $reasons.Add("vague/general wording")
  }
  foreach ($phrase in $llmPhrases) {
    if ($entry.Key -like "*$($phrase.phrase)*") {
      $score += [int]$phrase.weight
      $reasons.Add($phrase.reason)
    }
  }

  $sequenceRows.Add([PSCustomObject]@{
      sequence = $entry.Key
      count = $entry.Value
      risk = Get-RiskLabel -Score $score
      score = $score
      reason = ($reasons | Select-Object -Unique) -join "; "
    })
}

foreach ($phrase in $llmPhrases) {
  $count = [regex]::Matches($documentText.ToLowerInvariant(), [regex]::Escape($phrase.phrase)).Count
  if ($count -gt 0) {
    $score = [int]$phrase.weight
    if ($count -gt 1) {
      $score += 1
    }
    $sequenceRows.Add([PSCustomObject]@{
        sequence = $phrase.phrase
        count = $count
        risk = Get-RiskLabel -Score $score
        score = $score
        reason = $phrase.reason
      })
  }
}

$sentenceRows = New-Object System.Collections.Generic.List[object]
$index = 0
foreach ($sentence in $sentences) {
  $index += 1
  $sentenceText = ($sentence -replace "\s+", " ").Trim()
  $lower = $sentenceText.ToLowerInvariant()
  $words = Get-Words -Text $sentenceText
  $score = 0
  $reasons = New-Object System.Collections.Generic.List[string]

  foreach ($phrase in $llmPhrases) {
    if ($lower.Contains($phrase.phrase)) {
      $score += [int]$phrase.weight
      $reasons.Add($phrase.reason)
    }
  }

  $vagueHits = @($words | Where-Object { $vagueTerms -contains $_ }).Count
  if ($vagueHits -ge 2) {
    $score += 2
    $reasons.Add("multiple vague/general terms")
  } elseif ($vagueHits -eq 1) {
    $score += 1
    $reasons.Add("one vague/general term")
  }

  $topicHits = @($words | Where-Object { $topicTerms -contains $_ }).Count
  if ($topicHits -ge 5) {
    $score += 1
    $reasons.Add("dense SEO/topic phrase use")
  }

  if ($words.Count -ge 32) {
    $score += 1
    $reasons.Add("long explanatory sentence")
  }

  $repeatedSequences = @(
    $sequenceRows |
      Where-Object { $_.count -ge 3 -and $lower.Contains($_.sequence) } |
      Select-Object -First 3
  )
  if ($repeatedSequences.Count -gt 0) {
    $score += 1
    $reasons.Add("contains repeated document sequence")
  }

  if ($score -gt 0) {
    $sentenceRows.Add([PSCustomObject]@{
        sentenceNumber = $index
        risk = Get-RiskLabel -Score $score
        score = $score
        wordCount = $words.Count
        reason = ($reasons | Select-Object -Unique) -join "; "
        sentence = Convert-ToSnippet -Text $sentenceText
      })
  }
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$safeName = [IO.Path]::GetFileNameWithoutExtension($InputDocx) -replace "[^a-zA-Z0-9]+", "-"
$sequencePath = Join-Path $OutputDir "$safeName-sequence-flags.csv"
$sentencePath = Join-Path $OutputDir "$safeName-sentence-risk.csv"
$summaryPath = Join-Path $OutputDir "$safeName-summary.md"

$sequenceRows |
  Sort-Object @{ Expression = "score"; Descending = $true }, @{ Expression = "count"; Descending = $true }, "sequence" |
  Export-Csv -LiteralPath $sequencePath -NoTypeInformation -Encoding UTF8

$sentenceRows |
  Sort-Object @{ Expression = "score"; Descending = $true }, "sentenceNumber" |
  Export-Csv -LiteralPath $sentencePath -NoTypeInformation -Encoding UTF8

$highSequences = @($sequenceRows | Where-Object { $_.risk -eq "High" }).Count
$mediumSequences = @($sequenceRows | Where-Object { $_.risk -eq "Medium" }).Count
$highSentences = @($sentenceRows | Where-Object { $_.risk -eq "High" }).Count
$mediumSentences = @($sentenceRows | Where-Object { $_.risk -eq "Medium" }).Count

$summary = @(
  "# Writing Pattern Analysis",
  "",
  "Input: $InputDocx",
  "",
  "This report identifies LLM-like writing pattern risk. It does not prove AI authorship.",
  "",
  "## Summary",
  "",
  "- Paragraphs: $($paragraphs.Count)",
  "- Sentences: $($sentences.Count)",
  "- Words: $($allWords.Count)",
  "- High-risk sequences: $highSequences",
  "- Medium-risk sequences: $mediumSequences",
  "- High-risk sentences: $highSentences",
  "- Medium-risk sentences: $mediumSentences",
  "",
  "## Output Files",
  "",
  "- Sequence flags: $sequencePath",
  "- Sentence risk: $sentencePath"
) -join [Environment]::NewLine

Set-Content -LiteralPath $summaryPath -Value $summary -Encoding UTF8

[PSCustomObject]@{
  input = $InputDocx
  paragraphs = $paragraphs.Count
  sentences = $sentences.Count
  words = $allWords.Count
  highRiskSequences = $highSequences
  mediumRiskSequences = $mediumSequences
  highRiskSentences = $highSentences
  mediumRiskSentences = $mediumSentences
  sequenceFlagsCsv = (Resolve-Path -LiteralPath $sequencePath).Path
  sentenceRiskCsv = (Resolve-Path -LiteralPath $sentencePath).Path
  summaryMarkdown = (Resolve-Path -LiteralPath $summaryPath).Path
}
