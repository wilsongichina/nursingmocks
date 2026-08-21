param(
  [string]$CleanupRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\REGULAR"
)

$ErrorActionPreference = "Stop"

$resolvedRoot = (Resolve-Path -LiteralPath $CleanupRoot).Path
if ($resolvedRoot -ne "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\RN\REGULAR") {
  throw "Refusing to update unexpected cleanup root: $resolvedRoot"
}

$manifestPath = Join-Path $CleanupRoot "rn-regular-cleanup-manifest.csv"
$manifestJsonPath = Join-Path $CleanupRoot "rn-regular-cleanup-manifest.json"
$summaryPath = Join-Path $CleanupRoot "rn-regular-cleanup-summary.csv"
$reviewPath = Join-Path $CleanupRoot "rn-regular-review-placements.csv"

if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "Manifest not found: $manifestPath"
}

function New-Placement {
  param(
    [string]$File,
    [string]$FilePattern,
    [string]$Destination,
    [string]$Action,
    [string]$Notes
  )

  [pscustomobject]@{
    File = $File
    FilePattern = $FilePattern
    Destination = $Destination
    Action = $Action
    Notes = $Notes
  }
}

$placements = @(
  New-Placement -File "23-NACE Care of the Child Proctored Exam.json" -Destination "Pediatrics" -Action "import" -Notes "Content is pediatric nursing/child care. NACE label is source wording; import under Pediatrics."
  New-Placement -File "25-NACE Care of the childbearing family Proctored Exam.json" -Destination "Maternal Newborn" -Action "import" -Notes "Content is maternity/newborn/childbearing family. Import under Maternal Newborn."
  New-Placement -File "7-NACE Foundations of Nursing  Proctored Exam 2.json" -Destination "Fundamentals" -Action "import" -Notes "Content is broad foundations/fundamentals nursing. Import under Fundamentals."
  New-Placement -File "8-NACE Foundations of Nursing Proctored Exam.json" -Destination "Fundamentals" -Action "import" -Notes "Content is broad foundations/fundamentals nursing. Import under Fundamentals."
  New-Placement -File "2-CLEP human growth and development proctored exam.json" -Destination "Growth and Development" -Action "import" -Notes "Content is human growth/development support coursework. Import under Growth and Development."
  New-Placement -File "1-Proctored Exam#4 Chapter 30.json" -Destination "Duplicate Source - Do Not Import\Gastrointestinal System" -Action "duplicate" -Notes "Exact SHA-256 duplicate of imported Gastrointestinal System file."
  New-Placement -File "2-Proctored Exam 4_ Gastrointestinal System.json" -Destination "Duplicate Source - Do Not Import\Gastrointestinal System" -Action "duplicate" -Notes "Exact SHA-256 duplicate of imported Gastrointestinal System file."
  New-Placement -File "3-Gastrointestinal Disorders Proctored Exam 4.json" -Destination "Duplicate Source - Do Not Import\Gastrointestinal System" -Action "duplicate" -Notes "Exact SHA-256 duplicate of imported Gastrointestinal System file."
  New-Placement -FilePattern "1-Nur 111 nursing process cape fear college proctored exam*Examplify.json" -Destination "Fundamentals" -Action "import" -Notes "Content is broad nursing process, ethics, Medicare, and foundational nursing context. Import under Fundamentals."
  New-Placement -File "2-Nur3380  applying the nursing process to alterations in health exam 1.json" -Destination "Medical Surgical" -Action "import" -Notes "Content is alterations in health, fluid balance, leukemia, postoperative complications, and adult clinical care. Import under Medical Surgical."
  New-Placement -File "1-Lpn Anatomy and physiology proctored exam.json" -Destination "Anatomy and Physiology" -Action "import" -Notes "Title is LPN, but sampled content is generic anatomy and physiology. Import under Anatomy and Physiology."
  New-Placement -File "1-Human Growth And Development Proctored Exam (Spring 2025).json" -Destination "Growth and Development" -Action "import" -Notes "Content is human growth/development support coursework. Import under Growth and Development."
  New-Placement -File "1-Life Science Fall 2023 Lab Proctored Exam 1.json" -Destination "Excluded - Non Nursing Support Science" -Action "exclude" -Notes "Content is plant biology/photosynthesis lab science, not RN nursing course content."
  New-Placement -File "1-Microbiology proctored exam (Hennepin Tech).json" -Destination "Microbiology" -Action "import" -Notes "Content is microbiology support coursework relevant to nursing prerequisites. Import under Microbiology."
  New-Placement -File "2-Fa25 biol Microbiology (Hennepin Technical College) proctored exam.json" -Destination "Microbiology" -Action "import" -Notes "Content is microbiology support coursework relevant to nursing prerequisites. Import under Microbiology."
  New-Placement -File "3-Microbiology quiz proctored exam.json" -Destination "Microbiology" -Action "import" -Notes "Content is microbiology support coursework relevant to nursing prerequisites. Import under Microbiology."
  New-Placement -File "62-Smith Chason Los Angeles ATI Med Surg Proctored Exam 2.json" -Destination "Excluded - Wrong Vendor\ATI" -Action "exclude" -Notes "ATI-titled file. Do not import into RN Nursing Course Exams."
  New-Placement -File "32-Paediatrics ATI Proctored Exam.json" -Destination "Excluded - Wrong Vendor\ATI" -Action "exclude" -Notes "ATI-titled file. Do not import into RN Nursing Course Exams."
  New-Placement -File "1-Interprofessional Care of the Client and Family Across the Lifespan II Proctored Exam.json" -Destination "Excluded - Wrong Vendor\ATI" -Action "exclude" -Notes "Source folder is ATI Exams. Do not import into RN Nursing Course Exams."
  New-Placement -File "2-Promoting Health across the lifespan proctored exam.json" -Destination "Excluded - Wrong Vendor\ATI" -Action "exclude" -Notes "Source folder is ATI Exams. Do not import into RN Nursing Course Exams."
  New-Placement -File "1-Ati foundation of nursing proctored exam.json" -Destination "Excluded - Wrong Vendor\ATI" -Action "exclude" -Notes "ATI-titled file. Do not import into RN Nursing Course Exams."
)

$placementByFile = @{}
$patternPlacements = @()
foreach ($placement in $placements) {
  if ($placement.FilePattern) {
    $patternPlacements += $placement
  } else {
    $placementByFile[$placement.File] = $placement
  }
}

$manifest = @(Import-Csv -LiteralPath $manifestPath)
$updated = New-Object System.Collections.Generic.List[object]
$placementRows = New-Object System.Collections.Generic.List[object]

foreach ($row in $manifest) {
  $placement = $placementByFile[$row.sourceFileName]
  if (-not $placement) {
    foreach ($patternPlacement in $patternPlacements) {
      if ($row.sourceFileName -like $patternPlacement.FilePattern) {
        $placement = $patternPlacement
        break
      }
    }
  }

  if ($placement -and $row.action -match "review") {
    $destinationFolder = Join-Path $CleanupRoot $placement.Destination
    New-Item -ItemType Directory -Path $destinationFolder -Force | Out-Null

    $newDestinationPath = Join-Path $destinationFolder $row.sourceFileName
    if (Test-Path -LiteralPath $row.destinationPath) {
      Move-Item -LiteralPath $row.destinationPath -Destination $newDestinationPath -Force
    } elseif (-not (Test-Path -LiteralPath $newDestinationPath)) {
      throw "Could not locate staged review file: $($row.destinationPath)"
    }

    $placementRows.Add([pscustomobject]@{
      sourceFolder = $row.sourceFolder
      sourceFileName = $row.sourceFileName
      previousDestination = $row.destinationTopic
      newDestination = $placement.Destination
      action = $placement.Action
      questionCount = $row.questionCount
      notes = $placement.Notes
    })

    $row.action = $placement.Action
    $row.destinationTopic = $placement.Destination
    $row.destinationPath = $newDestinationPath
    $row.notes = $placement.Notes
  }

  $updated.Add($row)
}

$unresolvedReviewRows = @($updated | Where-Object { $_.action -match "review" })
if ($unresolvedReviewRows.Count -gt 0) {
  throw "Review rows remain unresolved: $($unresolvedReviewRows.Count)"
}

$updated | Export-Csv -LiteralPath $manifestPath -NoTypeInformation -Encoding UTF8
$updated | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestJsonPath -Encoding UTF8
$placementRows | Export-Csv -LiteralPath $reviewPath -NoTypeInformation -Encoding UTF8

$updated |
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
  Export-Csv -LiteralPath $summaryPath -NoTypeInformation -Encoding UTF8

$remainingReviewFiles = @(
  Get-ChildItem -LiteralPath (Join-Path $CleanupRoot "Review Needed") -Recurse -File -Filter "*.json" -ErrorAction SilentlyContinue
)

[pscustomobject]@{
  cleanupRoot = $CleanupRoot
  placementsApplied = $placementRows.Count
  unresolvedReviewRows = $unresolvedReviewRows.Count
  remainingReviewFiles = $remainingReviewFiles.Count
  reviewPlacementsCsv = $reviewPath
  manifestCsv = $manifestPath
  summaryCsv = $summaryPath
}
