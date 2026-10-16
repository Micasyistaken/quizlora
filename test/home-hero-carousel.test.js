import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const hero = html.slice(html.indexOf('function heroHtml(){'), html.indexOf('function countUp(){'));
const fan = html.slice(html.indexOf('function initFan(root){'), html.indexOf('A.carprev=', html.indexOf('function initFan(root){')));

test('hero card carousel keeps its dimensions and uses timed and explicit controls', () => {
  assert.ok(hero.includes('class="hero-fan-arrow prev"') && hero.includes('class="hero-fan-arrow next"'));
  assert.ok(!hero.includes('hero-fan-pause'), 'Separate pause/resume control must be absent.');
  assert.ok(hero.includes('data-quiz="${q.id}"'), 'Hero cards must open an in-page card, not navigate directly.');
  assert.ok(hero.includes('class="hero-card-hit"') && hero.includes('class="btn hero-card-play"'), 'Hero cards must reveal the quiz link only after selection.');
  assert.match(html, /#hero \.fan\{margin-top:180px\}/, 'Desktop card stack must leave room to rise without covering search.');
  assert.match(html, /#hero \.fan\{height:340px;margin-top:82px/, 'Mobile card stack must move down.');
  assert.match(html, /\.fan\{--cw:300px;--ch:446px/, 'Desktop card measurements must remain intact.');
  assert.match(html, /#hero \.fan \.fc\{display:block;position:absolute;[^}]*width:170px;height:304px/, 'Mobile side card measurements must remain intact.');
  assert.match(html, /#hero \.fan \.fc\[data-slot="0"\]\{width:212px;height:348px/, 'Mobile center card measurements must remain intact.');
  assert.match(fan, /if\(!hero\)\{\s*root\.addEventListener\('pointermove'/, 'Pointer-driven movement must be limited to the other carousel.');
  assert.match(fan, /setTimeout\(\(\)=>\{active=\(active\+1\)%n;layout\(\);schedule\(\)\},5000\)/, 'Hero must step left every five seconds.');
  assert.match(fan, /const step=d=>\{\s*const wasOpen=!!expanded/, 'Arrow controls must preserve the open state.');
  assert.match(fan, /expanded=cards\[active\];\s*expanded\.classList\.add\('is-open'\)/, 'The incoming arrow card must remain raised.');
  assert.match(fan, /reduce\.matches/, 'Reduced motion must disable automatic movement.');
  assert.match(hero, /<a class="btn hero-card-play" id="hero-card-play-\$\{i\}" href="#\/quiz\/\$\{q\.id\}" tabindex="-1">Oyna/, 'Inline card must preserve the correct quiz destination.');
  assert.match(fan, /expanded=c;c\.classList\.add\('is-open'\)/, 'Selected card must open in place.');
  assert.match(fan, /document\.addEventListener\('click',e=>\{if\(expanded&&!expanded\.contains\(e\.target\)&&!e\.target\.closest\('\.hero-fan-arrow'\)\)/, 'Outside click must close the card, excluding carousel arrows.');
  assert.ok(!html.includes('hero-card-dialog'), 'Card must not create a dark modal backdrop.');
  assert.match(html, /#hero \.hero-fan-arrow\.prev\{left:calc\(50% - var\(--hero-arrow-offset,212px\)\)\}/, 'Desktop arrows must track the scaled center card.');
  assert.match(html, /#hero \.hero-fan-arrow\.prev\{left:calc\(50% - 160px\)\}/, 'Mobile arrows must sit beside the center card.');
  console.log('hero carousel behavior passed');
});

test('homepage discovery provides a daily pick, switchable quiz list and complete category access', () => {
  const home = html.slice(html.indexOf('V.home=()=>{'), html.indexOf('function searchHtml(q){'));
  assert.match(home, /timeZone:'Europe\/Istanbul'/);
  assert.match(home, /data-a="homepick"/);
  assert.match(home, /data-a="homefeed" data-feed="popular"/);
  assert.match(home, /data-a="homefeed" data-feed="new"/);
  assert.match(home, /leads\.map\(exCard\)/);
  assert.match(home, /others\.map\(m=>`<a href="#\/kategori\/\$\{m\.id\}"/);
  assert.match(html, /brain:`<path/, 'Logic category artwork should not degrade to a missing symbol.');
});
