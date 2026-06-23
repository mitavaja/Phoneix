const fs = require('fs');
const path = require('path');

const searchDirs = [
  'website-frontend/src',
  'website-frontend/public',
  'website-frontend/index.html',
  'CRM/src',
  'CRM/public',
  'CRM/index.html',
  'admin panel/src',
  'admin panel/public',
  'admin panel/index.html',
  'backend'
];

const ignoreDirs = ['node_modules', 'dist', '.git', '.cache'];

function searchFile(filePath, term) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.toLowerCase().includes(term.toLowerCase())) {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(term.toLowerCase())) {
          console.log(`${filePath}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  } catch (e) {
    // Ignore errors
  }
}

function traverse(currentPath, term) {
  const stats = fs.statSync(currentPath);
  if (stats.isDirectory()) {
    const base = path.basename(currentPath);
    if (ignoreDirs.includes(base)) return;
    const files = fs.readdirSync(currentPath);
    files.forEach(file => {
      traverse(path.join(currentPath, file), term);
    });
  } else if (stats.isFile()) {
    const ext = path.extname(currentPath);
    if (['.js', '.jsx', '.html', '.css', '.json', '.env', '.config'].includes(ext) || ext === '') {
      searchFile(currentPath, term);
    }
  }
}

const term = process.argv[2] || 'phoenix';
console.log(`Searching for "${term}"...`);
searchDirs.forEach(dir => {
  const fullPath = path.resolve(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    traverse(fullPath, term);
  }
});
