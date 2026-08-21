param(
  [Parameter(Mandatory = $true)]
  [string]$SourceRoot,

  [Parameter(Mandatory = $true)]
  [string]$OutputRoot,

  [Parameter(Mandatory = $true)]
  [string]$GroupSlug
)

$ErrorActionPreference = "Stop"

function Get-JsonValue {
  param(
    [object]$Object,
    [string[]]$Path
  )

  $current = $Object

  foreach ($part in $Path) {
    if ($null -eq $current) {
      return $null
    }

    $property = $current.PSObject.Properties[$part]

    if ($null -eq $property) {
      return $null
    }

    $current = $property.Value
  }

  return $current
}

function Get-DetectedTerms {
  param([string]$Text)

  $terms = New-Object System.Collections.Generic.List[string]
  $checks = @(
    "ATI",
    "HESI",
    "LPN",
    "PN",
    "LVN",
    "RN",
    "CNA",
    "Phlebotomy",
    "NCLEX",
    "Kaplan"
  )

  foreach ($term in $checks) {
    if ($Text -match "\b$([regex]::Escape($term))\b") {
      $terms.Add($term)
    }
  }

  return (($terms | Select-Object -Unique) -join "; ")
}

if (-not (Test-Path -LiteralPath $SourceRoot)) {
  throw "Source root not found: $SourceRoot"
}

New-Item -ItemType Directory -Path $OutputRoot -Force | Out-Null

$sourceRootResolved = (Resolve-Path -LiteralPath $SourceRoot).Path
$topicFolders = @(Get-ChildItem -LiteralPath $sourceRootResolved -Directory | Sort-Object Name)
$inventory = New-Object System.Collections.Generic.List[object]
$parseErrors = New-Object System.Collections.Generic.List[object]

foreach ($folderInfo in $topicFolders) {
  $files = @(Get-ChildItem -LiteralPath $folderInfo.FullName -File -Filter "*.json" | Sort-Object Name)

  foreach ($fileInfo in $files) {
    $parseStatus = "ok"
    $parseError = ""
    $subtopicName = ""
    $subtopicSlug = ""
    $topicId = ""
    $questionCount = 0
    $questionArrayCount = 0

    try {
      $json = Get-Content -LiteralPath $fileInfo.FullName -Raw | ConvertFrom-Json
      $subtopicName = [string](Get-JsonValue -Object $json -Path @("subtopic", "name"))
      $subtopicSlug = [string](Get-JsonValue -Object $json -Path @("subtopic", "slug"))
      $topicId = [string](Get-JsonValue -Object $json -Path @("subtopic", "topic_id"))
      $questionCountValue = Get-JsonValue -Object $json -Path @("totalQuestions")

      if ($null -ne $questionCountValue) {
        $questionCount = [int]$questionCountValue
      }

      $questions = Get-JsonValue -Object $json -Path @("questions")

      if ($null -ne $questions) {
        $questionArrayCount = @($questions).Count
      }
    } catch {
      $parseStatus = "error"
      $parseError = $_.Exception.Message
      $parseErrors.Add([PSCustomObject]@{
        sourceFolder = $folderInfo.Name
        sourceFileName = $fileInfo.Name
        sourcePath = $fileInfo.FullName
        parseError = $parseError
      })
    }

    $combinedText = "$($folderInfo.Name) $($fileInfo.Name) $subtopicName $subtopicSlug $topicId"

    $inventory.Add([PSCustomObject]@{
      groupSlug = $GroupSlug
      sourceFolder = $folderInfo.Name
      sourceFileName = $fileInfo.Name
      sourcePath = $fileInfo.FullName
      relativePath = $fileInfo.FullName.Substring($sourceRootResolved.Length).TrimStart("\", "/")
      sourceSubtopic = $subtopicName
      sourceSubtopicSlug = $subtopicSlug
      sourceTopicId = $topicId
      totalQuestions = $questionCount
      questionArrayCount = $questionArrayCount
      jsonParseStatus = $parseStatus
      parseError = $parseError
      detectedTerms = Get-DetectedTerms -Text $combinedText
      fileLength = $fileInfo.Length
      lastWriteTime = $fileInfo.LastWriteTime.ToString("s")
    })
  }
}

$rootJsonArtifacts = @(Get-ChildItem -LiteralPath $sourceRootResolved -File -Filter "*.json" | Sort-Object Name)

$inventoryCsv = Join-Path $OutputRoot "$GroupSlug-source-inventory.csv"
$inventoryJson = Join-Path $OutputRoot "$GroupSlug-source-inventory.json"
$folderSummaryCsv = Join-Path $OutputRoot "$GroupSlug-source-folder-summary.csv"
$rootArtifactsCsv = Join-Path $OutputRoot "$GroupSlug-root-json-artifacts.csv"
$parseErrorsCsv = Join-Path $OutputRoot "$GroupSlug-parse-errors.csv"

$inventory | Export-Csv -LiteralPath $inventoryCsv -NoTypeInformation -Encoding UTF8
$inventory | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $inventoryJson -Encoding UTF8

$inventory |
  Group-Object sourceFolder |
  ForEach-Object {
    [PSCustomObject]@{
      sourceFolder = $_.Name
      files = $_.Count
      questions = ($_.Group | Measure-Object -Property totalQuestions -Sum).Sum
      parseErrors = @($_.Group | Where-Object { $_.jsonParseStatus -ne "ok" }).Count
      detectedTerms = (($_.Group.detectedTerms -split "; " | Where-Object { $_ } | Select-Object -Unique) -join "; ")
    }
  } |
  Sort-Object sourceFolder |
  Export-Csv -LiteralPath $folderSummaryCsv -NoTypeInformation -Encoding UTF8

$rootJsonArtifacts |
  Select-Object Name, FullName, Length, LastWriteTime |
  Export-Csv -LiteralPath $rootArtifactsCsv -NoTypeInformation -Encoding UTF8

$parseErrors | Export-Csv -LiteralPath $parseErrorsCsv -NoTypeInformation -Encoding UTF8

[PSCustomObject]@{
  groupSlug = $GroupSlug
  sourceRoot = $sourceRootResolved
  outputRoot = (Resolve-Path -LiteralPath $OutputRoot).Path
  sourceFolders = $topicFolders.Count
  jsonFiles = $inventory.Count
  rootJsonArtifacts = $rootJsonArtifacts.Count
  parseErrors = $parseErrors.Count
  inventoryCsv = $inventoryCsv
  inventoryJson = $inventoryJson
  folderSummaryCsv = $folderSummaryCsv
  rootArtifactsCsv = $rootArtifactsCsv
  parseErrorsCsv = $parseErrorsCsv
}
