param(
  [Parameter(Mandatory = $true)]
  [string]$CleanupRoot,

  [Parameter(Mandatory = $true)]
  [string]$ManifestPath,

  [Parameter(Mandatory = $true)]
  [string]$GroupSlug
)

$ErrorActionPreference = "Stop"

function Convert-ToCleanName {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return ""
  }

  $clean = [IO.Path]::GetFileNameWithoutExtension($Value)
  $clean = $clean -replace "^\d+[-_\s]*", ""
  $clean = $clean -replace "[_\u00a0]+", " "
  $clean = $clean -replace "\b(proctored\s+exam|exam|quiz|assessment|test)\b", " "
  $clean = $clean -replace "\b(ati|pn|lpn|rn|ngn|updated)\b", " "
  $clean = $clean -replace "\b(2020|2021|2022|2023|2024|2025|2026)\b", " "
  $clean = $clean -replace "\s+", " "
  return $clean.Trim().ToLowerInvariant()
}

function Convert-ToQuestionSignature {
  param([object]$Json)

  $questions = $Json.questions

  if ($null -eq $questions) {
    return ""
  }

  $parts = New-Object System.Collections.Generic.List[string]

  foreach ($question in @($questions)) {
    $id = ""
    $text = ""

    if ($question.PSObject.Properties["id"]) {
      $id = [string]$question.id
    } elseif ($question.PSObject.Properties["questionId"]) {
      $id = [string]$question.questionId
    }

    foreach ($field in @("question", "questionText", "text", "stem", "prompt")) {
      if ($question.PSObject.Properties[$field] -and $question.$field) {
        $text = [string]$question.$field
        break
      }
    }

    $normalizedText = $text -replace "<[^>]+>", " "
    $normalizedText = $normalizedText -replace "[^A-Za-z0-9]+", " "
    $normalizedText = ($normalizedText -replace "\s+", " ").Trim().ToLowerInvariant()
    $parts.Add("$id::$normalizedText")
  }

  return ($parts -join "||")
}

if (-not (Test-Path -LiteralPath $CleanupRoot)) {
  throw "Cleanup root not found: $CleanupRoot"
}

if (-not (Test-Path -LiteralPath $ManifestPath)) {
  throw "Manifest not found: $ManifestPath"
}

$manifest = Import-Csv -LiteralPath $ManifestPath
$rows = New-Object System.Collections.Generic.List[object]

foreach ($row in $manifest) {
  if ($row.action -eq "exclude") {
    continue
  }

  if (-not (Test-Path -LiteralPath $row.destinationPath)) {
    $rows.Add([PSCustomObject]@{
      action = $row.action
      destinationTopic = $row.destinationTopic
      sourceFolder = $row.sourceFolder
      sourceFileName = $row.sourceFileName
      destinationPath = $row.destinationPath
      sourceSubtopic = $row.sourceSubtopic
      questionCount = [int]$row.questionCount
      fileHash = ""
      cleanName = Convert-ToCleanName -Value $row.sourceFileName
      questionSignature = ""
      parseStatus = "missing_file"
    })
    continue
  }

  $hash = (Get-FileHash -LiteralPath $row.destinationPath -Algorithm SHA256).Hash
  $questionSignature = ""
  $parseStatus = "ok"

  try {
    $json = Get-Content -LiteralPath $row.destinationPath -Raw | ConvertFrom-Json
    $questionSignature = Convert-ToQuestionSignature -Json $json
  } catch {
    $parseStatus = "parse_error"
  }

  $rows.Add([PSCustomObject]@{
    action = $row.action
    destinationTopic = $row.destinationTopic
    sourceFolder = $row.sourceFolder
    sourceFileName = $row.sourceFileName
    destinationPath = $row.destinationPath
    sourceSubtopic = $row.sourceSubtopic
    questionCount = [int]$row.questionCount
    fileHash = $hash
    cleanName = Convert-ToCleanName -Value $row.sourceFileName
    questionSignature = $questionSignature
    parseStatus = $parseStatus
  })
}

$exactDuplicateRows = $rows |
  Where-Object { $_.fileHash } |
  Group-Object fileHash |
  Where-Object { $_.Count -gt 1 } |
  ForEach-Object {
    $groupId = $_.Name
    foreach ($item in $_.Group) {
      [PSCustomObject]@{
        duplicateType = "exact_file_hash"
        duplicateKey = $groupId
        destinationTopic = $item.destinationTopic
        sourceFolder = $item.sourceFolder
        sourceFileName = $item.sourceFileName
        questionCount = $item.questionCount
        destinationPath = $item.destinationPath
      }
    }
  }

$cleanNameRows = $rows |
  Where-Object { $_.cleanName } |
  Group-Object cleanName |
  Where-Object { $_.Count -gt 1 } |
  ForEach-Object {
    $group = $_.Group
    $hashCount = @($group.fileHash | Where-Object { $_ } | Select-Object -Unique).Count
    $signatureCount = @($group.questionSignature | Where-Object { $_ } | Select-Object -Unique).Count
    foreach ($item in $group) {
      [PSCustomObject]@{
        duplicateType = if ($hashCount -eq 1) { "same_clean_name_same_hash" } elseif ($signatureCount -eq 1) { "same_clean_name_same_question_signature" } else { "same_clean_name_different_content" }
        duplicateKey = $_.Name
        destinationTopic = $item.destinationTopic
        sourceFolder = $item.sourceFolder
        sourceFileName = $item.sourceFileName
        questionCount = $item.questionCount
        fileHash = $item.fileHash
        destinationPath = $item.destinationPath
      }
    }
  }

$signatureDuplicateRows = $rows |
  Where-Object { $_.questionSignature } |
  Group-Object questionSignature |
  Where-Object { $_.Count -gt 1 } |
  ForEach-Object {
    $groupId = $_.Name
    foreach ($item in $_.Group) {
      [PSCustomObject]@{
        duplicateType = "same_question_signature"
        duplicateKey = $groupId.Substring(0, [Math]::Min(120, $groupId.Length))
        destinationTopic = $item.destinationTopic
        sourceFolder = $item.sourceFolder
        sourceFileName = $item.sourceFileName
        questionCount = $item.questionCount
        fileHash = $item.fileHash
        destinationPath = $item.destinationPath
      }
    }
  }

$summary = [PSCustomObject]@{
  groupSlug = $GroupSlug
  auditedRows = $rows.Count
  exactDuplicateGroups = @(($rows | Where-Object { $_.fileHash } | Group-Object fileHash | Where-Object { $_.Count -gt 1 })).Count
  exactDuplicateFiles = @($exactDuplicateRows).Count
  cleanNameDuplicateGroups = @(($rows | Where-Object { $_.cleanName } | Group-Object cleanName | Where-Object { $_.Count -gt 1 })).Count
  cleanNameDuplicateFiles = @($cleanNameRows).Count
  questionSignatureDuplicateGroups = @(($rows | Where-Object { $_.questionSignature } | Group-Object questionSignature | Where-Object { $_.Count -gt 1 })).Count
  questionSignatureDuplicateFiles = @($signatureDuplicateRows).Count
}

$auditRowsCsv = Join-Path $CleanupRoot "$GroupSlug-duplicate-audit-rows.csv"
$exactCsv = Join-Path $CleanupRoot "$GroupSlug-exact-content-duplicates.csv"
$cleanNameCsv = Join-Path $CleanupRoot "$GroupSlug-clean-name-duplicates.csv"
$signatureCsv = Join-Path $CleanupRoot "$GroupSlug-question-signature-duplicates.csv"
$summaryCsv = Join-Path $CleanupRoot "$GroupSlug-duplicate-audit-summary.csv"

$rows | Select-Object action,destinationTopic,sourceFolder,sourceFileName,sourceSubtopic,questionCount,fileHash,cleanName,parseStatus,destinationPath |
  Export-Csv -LiteralPath $auditRowsCsv -NoTypeInformation -Encoding UTF8

@($exactDuplicateRows) | Export-Csv -LiteralPath $exactCsv -NoTypeInformation -Encoding UTF8
@($cleanNameRows) | Export-Csv -LiteralPath $cleanNameCsv -NoTypeInformation -Encoding UTF8
@($signatureDuplicateRows) | Export-Csv -LiteralPath $signatureCsv -NoTypeInformation -Encoding UTF8
@($summary) | Export-Csv -LiteralPath $summaryCsv -NoTypeInformation -Encoding UTF8

[PSCustomObject]@{
  groupSlug = $GroupSlug
  cleanupRoot = (Resolve-Path -LiteralPath $CleanupRoot).Path
  auditedRows = $summary.auditedRows
  exactDuplicateGroups = $summary.exactDuplicateGroups
  cleanNameDuplicateGroups = $summary.cleanNameDuplicateGroups
  questionSignatureDuplicateGroups = $summary.questionSignatureDuplicateGroups
  auditRowsCsv = $auditRowsCsv
  exactCsv = $exactCsv
  cleanNameCsv = $cleanNameCsv
  signatureCsv = $signatureCsv
  summaryCsv = $summaryCsv
}
