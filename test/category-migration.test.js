import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const treeSource = html.match(/const\s+TREE\s*=\s*(\[[\s\S]*?\]);\s*\nconst\s+QZ\s*=/);
assert.ok(treeSource, 'Kategori ağacı bulunamadı.');
const tree = new Function(`return (${treeSource[1]});`)();
const configStart = html.indexOf('const CATALOG_VERSION=');
const configEnd = html.indexOf('const PREMIUM_CATEGORY_NAMES=', configStart);
const migrationStart = html.indexOf('function syncCatalog(){');
const migrationEnd = html.indexOf('function migrate(){', migrationStart);
assert.ok(configStart >= 0 && configEnd > configStart && migrationStart >= 0 && migrationEnd > migrationStart);
const migrationCode = `${html.slice(configStart, configEnd)}\n${html.slice(migrationStart, migrationEnd)}\nreturn syncCatalog();`;

test('removed categories disappear while quizzes, follows and progress are reassigned', () => {
  const cats = [
    { id: 'c1', n: 'Genel Kültür', i: 'globe', c: '#5B3DF5', p: null },
    { id: 'c2', n: 'Dünya hakkında bilgiler', p: 'c1' },
    { id: 'c3', n: 'Günlük hayattan bilgiler', p: 'c1' },
    { id: 'c4', n: 'Karma bilgi', p: 'c1' },
    { id: 'c5', n: 'Matematik ve Mantık', i: 'calc', c: '#DB2777', p: null },
    { id: 'c6', n: 'Temel matematik', p: 'c5' },
    { id: 'c7', n: 'Problemler', p: 'c5' },
    { id: 'c8', n: 'Oyunlar ve E-spor', i: 'pad', c: '#7C3AED', p: null },
    { id: 'c9', n: 'Valorant', p: 'c8' },
    { id: 'c10', n: 'Diğer video oyunları', p: 'c8' }
  ];
  const db = {
    catalogVersion: 3,
    cats,
    quizzes: [
      { id: 'q1', cat: 'c9', qs: [{ cat: 'c8', sub: 'c9' }] },
      { id: 'q2', cat: 'c6', qs: [{ cat: 'c5', sub: 'c6' }] },
      { id: 'q3', cat: 'c2', qs: [{ cat: 'c1', sub: 'c2' }] }
    ],
    extra: [{ cat: 'c3' }],
    sugs: [{ cat: 'c9' }],
    users: { a: {
      follows: ['c2', 'c3', 'c5'],
      cat: { c5: { a: 6, c: 4 } },
      sub: { c2: { a: 3, c: 2 }, c3: { a: 4, c: 3 }, c4: { a: 5, c: 4 }, c9: { a: 1, c: 1 } }
    } },
    s: { groups: [] }
  };
  const before = new Set(db.cats.map(c => c.n));
  assert.ok(before.has('Valorant') && before.has('Temel matematik'), 'Pozitif kontrol: eski kategoriler fixture içinde olmalı.');
  const migrate = new Function('DB', 'TREE', 'GROUP_NAMES', migrationCode);
  assert.equal(migrate(db, tree, tree.map(([name]) => [name])), true);
  assert.equal(db.catalogVersion, 4);
  const names = new Set(db.cats.map(c => c.n));
  for (const removed of ['Dünya hakkında bilgiler', 'Günlük hayattan bilgiler', 'Temel matematik', 'Valorant', 'Matematik ve Mantık']) {
    assert.ok(!names.has(removed), `${removed} eski katalogdan kaldırılmalı.`);
  }
  assert.equal(db.cats.find(c => c.id === 'c5')?.n, 'Mantık', 'Ana kategori kimliği korunmalı.');
  assert.deepEqual(db.quizzes.map(q => q.cat), ['c10', 'c7', 'c4']);
  assert.deepEqual(db.quizzes.map(q => q.qs[0].sub), ['c10', 'c7', 'c4']);
  assert.equal(db.extra[0].cat, 'c4');
  assert.equal(db.sugs[0].cat, 'c10');
  assert.deepEqual(db.users.a.follows, ['c4', 'c5']);
  assert.deepEqual(db.users.a.sub.c4, { a: 12, c: 9 });
  assert.deepEqual(db.users.a.sub.c10, { a: 1, c: 1 });
  assert.deepEqual(db.users.a.cat.c5, { a: 6, c: 4 });
  const ids = new Set(db.cats.map(c => c.id));
  assert.ok(db.quizzes.every(q => ids.has(q.cat) && q.qs.every(x => ids.has(x.cat) && ids.has(x.sub))));
});
