import { hash, id, isExpired, normalize, now, shuffleStable, unique } from './utils.js';

const DEFAULTS = { maxQuestionsPerKnowledgeItem: Number(process.env.MAX_QUESTIONS_PER_KNOWLEDGE_ITEM || 3), threshold: Number(process.env.QUESTION_VALIDATION_THRESHOLD || 0.9) };
const TEMPLATE = {
  başkent: (fact) => `${fact.subject} ülkesinin başkenti hangisidir?`,
  'başkenti olduğu ülke': (fact) => `${fact.subject} hangi ülkenin başkentidir?`,
  yönetmen: (fact) => `${fact.subject} yapımının yönetmeni kimdir?`,
  yazar: (fact) => `${fact.subject} adlı eserin yazarı kimdir?`,
  icracı: (fact) => `${fact.subject} eserini seslendiren ya da icra eden kişi/grup hangisidir?`,
  kâşif: (fact) => `${fact.subject} ile ilişkilendirilen kâşif kimdir?`,
  'doğum yeri': (fact) => `${fact.subject} nerede doğmuştur?`,
  'vatandaşı olduğu ülke': (fact) => `${fact.subject} hangi ülkenin vatandaşıdır?`,
  kıta: (fact) => `${fact.subject} hangi kıtada yer alır?`,
  'idari konum': (fact) => `${fact.subject} hangi idari konumda bulunur?`,
  yaratıcı: (fact) => `${fact.subject} eserinin yaratıcısı kimdir?`,
  'önemli eser': (fact) => `${fact.subject} ile ilişkilendirilen önemli eser hangisidir?`
  , 'para birimi': (fact) => `${fact.subject} ülkesinin para birimi hangisidir?`
};

const questionText = (fact) => (TEMPLATE[fact.predicate] || ((entry) => `${entry.subject} için “${entry.predicate}” bilgisi hangisidir?`))(fact);
const difficultyFor = (fact) => fact.predicate === 'başkent' || fact.predicate === 'kıta' ? 'easy' : fact.predicate === 'idari konum' ? 'hard' : 'medium';

export class QuestionService {
  constructor(store, knowledge, config = DEFAULTS) { this.store = store; this.knowledge = knowledge; this.config = { ...DEFAULTS, ...config }; }

  async validate(candidate, fact, category) {
    const issues = [];
    if (!candidate.question || candidate.question.length < 12) issues.push('question_not_understandable');
    if (candidate.correct_answer !== fact.object) issues.push('answer_does_not_match_fact');
    if (candidate.wrong_answers.length !== 3 || unique(candidate.wrong_answers).length !== 3) issues.push('wrong_answer_count_or_uniqueness');
    if (candidate.wrong_answers.includes(candidate.correct_answer)) issues.push('wrong_answer_equals_correct');
    if (isExpired(fact)) issues.push('expired_fact');
    if (!category || fact.category_id !== category.id) issues.push('wrong_category_assignment');
    if (fact.verification_status !== 'verified' || !fact.source_url) issues.push('unverified_fact');
    if (candidate.question.toLocaleLowerCase('tr-TR').includes(candidate.correct_answer.toLocaleLowerCase('tr-TR')) && candidate.correct_answer.length > 3) issues.push('answer_revealed');
    return { valid: issues.length === 0, confidence: issues.length ? Math.max(0, 0.98 - issues.length * 0.2) : 0.98, issues };
  }

  async generate(category, { count, questionType = 'multiple_choice' } = {}) {
    if (questionType !== 'multiple_choice') throw new Error('Bu sürümde yalnızca multiple_choice üretimi aktiftir.');
    const db = await this.store.load();
    const facts = await this.knowledge.verified(category.id);
    const approved = db.questions.filter((q) => q.category_id === category.id && q.status === 'approved');
    const report = { requested: Number(count), generated: 0, approved: 0, review: 0, rejected: 0, duplicate: 0, skipped: { cap: 0, noPlausibleDistractors: 0 }, items: [] };
    for (const fact of shuffleStable(facts, `${category.id}:${approved.length}`)) {
      if (report.approved >= count) break;
      const fromFact = approved.filter((question) => question.knowledge_item_id === fact.id);
      if (fromFact.length >= this.config.maxQuestionsPerKnowledgeItem) { report.skipped.cap += 1; continue; }
      // A same-predicate, independently sourced fact is our only distractor source: no hallucinated choices.
      const choices = unique(facts.filter((item) => item.predicate === fact.predicate && item.id !== fact.id).map((item) => item.object).filter((value) => value !== fact.object));
      if (choices.length < 3) { report.skipped.noPlausibleDistractors += 1; continue; }
      const wrongAnswers = shuffleStable(choices, fact.id).slice(0, 3);
      const candidate = { question: questionText(fact), correct_answer: fact.object, wrong_answers: wrongAnswers, difficulty: difficultyFor(fact), language: category.language || 'tr' };
      report.generated += 1;
      const validation = await this.validate(candidate, fact, category);
      const questionKey = `${fact.fact_key}|${questionType}`;
      const duplicate = db.questions.some((question) => question.question_key === questionKey || normalize(question.question) === normalize(candidate.question));
      if (duplicate) { report.duplicate += 1; continue; }
      const timestamp = now();
      const record = { id: id('q'), category_id: category.id, knowledge_item_id: fact.id, question_type: questionType, question: candidate.question, correct_answer: candidate.correct_answer, wrong_answers: candidate.wrong_answers, difficulty: candidate.difficulty, language: candidate.language, validation_score: validation.confidence, validation_issues: validation.issues, status: validation.valid && validation.confidence >= this.config.threshold ? 'approved' : 'review', question_key: questionKey, times_used: 0, last_used_at: null, generated_by: 'template-source-backed-v1', created_at: timestamp, updated_at: timestamp };
      await this.store.transaction((state) => state.questions.push(record));
      report.items.push(record.id);
      if (record.status === 'approved') report.approved += 1; else report.review += 1;
    }
    return report;
  }

  async deduplicate(category) {
    return this.store.transaction((db) => {
      const questions = db.questions.filter((q) => q.category_id === category.id && q.status === 'approved'); const keys = new Set(); let archived = 0;
      for (const question of questions.sort((a, b) => a.created_at.localeCompare(b.created_at))) {
        const key = question.question_key || normalize(question.question);
        if (keys.has(key)) { question.status = 'archived'; question.updated_at = now(); archived += 1; } else keys.add(key);
      }
      return { checked: questions.length, archived };
    });
  }

  async revalidate(category) {
    const db = await this.store.load(); const facts = new Map(db.knowledge_items.map((fact) => [fact.id, fact])); let approved = 0; let review = 0;
    return this.store.transaction(async (state) => {
      for (const question of state.questions.filter((item) => item.category_id === category.id && ['approved', 'review', 'generated', 'validating'].includes(item.status))) {
        const fact = facts.get(question.knowledge_item_id);
        const validation = fact ? await this.validate({ question: question.question, correct_answer: question.correct_answer, wrong_answers: question.wrong_answers }, fact, category) : { valid: false, confidence: 0, issues: ['knowledge_item_missing'] };
        question.validation_score = validation.confidence; question.validation_issues = validation.issues;
        question.status = validation.valid && validation.confidence >= this.config.threshold ? 'approved' : 'review'; question.updated_at = now();
        if (question.status === 'approved') approved += 1; else review += 1;
      }
      return { approved, review };
    });
  }

  async stats(categoryId) {
    const db = await this.store.load(); const rows = db.questions.filter((q) => q.category_id === categoryId);
    return { total: rows.length, approved: rows.filter((q) => q.status === 'approved').length, review: rows.filter((q) => q.status === 'review').length, rejected: rows.filter((q) => q.status === 'rejected').length, archived: rows.filter((q) => q.status === 'archived').length };
  }
}

export class QuizService {
  constructor(store) { this.store = store; }
  async generate(category, { count = 20, difficultyDistribution = null, language = 'tr', excludeRecent = true } = {}) {
    const db = await this.store.load();
    let available = db.questions.filter((q) => q.category_id === category.id && q.status === 'approved' && q.language === language);
    if (!available.length) throw new Error(`${category.name} için kullanılabilir onaylı soru yok.`);
    const distribution = difficultyDistribution || { easy: Math.round(count * 0.25), medium: Math.round(count * 0.5), hard: count - Math.round(count * 0.25) - Math.round(count * 0.5) };
    const selected = []; const recently = Date.now() - 7 * 86_400_000;
    for (const [difficulty, required] of Object.entries(distribution)) {
      const pool = available.filter((q) => q.difficulty === difficulty).sort((a, b) => {
        const aRecent = excludeRecent && a.last_used_at && Date.parse(a.last_used_at) > recently ? 1 : 0;
        const bRecent = excludeRecent && b.last_used_at && Date.parse(b.last_used_at) > recently ? 1 : 0;
        return aRecent - bRecent || a.times_used - b.times_used || a.created_at.localeCompare(b.created_at);
      });
      selected.push(...pool.slice(0, required)); available = available.filter((q) => !selected.some((s) => s.id === q.id));
    }
    if (selected.length < count) selected.push(...available.sort((a, b) => a.times_used - b.times_used).slice(0, count - selected.length));
    const timestamp = now(); const quiz = { id: id('quiz'), category_id: category.id, language, requested_count: count, difficulty_distribution: distribution, question_ids: selected.map((q) => q.id), created_at: timestamp };
    await this.store.transaction((state) => {
      state.quiz_sets.push(quiz);
      for (const question of state.questions.filter((q) => quiz.question_ids.includes(q.id))) { question.times_used += 1; question.last_used_at = timestamp; question.updated_at = timestamp; }
    });
    return { ...quiz, actual_count: selected.length, questions: selected.map(({ correct_answer, wrong_answers, ...safe }) => ({ ...safe, options: shuffleStable([correct_answer, ...wrong_answers], safe.id) })) };
  }
}
