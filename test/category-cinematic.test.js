import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import test from 'node:test';

const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const treeSource=html.match(/const TREE=(\[[\s\S]*?\]);\s*const QZ=/)?.[1];
const scenesSource=html.match(/const CATEGORY_SCENES=(\{[^;]+\});/)?.[1];

test('every catalog main category has a local photographic scene',()=>{
  assert.ok(treeSource&&scenesSource);
  const tree=runInNewContext(`(${treeSource})`);
  const scenes=runInNewContext(`(${scenesSource})`);
  for(const [name] of tree){
    assert.ok(scenes[name],`Missing scene for ${name}`);
    assert.ok(existsSync(new URL(`../dist/assets/category-scenes/${scenes[name]}.jpg`,import.meta.url)),`Missing image for ${name}`);
  }
  assert.match(html,/CATEGORY_SCENES\[\(c&&c\.p\?mainOf\(c\.id\):c\)\?\.n\]\|\|'general-culture'/);
});

test('category and quiz entrances use the centered information strip',()=>{
  assert.match(html,/V\.kategori=id=>\{[\s\S]*?<section class="scene-entry"/);
  assert.match(html,/V\.quiz=id=>\{[\s\S]*?<section class="scene-entry"/);
  assert.match(html,/\.scene-info\{[^}]*width:min\(100%,1000px\);margin:0 auto/);
  assert.match(html,/\.scene-entry>img,\.quiz-scene>img/);
});

test('choice click records the answer without a send button',()=>{
  assert.match(html,/pick\(k\)\{if\(S\.fb\)return;if\(c\.back\)[\s\S]*?else\{S\.sel=k;this\.send\(\)\}/);
  assert.doesNotMatch(html,/>Cevabı gönder<\/button>/);
  assert.match(html,/if\(c\.typed\)\{\s*h\+=`<button class="btn pri grow" data-a="send">Yanıtı onayla/);
});
