$ErrorActionPreference = "Stop"

$sourcePath = Join-Path $PSScriptRoot "..\Documentation\public-sub-pages\ATI TEAS Science Practice Test humanized.md"
$workspaceOutDir = Join-Path $PSScriptRoot "..\.tmp-docx"
$outputPath = Join-Path $workspaceOutDir "ATI TEAS Science Practice Test Content - NursingMocks - Humanized.docx"

New-Item -ItemType Directory -Force -Path $workspaceOutDir | Out-Null

function Escape-Xml([string]$value) {
  if ($null -eq $value) { return "" }
  return [System.Security.SecurityElement]::Escape($value)
}

function Runs-FromMarkdown([string]$text, [bool]$boldAll = $false) {
  $escaped = Escape-Xml $text
  if ($boldAll) {
    return "<w:r><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`"/><w:b/><w:sz w:val=`"24`"/></w:rPr><w:t xml:space=`"preserve`">$escaped</w:t></w:r>"
  }

  $runs = ""
  $remaining = $text
  while ($remaining -match "^(.*?)\*\*(.*?)\*\*(.*)$") {
    $before = $Matches[1]
    $strong = $Matches[2]
    $after = $Matches[3]
    if ($before.Length -gt 0) {
      $runs += "<w:r><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`"/><w:sz w:val=`"24`"/></w:rPr><w:t xml:space=`"preserve`">$(Escape-Xml $before)</w:t></w:r>"
    }
    $runs += "<w:r><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`"/><w:b/><w:sz w:val=`"24`"/></w:rPr><w:t xml:space=`"preserve`">$(Escape-Xml $strong)</w:t></w:r>"
    $remaining = $after
  }
  if ($remaining.Length -gt 0) {
    $runs += "<w:r><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`"/><w:sz w:val=`"24`"/></w:rPr><w:t xml:space=`"preserve`">$(Escape-Xml $remaining)</w:t></w:r>"
  }
  return $runs
}

function Paragraph([string]$text, [string]$role = "body") {
  $spacingAfter = "160"
  $spacingBefore = "0"
  $jc = ""
  $pPrExtra = ""
  $boldAll = $false

  if ($role -eq "title") {
    $spacingAfter = "160"
    $boldAll = $true
  } elseif ($role -eq "h2") {
    $spacingBefore = "0"
    $spacingAfter = "160"
    $boldAll = $true
  } elseif ($role -eq "h3") {
    $spacingBefore = "0"
    $spacingAfter = "160"
    $boldAll = $true
  } elseif ($role -eq "cta") {
    $spacingBefore = "0"
    $spacingAfter = "160"
    $boldAll = $true
  } elseif ($role -eq "bullet") {
    $spacingAfter = "160"
  }

  $runs = Runs-FromMarkdown $text $boldAll
  return "<w:p><w:pPr><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`" w:cs=`"Times New Roman`"/><w:sz w:val=`"24`"/><w:szCs w:val=`"24`"/></w:rPr>$jc<w:spacing w:before=`"$spacingBefore`" w:after=`"$spacingAfter`" w:line=`"259`" w:lineRule=`"auto`"/>$pPrExtra</w:pPr>$runs</w:p>"
}

function Table-Xml([array]$rows) {
  $tbl = "<w:tbl><w:tblPr><w:tblW w:w=`"9360`" w:type=`"dxa`"/><w:tblBorders><w:top w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"DADCE0`"/><w:left w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"DADCE0`"/><w:bottom w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"DADCE0`"/><w:right w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"DADCE0`"/><w:insideH w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"DADCE0`"/><w:insideV w:val=`"single`" w:sz=`"4`" w:space=`"0`" w:color=`"DADCE0`"/></w:tblBorders><w:tblLayout w:type=`"fixed`"/><w:tblCellMar><w:left w:w=`"10`" w:type=`"dxa`"/><w:right w:w=`"10`" w:type=`"dxa`"/></w:tblCellMar><w:tblLook w:val=`"04A0`" w:firstRow=`"1`" w:lastRow=`"0`" w:firstColumn=`"1`" w:lastColumn=`"0`" w:noHBand=`"0`" w:noVBand=`"1`"/></w:tblPr><w:tblGrid><w:gridCol w:w=`"4680`"/><w:gridCol w:w=`"4680`"/></w:tblGrid>"
  for ($i = 0; $i -lt $rows.Count; $i++) {
    $cells = $rows[$i]
    $isHeader = $i -eq 0
    $tbl += "<w:tr>"
    foreach ($cell in $cells) {
      $bold = $isHeader
      $tbl += "<w:tc><w:tcPr><w:tcW w:w=`"4680`" w:type=`"dxa`"/><w:tcMar><w:top w:w=`"120`" w:type=`"dxa`"/><w:left w:w=`"120`" w:type=`"dxa`"/><w:bottom w:w=`"120`" w:type=`"dxa`"/><w:right w:w=`"120`" w:type=`"dxa`"/></w:tcMar></w:tcPr>"
      $tbl += Paragraph $cell $(if ($bold) { "h3" } else { "body" })
      $tbl += "</w:tc>"
    }
    $tbl += "</w:tr>"
  }
  $tbl += "</w:tbl>"
  return $tbl
}

$lines = Get-Content -LiteralPath $sourcePath
$body = ""
$tableBuffer = @()

function Flush-Table {
  if ($script:tableBuffer.Count -gt 0) {
    $rows = @()
    foreach ($row in $script:tableBuffer) {
      if ($row -match "^\|\s*-") { continue }
      $cells = $row.Trim("|").Split("|") | ForEach-Object { $_.Trim() }
      $rows += ,$cells
    }
    $script:body += Table-Xml $rows
    $script:tableBuffer = @()
  }
}

foreach ($line in $lines) {
  if ($line.Trim().Length -eq 0) {
    Flush-Table
    continue
  }

  if ($line.StartsWith("|")) {
    $tableBuffer += $line
    continue
  }

  Flush-Table

  if ($line.StartsWith("### ")) {
    $body += Paragraph $line.Substring(4) "h3"
  } elseif ($line.StartsWith("## ")) {
    $body += Paragraph $line.Substring(3) "h2"
  } elseif ($line.StartsWith("# ")) {
    $body += Paragraph $line.Substring(2) "title"
  } elseif ($line.StartsWith("- ")) {
    $body += Paragraph $line.Substring(2) "bullet"
  } elseif ($line -eq "Start ATI TEAS Science Practice") {
    $body += Paragraph $line "cta"
  } else {
    $body += Paragraph $line "body"
  }
}
Flush-Table

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    $body
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$stylesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="259" w:lineRule="auto"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
</w:styles>
"@

$numberingXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="1">
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
      <w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol"/></w:rPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num>
</w:numbering>
"@

$contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>
"@

$rels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"@

$wordRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>
"@

if (Test-Path -LiteralPath $outputPath) {
  Remove-Item -LiteralPath $outputPath -Force
}

$zipPath = Join-Path $workspaceOutDir "science-humanized-package.zip"
if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

$tmpPackage = Join-Path $workspaceOutDir "science-docx-package"
if (Test-Path -LiteralPath $tmpPackage) {
  Remove-Item -LiteralPath $tmpPackage -Recurse -Force
}

New-Item -ItemType Directory -Force -Path (Join-Path $tmpPackage "_rels") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $tmpPackage "word\_rels") | Out-Null

Set-Content -LiteralPath (Join-Path $tmpPackage "[Content_Types].xml") -Value $contentTypes -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tmpPackage "_rels\.rels") -Value $rels -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tmpPackage "word\document.xml") -Value $documentXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tmpPackage "word\styles.xml") -Value $stylesXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tmpPackage "word\numbering.xml") -Value $numberingXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tmpPackage "word\_rels\document.xml.rels") -Value $wordRels -Encoding UTF8

Compress-Archive -Path (Join-Path $tmpPackage "*") -DestinationPath $zipPath -Force
Move-Item -LiteralPath $zipPath -Destination $outputPath -Force

Write-Output $outputPath
