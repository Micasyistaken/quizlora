import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = readFileSync(resolve('dist/index.html'), 'utf8');

test('existing product destinations remain wired after the brand transition', () => {
  for (const route of ['home', 'gunluk', 'kesfet', 'kategori', 'quiz', 'oyna', 'modlar', 'sinav', 'yolculuk', 'duello', 'siralamalar', 'gorevler', 'magaza', 'giris', 'kayit', 'seviye', 'profil', 'u', 'oner', 'yonetim']) {
    assert.match(html, new RegExp(`(?:\\{|,)${route}:\\(\\)=>V\\.${route}\\(`));
  }
  assert.match(html, /aktar:\(\)=>V\.aktar\(\)/);
  assert.match(html, /sonsuz:\(\)=>go\('#\/modlar'\)/);
});

test('the transfer path is discoverable without changing old local storage keys', () => {
  assert.match(html, /href="#\/aktar"/);
  assert.match(html, /localStorage\.getItem\('qz_db'\)/);
  assert.match(html, /localStorage\.setItem\('qz_db',JSON\.stringify\(result\.data\)\)/);
  assert.match(html, /Bu adresteki mevcut yerel verinin üzerine yazılmasını onaylıyorum/);
});

test('public sharing points to the confirmed Collon address while old-origin transfer remains available', () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/collon\.vercel\.app\/">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/collon\.vercel\.app\/">/);
  assert.match(html, /location\.hostname==='quizlora\.vercel\.app'/);
  assert.match(html, /href="https:\/\/collon\.vercel\.app\/#\/aktar"/);
  assert.match(html, /href="https:\/\/quizlora\.vercel\.app\/#\/aktar"/);
});
