import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const asset = (path) => resolve(root, 'dist', path);
const html = readFileSync(asset('index.html'), 'utf8');

test('public document identity uses Collon assets', () => {
  assert.match(html, /<title>Collon<\/title>/);
  assert.match(html, /<meta name="description" content="Collon:/);
  assert.match(html, /<link rel="icon" href="assets\/collon-mark\.svg"/);
  assert.match(html, /<link rel="stylesheet" href="assets\/collon\.css"/);
});

test('brand art is scalable vector, not embedded raster', () => {
  for (const name of ['collon-mark.svg', 'collon-wordmark.svg']) {
    const path = asset(`assets/${name}`);
    assert.ok(existsSync(path), `${name} exists`);
    const svg = readFileSync(path, 'utf8');
    assert.match(svg, /<svg[^>]+viewBox="[^"]+"/);
    assert.doesNotMatch(svg, /<image\b|data:image\//);
  }
});

test('self-hosted Manrope and OFL license are included', () => {
  assert.ok(existsSync(asset('assets/fonts/manrope-latin.woff2')));
  assert.ok(existsSync(asset('assets/fonts/manrope-latin-ext.woff2')));
  assert.match(readFileSync(asset('assets/fonts/OFL.txt'), 'utf8'), /SIL OPEN FONT LICENSE/);
});

test('brand layer registers the self-hosted UI font', () => {
  const css = readFileSync(asset('assets/collon.css'), 'utf8');
  assert.match(css, /@font-face[\s\S]*?font-family:\s*['"]Collon UI/);
});
