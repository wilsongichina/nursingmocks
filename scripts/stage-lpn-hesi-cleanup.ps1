param(
  [string]$SourceRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\LPN\HESI",
  [string]$DestinationRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\HESI",
  [string]$SupplementalRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI\Excluded - HESI"
)

$ErrorActionPreference = "Stop"

function Get-DestinationDecision {
  param(
    [string]$Folder,
    [string]$File,
    [string]$Name
  )

  switch -Regex ($Folder) {
    "^1 - HESI Capstone$" {
      return @{ Destination = "Capstone"; Action = "import"; Notes = "" }
    }
    "^2 - Medical Surgical$" {
      return @{ Destination = "Medical Surgical"; Action = "import"; Notes = "" }
    }
    "^3 - Maternal Newborn$" {
      return @{ Destination = "Maternal Newborn"; Action = "import"; Notes = "" }
    }
    "^4 - Fundamentals$" {
      return @{ Destination = "Fundamentals"; Action = "import"; Notes = "" }
    }
    default {
      return @{ Destination = "Review Needed"; Action = "review"; Notes = "No placement rule matched." }
    }
  }
}

function Get-SupplementalDestinationDecision {
  param(
    [string]$File,
    [string]$Name
  )

  switch -Regex ($File) {
    "^5-HESI LPN phamacology proctored exam\.json$" {
      return @{ Destination = "Pharmacology"; Action = "import"; Notes = "Supplemental HESI-branded file recovered from LPN ATI excluded folder; import with LPN HESI Pharmacology." }
    }
    default {
      return @{ Destination = "Review Needed"; Action = "review"; Notes = "Supplemental HESI-branded file recovered from LPN ATI excluded folder; no placement rule matched." }
    }
  }
}

if (-not (Test-Path -LiteralPath $SourceRoot)) {
  throw "Source root not found: $SourceRoot"
}

New-Item -ItemType Directory -Path $DestinationRoot -Force | Out-Null

$manifest = New-Object System.Collections.Generic.List[object]
$topicFolders = Get-ChildItem -LiteralPath $SourceRoot -Directory | Sort-Object Name

foreach ($folderInfo in $topicFolders) {
  $folder = $folderInfo.Name
  $files = Get-ChildItem -LiteralPath $folderInfo.FullName -File -Filter "*.json" | Sort-Object Name

  foreach ($fileInfo in $files) {
    try {
      $json = Get-Content -LiteralPath $fileInfo.FullName -Raw | ConvertFrom-Json
      $subtopicName = [string]$json.subtopic.name
      $subtopicSlug = [string]$json.subtopic.slug
      $topicId = [string]$json.subtopic.topic_id
      $questions = [int]$json.totalQuestions
    } catch {
      $subtopicName = "PARSE ERROR"
      $subtopicSlug = ""
      $topicId = ""
      $questions = 0
    }

    $decision = Get-DestinationDecision -Folder $folder -File $fileInfo.Name -Name $subtopicName
    $destinationFolder = Join-Path $DestinationRoot $decision.Destination
    New-Item -ItemType Directory -Path $destinationFolder -Force | Out-Null

    $destinationPath = Join-Path $destinationFolder $fileInfo.Name
    Copy-Item -LiteralPath $fileInfo.FullName -Destination $destinationPath -Force

    $manifest.Add([PSCustomObject]@{
      action = $decision.Action
      destinationTopic = $decision.Destination
      sourceFolder = $folder
      sourceFileName = $fileInfo.Name
      sourcePath = $fileInfo.FullName
      destinationPath = $destinationPath
      sourceSubtopic = $subtopicName
      sourceSubtopicSlug = $subtopicSlug
      sourceTopicId = $topicId
      questionCount = $questions
      notes = $decision.Notes
    })
  }
}

if (Test-Path -LiteralPath $SupplementalRoot) {
  $supplementalFiles = Get-ChildItem -LiteralPath $SupplementalRoot -File -Filter "*.json" | Sort-Object Name

  foreach ($fileInfo in $supplementalFiles) {
    try {
      $json = Get-Content -LiteralPath $fileInfo.FullName -Raw | ConvertFrom-Json
      $subtopicName = [string]$json.subtopic.name
      $subtopicSlug = [string]$json.subtopic.slug
      $topicId = [string]$json.subtopic.topic_id
      $questions = [int]$json.totalQuestions
    } catch {
      $subtopicName = "PARSE ERROR"
      $subtopicSlug = ""
      $topicId = ""
      $questions = 0
    }

    $decision = Get-SupplementalDestinationDecision -File $fileInfo.Name -Name $subtopicName
    $destinationFolder = Join-Path $DestinationRoot $decision.Destination
    New-Item -ItemType Directory -Path $destinationFolder -Force | Out-Null

    $destinationPath = Join-Path $destinationFolder $fileInfo.Name
    Copy-Item -LiteralPath $fileInfo.FullName -Destination $destinationPath -Force

    $manifest.Add([PSCustomObject]@{
      action = $decision.Action
      destinationTopic = $decision.Destination
      sourceFolder = "Supplemental - LPN ATI Excluded HESI"
      sourceFileName = $fileInfo.Name
      sourcePath = $fileInfo.FullName
      destinationPath = $destinationPath
      sourceSubtopic = $subtopicName
      sourceSubtopicSlug = $subtopicSlug
      sourceTopicId = $topicId
      questionCount = $questions
      notes = $decision.Notes
    })
  }
}

$manifestCsv = Join-Path $DestinationRoot "lpn-hesi-cleanup-manifest.csv"
$manifestJson = Join-Path $DestinationRoot "lpn-hesi-cleanup-manifest.json"
$summaryCsv = Join-Path $DestinationRoot "lpn-hesi-cleanup-summary.csv"

$manifest | Export-Csv -LiteralPath $manifestCsv -NoTypeInformation -Encoding UTF8
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestJson -Encoding UTF8
$manifest |
  Group-Object destinationTopic, action |
  ForEach-Object {
    $first = $_.Group[0]
    [PSCustomObject]@{
      destinationTopic = $first.destinationTopic
      action = $first.action
      exams = $_.Count
      questions = ($_.Group | Measure-Object -Property questionCount -Sum).Sum
    }
  } |
  Sort-Object action, destinationTopic |
  Export-Csv -LiteralPath $summaryCsv -NoTypeInformation -Encoding UTF8

$rootJsonArtifacts = Get-ChildItem -LiteralPath $SourceRoot -File -Filter "*.json" | Sort-Object Name
$artifactCsv = Join-Path $DestinationRoot "lpn-hesi-root-json-artifacts.csv"
$rootJsonArtifacts |
  Select-Object Name, FullName, Length |
  Export-Csv -LiteralPath $artifactCsv -NoTypeInformation -Encoding UTF8

[PSCustomObject]@{
  sourceRoot = $SourceRoot
  destinationRoot = $DestinationRoot
  topicFolders = $topicFolders.Count
  stagedExamJsonFiles = $manifest.Count
  rootJsonArtifacts = $rootJsonArtifacts.Count
  supplementalRoot = $SupplementalRoot
  manifestCsv = $manifestCsv
  manifestJson = $manifestJson
  summaryCsv = $summaryCsv
  rootJsonArtifactsCsv = $artifactCsv
}
