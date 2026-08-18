param(
  [string]$SourceRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\LPN\ATI",
  [string]$DestinationRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI"
)

$ErrorActionPreference = "Stop"

function Get-DestinationDecision {
  param(
    [string]$Folder,
    [string]$File,
    [string]$Name
  )

  if ($Name -match "\bHESI\b" -or $File -match "\bHESI\b") {
    return @{
      Destination = "Excluded - HESI"
      Action = "exclude"
      Notes = "HESI-branded file found inside LPN ATI source folder; exclude from ATI import and review with LPN HESI."
    }
  }

  switch -Regex ($Folder) {
    "^1 - Nursing Fundamentals$" {
      return @{ Destination = "Fundamentals"; Action = "import"; Notes = "" }
    }
    "^2 - Maternity$" {
      if ($Name -match "Nursing Care of Children|Pediatric|Paediatric" -or $File -match "Nursing Care of Children|Pediatric|Paediatric") {
        return @{ Destination = "Pediatric Nursing"; Action = "import"; Notes = "Reviewed placement: child-care content inside Maternity source folder mapped to Pediatric Nursing." }
      }

      if ($Name -match "\bRN\b" -or $File -match "\bRn\b|\bRN\b") {
        return @{ Destination = "Maternal Newborn"; Action = "import"; Notes = "Reviewed placement: file has RN in title but content and source folder are Maternal Newborn." }
      }

      return @{ Destination = "Maternal Newborn"; Action = "import"; Notes = "" }
    }
    "^3 - Capstone Proctored Comprehensive Assessment$" {
      return @{ Destination = "Comprehensive Review"; Action = "import"; Notes = "" }
    }
    "^4 - Medical Surgical$" {
      if ($Name -match "Leadership|Management" -or $File -match "Leadership|Management") {
        return @{ Destination = "Management"; Action = "import"; Notes = "Reviewed placement: leadership/management content inside Medical Surgical source folder mapped to Management." }
      }

      if ($Name -match "Pharm|Medication" -or $File -match "Pharm|Medication") {
        return @{ Destination = "Pharmacology"; Action = "import"; Notes = "Reviewed placement: pharmacology competency content inside Medical Surgical source folder mapped to Pharmacology." }
      }

      if ($Name -match "Geriatric|Gerontology" -or $File -match "Geriatric|Gerontology") {
        return @{ Destination = "Gerontology"; Action = "import"; Notes = "Reviewed placement: geriatric content inside Medical Surgical source folder mapped to Gerontology." }
      }

      return @{ Destination = "Adult Medical Surgical"; Action = "import"; Notes = "" }
    }
    "^5 - Gastrointestinal disorders$" {
      return @{ Destination = "No Import - Empty Source Folder"; Action = "empty"; Notes = "Source folder had no JSON files during inventory." }
    }
    "^6 - Postpartum AMD Newborn Care$" {
      return @{ Destination = "No Import - Empty Source Folder"; Action = "empty"; Notes = "Source folder had no JSON files during inventory." }
    }
    "^7 - Mental Health$" {
      return @{ Destination = "Mental Health"; Action = "import"; Notes = "" }
    }
    "^8 - PN Pharmacology$" {
      return @{ Destination = "Pharmacology"; Action = "import"; Notes = "" }
    }
    "^9 - PN Mobility$" {
      return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Mobility source folder mapped to Fundamentals/Safety context." }
    }
    "^10 - Dosage Calculations$" {
      return @{ Destination = "Dosage Calculations"; Action = "import"; Notes = "" }
    }
    "^11 - Management$" {
      return @{ Destination = "Management"; Action = "import"; Notes = "" }
    }
    "^12 - PN Pediatrics$" {
      return @{ Destination = "Pediatric Nursing"; Action = "import"; Notes = "ATI current wording is Pediatric Nursing, formerly Nursing Care of Children." }
    }
    "^13 - Geriatric$" {
      return @{ Destination = "Gerontology"; Action = "import"; Notes = "Geriatric source wording mapped to Gerontology." }
    }
    "^14 - PN Anatomy and Physiology$" {
      return @{ Destination = "Anatomy and Physiology"; Action = "import"; Notes = "" }
    }
    "^15 - Advanced Concepts$" {
      return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Reviewed placement: broad concepts files mapped to Fundamentals." }
    }
    "^16 - Lifespan Exams$" {
      if ($Name -match "Custom Lifespan" -or $File -match "Custom Lifespan") {
        return @{ Destination = "Pediatric Nursing"; Action = "import"; Notes = "Reviewed placement: custom lifespan file had pediatric/developmental content signals." }
      }

      return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Reviewed placement: lifespan final mapped to Fundamentals." }
    }
    "^17 - Physical Assessment$" {
      return @{ Destination = "Health Assessment"; Action = "import"; Notes = "Physical Assessment source wording mapped to Health Assessment." }
    }
    "^18 - Nutrition$" {
      return @{ Destination = "Nutrition"; Action = "import"; Notes = "" }
    }
    "^19 - Critical Thinking$" {
      return @{ Destination = "Comprehensive Review"; Action = "import"; Notes = "Reviewed placement: Critical Thinking mapped to Comprehensive Review." }
    }
    "^20 - Nurse Teachings$" {
      return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Reviewed placement: nurse teaching mapped to Fundamentals." }
    }
    "^21 - Microbiology$" {
      return @{ Destination = "Microbiology"; Action = "import"; Notes = "Reviewed placement: microbiology/infection-control content imported as support science topic." }
    }
    "^22 - Leadership$" {
      return @{ Destination = "Management"; Action = "import"; Notes = "Leadership source folder mapped to ATI PN Management module." }
    }
    "^23 - Obstetrics and Pediatrics$" {
      if ($Name -match "Obstetric|OB|Maternity|Maternal|Newborn" -or $File -match "Obstetric|OB|Maternity|Maternal|Newborn") {
        return @{ Destination = "Maternal Newborn"; Action = "import"; Notes = "Reviewed placement: obstetrics/OB files mapped to Maternal Newborn." }
      }

      if ($Name -match "Pediatric|Paediatric|Children" -or $File -match "Pediatric|Paediatric|Children") {
        return @{ Destination = "Pediatric Nursing"; Action = "import"; Notes = "Reviewed placement: pediatric files mapped to Pediatric Nursing." }
      }

      return @{ Destination = "Comprehensive Review"; Action = "review"; Notes = "Combined Obstetrics and Pediatrics source folder did not match a specific OB or pediatric title." }
    }
    "^24 - Medication Administration$" {
      return @{ Destination = "Pharmacology"; Action = "import"; Notes = "Medication Administration source folder mapped to Pharmacology." }
    }
    default {
      return @{ Destination = "Review Needed"; Action = "review"; Notes = "No placement rule matched." }
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

$manifestCsv = Join-Path $DestinationRoot "lpn-ati-cleanup-manifest.csv"
$manifestJson = Join-Path $DestinationRoot "lpn-ati-cleanup-manifest.json"
$summaryCsv = Join-Path $DestinationRoot "lpn-ati-cleanup-summary.csv"

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
$artifactCsv = Join-Path $DestinationRoot "lpn-ati-root-json-artifacts.csv"
$rootJsonArtifacts |
  Select-Object Name, FullName, Length |
  Export-Csv -LiteralPath $artifactCsv -NoTypeInformation -Encoding UTF8

[PSCustomObject]@{
  sourceRoot = $SourceRoot
  destinationRoot = $DestinationRoot
  topicFolders = $topicFolders.Count
  stagedExamJsonFiles = $manifest.Count
  rootJsonArtifacts = $rootJsonArtifacts.Count
  manifestCsv = $manifestCsv
  manifestJson = $manifestJson
  summaryCsv = $summaryCsv
  rootJsonArtifactsCsv = $artifactCsv
}
