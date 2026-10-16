import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const protocol=readFileSync(new URL('../AGENTS.md',import.meta.url),'utf8');

test('Türkiye clock keeps separators fixed and animates changed digits only',()=>{
  assert.match(html,/timeZone:'Europe\/Istanbul'/);
  assert.match(html,/\$\{clockHtml\(\)\}<a class="brand"/);
  assert.match(html,/if\(!cell\|\|!current\|\|current\.textContent===digit\)return/);
  assert.match(html,/if\(reduce\|\|document\.hidden\)/);
  assert.match(html,/class="clock-separator/);
  assert.match(protocol,/Unlumen Animate Digits referansını/);
});

test('dock and motion menu retain routes with accessible shared content',()=>{
  assert.match(html,/class="docknav" id="desktop-dock"/);
  assert.match(html,/class="dock-panel" id="dock-panel" aria-hidden="true" inert/);
  assert.match(html,/s\.target=1\+\.28\*Math\.exp/);
  assert.match(html,/MAINS\(\)\.map\(m=>\[`#\/kategori\/\$\{m\.id\}`/);
  assert.match(html,/DAILY_MODES\.map\(m=>\[`#\/gunluk\/\$\{m\.id\}`/);
  assert.match(html,/nav\.addEventListener\('keydown',e=>\{if\(e\.key==='Escape'/);
});

test('Unlumen theme switch reveals theme and remains a keyboard-accessible button',()=>{
  assert.match(html,/class="theme-switch" id="theme-switch" type="button"/);
  assert.match(html,/Açık temaya geç/);
  assert.match(html,/document\.startViewTransition\(apply\)/);
  assert.match(html,/@keyframes theme-reveal/);
  assert.match(html,/prefers-reduced-motion: reduce/);
  assert.match(html,/control\.addEventListener\('click'/);
  assert.match(html,/function setTheme\(theme\)/);
});

test('navigation and quiz-start CTAs use cursor pull with spring return',()=>{
  assert.match(html,/const MAGNETIC_SELECTOR=/);
  assert.match(html,/a\.btn\[href\^="#\/"\]/);
  assert.match(html,/a\.hero-daily-cta/);
  assert.match(html,/button\[data-a="krnd"\]/);
  assert.match(html,/const pull=dist<100\?\(1-dist\/100\)\*\.5:0/);
  assert.match(html,/function release\(el\)/);
  assert.match(html,/initMagneticButtons\(\);/);
});
