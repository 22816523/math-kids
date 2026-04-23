const fs = require('fs');
const path = require('path');

const softwareName = '儿童数学启蒙互动学习系统';
const version = 'V1.0';
const linesPerPage = 50;
const pagesPerSection = 30;

const workspaceRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(workspaceRoot, 'mvp_web');
const outputHtml = path.join(__dirname, '程序鉴别材料.html');
const outputMeta = path.join(__dirname, '程序鉴别材料-说明.json');

const excludedDirs = new Set(['node_modules', 'tests']);
const excludedFiles = new Set(['check_live_errors.js', 'test_baisu.js']);
const allowedExts = new Set(['.html', '.css', '.js']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) {
        continue;
      }
      files.push(...walk(fullPath));
      continue;
    }
    if (!allowedExts.has(path.extname(entry.name))) {
      continue;
    }
    if (excludedFiles.has(entry.name)) {
      continue;
    }
    files.push(fullPath);
  }
  return files;
}

function htmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readSourceLines(files) {
  const listing = [];
  for (const file of files) {
    const relativePath = path.relative(sourceRoot, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      listing.push({
        file: relativePath,
        lineNumber: i + 1,
        code: lines[i],
      });
    }
  }
  return listing;
}

function buildPage(sectionTitle, pageNumber, totalPages, lines) {
  let lastFile = null;
  const rows = lines.map((line) => {
    const fileCell = line.file === lastFile ? '' : line.file;
    lastFile = line.file;
    return `
      <div class="row">
        <div class="cell file">${htmlEscape(fileCell)}</div>
        <div class="cell line">${line.lineNumber}</div>
        <div class="cell code">${htmlEscape(line.code)}</div>
      </div>`;
  }).join('');

  return `
    <section class="page">
      <div class="page-header">
        <div class="title">${softwareName} ${version}</div>
        <div class="subtitle">${sectionTitle}</div>
        <div class="page-no">第 ${pageNumber} / ${totalPages} 页</div>
      </div>
      <div class="table-header">
        <div class="cell file">文件</div>
        <div class="cell line">行号</div>
        <div class="cell code">源代码</div>
      </div>
      <div class="rows">${rows}</div>
    </section>`;
}

function buildHtml(frontPages, backPages, meta) {
  const totalPages = frontPages.length + backPages.length;
  const pageHtml = [];

  frontPages.forEach((lines, index) => {
    pageHtml.push(buildPage('源程序前连续30页', index + 1, totalPages, lines));
  });

  backPages.forEach((lines, index) => {
    pageHtml.push(buildPage('源程序后连续30页', frontPages.length + index + 1, totalPages, lines));
  });

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${softwareName}${version}程序鉴别材料</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm 10mm 12mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      font-family: Consolas, "Courier New", monospace;
      color: #111827;
      background: #ffffff;
    }
    .page {
      page-break-after: always;
      height: 186mm;
      display: flex;
      flex-direction: column;
    }
    .page:last-child {
      page-break-after: auto;
    }
    .page-header {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
      align-items: end;
      padding-bottom: 6px;
      border-bottom: 1px solid #9ca3af;
      margin-bottom: 4px;
    }
    .title {
      font-size: 13px;
      font-weight: 700;
    }
    .subtitle,
    .page-no {
      font-size: 10px;
    }
    .table-header,
    .row {
      display: grid;
      grid-template-columns: 260px 56px 1fr;
      gap: 8px;
      align-items: baseline;
    }
    .table-header {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 0 4px;
      border-bottom: 1px solid #d1d5db;
      color: #374151;
    }
    .rows {
      display: grid;
      grid-template-rows: repeat(${linesPerPage}, 1fr);
      flex: 1;
      min-height: 0;
    }
    .row {
      font-size: 9px;
      line-height: 1.2;
      border-bottom: 1px dotted #e5e7eb;
      white-space: pre;
      overflow: hidden;
    }
    .cell {
      overflow: hidden;
      text-overflow: clip;
    }
    .file {
      color: #374151;
    }
    .line {
      color: #6b7280;
      text-align: right;
      padding-right: 4px;
    }
    .code {
      color: #111827;
    }
  </style>
</head>
<body>
${pageHtml.join('\n')}
<!-- meta: ${htmlEscape(JSON.stringify(meta))} -->
</body>
</html>`;
}

function chunk(lines) {
  const pages = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }
  return pages;
}

const files = walk(sourceRoot).sort((a, b) => {
  const aRelative = path.relative(sourceRoot, a).replace(/\\/g, '/');
  const bRelative = path.relative(sourceRoot, b).replace(/\\/g, '/');
  return aRelative.localeCompare(bRelative, 'zh-Hans-CN');
});

const listing = readSourceLines(files);
const requiredLines = linesPerPage * pagesPerSection;

if (listing.length < requiredLines * 2) {
  throw new Error(`主程序源码行数不足以生成前后各${pagesPerSection}页，当前仅有${listing.length}行。`);
}

const frontPages = chunk(listing.slice(0, requiredLines));
const backPages = chunk(listing.slice(listing.length - requiredLines));

const meta = {
  softwareName,
  version,
  sourceRoot: path.relative(workspaceRoot, sourceRoot).replace(/\\/g, '/'),
  includedFiles: files.map((file) => path.relative(sourceRoot, file).replace(/\\/g, '/')),
  totalSourceLines: listing.length,
  linesPerPage,
  pagesPerSection,
  frontLineRange: [1, requiredLines],
  backLineRange: [listing.length - requiredLines + 1, listing.length],
};

fs.writeFileSync(outputHtml, buildHtml(frontPages, backPages, meta), 'utf8');
fs.writeFileSync(outputMeta, JSON.stringify(meta, null, 2), 'utf8');

console.log(JSON.stringify({
  html: outputHtml,
  meta: outputMeta,
  totalSourceLines: listing.length,
  includedFiles: meta.includedFiles.length,
}, null, 2));
