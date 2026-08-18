param(
  [string]$CleanupRoot = "C:\Users\wilso\OneDrive\Desktop\Naxlex cleanup\Nursing Test Bank\LPN\ATI"
)

$ErrorActionPreference = "Stop"

$moves = @(
  @{ File = "1-Ati lpn concepts of nursing proctored exam.json"; Destination = "Fundamentals" },
  @{ File = "2-Ati Lpn Advanced Concept Quiz Proctored Exam.json"; Destination = "Fundamentals" },
  @{ File = "1-Ati nur 213 lifespan Proctored  final exam.json"; Destination = "Fundamentals" },
  @{ File = "2-ATI PN Custom Lifespan Proctored Exam 1 2023.json"; Destination = "Pediatric Nursing" },
  @{ File = "1-Ati pn critical thinking proctored exam.json"; Destination = "Comprehensive Review" },
  @{ File = "20-Ati PN Maternal Newborn Rn X1 Proctored Exam.json"; Destination = "Maternal Newborn" },
  @{ File = "1-Ati lpn nurse teaching proctored exam.json"; Destination = "Fundamentals" },
  @{ File = "1-Ati lpn OBSTETRICS nursing proctored exam.json"; Destination = "Maternal Newborn" },
  @{ File = "2-Ati lpn obstetrics OB nursing cohort proctored exam Total Questions_ 35.json"; Destination = "Maternal Newborn" },
  @{ File = "3-Ati lpn OBSTETRICS nursing proctored exam.json"; Destination = "Maternal Newborn" }
)

$reviewRoot = Join-Path $CleanupRoot "Review Needed"
$results = New-Object System.Collections.Generic.List[object]

foreach ($move in $moves) {
  $source = Join-Path $reviewRoot $move.File
  $destinationFolder = Join-Path $CleanupRoot $move.Destination
  $destinationPath = Join-Path $destinationFolder $move.File

  New-Item -ItemType Directory -Path $destinationFolder -Force | Out-Null

  if (Test-Path -LiteralPath $source) {
    Move-Item -LiteralPath $source -Destination $destinationPath -Force
    $status = "moved"
  } elseif (Test-Path -LiteralPath $destinationPath) {
    $status = "already_moved"
  } else {
    $status = "missing"
  }

  $results.Add([PSCustomObject]@{
    file = $move.File
    destination = $move.Destination
    status = $status
  })
}

$remaining = @(Get-ChildItem -LiteralPath $reviewRoot -Filter "*.json" -ErrorAction SilentlyContinue)

[PSCustomObject]@{
  cleanupRoot = $CleanupRoot
  moved = @($results | Where-Object { $_.status -eq "moved" }).Count
  alreadyMoved = @($results | Where-Object { $_.status -eq "already_moved" }).Count
  missing = @($results | Where-Object { $_.status -eq "missing" }).Count
  remainingReviewNeededJson = $remaining.Count
}

$results | Format-Table -AutoSize
