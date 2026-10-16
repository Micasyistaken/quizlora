import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');

test('category entrance distinguishes available quizzes from play modes without placeholder taxonomy',()=>{
  const category=html.match(/V\.kategori=id=>\{([\s\S]*?)\n\};/)?.[1]||'';
  assert.match(category,/scene-actions/);
  assert.match(category,/qs\.length\?/);
  assert.doesNotMatch(category,/Özel konu/);
  assert.match(category,/Bu konuda hazır quiz yok/);
});

test('quiz entrance presents one primary start action and a quieter restart action',()=>{
  const intro=html.match(/V\.quiz=id=>\{([\s\S]*?)\n\};/)?.[1]||'';
  assert.match(intro,/scene-actions/);
  assert.match(intro,/scene-action-primary/);
  assert.match(intro,/scene-action-secondary/);
  assert.match(intro,/data-a="restart"/);
});

test('mode entrances and solving surfaces share task-specific layout classes',()=>{
  assert.match(html,/V\.sinav=id=>\{[\s\S]*?mode-entry/);
  assert.match(html,/V\.yolculuk=\(\)=>\{[\s\S]*?journey-entry/);
  assert.match(html,/V\.duello=\(\)=>\{[\s\S]*?duel-entry/);
  assert.match(html,/class="run run-scene"/);
});
