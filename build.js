const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const PARTIALS = path.join(SRC, 'partials');
const PAGES = path.join(SRC, 'pages');
const ROOT = __dirname;

const BASE_URL = 'https://atlasclock.vercel.app';

function loadPartial(name) {
  const filePath = path.join(PARTIALS, `_${name}.html`);
  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] Partial not found: _${name}.html`);
    return '';
  }
  return fs.readFileSync(filePath, 'utf-8');
}

function resolveMeta(line) {
  const match = line.match(/{{head:\s*(.*?)\s*}}/);
  if (!match) return { title: 'AtlasClock', description: 'Global Time & World Clock Experience', url: BASE_URL };
  const parts = match[1].split('|').map(s => s.trim());
  const rawTitle = parts[0] || 'AtlasClock';
  const title = rawTitle.includes('AtlasClock') ? rawTitle : `${rawTitle} - AtlasClock`;
  const description = parts[1] || 'Real-time global time synchronization with cinematic visualizations.';
  const pagePath = parts[2] || '';
  const url = pagePath ? `${BASE_URL}/${pagePath}` : BASE_URL;
  return { title, description, url };
}

function resolveNavClass(pageName, line) {
  const match = line.match(/{{\s*nav:\s*(\w+)\s*}}/);
  if (!match) return line;
  const active = match[1];
  let result = line.replace(/{{nav:\s*\w+\s*}}/, '');
  const pages = ['home', 'world-clocks', 'explorer', 'guide', 'features', 'about'];
  pages.forEach(p => {
    const token = `{{${p}}}`;
    const className = p === active ? 'active' : '';
    result = result.split(token).join(className);
  });
  return result;
}

function processIncludes(content) {
  return content.replace(/{{\s*include:\s*(\w+)\s*}}/g, (_, name) => {
    return loadPartial(name);
  });
}

function build() {
  console.log('═══════════════════════════════════════');
  console.log('  AtlasClock Static Site Builder');
  console.log('═══════════════════════════════════════\n');

  if (!fs.existsSync(PAGES)) {
    fs.mkdirSync(PAGES, { recursive: true });
  }

  const files = fs.readdirSync(PAGES).filter(f => f.endsWith('.html'));

  if (files.length === 0) {
    console.log('[!] No page files found in src/pages/');
    console.log('[!] Place your HTML page templates there.\n');
    return;
  }

  console.log(`[BUILD] Found ${files.length} page(s)\n`);

  files.forEach(file => {
    const srcPath = path.join(PAGES, file);
    let content = fs.readFileSync(srcPath, 'utf-8');

    // Extract multi-line {{extra_scripts: ... }} block
    const extraMatch = content.match(/\{\{extra_scripts:\s*([\s\S]*?)\s*\}\}/);
    const extraScripts = extraMatch ? extraMatch[1].trim() : '';

    // Remove the extra_scripts block from content
    content = content.replace(/\{\{extra_scripts:\s*[\s\S]*?\s*\}\}/g, '');

    // Extract metadata
    const headMatch = content.match(/\{\{head:\s*(.*?)\s*\}\}/);
    let meta = { title: 'AtlasClock', description: 'Global Time & World Clock Experience', url: BASE_URL };
    if (headMatch) {
      const parts = headMatch[1].split('|').map(s => s.trim());
      const rawTitle = parts[0] || 'AtlasClock';
      meta.title = rawTitle.includes('AtlasClock') ? rawTitle : `${rawTitle} - AtlasClock`;
      meta.description = parts[1] || meta.description;
      meta.url = parts[2] ? `${BASE_URL}/${parts[2]}` : BASE_URL;
    }
    content = content.replace(/\{\{head:\s*.*?\s*\}\}/, '');

    // Extract nav
    const navMatch = content.match(/\{\{nav:\s*([\w-]+)\s*\}\}/);
    const navPage = navMatch ? navMatch[1] : null;
    content = content.replace(/\{\{nav:\s*[\w-]+\s*\}\}/, '');

    // Process includes (may introduce new template tags)
    content = processIncludes(content);

    // Replace nav classes
    if (navPage) {
      const pages = ['home', 'world-clocks', 'explorer', 'guide', 'features', 'about'];
      pages.forEach(p => {
        const token = `{{${p}}}`;
        content = content.split(token).join(p === navPage ? 'active' : '');
      });
    }
    // Replace {{extra_scripts}} in _scripts.html with captured content
    content = content.replace(/{{extra_scripts}}/g, extraScripts);

    // Clean up any remaining nav tokens
    content = content.replace(/{{home}}|{{world-clocks}}|{{explorer}}|{{guide}}|{{features}}|{{about}}/g, '');

    // Replace remaining template tags
    content = content.replace(/{{title}}/g, meta.title);
    content = content.replace(/{{description}}/g, meta.description);
    content = content.replace(/{{url}}/g, meta.url);

    // Final cleanup of any leftover tags
    content = content.replace(/\{\{[\w-]+(?::[^}]*)?\}\}/g, '');

    // Trim leading blank lines
    content = content.replace(/^\s*\n/, '');

    const outPath = path.join(ROOT, file === 'index.html' ? 'index.html' : file);
    fs.writeFileSync(outPath, content, 'utf-8');
    const sizeKB = (Buffer.byteLength(content, 'utf-8') / 1024).toFixed(1);
    console.log(`  [OK] ${file} -> ${sizeKB} KB`);
  });

  console.log('\n═══════════════════════════════════════');
  console.log('  Build complete! Open index.html or run:');
  console.log('  npm start');
  console.log('═══════════════════════════════════════\n');
}

build();
