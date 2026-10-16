import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { now, shuffleStable } from './utils.js';

/** Produces a static, browser-safe pool: correct answers are represented only by an option index. */
export async function exportQuestionPool(store, output = resolve('dist', 'question-pool.json')) {
  const db = await store.load(); const names = new Map(db.categories.map((category) => [category.id, category.name]));
  const questions = db.questions.filter((question) => question.status === 'approved').map((question) => {
    const options = shuffleStable([question.correct_answer, ...question.wrong_answers], question.id);
    return { id: question.id, category_name: names.get(question.category_id), question: question.question, options, answer_index: options.indexOf(question.correct_answer), explanation: `Doğrulanmış kaynak: ${question.knowledge_item_id}`, difficulty: question.difficulty, source_knowledge_item_id: question.knowledge_item_id };
  });
  const payload = { version: 1, generated_at: now(), questions };
  const destination = resolve(output); await mkdir(dirname(destination), { recursive: true }); await writeFile(destination, `${JSON.stringify(payload)}\n`, 'utf8');
  return { output: destination, approved_questions: questions.length };
}
