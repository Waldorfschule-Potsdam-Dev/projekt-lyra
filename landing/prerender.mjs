import puppeteer from 'puppeteer';
import handler from 'serve-handler';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const server = http.createServer((request, response) => {
  return handler(request, response, { public: 'dist' });
});

server.listen(PORT, async () => {
  console.log('Starting prerendering...');
  
  try {
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // Set a standard desktop viewport to render everything optimally
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log(`Loading http://localhost:${PORT}...`);
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0' });
    
    // Give Framer Motion and other layout effects a brief moment to settle
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const html = await page.content();
    
    // Write the modified HTML back to dist/index.html
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    fs.writeFileSync(indexPath, html);
    
    console.log('Prerendering successfully completed.');
    
    await browser.close();
  } catch (error) {
    console.error('Error during prerendering:', error);
    process.exit(1);
  } finally {
    server.close();
  }
});
