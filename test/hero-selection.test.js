import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const start = source.indexOf('function selectHeroQuizzes(');
const end = source.indexOf('function heroHtml()', start);

function selector(categories) {
  assert.ok(start > 0 && end > start, 'home quiz selector exists');
  const byId = new Map(categories.map(c => [c.id, c]));
  const context = {
    cat: id => byId.get(id),
    mainOf: id => byId.get(byId.get(id)?.p),
    Math,
  };
  return vm.runInNewContext(`${source.slice(start, end)}; selectHeroQuizzes`, context);
}

const categories = Array.from({ length: 4 }, (_, group) => [
  { id: `m${group}`, n: `Main ${group}` },
  ...Array.from({ length: 4 }, (_, child) => ({ id: `c${group}-${child}`, p: `m${group}`, n: `Topic ${group}-${child}` })),
]).flat();
const quizzes = categories.filter(c => c.p).map((c, i) => ({ id: `q${i}`, cat: c.id, st: 'yayinda' }));

test('home selection shows nine published quizzes from distinct real categories', () => {
  const pick = selector(categories);
  const selected = pick([...quizzes, { id: 'draft', cat: 'c0-0', st: 'taslak' }, { id: 'orphan', cat: 'missing', st: 'yayinda' }], 9, () => .42);
  assert.equal(selected.length, 9);
  assert.equal(new Set(selected.map(q => q.cat)).size, 9);
  assert.equal(new Set(selected.map(q => categories.find(c => c.id === q.cat).p)).size, 4);
  assert.ok(selected.every(q => q.st !== 'taslak' && q.id !== 'orphan'));
});

test('re-entering home changes the selected card order when the previous draw repeats', () => {
  const pick = selector(categories);
  const first = pick(quizzes, 9, () => .3);
  const second = pick(quizzes, 9, () => .3, first.map(q => q.id));
  assert.notDeepEqual(Array.from(second, q => q.id), Array.from(first, q => q.id));
  assert.equal(new Set(second.map(q => q.id)).size, 9);
});
