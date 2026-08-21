param(
  [string]$SourceRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex\Nursing Test Bank\RN\ATI",
  [string]$DestinationRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\ATI"
)

$ErrorActionPreference = "Stop"

function Get-DestinationDecision {
  param(
    [string]$Folder,
    [string]$File,
    [string]$Name
  )

  if ($Name -match "HESI") {
    return @{
      Destination = "Excluded - HESI"
      Action = "exclude"
      Notes = "HESI-branded file found inside ATI source folder; move/exclude from ATI RN import."
    }
  }

  switch -Regex ($Folder) {
    "^1 - Pharmacology$" { return @{ Destination = "Pharmacology"; Action = "import"; Notes = "" } }
    "^10 - Mental Health$" { return @{ Destination = "Mental Health"; Action = "import"; Notes = "" } }
    "^11 - Dosage Calculations$" { return @{ Destination = "Dosage Calculations"; Action = "import"; Notes = "" } }
    "^16 - Nutrition$" { return @{ Destination = "Nutrition"; Action = "import"; Notes = "" } }
    "^17 - Leadership$" { return @{ Destination = "Leadership and Management"; Action = "import"; Notes = "" } }
    "^18 - Psychology$" { return @{ Destination = "Mental Health"; Action = "import"; Notes = "Psychology source wording mapped to Mental Health." } }
    "^22 - Nursing Care of Children$" { return @{ Destination = "Nursing Care of Children"; Action = "import"; Notes = "" } }
    "^25 - Communication$" { return @{ Destination = "Communication"; Action = "import"; Notes = "" } }
    "^27 - Capstone$" { return @{ Destination = "Capstone"; Action = "import"; Notes = "" } }
    "^29 - Geriatrics$" { return @{ Destination = "Gerontology"; Action = "import"; Notes = "" } }
    "^30 - Physical Assessments$" { return @{ Destination = "Health Assessment"; Action = "import"; Notes = "Physical Assessments source wording mapped to Health Assessment." } }
    "^32 - Health Assessment$" { return @{ Destination = "Health Assessment"; Action = "import"; Notes = "" } }
    "^33 - Pathophysiology$" { return @{ Destination = "Pathophysiology"; Action = "import"; Notes = "" } }
    "^35 - Informatics$" { return @{ Destination = "Nursing Informatics"; Action = "import"; Notes = "" } }
    "^8 - Community Health$" { return @{ Destination = "Community Health"; Action = "import"; Notes = "" } }
    "^2 - Medical-Surgical$" {
      if ($Name -match "Mental") { return @{ Destination = "Mental Health"; Action = "import"; Notes = "Title indicates Mental Health despite Medical-Surgical folder." } }
      if ($Name -match "Health Assessment") { return @{ Destination = "Health Assessment"; Action = "import"; Notes = "Title indicates Health Assessment despite Medical-Surgical folder." } }
      if ($Name -match "Geriatrics|gerontology") { return @{ Destination = "Gerontology"; Action = "import"; Notes = "Title indicates Gerontology despite Medical-Surgical folder." } }
      if ($Name -match "pharm") { return @{ Destination = "Adult Medical Surgical"; Action = "import"; Notes = "Keep under Adult Medical Surgical with Pharmacology as a secondary tag." } }
      return @{ Destination = "Adult Medical Surgical"; Action = "import"; Notes = "" }
    }
    "^3 - Fundamentals$" {
      if ($Name -match "Mental Health") { return @{ Destination = "Mental Health"; Action = "import"; Notes = "Title indicates Mental Health despite Fundamentals folder." } }
      if ($Name -match "med surg") { return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Keep under Fundamentals with Adult Medical Surgical as a secondary tag." } }
      return @{ Destination = "Fundamentals"; Action = "import"; Notes = "" }
    }
    "^4 - Maternal-Newborn$" {
      if ($Name -match "Mental Health") { return @{ Destination = "Mental Health"; Action = "import"; Notes = "Title indicates Mental Health despite Maternal-Newborn folder." } }
      if ($Name -match "Fundamentals") { return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Title indicates Fundamentals despite Maternal-Newborn folder." } }
      if ($File -match "^85-") { return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Content is adult basic nursing/fundamentals despite Nursing Care of Children title." } }
      if ($File -match "^96-") { return @{ Destination = "Nursing Care of Children"; Action = "import"; Notes = "Pediatric content confirmed from question review." } }
      if ($File -match "^98-") { return @{ Destination = "Nursing Care of Children"; Action = "import"; Notes = "Mixed pediatric and maternal/newborn assessment; store under Nursing Care of Children with Maternal Newborn as secondary topic." } }
      if ($Name -match "Nursing Care of Children|Pediatric|Paediatric") { return @{ Destination = "Review Needed"; Action = "review"; Notes = "Mixed Maternal Newborn and pediatric/Nursing Care of Children signal." } }
      return @{ Destination = "Maternal Newborn"; Action = "import"; Notes = "" }
    }
    "^5 - Anatomy and Physiology$" { return @{ Destination = "Anatomy and Physiology"; Action = "import"; Notes = "" } }
    "^6 - Obstetrics and Pediatrics$" {
      if ($File -match "^(2|14|22|25|74)-") { return @{ Destination = "Maternal Newborn"; Action = "import"; Notes = "OB/Obstetrics file split from combined source folder." } }
      return @{ Destination = "Nursing Care of Children"; Action = "import"; Notes = "Pediatric file split from combined source folder." }
    }
    "^7 - Fluid and Electrolytes$" { return @{ Destination = "Adult Medical Surgical"; Action = "import"; Notes = "Fluid/electrolyte, ABG, renal, burns, and acute-care content; keep Fundamentals/Pathophysiology as secondary tags if useful." } }
    "^9 - Lifespan Development$" { return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Lifespan source wording mapped to Fundamentals." } }
    "^12 - Nursing Specialty$" {
      if ($File -match "^1-") { return @{ Destination = "Adult Medical Surgical"; Action = "import"; Notes = "Nursing Specialty source bucket mapped by file title." } }
      if ($File -match "^2-") { return @{ Destination = "Pharmacology"; Action = "import"; Notes = "Nursing Specialty source bucket mapped by file title." } }
      if ($File -match "^3-") { return @{ Destination = "Health Assessment"; Action = "import"; Notes = "Nursing Specialty source bucket mapped by file title." } }
      return @{ Destination = "Comprehensive Review"; Action = "import"; Notes = "Nursing Specialty source bucket mapped to Comprehensive Review." }
    }
    "^13 - Cardiovascular and Respiratory$" { return @{ Destination = "Adult Medical Surgical"; Action = "import"; Notes = "Body-system source folder mapped to Adult Medical Surgical." } }
    "^14 - Foundations of Nursing$" { return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Foundations source wording mapped to Fundamentals." } }
    "^15 - Adult Health$" {
      if ($File -match "^(6|7|8)-") { return @{ Destination = "Health Assessment"; Action = "import"; Notes = "Title indicates Health Assessment despite Adult Health folder." } }
      if ($File -match "^9-") { return @{ Destination = "Gerontology"; Action = "import"; Notes = "Title indicates Gerontology despite Adult Health folder." } }
      return @{ Destination = "Adult Medical Surgical"; Action = "import"; Notes = "Adult Health source wording mapped to Adult Medical Surgical." }
    }
    "^19 - Concept-based assessment level$" { return @{ Destination = "Comprehensive Review"; Action = "import"; Notes = "Concept-based source bucket mapped to Comprehensive Review." } }
    "^20 - Dimensions of Nursing Practice$" {
      if ($File -match "^1-") { return @{ Destination = "Adult Medical Surgical"; Action = "import"; Notes = "Dimensions source bucket mapped by file title." } }
      return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Dimensions source bucket mapped by file title." }
    }
    "^21 - Growth and Development$" { return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Growth and Development source wording mapped to Fundamentals." } }
    "^23 - Custom$" {
      if ($File -match "^2-") { return @{ Destination = "Adult Medical Surgical"; Action = "import"; Notes = "Custom source bucket mapped by file title." } }
      return @{ Destination = "Comprehensive Review"; Action = "import"; Notes = "Custom source bucket mapped to Comprehensive Review." }
    }
    "^24 - Mobility Safety$" { return @{ Destination = "Duplicate Source - Do Not Import"; Action = "duplicate"; Notes = "Same file names/counts as 23 - Custom; do not double-import by default." } }
    "^26 - Reproductive Health$" { return @{ Destination = "Maternal Newborn"; Action = "import"; Notes = "Reproductive Health source wording mapped to Maternal Newborn." } }
    "^28 -Advanced Concepts$" { return @{ Destination = "Adult Medical Surgical"; Action = "import"; Notes = "Advanced Concepts source wording mapped to Adult Medical Surgical." } }
    "^31 - Health concepts$" { return @{ Destination = "Fundamentals"; Action = "import"; Notes = "Health Concepts source bucket mapped to Fundamentals." } }
    "^34 - Critical Care$" {
      if ($File -match "^1-") { return @{ Destination = "Comprehensive Review"; Action = "import"; Notes = "Critical thinking file mapped to Comprehensive Review." } }
      return @{ Destination = "Adult Medical Surgical"; Action = "import"; Notes = "Critical Care source wording mapped to Adult Medical Surgical." }
    }
    "^36 - Role transition of professional nurse$" {
      if ($File -match "^2-") { return @{ Destination = "Leadership and Management"; Action = "import"; Notes = "Transitions file mapped to Leadership and Management." } }
      return @{ Destination = "Comprehensive Review"; Action = "import"; Notes = "Role Transition source bucket mapped to Comprehensive Review." }
    }
    default { return @{ Destination = "Unmapped"; Action = "review"; Notes = "No placement rule matched." } }
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

$manifestCsv = Join-Path $DestinationRoot "ati-rn-cleanup-manifest.csv"
$manifestJson = Join-Path $DestinationRoot "ati-rn-cleanup-manifest.json"
$summaryCsv = Join-Path $DestinationRoot "ati-rn-cleanup-summary.csv"

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
$artifactCsv = Join-Path $DestinationRoot "ati-rn-root-json-artifacts.csv"
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
