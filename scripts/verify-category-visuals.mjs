import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const htmlPath = new URL('dist/index.html', root);
const symbolsPath = new URL('dist/assets/category-symbols.js', root);
const html = readFileSync(htmlPath, 'utf8');

const treeMatch = html.match(/const\s+TREE\s*=\s*(\[[\s\S]*?\]);\s*\nconst\s+QZ\s*=/);
const officialMatch = html.match(/const\s+OFFICIAL_CATEGORY_MARKS\s*=\s*Object\.freeze\((\{[\s\S]*?\})\);/);
assert.ok(treeMatch, 'Kategori ağacı bulunamadı.');
assert.ok(officialMatch, 'Resmî logo haritası bulunamadı.');
assert.ok(existsSync(symbolsPath), 'Kategorilere özel sembol dosyası bulunamadı.');

const tree = new Function(`return (${treeMatch[1]});`)();
const names = tree.flatMap(([main, , , children]) => [main, ...children]);
const symbolsSource = readFileSync(symbolsPath, 'utf8');
const symbolsMatch = symbolsSource.match(/window\.QZ_CATEGORY_SYMBOLS=Object\.freeze\((\{[\s\S]*\})\);/);
assert.ok(symbolsMatch, 'Derlenmiş kategori sembolleri bulunamadı.');
const symbols = JSON.parse(symbolsMatch[1]);
const official = new Function(`return (${officialMatch[1]});`)();
assert.equal(names.length, 148, 'Kategori ağacının kapsamı beklenmedik biçimde değişti.');
assert.equal(Object.keys(symbols).length, names.length, 'Her kategoriye özel bir sembol atanmalı.');
assert.equal(new Set(tree.map(([name]) => symbols[name])).size, tree.length, 'Ana kategorilerin vektör simgeleri farklı olmalı.');

for (const name of names) {
  assert.ok(typeof symbols[name] === 'string' && symbols[name].length > 10, `${name} için konu simgesi eksik.`);
}

const brandedNames = [
  'Süper Lig', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
  'Dünya Kupası', 'League of Legends', 'Minecraft', 'Naruto',
  'One Piece', 'Dragon Ball'
];
assert.deepEqual(Object.keys(official).sort(), brandedNames.sort(), 'Resmî marka kategorileri eksik veya fazla.');
const conceptualChildren = tree.flatMap(([, , , children]) => children).filter(name => !official[name]);
assert.equal(
  new Set(conceptualChildren.map(name => symbols[name])).size,
  conceptualChildren.length,
  'Kavramsal alt kategoriler aynı konu simgesini tekrar etmemeli.'
);
for (const [name, relativePath] of Object.entries(official)) {
  assert.ok(names.includes(name), `${name} katalogda bulunmuyor.`);
  const markPath = new URL(`dist/assets/${relativePath}`, root);
  assert.ok(existsSync(markPath), `${name} için yerel logo bulunamadı.`);
  const mark = readFileSync(markPath);
  assert.ok(mark.length > 100, `${name} logo dosyası boş.`);
  assert.ok(relativePath.endsWith('.svg'), `${name} logosu raster değil SVG olmalı.`);
  const svg = mark.toString('utf8');
  assert.match(svg, /<svg[\s>]/, `${name} SVG dosyası geçersiz.`);
  assert.doesNotMatch(svg, /<script|\bonload\s*=|<foreignObject|<image|data:image/i, `${name} SVG dosyasında raster veya aktif içerik var.`);
}

assert.match(html, /function\s+categoryVisual\(/, 'Kategori görsel bileşeni bulunamadı.');
assert.match(html, /QZ_CATEGORY_SYMBOLS\?\.\[label\]/, 'Konuya özel semboller görsel bileşende kullanılmıyor.');
assert.match(html, /official\?`<span class="official-mark"/, 'Vektör logo eşlemesi görsel bileşende kullanılmıyor.');
assert.match(html, /class="category-art/, 'Kategori görsel bileşeni kullanılmıyor.');
assert.doesNotMatch(html, /cat-orbit|cat-spark|category-art::before|category-art::after/, 'Simgelerin dekoratif kutu/çerçeveleri kaldırılmalı.');
assert.match(html, /\.category-art\{[^}]*background:none;box-shadow:none/, 'Kategori simgelerinin kutu zemini kaldırılmalı.');

console.log(`Category visual system verification passed: ${names.length} subject symbols, ${brandedNames.length} official marks.`);
