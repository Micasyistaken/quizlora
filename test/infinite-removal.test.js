import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');

test('only Daily, Explore and Modes provide desktop navigation submenus',()=>{
  const menu=html.match(/function navMenuItems\(key\)\{([\s\S]*?)\n\}/)?.[1]||'';
  const keys=[...menu.matchAll(/if\(key==='([^']+)'\)/g)].map(match=>match[1]);
  assert.deepEqual(keys,['gunluk','kesfet','modlar']);
});

test('infinite test has no playable route or visible entry point',()=>{
  assert.doesNotMatch(html,/#\/sonsuz(?:\/|["'])/);
  assert.doesNotMatch(html,/V\.sonsuz\s*=/);
  assert.doesNotMatch(html,/Sonsuz test|Sonsuz Merak|Kesintisiz Test/i);
  assert.match(html,/sonsuz:\(\)=>go\('#\/modlar'\)/);
});
