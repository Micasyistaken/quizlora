#!/usr/bin/env node
import { createBot, fillAllPools, fillPool, runNaturalCommand } from './bot.js';
import { exportQuestionPool } from './core/export.js';

const [, , command, ...args] = process.argv;
const bot = createBot();
const flag = (name, fallback = null) => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : fallback; };
const requireCategory = async () => {
  const value = flag('--category'); if (!value) throw new Error('--category zorunludur.');
  const category = await bot.categories.bySlug(value); if (!category) throw new Error(`Aktif kategori bulunamadı: ${value}`);
  return category;
};
const print = (value) => console.log(JSON.stringify(value, null, 2));
const help = () => console.log(`Quizlora Question Pool Bot

Komutlar:
  categories:sync
  categories:list
  categories:set-context --category <slug> --description <metin> --sources <virgüllü sorgular>
  knowledge:populate --category <slug> --entities <sorgu,...>
  knowledge:populate-sparql --category <slug> --predicate <ilişki> --query-file <dosya.rq>
  knowledge:populate-countries --category <slug>
  knowledge:import --category <slug> --file <facts.json>
  knowledge:validate --category <slug>
  knowledge:stats --category <slug>
  questions:generate --category <slug> --count <sayı>
  questions:revalidate --category <slug>
  questions:deduplicate --category <slug>
  questions:stats --category <slug>
  questions:fill --category <slug> --target <sayı>
  questions:fill-all --target <sayı>
  questions:export [--output <dosya>]
  quiz:generate --category <slug> --count <sayı> [--difficulty easy|medium|hard]
  run "Coğrafya kategorisini 100 soruya tamamla."
  doctor
`);

try {
  await bot.categories.sync();
  if (!command || command === '--help' || command === 'help') help();
  else if (command === 'categories:sync') print(await bot.categories.sync());
  else if (command === 'categories:list') print(await bot.categories.list());
  else if (command === 'categories:set-context') {
    const category = await requireCategory();
    const sources = flag('--sources');
    print(await bot.categories.configure(category.slug, { knowledgeDescription: flag('--description'), sourceQueries: sources ? sources.split(',').map((x) => x.trim()).filter(Boolean) : undefined }));
  } else if (command === 'knowledge:populate') {
    const category = await requireCategory(); const values = flag('--entities', flag('--entity'));
    if (!values) throw new Error('--entities veya --entity zorunludur.');
    print(await bot.knowledge.populateWikidata(category, values.split(',').map((x) => x.trim()).filter(Boolean)));
  } else if (command === 'knowledge:populate-sparql') {
    const category = await requireCategory(); const queryFile = flag('--query-file'); const predicate = flag('--predicate');
    if (!queryFile || !predicate) throw new Error('--query-file ve --predicate zorunludur.');
    print(await bot.knowledge.importSparql(category, queryFile, predicate));
  } else if (command === 'knowledge:populate-countries') { const category = await requireCategory(); print(await bot.knowledge.populateCountries(category));
  } else if (command === 'knowledge:import') {
    const category = await requireCategory(); const file = flag('--file'); if (!file) throw new Error('--file zorunludur.');
    print(await bot.knowledge.importManual(category, file));
  } else if (command === 'knowledge:stats') { const category = await requireCategory(); print(await bot.knowledge.stats(category.id));
  } else if (command === 'knowledge:validate') { const category = await requireCategory(); print(await bot.knowledge.validate(category));
  } else if (command === 'questions:generate') { const category = await requireCategory(); print(await bot.questions.generate(category, { count: Number(flag('--count', 1)) }));
  } else if (command === 'questions:revalidate') { const category = await requireCategory(); print(await bot.questions.revalidate(category));
  } else if (command === 'questions:deduplicate') { const category = await requireCategory(); print(await bot.questions.deduplicate(category));
  } else if (command === 'questions:stats') { const category = await requireCategory(); print(await bot.questions.stats(category.id));
  } else if (command === 'questions:fill') { const category = await requireCategory(); const target = Number(flag('--target')); if (!Number.isInteger(target) || target < 0) throw new Error('--target sıfır veya pozitif tam sayı olmalıdır.'); print(await fillPool(bot, category, target));
  } else if (command === 'questions:fill-all') { const target = Number(flag('--target')); if (!Number.isInteger(target) || target < 0) throw new Error('--target sıfır veya pozitif tam sayı olmalıdır.'); print(await fillAllPools(bot, target));
  } else if (command === 'questions:export') { print(await exportQuestionPool(bot.store, flag('--output') || undefined));
  } else if (command === 'quiz:generate') {
    const category = await requireCategory(); const count = Number(flag('--count', 20)); const difficulty = flag('--difficulty');
    print(await bot.quizzes.generate(category, { count, difficultyDistribution: difficulty ? { [difficulty]: count } : null }));
  } else if (command === 'run') print(await runNaturalCommand(bot, args.join(' ')));
  else if (command === 'doctor') {
    const sync = await bot.categories.sync(); const db = await bot.store.load();
    print({ status: 'ok', categories: sync.active, knowledge_items: db.knowledge_items.length, questions: db.questions.length, data_file: bot.store.file, source_policy: 'explicit source plans; no quiz scraping' });
  } else { throw new Error(`Bilinmeyen komut: ${command}`); }
} catch (error) {
  console.error(JSON.stringify({ error: error.message }, null, 2)); process.exitCode = 1;
}
