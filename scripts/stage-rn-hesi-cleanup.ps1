param(
  [string]$SourceRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\HESI",
  [string]$DestinationRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\HESI",
  [string]$SupplementalRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\ATI\Excluded - HESI"
)

$ErrorActionPreference = "Stop"

function Get-DestinationDecision {
  param(
    [string]$Folder,
    [string]$File,
    [string]$Name
  )

  switch -Regex ($Folder) {
    "^1 - Hesi Medical Surgical$" {
      if ($Name -match "Dosage|Calculation" -or $File -match "Dosage|Calculation") {
        return @{ Destination = "Dosage Calculations"; Action = "import"; Notes = "Reviewed placement: dosage-calculation file inside Medical Surgical source folder mapped to Dosage Calculations." }
      }

      return @{ Destination = "Medical Surgical"; Action = "import"; Notes = "" }
    }
    "^2 - Hesi Biology$" {
      return @{ Destination = "Biology"; Action = "import"; Notes = "" }
    }
    "^3 - HESI Pediatric$" {
      return @{ Destination = "Pediatric Nursing"; Action = "import"; Notes = "" }
    }
    "^4 - HESI Pharmacology$" {
      return @{ Destination = "Pharmacology"; Action = "import"; Notes = "" }
    }
    "^5 - Nursing Specialty$" {
      return @{ Destination = "Specialty"; Action = "import"; Notes = "" }
    }
    "^6 - Nursing Research$" {
      return @{ Destination = "Nursing Research"; Action = "import"; Notes = "" }
    }
    "^7 - Nutrition$" {
      return @{ Destination = "Nutrition"; Action = "import"; Notes = "" }
    }
    "^8 - Hesi Dosage Calculations$" {
      return @{ Destination = "Dosage Calculations"; Action = "import"; Notes = "" }
    }
    "^9 - HESI Leadership$" {
      return @{ Destination = "Leadership"; Action = "import"; Notes = "" }
    }
    "^10 - RN HESI Mental Health$" {
      return @{ Destination = "Mental Health"; Action = "import"; Notes = "" }
    }
    "^11 - Hesi Cat$" {
      return @{ Destination = "CAT"; Action = "import"; Notes = "" }
    }
    "^12 - Nursing Fundamentals$" {
      return @{ Destination = "Fundamentals"; Action = "import"; Notes = "" }
    }
    "^13 - HESI Maternity$" {
      return @{ Destination = "Maternity"; Action = "import"; Notes = "" }
    }
    "^14 - HESI Management$" {
      return @{ Destination = "Management"; Action = "import"; Notes = "" }
    }
    "^15 - HESI Adult Health$" {
      return @{ Destination = "Adult Health"; Action = "import"; Notes = "" }
    }
    "^16 - HESI Community Health$" {
      return @{ Destination = "Community Health"; Action = "import"; Notes = "" }
    }
    "^17 - RN HESI HEALTH ASSESSMENT$" {
      return @{ Destination = "Health Assessment"; Action = "import"; Notes = "" }
    }
    "^18 - Foundations of Nursing$" {
      return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Foundations of Nursing source folder merged into Fundamentals." }
    }
    "^19 - Capstone$" {
      return @{ Destination = "Capstone"; Action = "import"; Notes = "" }
    }
    "^20 - Milestones$" {
      return @{ Destination = "Milestones"; Action = "import"; Notes = "" }
    }
    "^21 - Psychiatric Exam$" {
      return @{ Destination = "Mental Health"; Action = "import"; Notes = "Psychiatric Exam source folder merged into Mental Health." }
    }
    "^22 - Information Technology in Nursing$" {
      return @{ Destination = "Information Technology in Nursing"; Action = "import"; Notes = "" }
    }
    "^23 - Pathophysiology$" {
      return @{ Destination = "Pathophysiology"; Action = "import"; Notes = "" }
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
    "^2-HESI RN Adult Health 1 Proctored Exam \(WGU\)\.json$" {
      return @{ Destination = "Adult Health"; Action = "import"; Notes = "Supplemental HESI-branded file recovered from ATI RN excluded folder; text comparison showed low overlap with existing Adult Health files." }
    }
    "^5-Wgu hesi rn adult health.*proctored exam\.json$" {
      return @{ Destination = "Adult Health"; Action = "import"; Notes = "Supplemental HESI-branded file recovered from ATI RN excluded folder; no text-overlap match found in existing RN HESI cleanup set." }
    }
    "^2-Hesi rn foundation of nursing proctored exam\.json$" {
      return @{ Destination = "Duplicate Source - Do Not Import"; Action = "duplicate"; Notes = "Supplemental HESI-branded file has same filename as an existing Fundamentals file and high text overlap with an uploaded Medical Surgical file; do not import." }
    }
    default {
      return @{ Destination = "Review Needed"; Action = "review"; Notes = "Supplemental HESI-branded file recovered from ATI RN excluded folder; no placement rule matched." }
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
      sourceFolder = "Supplemental - ATI RN Excluded HESI"
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

$manifestCsv = Join-Path $DestinationRoot "rn-hesi-cleanup-manifest.csv"
$manifestJson = Join-Path $DestinationRoot "rn-hesi-cleanup-manifest.json"
$summaryCsv = Join-Path $DestinationRoot "rn-hesi-cleanup-summary.csv"

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
$artifactCsv = Join-Path $DestinationRoot "rn-hesi-root-json-artifacts.csv"
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
