const fs = require('fs');
const path = require('path');

const projects = ['CRM', 'admin panel', 'website-frontend'];
const baseDir = 'd:\\Phonenix ecommerce';

projects.forEach(proj => {
  const projDir = path.join(baseDir, proj);
  
  // 1. Move index.html
  const publicIndex = path.join(projDir, 'public', 'index.html');
  const rootIndex = path.join(projDir, 'index.html');
  if (fs.existsSync(publicIndex)) {
    fs.renameSync(publicIndex, rootIndex);
  }

  // 2. Modify index.html
  if (fs.existsSync(rootIndex)) {
    let html = fs.readFileSync(rootIndex, 'utf8');
    html = html.replace(/%PUBLIC_URL%/g, '');
    if (!html.includes('/src/index.jsx')) {
      html = html.replace('</body>', '  <script type="module" src="/src/index.jsx"></script>\n</body>');
    }
    fs.writeFileSync(rootIndex, html);
  }

  // 3. Create vite.config.js
  const viteConfigPath = path.join(projDir, 'vite.config.js');
  const viteConfig = `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  server: { port: 3000 }\n});`;
  fs.writeFileSync(viteConfigPath, viteConfig);

  // 4. Modify package.json
  const pkgPath = path.join(projDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.scripts) {
      pkg.scripts.start = 'vite';
      pkg.scripts.dev = 'vite';
      pkg.scripts.build = 'vite build';
      pkg.scripts.preview = 'vite preview';
    }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  }
});
