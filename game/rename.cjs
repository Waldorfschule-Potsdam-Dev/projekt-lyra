const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /wazaaah/g, to: 'wazaaah' },
  { from: /wazaaah/g, to: 'Wazaaah' },
  { from: /spotify/g, to: 'musica' },
  { from: /Spotify/g, to: 'Musica' },
  { from: /instagram/g, to: 'lumigram' },
  { from: /Instagram/g, to: 'Lumigram' },
  { from: /chrome/g, to: 'browser' },
  { from: /Chrome/g, to: 'Browser' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.md') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { from, to } of replacements) {
        if (from.test(content)) {
          content = content.replace(from, to);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
console.log('Done replacing strings.');
