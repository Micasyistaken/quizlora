import { dirname, resolve } from 'node:path';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { now } from './utils.js';

export const emptyDatabase = () => ({
  schema_version: 1,
  created_at: now(),
  updated_at: now(),
  categories: [],
  knowledge_items: [],
  questions: [],
  question_stats: [],
  quiz_sets: [],
  generation_jobs: [],
  source_records: []
});

/** Small, dependency-free durable store. It is deliberately replaceable by PostgreSQL. */
export class JsonStore {
  constructor(file = process.env.QUIZLORA_DATA_FILE || resolve('data', 'quizlora-bot.json')) {
    this.file = resolve(file);
    this.data = null;
  }

  async load() {
    if (this.data) return this.data;
    try { this.data = JSON.parse(await readFile(this.file, 'utf8')); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      this.data = emptyDatabase();
      await this.save();
    }
    return this.data;
  }

  async save() {
    if (!this.data) throw new Error('Kaydedilecek veri yüklenmedi.');
    this.data.updated_at = now();
    await mkdir(dirname(this.file), { recursive: true });
    const temporary = `${this.file}.tmp`;
    await writeFile(temporary, `${JSON.stringify(this.data, null, 2)}\n`, 'utf8');
    await rename(temporary, this.file);
  }

  async transaction(change) {
    const data = await this.load();
    const result = await change(data);
    await this.save();
    return result;
  }
}
