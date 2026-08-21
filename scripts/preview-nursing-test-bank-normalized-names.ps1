param(
  [Parameter(Mandatory = $true)]
  [string]$CleanupRoot,

  [Parameter(Mandatory = $true)]
  [string]$ManifestPath,

  [Parameter(Mandatory = $true)]
  [string]$GroupSlug,

  [string]$Vendor = "ATI",
  [string]$Program = "PN",
  [string]$PublicProgramLabel = $Program
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
  $value = $value -replace "\bPn\b", "PN"
  $value = $value -replace "\bLpn\b", "LPN"
  $value = $value -replace "\bNgn\b", "NGN"
  $value = $value -replace "\bIi\b", "II"
  $value = $value -replace "\bIii\b", "III"
  $value = $value -replace "\bIv\b", "IV"
  return ($value -replace "\s+", " ").Trim()
}

function Convert-ToSlug {
  param([string]$Value)

  $slug = $Value.ToLowerInvariant()
  $slug = $slug -replace "&", " and "
  $slug = $slug -replace "[^a-z0-9]+", "-"
  return $slug.Trim("-")
}

function Convert-ToDisplayTitle {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return ""
  }

  $protected = @{
    "ATI" = "ATI"
    "RN" = "RN"
    "PN" = "PN"
    "LPN" = "LPN"
    "NGN" = "NGN"
    "OB" = "OB"
    "IV" = "IV"
    "II" = "II"
    "III" = "III"
    "NUR" = "NUR"
    "NURS" = "NURS"
    "NSG" = "NSG"
    "NRSG" = "NRSG"
    "PPE" = "PPE"
  }

  $minorWords = @("a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "of", "on", "or", "the", "to", "with")
  $words = ($Value -replace "\s+", " ").Trim().Split(" ")
  $result = New-Object System.Collections.Generic.List[string]

  for ($index = 0; $index -lt $words.Count; $index++) {
    $word = $words[$index]
    $trimmed = $word.Trim()
    $punctPrefix = ""
    $punctSuffix = ""

    if ($trimmed -match "^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9]*)$") {
      $punctPrefix = $matches[1]
      $core = $matches[2]
      $punctSuffix = $matches[3]
    } else {
      $core = $trimmed
    }

    $upperCore = $core.ToUpperInvariant()
    $lowerCore = $core.ToLowerInvariant()

    if ($protected.ContainsKey($upperCore)) {
      $nextCore = $protected[$upperCore]
    } elseif ($index -gt 0 -and $index -lt ($words.Count - 1) -and $minorWords -contains $lowerCore) {
      $nextCore = $lowerCore
    } else {
      $nextCore = $core
    }

    $result.Add("$punctPrefix$nextCore$punctSuffix")
  }

  return (($result -join " ") -replace "\s+", " ").Trim()
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

function Normalize-TopicForTitle {
  param([string]$DestinationTopic)

  $topic = $DestinationTopic
  $topic = $topic -replace "^PN\s+", ""
  $topic = $topic -replace "^RN\s+", ""
  $topic = $topic -replace "\bAdult Medical Surgical\b", "Med Surg"
  $topic = $topic -replace "\bPediatric Nursing\b", "Pediatric Nursing"
  return ($topic -replace "\s+", " ").Trim()
}

function Normalize-SourceExamTitle {
  param(
    [string]$RawName,
    [string]$Vendor,
    [string]$PublicProgramLabel
  )

  $title = $RawName
  $title = $title -replace "[_\u00a0]+", " "
  $title = $title -replace "\s+", " "
  $title = $title -replace "\s+([,.;:)])", '$1'
  $title = $title -replace "([(])\s+", '$1'
  $title = $title.Trim(" -_")

  $title = Convert-ToTitleCase -Value $title

  $title = $title -replace "\bLPN\b", $PublicProgramLabel
  if ($PublicProgramLabel -eq "PN") {
    $title = $title -replace "\bRN\b", "PN"
  }
  $vendorPattern = [regex]::Escape($Vendor)
  $programPattern = [regex]::Escape($PublicProgramLabel)

  $title = $title -replace "\b$vendorPattern\s+$programPattern\s+$vendorPattern\s+$programPattern\b", "$Vendor $PublicProgramLabel"
  $title = $title -replace "\b$vendorPattern\s+$programPattern\s+RN\s+$vendorPattern\b", "$Vendor $PublicProgramLabel"
  $title = $title -replace "\b$vendorPattern\s+$programPattern\s+$vendorPattern\b", "$Vendor $PublicProgramLabel"
  $title = $title -replace "\b$vendorPattern\s+$programPattern\s+$programPattern\b", "$Vendor $PublicProgramLabel"
  $title = $title -replace "\bATI\s+PN\s+PN\b", "ATI PN"
  $title = $title -replace "\bATI\s+PN\s+LPN\b", "ATI PN"
  $title = $title -replace "\bATI\s+PN\s+ATI\b", "ATI PN"
  $title = $title -replace "\bATI\s+PN\s+RN\b", "ATI PN"
  $title = $title -replace "\bATI\s+LPN\s+LPN\b", "ATI $PublicProgramLabel"
  $title = $title -replace "^(LPN|PN|RN)\s+$vendorPattern\s+", "$Vendor $PublicProgramLabel "
  $title = $title -replace "^PN\s+", "$Vendor $PublicProgramLabel "
  $title = $title -replace "^RN\s+", "$Vendor $PublicProgramLabel "
  $title = $title -replace "\bPhamacology\b", "Pharmacology"
  $title = $title -replace "\bPaharmacology\b", "Pharmacology"
  $title = $title -replace "\bSpeciality\b", "Specialty"
  $title = $title -replace "\bPaediatrics\b", "Pediatrics"
  $title = $title -replace "\bPaediatric\b", "Pediatric"
  $title = $title -replace "\bOb\b", "OB"
  $title = $title -replace "\bVati\b", "VATI"
  $title = $title -replace "\bHesi\b", "HESI"
  $title = $title -replace "\bNs(?=\d)", "NS"
  $title = $title -replace "(?<=\d)Ns\b", "NS"
  $title = $title -replace "\bFa(?=\d)", "FA"
  $title = $title -replace "\bNurs\b", "NURS"
  $title = $title -replace "\bNur\b", "NUR"
  $title = $title -replace "\bNrsg\b", "NRSG"
  $title = $title -replace "\bNsg\b", "NSG"
  $title = $title -replace "\bWgu\b", "WGU"
  $title = $title -replace "\bNj\b", "NJ"
  $title = $title -replace "\bNy\b", "NY"
  $title = $title -replace "\bSp\b(?=\s+\d)", "SP"
  $title = $title -replace "\bProctored\s+Proctored\s+Exam\b", "Proctored Exam"

  if ($Vendor -eq "HESI") {
    # HESI RN pages already provide the vendor/program context at the start
    # of the public title. Remove redundant source-title tokens such as
    # "RN Medical Surgical HESI Proctored Exam" -> "Medical Surgical Proctored Exam".
    $title = $title -replace "^(RN|LPN|PN)\s+", ""
    $title = $title -replace "\s+\bHESI\b(?=\s+(Proctored|Practice|Final|Exit|Exam|Assessment))", ""
    $title = $title -replace "\bHESI\s+RN\s+HESI\s+RN\b", "HESI RN"
    $title = $title -replace "\bHESI\s+RN\s+RN\b", "HESI RN"
  }

  if ($title -match "\b$vendorPattern\b" -and $title -notmatch "\b$vendorPattern\s+(RN|PN|LPN)\b") {
    $title = $title -replace "\b$vendorPattern\b", "$Vendor $PublicProgramLabel"
  }

  if ($title -notmatch "\b$vendorPattern\b") {
    $title = "$Vendor $PublicProgramLabel $title"
  }

  $title = $title -replace "^$vendorPattern\s+$programPattern\s+$vendorPattern\s+$programPattern\s+", "$Vendor $PublicProgramLabel "
  $title = $title -replace "^$vendorPattern\s+$programPattern\s+RN\s+$vendorPattern\s+", "$Vendor $PublicProgramLabel "
  $title = $title -replace "^$vendorPattern\s+$programPattern\s+$vendorPattern\s+", "$Vendor $PublicProgramLabel "

  $title = $title -replace "\s+", " "
  $title = $title.Trim()

  if ($title -notmatch "\bPractice Questions\b$") {
    $title = "$title Practice Questions"
  }

  if ($Vendor -eq "HESI") {
    $title = $title -replace "^HESI\s+PN\s+", "HESI $PublicProgramLabel "
    $title = $title -replace "^HESI\s+$programPattern\s+Specialty\s+(LPN|PN|RN)\s+", "HESI $PublicProgramLabel Specialty "
    $title = $title -replace "^HESI\s+$programPattern\s+Capstone\s+(LPN|PN|RN)\s+", "HESI $PublicProgramLabel Capstone "
  }

  $title = $title -replace "\b(PN|RN|LPN)\s+(X\d+)\b", '$2'
  $title = $title -replace "\s+", " "

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
  if ($examNumberMatch.Success) {
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

  return [PSCustomObject]@{
    Modifier = (($modifierParts | Select-Object -Unique) -join " ").Trim()
    ExamType = $examType
  }
}

if (-not (Test-Path -LiteralPath $ManifestPath)) {
  throw "Manifest not found: $ManifestPath"
}

$duplicatePath = Join-Path $CleanupRoot "$GroupSlug-clean-name-duplicates.csv"
$duplicateKeys = @{}
if (Test-Path -LiteralPath $duplicatePath) {
  foreach ($row in Import-Csv -LiteralPath $duplicatePath) {
    $key = "$($row.destinationTopic)|$($row.sourceFolder)|$($row.sourceFileName)"
    $duplicateKeys[$key] = $row.duplicateKey
  }
}

$rows = Import-Csv -LiteralPath $ManifestPath |
  Where-Object { $_.action -ne "exclude" }

$preview = foreach ($row in $rows) {
  $sourceNumber = Get-SourceFileNumber -FileName $row.sourceFileName
  $rawBase = Get-BaseNameWithoutSourceNumber -FileName $row.sourceFileName
  $topicTitle = Normalize-TopicForTitle -DestinationTopic $row.destinationTopic
  $parts = Get-NormalizedExamParts -RawName $rawBase
  $publicTitle = Normalize-SourceExamTitle -RawName $rawBase -Vendor $Vendor -PublicProgramLabel $PublicProgramLabel
  $slug = Convert-ToSlug -Value $publicTitle
  $dupKey = "$($row.destinationTopic)|$($row.sourceFolder)|$($row.sourceFileName)"
  $isNameCollision = $duplicateKeys.ContainsKey($dupKey)
  $reviewReasons = New-Object System.Collections.Generic.List[string]

  if ($row.action -eq "review") {
    $reviewReasons.Add("manifest_action_review")
  }
  if ($isNameCollision) {
    $reviewReasons.Add("clean_name_collision:$($duplicateKeys[$dupKey])")
  }
  if ($row.destinationTopic -eq "Review Needed") {
    $reviewReasons.Add("topic_review_needed")
  }
  if ($row.action -eq "review" -and $row.notes) {
    $reviewReasons.Add($row.notes)
  }

  $setSuffix = ""
  if ($sourceNumber) {
    $setSuffix = " - Set $sourceNumber"
  }

  [PSCustomObject]@{
    action = $row.action
    needsReview = (($reviewReasons.Count -gt 0).ToString().ToLowerInvariant())
    reviewReason = (($reviewReasons | Select-Object -Unique) -join "; ")
    vendor = $Vendor
    program = $Program
    publicProgramLabel = $PublicProgramLabel
    sourceFolder = $row.sourceFolder
    sourceFileName = $row.sourceFileName
    sourceFileNumber = $sourceNumber
    sourceSubtopic = $row.sourceSubtopic
    sourceSubtopicSlug = $row.sourceSubtopicSlug
    sourceTopicId = $row.sourceTopicId
    destinationTopic = $row.destinationTopic
    normalizedTopic = $topicTitle
    previousName = $rawBase
    normalizedExamType = $parts.ExamType
    normalizedModifier = $parts.Modifier
    normalizedSetLabel = $(if ($sourceNumber) { "Set $sourceNumber" } else { "" })
    normalizationNotes = $row.notes
    publicQuizTitle = $publicTitle
    slug = $slug
    seoTitle = "$publicTitle | NursingMocks"
    cardLabel = "$Vendor $PublicProgramLabel $topicTitle$setSuffix"
    questionCount = $row.questionCount
    sourcePath = $row.sourcePath
    destinationPath = $row.destinationPath
  }
}

$titleCounts = @{}
foreach ($item in $preview) {
  $key = "$($item.vendor)|$($item.program)|$($item.publicQuizTitle)".ToLowerInvariant()
  if (-not $titleCounts.ContainsKey($key)) {
    $titleCounts[$key] = 0
  }
  $titleCounts[$key] += 1
}

$slugCounts = @{}
$preview = foreach ($item in $preview) {
  $titleKey = "$($item.vendor)|$($item.program)|$($item.publicQuizTitle)".ToLowerInvariant()
  $hasCleanNameCollision = $item.reviewReason -match "clean_name_collision"
  if (($titleCounts[$titleKey] -gt 1 -or $hasCleanNameCollision) -and $item.sourceFileNumber) {
    if ($item.publicQuizTitle -notmatch "\s-\sSet\s+\d+$") {
      $item.publicQuizTitle = "$($item.publicQuizTitle) - Set $($item.sourceFileNumber)"
      $item.slug = Convert-ToSlug -Value $item.publicQuizTitle
      $item.seoTitle = "$($item.publicQuizTitle) | NursingMocks"
    }
  }

  $slugKey = $item.slug.ToLowerInvariant()
  if (-not $slugCounts.ContainsKey($slugKey)) {
    $slugCounts[$slugKey] = 0
  }
  $slugCounts[$slugKey] += 1
  if ($slugCounts[$slugKey] -gt 1 -and $item.sourceFileNumber) {
    $item.slug = "$($item.slug)-set-$($item.sourceFileNumber)"
  }

  $item
}

$previewCsv = Join-Path $CleanupRoot "$GroupSlug-normalized-name-preview.csv"
$reviewCsv = Join-Path $CleanupRoot "$GroupSlug-normalized-name-review.csv"
$simpleCsv = Join-Path $CleanupRoot "$GroupSlug-normalized-name-review-simple.csv"
$summaryCsv = Join-Path $CleanupRoot "$GroupSlug-normalized-name-summary.csv"

$preview | Export-Csv -LiteralPath $previewCsv -NoTypeInformation -Encoding UTF8
$reviewRows = @($preview | Where-Object { $_.needsReview -eq "true" })
$reviewRows | Export-Csv -LiteralPath $reviewCsv -NoTypeInformation -Encoding UTF8
$reviewRows |
  Select-Object sourceFileName, destinationTopic, publicQuizTitle, slug, reviewReason, questionCount |
  Export-Csv -LiteralPath $simpleCsv -NoTypeInformation -Encoding UTF8

$summary = [PSCustomObject]@{
  groupSlug = $GroupSlug
  previewRows = @($preview).Count
  reviewRows = @($reviewRows).Count
  outputPreviewCsv = $previewCsv
  outputReviewCsv = $reviewCsv
  outputSimpleReviewCsv = $simpleCsv
}

$summary | Export-Csv -LiteralPath $summaryCsv -NoTypeInformation -Encoding UTF8
$summary

$reviewRows |
  Select-Object -First 25 sourceFileName, destinationTopic, publicQuizTitle, reviewReason |
  Format-Table -AutoSize
