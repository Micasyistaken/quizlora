import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

test('hero discovery and symbols reuse the category visual system', () => {
  assert.match(html, /class="fca hero-card-symbol">\$\{categoryVisual\(subject,m,210\)\}/);
  assert.match(html, /class="hero-discover desktop"><a href="#\/kesfet">Daha fazlasını keşfet/);
  assert.match(html, /<div class="hstats">[\s\S]*?class="hero-discover"><a href="#\/kesfet">Daha fazlasını keşfet/);
});

test('daily navigation and four mode routes are connected', () => {
  assert.match(html, /\['#\/','Ana Sayfa','home'\],\['#\/gunluk','Günlük','sun'\],\['#\/kesfet','Keşfet','compass'\]/);
  assert.match(html, /gunluk:\(\)=>V\.gunluk\(a\)/);
  for (const id of ['parolla', 'kelime', 'pixel', 'film']) {
    assert.match(html, new RegExp(`id:'${id}'`));
  }
  assert.match(html, /href="#\/gunluk\/\$\{m\.id\}"[^>]*>Başlat/);
  assert.match(html, /data-mini-game="\$\{mode\.id\}"/);
  assert.match(html, /\.mqb\{[^}]*min-height:350px/);
});

test('tilt effect is pointer-limited and motion-aware', () => {
  assert.match(html, /if\(e\.pointerType!=='mouse'\|\|reduced\.matches\)return/);
  assert.match(html, /prefers-reduced-motion: reduce/);
  assert.match(html, /card\.addEventListener\('pointercancel',reset\)/);
  assert.match(html, /card\.addEventListener\('focusin',reset\)/);
  assert.match(html, /state\.tx=sensitivity\(\.5-y\);state\.ty=sensitivity\(x-\.5\)/);
  assert.match(html, /Math\.tanh\(v\*3\.2\)\/Math\.tanh\(1\.6\)\*11/);
  assert.match(html, /state\.frame=requestAnimationFrame\(animate\)/);
  assert.match(html, /class="daily-float">\$\{dailyArt\(m\.art\)\}/);
  assert.match(html, /\.daily-card\.is-tilting::after\{clip-path:circle\(110%/);
});

test('home hero leads directly to daily games without a duplicate search form', () => {
  const hero=html.slice(html.indexOf('function heroHtml(){'),html.indexOf('function countUp(){'));
  assert.match(hero, /<h1 class="hh"><span>Bilgini<\/span> <span>konuştur\.<\/span><\/h1>/);
  assert.match(hero, /class="hero-daily-cta" href="#\/gunluk"/);
  assert.doesNotMatch(hero, /class="hsearch"/);
  assert.match(html, /#hero \.hh\{white-space:nowrap/);
});
