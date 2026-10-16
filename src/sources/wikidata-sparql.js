import { SourceAdapter } from './base.js';

const ENDPOINT = 'https://query.wikidata.org/sparql';
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

/** Executes a reviewed, category-owned Wikidata query. It never crawls arbitrary pages. */
export class WikidataSparqlAdapter extends SourceAdapter {
  constructor() { super('wikidata-sparql'); }
  async execute(query) {
    for (let attempt = 0; attempt <= 2; attempt += 1) {
      const response = await fetch(ENDPOINT, { method: 'POST', headers: { accept: 'application/sparql-results+json', 'content-type': 'application/sparql-query', 'user-agent': 'QuizloraQuestionPoolBot/1.0 (+https://quizlora.vercel.app/)' }, body: query, signal: AbortSignal.timeout(45_000) });
      if (response.ok) return response.json();
      if ((response.status === 429 || response.status >= 500) && attempt < 2) { await pause(1_000 * (attempt + 1)); continue; }
      throw new Error(`Wikidata Query Service HTTP ${response.status}`);
    }
  }
  async validateSource(result) { return Boolean(result?.source_url?.startsWith('https://www.wikidata.org/entity/')); }
}
