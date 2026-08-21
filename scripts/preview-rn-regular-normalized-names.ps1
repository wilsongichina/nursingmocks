param(
  [string]$CleanupRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\REGULAR"
)

$ErrorActionPreference = "Stop"

function Convert-ToTitleCase {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) { return "" }

  $textInfo = [Globalization.CultureInfo]::GetCultureInfo("en-US").TextInfo
  $value = $Value.ToLowerInvariant()
  $value = $textInfo.ToTitleCase($value)
  $value = $value -replace "\bRn\b", "RN"
  $value = $value -replace "\bLpn\b", "LPN"
  $value = $value -replace "\bPn\b", "PN"
  $value = $value -replace "\bAti\b", "ATI"
  $value = $value -replace "\bHesi\b", "HESI"
  $value = $value -replace "\bNgn\b", "NGN"
  $value = $value -replace "\bIi\b", "II"
  $value = $value -replace "\bIii\b", "III"
  $value = $value -replace "\bIv\b", "IV"
  $value = $value -replace "\bOb\b", "OB"
  $value = $value -replace "\bWgu\b", "WGU"
  $value = $value -replace "\bNurs\b", "NURS"
  $value = $value -replace "\bNur\b", "NUR"
  $value = $value -replace "\bNrsg\b", "NRSG"
  $value = $value -replace "\bNsg\b", "NSG"
  $value = $value -replace "\bCleP\b", "CLEP"
  $value = $value -replace "\bNace\b", "NACE"
  return ($value -replace "\s+", " ").Trim()
}

function Convert-ToDisplayTitle {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) { return "" }

  $protected = @{
    "RN" = "RN"; "LPN" = "LPN"; "PN" = "PN"; "ATI" = "ATI"; "HESI" = "HESI";
    "NGN" = "NGN"; "OB" = "OB"; "IV" = "IV"; "II" = "II"; "III" = "III";
    "NUR" = "NUR"; "NURS" = "NURS"; "NSG" = "NSG"; "NRSG" = "NRSG";
    "WGU" = "WGU"; "CLEP" = "CLEP"; "NACE" = "NACE"; "ICU" = "ICU"
  }

  $minorWords = @("a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "of", "on", "or", "the", "to", "with")
  $words = ($Value -replace "\s+", " ").Trim().Split(" ")
  $result = New-Object System.Collections.Generic.List[string]

  for ($index = 0; $index -lt $words.Count; $index++) {
    $word = $words[$index].Trim()
    if ($word -match "^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$") {
      $prefix = $matches[1]
      $core = $matches[2]
      $suffix = $matches[3]
    } else {
      $prefix = ""
      $core = $word
      $suffix = ""
    }

    $upper = $core.ToUpperInvariant()
    $lower = $core.ToLowerInvariant()
    if ($protected.ContainsKey($upper)) {
      $next = $protected[$upper]
    } elseif ($index -gt 0 -and $index -lt ($words.Count - 1) -and $minorWords -contains $lower) {
      $next = $lower
    } else {
      $next = $core
    }

    $result.Add("$prefix$next$suffix")
  }

  return (($result -join " ") -replace "\s+", " ").Trim()
}

function Convert-ToSlug {
  param([string]$Value)

  $slug = $Value.ToLowerInvariant()
  $slug = $slug -replace "&", " and "
  $slug = $slug -replace "[^a-z0-9]+", "-"
  return ($slug -replace "^-+|-+$", "")
}

function Get-SourceFileNumber {
  param([string]$FileName)

  $match = [regex]::Match($FileName, "^(\d+)[-_\s]*")
  if ($match.Success) { return $match.Groups[1].Value }
  return ""
}

function Get-BaseNameWithoutSourceNumber {
  param([string]$FileName)

  $base = [IO.Path]::GetFileNameWithoutExtension($FileName)
  return (($base -replace "^\d+[-_\s]*", "") -replace "\s+", " ").Trim()
}

function Normalize-SourceTitle {
  param([string]$RawName)

  $title = $RawName
  $title = $title -replace "[_\u00a0]+", " "
  $title = $title -replace "\s+", " "
  $title = $title -replace "\s+([,.;:)])", '$1'
  $title = $title -replace "([(])\s+", '$1'
  $title = $title.Trim(" -_")
  $title = Convert-ToTitleCase -Value $title

  $title = $title -replace "\bPaharmacology\b", "Pharmacology"
  $title = $title -replace "\bPathophamacology\b", "Pathopharmacology"
  $title = $title -replace "\bPharmocology\b", "Pharmacology"
  $title = $title -replace "\bPaediatrics\b", "Pediatrics"
  $title = $title -replace "\bPaediatric\b", "Pediatric"
  $title = $title -replace "\bMed\s+Sug\b", "Med Surg"
  $title = $title -replace "\bMed\s+Surge\b", "Med Surg"
  $title = $title -replace "\bSurg\b", "Surg"
  $title = $title -replace "\bAldults\b", "Adults"
  $title = $title -replace "\bHellen\s+Fluid\b", "Hellen Fuld"
  $title = $title -replace "\bCollage\b", "College"
  $title = $title -replace "\bPennysilvania\b", "Pennsylvania"
  $title = $title -replace "\bExamplify\b", "Examplify"
  $title = $title -replace "\bProctored\s+Proctored\s+Exam\b", "Proctored Exam"
  $title = $title -replace "\bProctored\s+Exam\s+Proctored\s+Exam\b", "Proctored Exam"
  $title = $title -replace "\s+", " "
  $title = $title.Trim()

  if ($title -notmatch "\bPractice Questions\b$") {
    $title = "$title Practice Questions"
  }

  return Convert-ToDisplayTitle -Value $title
}

function Get-NormalizedExamParts {
  param([string]$RawName)

  $working = " $RawName "
  $working = $working -replace "[_\u00a0]+", " "
  $working = $working -replace "\s+", " "
  $working = $working.Trim()
  $lower = $working.ToLowerInvariant()
  $modifierParts = New-Object System.Collections.Generic.List[string]
  $examType = "Practice Questions"

  $yearMatch = [regex]::Match($working, "\b(2019|2020|2021|2022|2023|2024|2025|2026)\b")
  if ($yearMatch.Success) { $modifierParts.Add($yearMatch.Groups[1].Value) }

  if ($lower -match "\bngn\b") { $modifierParts.Add("NGN") }

  $retakeMatch = [regex]::Match($working, "\bretake\s*(\d+)\b", "IgnoreCase")
  if ($retakeMatch.Success) { $modifierParts.Add("Retake $($retakeMatch.Groups[1].Value)") }

  $assessmentMatch = [regex]::Match($working, "\bassessment\s*(\d+(?:\.\d+)?)?\b", "IgnoreCase")
  if ($assessmentMatch.Success -and $assessmentMatch.Groups[1].Value) {
    $modifierParts.Add("Assessment $($assessmentMatch.Groups[1].Value)")
  }

  $examNumberMatch = [regex]::Match($working, "\b(?:exam|proctored exam)\s*(\d+)\b", "IgnoreCase")
  if ($examNumberMatch.Success) { $modifierParts.Add("Exam $($examNumberMatch.Groups[1].Value)") }

  if ($lower -match "\bfinal\b") {
    $examType = "Final Proctored Exam"
  } elseif ($lower -match "\bmidterm\b") {
    $examType = "Midterm Proctored Exam"
  } elseif ($lower -match "\bquiz\b") {
    $examType = "Quiz"
  } elseif ($lower -match "\bassess") {
    $examType = "Assessment"
  } elseif ($lower -match "\bproctored\b") {
    $examType = "Proctored Exam"
  }

  foreach ($token in @("Capstone", "Benchmark", "Examplify", "WGU", "NACE", "CLEP")) {
    if ($working -match "\b$token\b") { $modifierParts.Add($token) }
  }

  return [pscustomobject]@{
    Modifier = (($modifierParts | Select-Object -Unique) -join " ").Trim()
    ExamType = $examType
  }
}

$manifestPath = Join-Path $CleanupRoot "rn-regular-cleanup-manifest.csv"
if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "Manifest not found: $manifestPath"
}

$rows = Import-Csv -LiteralPath $manifestPath | Where-Object { $_.action -eq "import" }

$preview = foreach ($row in $rows) {
  $sourceNumber = Get-SourceFileNumber -FileName $row.sourceFileName
  $rawBase = Get-BaseNameWithoutSourceNumber -FileName $row.sourceFileName
  $parts = Get-NormalizedExamParts -RawName $rawBase
  $publicTitle = Normalize-SourceTitle -RawName $rawBase
  $slug = Convert-ToSlug -Value $publicTitle
  $setLabel = if ($sourceNumber) { "Set $sourceNumber" } else { "" }
  $cardLabel = if ($setLabel) { "$($row.destinationTopic) - $setLabel" } else { $row.destinationTopic }

  [pscustomobject]@{
    action = $row.action
    needsReview = "false"
    reviewReason = ""
    group = "RN Nursing Course Exams"
    sourceFolder = $row.sourceFolder
    sourceFileName = $row.sourceFileName
    sourceFileNumber = $sourceNumber
    sourceSubtopic = $row.sourceSubtopic
    sourceSubtopicSlug = $row.sourceSubtopicSlug
    sourceTopicId = $row.sourceTopicId
    destinationTopic = $row.destinationTopic
    previousName = $rawBase
    normalizedExamType = $parts.ExamType
    normalizedModifier = $parts.Modifier
    normalizedSetLabel = $setLabel
    normalizationNotes = $row.notes
    publicQuizTitle = $publicTitle
    slug = $slug
    seoTitle = "$publicTitle | NursingMocks"
    cardLabel = $cardLabel
    questionCount = $row.questionCount
    sourcePath = $row.sourcePath
    destinationPath = $row.destinationPath
  }
}

$titleCounts = @{}
foreach ($item in $preview) {
  $key = $item.publicQuizTitle.ToLowerInvariant()
  if (-not $titleCounts.ContainsKey($key)) { $titleCounts[$key] = 0 }
  $titleCounts[$key] += 1
}

$slugCounts = @{}
$preview = foreach ($item in $preview) {
  $titleKey = $item.publicQuizTitle.ToLowerInvariant()
  if ($titleCounts[$titleKey] -gt 1 -and $item.sourceFileNumber) {
    if ($item.publicQuizTitle -notmatch "\s-\sSet\s+\d+$") {
      $item.publicQuizTitle = "$($item.publicQuizTitle) - Set $($item.sourceFileNumber)"
      $item.slug = Convert-ToSlug -Value $item.publicQuizTitle
      $item.seoTitle = "$($item.publicQuizTitle) | NursingMocks"
      $item.cardLabel = "$($item.destinationTopic) - Set $($item.sourceFileNumber)"
    }
  }

  $slugKey = $item.slug.ToLowerInvariant()
  if (-not $slugCounts.ContainsKey($slugKey)) { $slugCounts[$slugKey] = 0 }
  $slugCounts[$slugKey] += 1
  if ($slugCounts[$slugKey] -gt 1 -and $item.sourceFileNumber) {
    $item.slug = "$($item.slug)-set-$($item.sourceFileNumber)"
  }

  $item
}

$slugCollisionRows = @(
  $preview |
    Group-Object slug |
    Where-Object { $_.Count -gt 1 } |
    ForEach-Object {
      [pscustomobject]@{
        slug = $_.Name
        count = $_.Count
        files = ($_.Group.sourceFileName -join "; ")
        titles = ($_.Group.publicQuizTitle -join "; ")
      }
    }
)

$titleCollisionRows = @(
  $preview |
    Group-Object publicQuizTitle |
    Where-Object { $_.Count -gt 1 } |
    ForEach-Object {
      [pscustomobject]@{
        publicQuizTitle = $_.Name
        count = $_.Count
        files = ($_.Group.sourceFileName -join "; ")
        slugs = ($_.Group.slug -join "; ")
      }
    }
)

$reviewRows = @($preview | Where-Object { $_.needsReview -eq "true" })

$previewCsv = Join-Path $CleanupRoot "rn-regular-normalized-name-preview.csv"
$reviewCsv = Join-Path $CleanupRoot "rn-regular-normalized-name-review.csv"
$simpleReviewCsv = Join-Path $CleanupRoot "rn-regular-normalized-name-review-simple.csv"
$summaryCsv = Join-Path $CleanupRoot "rn-regular-normalized-name-summary.csv"
$slugCollisionCsv = Join-Path $CleanupRoot "rn-regular-normalized-slug-collisions.csv"
$titleCollisionCsv = Join-Path $CleanupRoot "rn-regular-normalized-title-collisions.csv"

$preview | Export-Csv -LiteralPath $previewCsv -NoTypeInformation -Encoding UTF8
$reviewRows | Export-Csv -LiteralPath $reviewCsv -NoTypeInformation -Encoding UTF8
$reviewRows |
  Select-Object sourceFileName, destinationTopic, publicQuizTitle, slug, reviewReason, questionCount |
  Export-Csv -LiteralPath $simpleReviewCsv -NoTypeInformation -Encoding UTF8
$slugCollisionRows | Export-Csv -LiteralPath $slugCollisionCsv -NoTypeInformation -Encoding UTF8
$titleCollisionRows | Export-Csv -LiteralPath $titleCollisionCsv -NoTypeInformation -Encoding UTF8

$summary = [pscustomobject]@{
  groupSlug = "rn-regular"
  previewRows = @($preview).Count
  reviewRows = @($reviewRows).Count
  slugCollisionRows = @($slugCollisionRows).Count
  titleCollisionRows = @($titleCollisionRows).Count
  outputPreviewCsv = $previewCsv
  outputReviewCsv = $reviewCsv
  outputSimpleReviewCsv = $simpleReviewCsv
  outputSlugCollisionCsv = $slugCollisionCsv
  outputTitleCollisionCsv = $titleCollisionCsv
}

$summary | Export-Csv -LiteralPath $summaryCsv -NoTypeInformation -Encoding UTF8
$summary
