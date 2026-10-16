import { JsonStore } from './core/store.js';
import { CategoryService } from './core/categories.js';
import { KnowledgeService } from './core/knowledge.js';
import { QuestionService, QuizService } from './core/questions.js';
import { WikidataSourceAdapter } from './sources/wikidata.js';
import { ManualSourceAdapter } from './sources/manual.js';
import { WikidataSparqlAdapter } from './sources/wikidata-sparql.js';
import { RestCountriesAdapter } from './sources/rest-countries.js';

export const createBot = (options = {}) => {
  const store = options.store || new JsonStore(options.dataFile);
  const categories = new CategoryService(store, options.categories);
  const knowledge = new KnowledgeService(store, { wikidata: new WikidataSourceAdapter(), sparql: new WikidataSparqlAdapter(), countries: new RestCountriesAdapter(), manual: new ManualSourceAdapter() });
  const questions = new QuestionService(store, knowledge, options.questions);
  const quizzes = new QuizService(store);
  return { store, categories, knowledge, questions, quizzes };
};

export async function fillPool(bot, category, target) {
  const before = await bot.questions.stats(category.id);
  const needed = Math.max(0, Number(target) - before.approved);
  const knowledgeBefore = await bot.knowledge.stats(category.id);
  let ingestion = null;
  // Category-owned seed terms are explicit editorial policy. No uncontrolled web crawling occurs.
  if (needed > 0 && knowledgeBefore.active < needed * 4 && category.source_queries?.length) {
    ingestion = await bot.knowledge.populateWikidata(category, category.source_queries);
  }
  const generation = needed ? await bot.questions.generate(category, { count: needed }) : { requested: 0, approved: 0 };
  const deduplication = await bot.questions.deduplicate(category);
  const after = await bot.questions.stats(category.id);
  return { category: category.name, target: Number(target), pool_before: before.approved, needed, knowledge_before: knowledgeBefore, ingestion, generation, deduplication, pool_after: after.approved, remaining: Math.max(0, Number(target) - after.approved), source_plan_required: needed > 0 && !category.source_queries?.length };
}

export async function fillAllPools(bot, target) {
  const categories = await bot.categories.list(); const reports = [];
  for (const category of categories) reports.push(await fillPool(bot, category, target));
  return { target_per_category: Number(target), categories: reports.length, completed: reports.filter((report) => report.remaining === 0).length, source_plan_required: reports.filter((report) => report.source_plan_required).map((report) => report.category), reports };
}

const phrase = (value) => value.toLocaleLowerCase('tr-TR').replace(/[.!?]+$/g, '').trim();
export async function runNaturalCommand(bot, text) {
  await bot.categories.sync();
  const command = phrase(text);
  const categories = await bot.categories.list();
  const names = categories.sort((a, b) => b.name.length - a.name.length).map((category) => category.name);
  const categoryFor = (raw) => (raw ? categories.find((category) => phrase(raw) === phrase(category.name)) : null) || categories.find((category) => command.includes(phrase(category.name)));
  const allMatch = command.match(/tüm\s+aktif\s+kategorileri\s+minimum\s+(\d+)\s+soruya\s+(?:çıkar|tamamla)/);
  if (allMatch) return { operation: 'questions:fill-all', report: await fillAllPools(bot, Number(allMatch[1])) };
  const targetMatch = command.match(/(\d+)\s+soruya\s+tamamla/);
  if (targetMatch) {
    const category = categoryFor(); if (!category) throw new Error(`Kategori komutta bulunamadı. Bilinen kategoriler: ${names.join(', ')}`);
    return { operation: 'questions:fill', report: await fillPool(bot, category, Number(targetMatch[1])) };
  }
  const questionMatch = command.match(/(\d+)\s+(?:yeni\s+)?soru\s+(?:hazırla|üret|ekle)/);
  if (questionMatch) {
    const category = categoryFor(); if (!category) throw new Error('Kategori bulunamadı.');
    return { operation: 'questions:generate', category: category.name, report: await bot.questions.generate(category, { count: Number(questionMatch[1]) }) };
  }
  const quizMatch = command.match(/(\d+)\s+soruluk\s*(kolay|orta|zor)?\s*quiz\s+oluştur/);
  if (quizMatch) {
    const category = categoryFor(); if (!category) throw new Error('Kategori bulunamadı.');
    const difficulty = { kolay: 'easy', orta: 'medium', zor: 'hard' }[quizMatch[2]];
    return { operation: 'quiz:generate', quiz: await bot.quizzes.generate(category, { count: Number(quizMatch[1]), difficultyDistribution: difficulty ? { [difficulty]: Number(quizMatch[1]) } : null }) };
  }
  if (command.includes('duplicate') || command.includes('tekrar eden')) {
    const category = categoryFor(); if (!category) throw new Error('Kategori bulunamadı.');
    return { operation: 'questions:deduplicate', category: category.name, report: await bot.questions.deduplicate(category) };
  }
  throw new Error(`Komut anlaşılmadı. Kategori ve işlem belirtin. Örnek: “Coğrafya kategorisini 100 soruya tamamla.”`);
}
