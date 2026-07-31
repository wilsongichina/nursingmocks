$ErrorActionPreference = "Stop"

$sourcePath = Join-Path $PSScriptRoot "..\Documentation\public-sub-pages\ATI TEAS English Practice Test humanized.md"
$workspaceOutDir = Join-Path $PSScriptRoot "..\.tmp-docx"
$outputPath = Join-Path $workspaceOutDir "ATI TEAS English Practice Test Content - NursingMocks - Humanized.docx"
$templatePath = "C:\Users\wilso\OneDrive\Desktop\Content Strategy\Nursing Mocks\humanized\ATI TEAS Reading Practice Test Content - NursingMocks - Humanized.docx"

New-Item -ItemType Directory -Force -Path $workspaceOutDir | Out-Null

function Escape-Xml([string]$value) {
  if ($null -eq $value) { return "" }
  return [System.Security.SecurityElement]::Escape($value)
}

function Run-Xml([string]$text, [bool]$bold = $false) {
  $boldXml = ""
  if ($bold) { $boldXml = "<w:b/><w:bCs/>" }
  return "<w:r><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`" w:cs=`"Times New Roman`"/>$boldXml<w:color w:val=`"111827`"/><w:sz w:val=`"24`"/><w:szCs w:val=`"24`"/></w:rPr><w:t xml:space=`"preserve`">$(Escape-Xml $text)</w:t></w:r>"
}

function Runs-FromMarkdown([string]$text, [bool]$boldAll = $false) {
  if ($boldAll) { return Run-Xml $text $true }

  $runs = ""
  $remaining = $text
  while ($remaining -match "^(.*?)\*\*(.*?)\*\*(.*)$") {
    $before = $Matches[1]
    $strong = $Matches[2]
    $after = $Matches[3]
    if ($before.Length -gt 0) { $runs += Run-Xml $before $false }
    $runs += Run-Xml $strong $true
    $remaining = $after
  }
  if ($remaining.Length -gt 0) { $runs += Run-Xml $remaining $false }
  return $runs
}

function Paragraph-Xml([string]$text, [string]$role = "body") {
  $boldAll = $false
  $pPr = "<w:spacing w:after=`"120`"/><w:jc w:val=`"both`"/>"

  if ($role -eq "title") {
    $boldAll = $true
    $pPr = "<w:spacing w:after=`"180`"/>"
  } elseif ($role -eq "h2") {
    $boldAll = $true
    $pPr = "<w:keepNext/><w:spacing w:before=`"260`" w:after=`"100`"/><w:outlineLvl w:val=`"1`"/>"
  } elseif ($role -eq "h3") {
    $boldAll = $true
    $pPr = "<w:keepNext/><w:spacing w:before=`"220`" w:after=`"80`"/><w:outlineLvl w:val=`"2`"/>"
  } elseif ($role -eq "cta") {
    $boldAll = $true
    $pPr = "<w:spacing w:before=`"80`" w:after=`"160`"/>"
  }

  return "<w:p><w:pPr>$pPr</w:pPr>$(Runs-FromMarkdown $text $boldAll)</w:p>"
}

function Table-CellXml([string]$text, [int]$width, [bool]$header = $false, [bool]$center = $false, [bool]$bold = $false) {
  $shading = ""
  if ($header) { $shading = "<w:shd w:val=`"clear`" w:color=`"auto`" w:fill=`"EEF2FF`"/>" }
  $jc = ""
  if ($center) { $jc = "<w:jc w:val=`"center`"/>" }
  $run = Run-Xml $text ($header -or $bold)
  return "<w:tc><w:tcPr><w:tcW w:w=`"$width`" w:type=`"dxa`"/>$shading<w:vAlign w:val=`"center`"/></w:tcPr><w:p><w:pPr><w:spacing w:after=`"0`"/>$jc</w:pPr>$run</w:p></w:tc>"
}

function Table-Xml([array]$rows) {
  $tbl = "<w:tbl><w:tblPr><w:tblW w:w=`"0`" w:type=`"auto`"/><w:tblBorders><w:top w:val=`"single`" w:sz=`"6`" w:space=`"0`" w:color=`"CBD5E1`"/><w:left w:val=`"single`" w:sz=`"6`" w:space=`"0`" w:color=`"CBD5E1`"/><w:bottom w:val=`"single`" w:sz=`"6`" w:space=`"0`" w:color=`"CBD5E1`"/><w:right w:val=`"single`" w:sz=`"6`" w:space=`"0`" w:color=`"CBD5E1`"/><w:insideH w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"E5E7EB`"/><w:insideV w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"E5E7EB`"/></w:tblBorders><w:tblCellMar><w:top w:w=`"120`" w:type=`"dxa`"/><w:left w:w=`"120`" w:type=`"dxa`"/><w:bottom w:w=`"120`" w:type=`"dxa`"/><w:right w:w=`"120`" w:type=`"dxa`"/></w:tblCellMar><w:tblLook w:val=`"04A0`" w:firstRow=`"1`" w:lastRow=`"0`" w:firstColumn=`"1`" w:lastColumn=`"0`" w:noHBand=`"0`" w:noVBand=`"1`"/></w:tblPr><w:tblGrid><w:gridCol w:w=`"5200`"/><w:gridCol w:w=`"2600`"/></w:tblGrid>"
  for ($i = 0; $i -lt $rows.Count; $i++) {
    $isHeader = $i -eq 0
    $tbl += "<w:tr>"
    $tbl += Table-CellXml $rows[$i][0] 5200 $isHeader $false $true
    $tbl += Table-CellXml $rows[$i][1] 2600 $isHeader $true $false
    $tbl += "</w:tr>"
  }
  $tbl += "</w:tbl>"
  return $tbl
}

if (!(Test-Path -LiteralPath $sourcePath)) {
  throw "Source Markdown not found: $sourcePath"
}

if (!(Test-Path -LiteralPath $templatePath)) {
  throw "Template DOCX not found: $templatePath"
}

$lines = Get-Content -LiteralPath $sourcePath
$body = ""
$i = 0
while ($i -lt $lines.Count) {
  $line = $lines[$i].Trim()
  if ($line.Length -eq 0) {
    $i++
    continue
  }

  if ($line.StartsWith("|")) {
    $rows = @()
    while ($i -lt $lines.Count -and $lines[$i].Trim().StartsWith("|")) {
      $rowLine = $lines[$i].Trim()
      if ($rowLine -notmatch "^\|\s*-+") {
        $cells = $rowLine.Trim("|").Split("|") | ForEach-Object { $_.Trim().Trim(":").Trim() }
        if ($cells.Count -ge 2) { $rows += ,@($cells[0], $cells[1]) }
      }
      $i++
    }
    if ($rows.Count -gt 0) { $body += Table-Xml $rows }
    continue
  }

  if ($line.StartsWith("# ")) {
    $body += Paragraph-Xml $line.Substring(2).Trim() "title"
  } elseif ($line.StartsWith("## ")) {
    $body += Paragraph-Xml $line.Substring(3).Trim() "h2"
  } elseif ($line.StartsWith("### ")) {
    $body += Paragraph-Xml $line.Substring(4).Trim() "h3"
  } elseif ($line -match "^Start ATI TEAS .+ Practice$") {
    $body += Paragraph-Xml $line "cta"
  } else {
    $body += Paragraph-Xml $line "body"
  }
  $i++
}

$templateZip = Join-Path $workspaceOutDir "english-template-copy.zip"
$tmpPackage = Join-Path $workspaceOutDir "english-styled-package"
if (Test-Path -LiteralPath $templateZip) { Remove-Item -LiteralPath $templateZip -Force }
if (Test-Path -LiteralPath $tmpPackage) { Remove-Item -LiteralPath $tmpPackage -Recurse -Force }
Copy-Item -LiteralPath $templatePath -Destination $templateZip -Force
Expand-Archive -LiteralPath $templateZip -DestinationPath $tmpPackage -Force

$templateDocument = Get-Content -LiteralPath (Join-Path $tmpPackage "word\document.xml") -Raw
$bodyStart = $templateDocument.IndexOf("<w:body>")
$bodyEnd = $templateDocument.LastIndexOf("</w:body>")
if ($bodyStart -lt 0 -or $bodyEnd -lt 0) {
  throw "Template document.xml does not contain a standard Word body."
}

$prefix = $templateDocument.Substring(0, $bodyStart + "<w:body>".Length)
$bodyOnly = $templateDocument.Substring($bodyStart + "<w:body>".Length, $bodyEnd - ($bodyStart + "<w:body>".Length))
$sectMatch = [regex]::Match($bodyOnly, "<w:sectPr[\s\S]*?</w:sectPr>")
$sectPr = ""
if ($sectMatch.Success) {
  $sectPr = $sectMatch.Value
} else {
  $sectPr = "<w:sectPr><w:pgSz w:w=`"12240`" w:h=`"15840`"/><w:pgMar w:top=`"1440`" w:right=`"1440`" w:bottom=`"1440`" w:left=`"1440`" w:header=`"720`" w:footer=`"720`" w:gutter=`"0`"/></w:sectPr>"
}
$suffix = $templateDocument.Substring($bodyEnd)
$documentXml = "$prefix$body$sectPr$suffix"

Set-Content -LiteralPath (Join-Path $tmpPackage "word\document.xml") -Value $documentXml -Encoding UTF8

if (Test-Path -LiteralPath $outputPath) { Remove-Item -LiteralPath $outputPath -Force }
$zipPath = Join-Path $workspaceOutDir "english-styled-package.zip"
if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
Compress-Archive -Path (Join-Path $tmpPackage "*") -DestinationPath $zipPath -Force
Move-Item -LiteralPath $zipPath -Destination $outputPath -Force

Write-Output $outputPath
