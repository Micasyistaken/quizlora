import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createBot } from '../src/bot.js';
import { WikidataSourceAdapter } from '../src/sources/wikidata.js';

const workspace = async () => mkdtemp(join(tmpdir(), 'quizlora-bot-'));
const sourceFile = resolve('dist', 'index.html');
async function botFor(folder) {
  const bot = createBot({ dataFile: join(folder, 'store.json'), categories: { sourceUrl: 'http://127.0.0.1:1/unavailable', localFile: sourceFile } });
  await bot.categories.sync(); return bot;
}
const fact = (subject, object, predicate = 'başkent') => ({ subject, entity: subject, predicate, object, source_name: 'Test primary source', source_url: `https://example.test/${encodeURIComponent(subject)}`, source_type: 'manual', confidence_score: 0.99 });

test('current Quizlora categories are discovered from the public bundle', async (t) => {
  const folder = await workspace(); t.after(() => rm(folder, { recursive: true, force: true }));
  const bot = await botFor(folder); const categories = await bot.categories.list();
  assert.ok(categories.some((category) => category.name === 'Coğrafya'));
  assert.ok(categories.some((category) => category.name === 'Ülkeler ve başkentler'));
});

test('same relation is idempotent and facts without provenance are rejected', async (t) => {
  const folder = await workspace(); t.after(() => rm(folder, { recursive: true, force: true }));
  const bot = await botFor(folder); const category = await bot.categories.bySlug('coğrafya');
  const first = await bot.knowledge.addCandidates(category, [fact('Türkiye', 'Ankara'), fact('Türkiye', 'Ankara'), { subject: 'X', predicate: 'başkent', object: 'Y' }]);
  assert.equal(first.accepted.length, 1); assert.equal(first.duplicate.length, 1); assert.equal(first.rejected.length, 1);
});

test('only verified, non-expired facts make approved questions with same-class distractors', async (t) => {
  const folder = await workspace(); t.after(() => rm(folder, { recursive: true, force: true }));
  const bot = await botFor(folder); const category = await bot.categories.bySlug('coğrafya');
  await bot.knowledge.addCandidates(category, [fact('Türkiye', 'Ankara'), fact('Fransa', 'Paris'), fact('İtalya', 'Roma'), fact('Japonya', 'Tokyo')]);
  const generated = await bot.questions.generate(category, { count: 2 });
  assert.equal(generated.approved, 2);
  const generatedAgain = await bot.questions.generate(category, { count: 2 });
  assert.equal(generatedAgain.approved, 2, 'other relations may still be produced, but no relation is repeated');
  const db = await bot.store.load();
  assert.equal(new Set(db.questions.map((question) => question.question_key)).size, db.questions.length);
  db.knowledge_items.forEach((item) => { item.expires_at = '2000-01-01T00:00:00.000Z'; }); await bot.store.save();
  assert.equal((await bot.questions.generate(category, { count: 1 })).approved, 0);
});

test('quiz selection favors the requested difficulty and tracks usage', async (t) => {
  const folder = await workspace(); t.after(() => rm(folder, { recursive: true, force: true }));
  const bot = await botFor(folder); const category = await bot.categories.bySlug('coğrafya');
  await bot.knowledge.addCandidates(category, [fact('Türkiye', 'Ankara'), fact('Fransa', 'Paris'), fact('İtalya', 'Roma'), fact('Japonya', 'Tokyo')]);
  await bot.questions.generate(category, { count: 4 });
  const db = await bot.store.load(); db.questions.forEach((question, index) => { question.difficulty = index < 2 ? 'easy' : 'medium'; }); await bot.store.save();
  const quiz = await bot.quizzes.generate(category, { count: 2, difficultyDistribution: { easy: 2 } });
  assert.equal(quiz.actual_count, 2); assert.ok(quiz.questions.every((question) => question.difficulty === 'easy'));
  assert.ok((await bot.store.load()).questions.some((question) => question.times_used > 0));
});

test('ambiguous multi-valued Wikidata claims are not turned into quiz facts', async () => {
  const adapter = new WikidataSourceAdapter();
  adapter.labels = async (ids) => Object.fromEntries(ids.map((value) => [value, value]));
  const facts = await adapter.extractFacts({ id: 'QX', labels: { tr: { value: 'Örnek ülke' } }, claims: { P36: [
    { rank: 'normal', mainsnak: { snaktype: 'value', datavalue: { value: { id: 'Qold' } } } },
    { rank: 'normal', mainsnak: { snaktype: 'value', datavalue: { value: { id: 'Qnew' } } } }
  ] } });
  assert.equal(facts.length, 0);
});
