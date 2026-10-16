import { SourceAdapter } from './base.js';

const API = 'https://www.wikidata.org/w/api.php';
const PROPERTY_MAP = {
  P36: 'başkent', P1376: 'başkenti olduğu ülke', P57: 'yönetmen', P50: 'yazar',
  P175: 'icracı', P61: 'kâşif', P19: 'doğum yeri', P27: 'vatandaşı olduğu ülke',
  P30: 'kıta', P131: 'idari konum', P170: 'yaratıcı', P451: 'rakip', P800: 'önemli eser'
};
const VOLATILE = new Set(['güncel lider', 'nüfus', 'sıralama', 'piyasa değeri']);

const MAX_RETRIES = Math.max(0, Number(process.env.MAX_RETRIES || 2));
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const request = async (params) => {
  const url = new URL(API); Object.entries({ origin: '*', format: 'json', ...params }).forEach(([key, value]) => url.searchParams.set(key, value));
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: { 'user-agent': 'QuizloraQuestionPoolBot/1.0 (+https://quizlora.vercel.app/; source-backed facts)' } });
    if (response.ok) return response.json();
    if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
      const retryAfter = Number(response.headers.get('retry-after'));
      await pause(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 750 * (attempt + 1));
      continue;
    }
    throw new Error(`Wikidata HTTP ${response.status}`);
  }
};

const label = (entity, language) => entity?.labels?.[language]?.value || entity?.labels?.en?.value || entity?.id;

export class WikidataSourceAdapter extends SourceAdapter {
  constructor({ language = 'tr' } = {}) { super('wikidata'); this.language = language; }
  async searchKnowledge(_category, query, limit = 8) {
    const body = await request({ action: 'wbsearchentities', search: query, language: this.language, uselang: this.language, limit: String(limit) });
    const results = body.search || [];
    // Source plans contain exact editorial entity names. Taking a fuzzy result would silently contaminate a category.
    const selected = results.filter((entry) => entry.label && entry.label.localeCompare(query, this.language, { sensitivity: 'base' }) === 0);
    return (selected.length ? selected : results.slice(0, 1)).map((entry) => ({ entity_id: entry.id, entity: entry.label, source_url: `https://www.wikidata.org/wiki/${entry.id}` }));
  }
  async fetchEntity(entityId) {
    const body = await request({ action: 'wbgetentities', ids: entityId, languages: `${this.language}|en`, props: 'labels|claims' });
    const entity = body.entities?.[entityId];
    if (!entity || entity.missing !== undefined) throw new Error(`Wikidata varlığı bulunamadı: ${entityId}`);
    return entity;
  }
  async labels(ids) {
    if (!ids.length) return {};
    const body = await request({ action: 'wbgetentities', ids: [...new Set(ids)].join('|'), languages: `${this.language}|en`, props: 'labels' });
    return Object.fromEntries(Object.entries(body.entities || {}).map(([key, value]) => [key, label(value, this.language)]));
  }
  async extractFacts(entity) {
    const pending = [];
    for (const [property, predicate] of Object.entries(PROPERTY_MAP)) {
      const propertyCandidates = [];
      for (const claim of entity.claims?.[property] || []) {
        if (claim.rank === 'deprecated' || claim.mainsnak?.snaktype !== 'value') continue;
        // Dated statements are often historically true but ambiguous in a present-tense quiz question.
        if (claim.qualifiers?.P580 || claim.qualifiers?.P582 || claim.qualifiers?.P585) continue;
        const value = claim.mainsnak.datavalue?.value;
        if (value?.id) propertyCandidates.push({ property, predicate, objectId: value.id });
        else if (typeof value === 'string' || typeof value === 'number') propertyCandidates.push({ property, predicate, object: String(value) });
        else if (value?.time) propertyCandidates.push({ property, predicate, object: value.time.replace(/^\+/, '').slice(0, 10) });
      }
      // No question is better than an ambiguous multi-valued relation without claim-specific context.
      const uniqueValues = new Set(propertyCandidates.map((entry) => entry.objectId || entry.object));
      if (uniqueValues.size === 1) pending.push(...propertyCandidates.slice(0, 1));
    }
    const lookup = await this.labels(pending.filter((x) => x.objectId).map((x) => x.objectId));
    const subject = label(entity, this.language);
    return pending.map((entry) => ({
      entity: subject, subject, predicate: entry.predicate, object: entry.object || lookup[entry.objectId],
      source_name: 'Wikidata', source_type: 'wikidata', source_url: `https://www.wikidata.org/wiki/${entity.id}`,
      source_date: null, confidence_score: 0.95, fact_type: VOLATILE.has(entry.predicate) ? 'volatile' : 'static', external_id: entity.id
    })).filter((entry) => entry.object && entry.object !== entry.subject);
  }
  async validateSource(result) { return Boolean(result?.source_url?.startsWith('https://www.wikidata.org/wiki/')); }
}
