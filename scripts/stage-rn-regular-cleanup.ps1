param(
  [string]$SourceRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\REGULAR",
  [string]$DestinationRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\REGULAR"
)

$ErrorActionPreference = "Stop"

function Get-JsonInfo {
  param([string]$Path)

  try {
    $json = Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
    $questions = 0
    $subtopicName = ""
    $subtopicSlug = ""
    $topicId = ""

    if ($json -is [array]) {
      $questions = @($json).Count
      if ($questions -gt 0) {
        $first = $json[0]
        if ($first.PSObject.Properties.Name -contains "topic_id") { $topicId = [string]$first.topic_id }
      }
    } elseif ($null -ne $json.questions) {
      $questions = @($json.questions).Count
      if ($json.PSObject.Properties.Name -contains "subtopic" -and $null -ne $json.subtopic) {
        $subtopicName = [string]$json.subtopic.name
        $subtopicSlug = [string]$json.subtopic.slug
        $topicId = [string]$json.subtopic.topic_id
      } elseif ($json.PSObject.Properties.Name -contains "topic_id") {
        $topicId = [string]$json.topic_id
      }
    } else {
      if ($json.PSObject.Properties.Name -contains "totalQuestions") { $questions = [int]$json.totalQuestions }
      if ($json.PSObject.Properties.Name -contains "subtopic" -and $null -ne $json.subtopic) {
        $subtopicName = [string]$json.subtopic.name
        $subtopicSlug = [string]$json.subtopic.slug
        $topicId = [string]$json.subtopic.topic_id
      }
    }

    return @{
      ParseStatus = "ok"
      QuestionCount = $questions
      SubtopicName = $subtopicName
      SubtopicSlug = $subtopicSlug
      TopicId = $topicId
      Error = ""
    }
  } catch {
    return @{
      ParseStatus = "error"
      QuestionCount = 0
      SubtopicName = "PARSE ERROR"
      SubtopicSlug = ""
      TopicId = ""
      Error = $_.Exception.Message
    }
  }
}

function Get-FolderDecision {
  param([string]$Folder)

  switch -Regex ($Folder) {
    "^1 - Multidimensional care$" {
      return @{ Destination = "Multidimensional Care"; Action = "import"; Notes = "Course-based RN nursing content." }
    }
    "^2 - Pathophysiology$" {
      return @{ Destination = "Pathophysiology"; Action = "import"; Notes = "Course-based pathophysiology content." }
    }
    "^3 - Endocrinology$" {
      return @{ Destination = "Endocrinology"; Action = "import"; Notes = "Endocrine course content." }
    }
    "^4 - Perfusion$" {
      return @{ Destination = "Perfusion"; Action = "import"; Notes = "Perfusion/cardiovascular assessment content." }
    }
    "^5 - Gastrointestinal System$" {
      return @{ Destination = "Gastrointestinal System"; Action = "import"; Notes = "GI system course content." }
    }
    "^6 - ICU Cardiac, Respiratory, Neuro, Renal, Shock Skills$" {
      return @{ Destination = "Critical Care"; Action = "import"; Notes = "ICU/shock skills merged into Critical Care." }
    }
    "^7 - Gastro Urinary Systems Medication$" {
      return @{ Destination = "Review Needed\Duplicate Review - Gastrointestinal System"; Action = "review-duplicate"; Notes = "Likely duplicate/overlap with Gastrointestinal System; hold for duplicate check." }
    }
    "^8 - Kaplan Admission Tests$" {
      return @{ Destination = "Excluded - Already Uploaded\Kaplan Admission Tests"; Action = "exclude"; Notes = "Kaplan Admission Tests are excluded because Kaplan has already been uploaded." }
    }
    "^9 - Pharmacology$" {
      return @{ Destination = "Pharmacology"; Action = "import"; Notes = "Pharmacology/pathopharmacology/medication-safety content." }
    }
    "^10 - Medical-Surgical$" {
      return @{ Destination = "Medical Surgical"; Action = "import"; Notes = "Medical-surgical RN course content." }
    }
    "^11 - Adult Health$" {
      return @{ Destination = "Adult Health"; Action = "import"; Notes = "Adult/gerontology/adult-care content." }
    }
    "^12 - Fundamentals$" {
      return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Fundamentals/basic nursing content." }
    }
    "^13 - Maternal Newborn$" {
      return @{ Destination = "Maternal Newborn"; Action = "import"; Notes = "Maternity, newborn, and childbearing-family content." }
    }
    "^14 - Anatomy and Physiology$" {
      return @{ Destination = "Anatomy and Physiology"; Action = "import"; Notes = "Anatomy and physiology support content." }
    }
    "^15 - Pediatrics$" {
      return @{ Destination = "Pediatrics"; Action = "import"; Notes = "Pediatric nursing and child health content." }
    }
    "^16 - Community Health$" {
      return @{ Destination = "Community Health"; Action = "import"; Notes = "Community/public health nursing content." }
    }
    "^17 - Promoting Health across the lifespan ATI Exams$" {
      return @{ Destination = "Review Needed\Vendor Review - Health Promotion Across the Lifespan"; Action = "review"; Notes = "ATI appears in the source folder name; hold for classification." }
    }
    "^18 - Mental Health$" {
      return @{ Destination = "Mental Health"; Action = "import"; Notes = "Psychiatric/mental-health course content." }
    }
    "^19 - Dosage Calculations$" {
      return @{ Destination = "Dosage Calculations"; Action = "import"; Notes = "Medication math and dosage-calculation content." }
    }
    "^20 - Nursing Specialty$" {
      return @{ Destination = "Nursing Specialty"; Action = "import"; Notes = "Mixed/specialty RN course content." }
    }
    "^21 - Foundations of Nursing$" {
      return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Foundations of Nursing source folder merged into Fundamentals." }
    }
    "^22 - Life Science$" {
      return @{ Destination = "Review Needed\Support Science - Life Science"; Action = "review"; Notes = "Support science content; hold for inclusion decision." }
    }
    "^23 - Nutrition$" {
      return @{ Destination = "Nutrition"; Action = "import"; Notes = "Nutrition course content." }
    }
    "^24 - Leadership$" {
      return @{ Destination = "Leadership"; Action = "import"; Notes = "Leadership and management content." }
    }
    "^25 - Dimensions of Nursing Practice$" {
      return @{ Destination = "Dimensions of Nursing Practice"; Action = "import"; Notes = "Professional practice/SBAR/dimensions content." }
    }
    "^26 - Nursing of Women and Childbearing$" {
      return @{ Destination = "Maternal Newborn"; Action = "import"; Notes = "Nursing of Women and Childbearing merged into Maternal Newborn." }
    }
    "^27 - Applying the nursing process to alterations in health$" {
      return @{ Destination = "Review Needed\Nursing Process and Alterations in Health"; Action = "review"; Notes = "Mixed nursing process and alterations content; hold for file-level placement." }
    }
    "^28 - Health Assessment$" {
      return @{ Destination = "Health Assessment"; Action = "import"; Notes = "Health assessment content." }
    }
    "^29 - Management of Care for Adults$" {
      return @{ Destination = "Adult Health"; Action = "import"; Notes = "Management of Care for Adults merged into Adult Health." }
    }
    "^30 - Critical Care$" {
      return @{ Destination = "Critical Care"; Action = "import"; Notes = "Critical care med-surg content." }
    }
    "^31 - Growth and Development$" {
      return @{ Destination = "Review Needed\Support Development - Growth and Development"; Action = "review"; Notes = "Support/development content; hold for inclusion decision." }
    }
    "^32 - Microbiology$" {
      return @{ Destination = "Review Needed\Support Science - Microbiology"; Action = "review"; Notes = "Support science content; hold for inclusion decision." }
    }
    default {
      return @{ Destination = "Review Needed\Unmapped"; Action = "review"; Notes = "No source-folder placement rule matched." }
    }
  }
}

function Apply-FileOverride {
  param(
    [hashtable]$Decision,
    [string]$Folder,
    [string]$File,
    [int]$QuestionCount
  )

  if ($QuestionCount -le 0) {
    return @{ Destination = "Excluded - Empty Files"; Action = "exclude"; Notes = "Zero-question JSON file; exclude unless repairable content is found." }
  }

  if ($File -match "Kaplan" -or $Folder -match "Kaplan") {
    return @{ Destination = "Excluded - Already Uploaded\Kaplan"; Action = "exclude"; Notes = "Kaplan content excluded because Kaplan has already been uploaded." }
  }

  if ($File -match "(?i)(^|[^a-z])ati([^a-z]|$)" -or $Folder -match "(?i)(^|[^a-z])ati([^a-z]|$)") {
    return @{ Destination = "Review Needed\Vendor Review - ATI Titled"; Action = "review"; Notes = "ATI-titled file/folder inside RN REGULAR; hold for classification." }
  }

  if ($File -match "\bLPN\b|\bPN\b|Lpn|lpn|pn ") {
    return @{ Destination = "Review Needed\Program Review - LPN or PN Titled"; Action = "review"; Notes = "LPN/PN-titled file inside RN source; hold for program classification." }
  }

  if ($File -match "\bNACE\b|NACE" -or $File -match "\bCLEP\b|CLEP") {
    return @{ Destination = "Review Needed\Credential or Support Review"; Action = "review"; Notes = "NACE/CLEP-titled file; hold for classification." }
  }

  return $Decision
}

if (-not (Test-Path -LiteralPath $SourceRoot)) {
  throw "Source root not found: $SourceRoot"
}

New-Item -ItemType Directory -Path $DestinationRoot -Force | Out-Null

$resolvedDestination = (Resolve-Path -LiteralPath $DestinationRoot).Path
if ($resolvedDestination -ne "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\REGULAR") {
  throw "Refusing to clean unexpected destination root: $resolvedDestination"
}

Get-ChildItem -LiteralPath $DestinationRoot -Directory | Remove-Item -Recurse -Force

$manifest = New-Object System.Collections.Generic.List[object]
$topicFolders = Get-ChildItem -LiteralPath $SourceRoot -Directory | Sort-Object Name

foreach ($folderInfo in $topicFolders) {
  $folder = $folderInfo.Name
  $files = Get-ChildItem -LiteralPath $folderInfo.FullName -File -Filter "*.json" | Sort-Object Name

  foreach ($fileInfo in $files) {
    $jsonInfo = Get-JsonInfo -Path $fileInfo.FullName
    $decision = Get-FolderDecision -Folder $folder
    $decision = Apply-FileOverride -Decision $decision -Folder $folder -File $fileInfo.Name -QuestionCount $jsonInfo.QuestionCount

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
      sourceSubtopic = $jsonInfo.SubtopicName
      sourceSubtopicSlug = $jsonInfo.SubtopicSlug
      sourceTopicId = $jsonInfo.TopicId
      questionCount = $jsonInfo.QuestionCount
      parseStatus = $jsonInfo.ParseStatus
      parseError = $jsonInfo.Error
      notes = $decision.Notes
    })
  }
}

$manifestCsv = Join-Path $DestinationRoot "rn-regular-cleanup-manifest.csv"
$manifestJson = Join-Path $DestinationRoot "rn-regular-cleanup-manifest.json"
$summaryCsv = Join-Path $DestinationRoot "rn-regular-cleanup-summary.csv"
$artifactCsv = Join-Path $DestinationRoot "rn-regular-root-json-artifacts.csv"

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

Get-ChildItem -LiteralPath $SourceRoot -File |
  Select-Object Name, FullName, Extension, Length |
  Export-Csv -LiteralPath $artifactCsv -NoTypeInformation -Encoding UTF8

[PSCustomObject]@{
  sourceRoot = $SourceRoot
  destinationRoot = $DestinationRoot
  topicFolders = $topicFolders.Count
  stagedExamJsonFiles = $manifest.Count
  importFiles = @($manifest | Where-Object action -eq "import").Count
  reviewFiles = @($manifest | Where-Object { $_.action -match "review" }).Count
  excludedFiles = @($manifest | Where-Object action -eq "exclude").Count
  manifestCsv = $manifestCsv
  manifestJson = $manifestJson
  summaryCsv = $summaryCsv
  rootJsonArtifactsCsv = $artifactCsv
}
