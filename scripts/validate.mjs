import { readFileSync, existsSync } from 'node:fs';

const htmlPath = new URL('../dist/index.html', import.meta.url);
const vercelPath = new URL('../vercel.json', import.meta.url);

if (!existsSync(htmlPath) || !existsSync(vercelPath)) {
  throw new Error('dist/index.html ve vercel.json bulunmalıdır.');
}

const html = readFileSync(htmlPath, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);

if (scripts.length !== 1) {
  throw new Error(`Bir inline script bekleniyordu; bulunan: ${scripts.length}.`);
}

new Function(scripts[0]);
JSON.parse(readFileSync(vercelPath, 'utf8'));

for (const asset of ['collon.css', 'collon-mark.svg', 'collon-wordmark.svg', 'collon-transfer.js', 'fonts/manrope-latin.woff2', 'fonts/manrope-latin-ext.woff2', 'fonts/OFL.txt']) {
  if (!existsSync(new URL(`../dist/assets/${asset}`, import.meta.url))) {
    throw new Error(`Collon varlığı eksik: ${asset}`);
  }
}
if (!html.includes('assets/collon.css') || !html.includes('assets/collon-transfer.js')) {
  throw new Error('Collon stil ve veri aktarımı sayfaya bağlanmalıdır.');
}

console.log('Collon statik doğrulaması geçti.');
