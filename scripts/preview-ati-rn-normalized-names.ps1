param(
  [string]$CleanupRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\ATI",
  [string]$DestinationTopic = "Adult Medical Surgical"
)

$ErrorActionPreference = "Stop"

function Convert-ToTitleCase {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return ""
  }

  $textInfo = [Globalization.CultureInfo]::GetCultureInfo("en-US").TextInfo
  $value = $Value.ToLowerInvariant()
  $value = $textInfo.ToTitleCase($value)
  $value = $value -replace "\bAti\b", "ATI"
  $value = $value -replace "\bRn\b", "RN"
  $value = $value -replace "\bLpn\b", "LPN"
  $value = $value -replace "\bNgn\b", "NGN"
  return ($value -replace "\s+", " ").Trim()
}

function Get-SourceFileNumber {
  param([string]$FileName)

  $match = [regex]::Match($FileName, "^(\d+)[-_\s]*")
  if ($match.Success) {
    return $match.Groups[1].Value
  }

  return ""
}

function Get-BaseNameWithoutSourceNumber {
  param([string]$FileName)

  $base = [IO.Path]::GetFileNameWithoutExtension($FileName)
  return (($base -replace "^\d+[-_\s]*", "") -replace "\s+", " ").Trim()
}

function Convert-SourceTitleToPublicTitle {
  param([string]$RawName)

  $title = $RawName
  $title = $title -replace "[_\u00a0]+", " "
  $title = $title -replace "\s+", " "
  $title = $title -replace "\s+([,.;:)])", '$1'
  $title = $title -replace "([(])\s+", '$1'
  $title = $title.Trim(" -_")

  $title = Convert-ToTitleCase -Value $title

  $title = $title -replace "\bATI\b(?!\s+(RN|LPN)\b)", "ATI RN"
  $title = $title -replace "\bATI\s+RN\s+RN\b", "ATI RN"
  $title = $title -replace "\bNGN\b", "NGN"
  $title = $title -replace "\bVati\b", "VATI"
  $title = $title -replace "\bHesi\b", "HESI"
  $title = $title -replace "\bNurs\b", "NURS"
  $title = $title -replace "\bNur\b", "NUR"
  $title = $title -replace "\bNrsg\b", "NRSG"
  $title = $title -replace "\bNsg\b", "NSG"
  $title = $title -replace "\bNpro\b", "NPRO"
  $title = $title -replace "\bNurs(?=\d)", "NURS"
  $title = $title -replace "\bNur(?=\d)", "NUR"
  $title = $title -replace "\bNrsg(?=\d)", "NRSG"
  $title = $title -replace "\bNsg(?=\d)", "NSG"
  $title = $title -replace "\bNpro(?=\d)", "NPRO"
  $title = $title -replace "\bWgu\b", "WGU"
  $title = $title -replace "\bNj\b", "NJ"
  $title = $title -replace "\bSp\b(?=\s+\d{4}\b)", "SP"
  $title = $title -replace "\bWn\b", "WN"
  $title = $title -replace "\bProctored\s+Proctored\s+Exam\b", "Proctored Exam"
  $title = $title -replace "\s+", " "
  $title = $title.Trim()

  if ($title -notmatch "\bPractice Questions\b$") {
    $title = "$title Practice Questions"
  }

  return $title
}

function Normalize-TopicForTitle {
  param([string]$DestinationTopic)

  switch ($DestinationTopic) {
    "Adult Medical Surgical" { return "Med Surg" }
    default { return $DestinationTopic }
  }
}

function Normalize-ExamTypeAndModifier {
  param(
    [string]$RawName,
    [string]$TopicTitle
  )

  $working = " $RawName "
  $working = $working -replace "[_\u00a0]+", " "
  $working = $working -replace "\s+", " "
  $working = $working.Trim()

  $modifierParts = New-Object System.Collections.Generic.List[string]
  $examType = "Practice Questions"
  $lower = $working.ToLowerInvariant()

  $yearMatch = [regex]::Match($working, "\b(2019|2020|2021|2022|2023|2024|2025|2026)\b")
  if ($yearMatch.Success) {
    $modifierParts.Add($yearMatch.Groups[1].Value)
  }

  if ($lower -match "\bngn\b") {
    $modifierParts.Add("NGN")
  }

  $retakeMatch = [regex]::Match($working, "\bretake\s*(\d+)\b", "IgnoreCase")
  if ($retakeMatch.Success) {
    $modifierParts.Add("Retake $($retakeMatch.Groups[1].Value)")
  }

  $assessmentMatch = [regex]::Match($working, "\bassessment\s*(\d+)?\b", "IgnoreCase")
  if ($assessmentMatch.Success -and $assessmentMatch.Groups[1].Value) {
    $modifierParts.Add("Assessment $($assessmentMatch.Groups[1].Value)")
  }

  $examNumberMatch = [regex]::Match($working, "\b(?:exam|proctored exam)\s*(\d+)\b", "IgnoreCase")
  if ($examNumberMatch.Success -and -not ($modifierParts -contains "Exam $($examNumberMatch.Groups[1].Value)")) {
    $modifierParts.Add("Exam $($examNumberMatch.Groups[1].Value)")
  }

  if ($lower -match "\bfinal\b") {
    $examType = "Final Proctored Exam"
  } elseif ($lower -match "\bmidterm\b") {
    $examType = "Midterm Proctored Exam"
  } elseif ($lower -match "\bonline practice\b") {
    $examType = "Online Practice"
  } elseif ($lower -match "\bquiz\b") {
    $examType = "Quiz"
  } elseif ($lower -match "\bassess") {
    $examType = "Assessment"
  } elseif ($lower -match "\bproctored\b") {
    $examType = "Proctored Exam"
  }

  foreach ($token in @("Capstone", "VATI", "Benchmark", "Fletcher")) {
    if ($working -match "\b$token\b") {
      $modifierParts.Add($token)
    }
  }

  $modifier = (($modifierParts | Select-Object -Unique) -join " ").Trim()

  return [PSCustomObject]@{
    Modifier = $modifier
    ExamType = $examType
  }
}

function Convert-ToSlug {
  param([string]$Value)

  $slug = $Value.ToLowerInvariant()
  $slug = $slug -replace "&", " and "
  $slug = $slug -replace "[^a-z0-9]+", "-"
  return $slug.Trim("-")
}

$manifestPath = Join-Path $CleanupRoot "ati-rn-cleanup-manifest.csv"
if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "Manifest not found: $manifestPath"
}

$rows = Import-Csv -LiteralPath $manifestPath |
  Where-Object { $_.action -eq "import" -and $_.destinationTopic -eq $DestinationTopic }

$preview = foreach ($row in $rows) {
  $sourceNumber = Get-SourceFileNumber -FileName $row.sourceFileName
  $rawBase = Get-BaseNameWithoutSourceNumber -FileName $row.sourceFileName
  $topicTitle = Normalize-TopicForTitle -DestinationTopic $row.destinationTopic
  $parts = Normalize-ExamTypeAndModifier -RawName $rawBase -TopicTitle $topicTitle
  $publicTitle = Convert-SourceTitleToPublicTitle -RawName $rawBase
  $cardLabel = "ATI RN $topicTitle"

  [PSCustomObject]@{
    sourceFileName = $row.sourceFileName
    sourceSubtopic = $row.sourceSubtopic
    sourceFolder = $row.sourceFolder
    sourceFileNumber = $sourceNumber
    destinationTopic = $row.destinationTopic
    previousName = $rawBase
    normalizedPublicTitle = $publicTitle
    normalizedSlug = Convert-ToSlug -Value $publicTitle
    cardLabel = $cardLabel
    normalizedModifier = $parts.Modifier
    normalizedExamType = $parts.ExamType
    questionCount = $row.questionCount
  }
}

$titleCounts = @{}
foreach ($item in $preview) {
  $key = $item.normalizedPublicTitle.ToLowerInvariant()
  if (-not $titleCounts.ContainsKey($key)) {
    $titleCounts[$key] = 0
  }
  $titleCounts[$key] += 1
}

$preview = foreach ($item in $preview) {
  $key = $item.normalizedPublicTitle.ToLowerInvariant()
  if ($titleCounts[$key] -gt 1 -and $item.sourceFileNumber) {
    $item.normalizedPublicTitle = "$($item.normalizedPublicTitle) - Set $($item.sourceFileNumber)"
    $item.normalizedSlug = Convert-ToSlug -Value $item.normalizedPublicTitle
    $item.cardLabel = "$($item.cardLabel) - Set $($item.sourceFileNumber)"
  }
  $item
}

$safeTopic = Convert-ToSlug -Value $DestinationTopic
$outCsv = Join-Path $CleanupRoot "ati-rn-$safeTopic-normalized-name-preview.csv"
$preview | Export-Csv -LiteralPath $outCsv -NoTypeInformation -Encoding UTF8

[PSCustomObject]@{
  destinationTopic = $DestinationTopic
  rows = @($preview).Count
  outputCsv = $outCsv
}

$preview | Select-Object -First 25 sourceFileName, previousName, normalizedPublicTitle, normalizedSlug | Format-Table -AutoSize
