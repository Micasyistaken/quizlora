import { hash, id, isExpired, normalize, now } from './utils.js';
import { readFile } from 'node:fs/promises';

const DEFAULT_TTL_DAYS = 30;
const factKey = (candidate) => [candidate.subject, candidate.predicate, candidate.object].map(normalize).join('|');

export class KnowledgeService {
  constructor(store, adapters) { this.store = store; this.adapters = adapters; }
  async addCandidates(category, candidates, { sourceRecord = null } = {}) {
    return this.store.transaction((db) => {
      const accepted = []; const rejected = []; const duplicate = [];
      for (const candidate of candidates) {
        const key = factKey(candidate);
        const sourceValid = Boolean(candidate.source_name && candidate.source_url && candidate.subject && candidate.predicate && candidate.object);
        if (!sourceValid) { rejected.push({ candidate, reason: 'missing_provenance_or_relation' }); continue; }
        if (db.knowledge_items.some((item) => item.fact_key === key || item.content_hash === hash(key))) {
          duplicate.push(key); continue;
        }
        const timestamp = now();
        const record = {
          id: id('ki'), category_id: category.id, entity: candidate.entity || candidate.subject,
          subject: candidate.subject, predicate: candidate.predicate, object: candidate.object,
          fact: `${candidate.subject} | ${candidate.predicate} | ${candidate.object}`,
          normalized_fact: normalize(`${candidate.subject} ${candidate.predicate} ${candidate.object}`), fact_key: key,
          subcategory: candidate.subcategory || null, tags: candidate.tags || [], language: category.language || 'tr',
          source_name: candidate.source_name, source_url: candidate.source_url, source_type: candidate.source_type || 'unknown',
          source_date: candidate.source_date || null, retrieved_at: timestamp, verification_status: 'verified',
          confidence_score: Number(candidate.confidence_score ?? 0.9), content_hash: hash(key), fact_type: candidate.fact_type || 'static',
          verified_at: timestamp, expires_at: candidate.fact_type === 'volatile' ? new Date(Date.now() + DEFAULT_TTL_DAYS * 86_400_000).toISOString() : null,
          is_active: true, source_record_id: sourceRecord?.id || null, external_id: candidate.external_id || null, created_at: timestamp, updated_at: timestamp
        };
        db.knowledge_items.push(record); accepted.push(record);
      }
      return { accepted, rejected, duplicate };
    });
  }
  async populateWikidata(category, queries) {
    const adapter = this.adapters.wikidata;
    const candidates = []; const sourceRecords = []; const errors = [];
    for (const query of queries) {
      try {
        const matches = await adapter.searchKnowledge(category, query);
        for (const match of matches) {
          const entity = await adapter.fetchEntity(match.entity_id);
          const facts = await adapter.extractFacts(entity);
          candidates.push(...facts);
          sourceRecords.push({ id: id('src'), adapter: 'wikidata', query, external_id: match.entity_id, source_url: match.source_url, retrieved_at: now() });
        }
      } catch (error) {
        errors.push({ query, error: error.message, retryable: /HTTP (429|5\d\d)/.test(error.message) });
      }
    }
    const result = await this.addCandidates(category, candidates);
    await this.store.transaction((db) => { db.source_records.push(...sourceRecords); });
    return { adapter: 'wikidata', queries, found: candidates.length, source_errors: errors, ...summarize(result) };
  }
  async importManual(category, file) {
    const candidates = await this.adapters.manual.importFile(file);
    const result = await this.addCandidates(category, candidates);
    return { adapter: 'manual', file, ...summarize(result) };
  }
  async importSparql(category, queryFile, predicate) {
    const query = await readFile(queryFile, 'utf8'); const response = await this.adapters.sparql.execute(query);
    const bindings = response.results?.bindings || [];
    const candidates = bindings.map((row) => ({
      entity: row.subjectLabel?.value || row.subject?.value, subject: row.subjectLabel?.value || row.subject?.value,
      predicate, object: row.objectLabel?.value || row.object?.value, source_name: 'Wikidata Query Service',
      source_url: row.subject?.value, source_type: 'wikidata-sparql', source_date: null, confidence_score: 0.97, fact_type: 'static', external_id: row.subject?.value?.split('/').pop()
    }));
    const result = await this.addCandidates(category, candidates);
    await this.store.transaction((db) => db.source_records.push({ id: id('src'), adapter: 'wikidata-sparql', query_file: queryFile, source_url: 'https://query.wikidata.org/', retrieved_at: now(), candidates: candidates.length }));
    return { adapter: 'wikidata-sparql', query_file: queryFile, found: candidates.length, ...summarize(result) };
  }
  async populateCountries(category) {
    const candidates = await this.adapters.countries.extractFacts();
    const result = await this.addCandidates(category, candidates);
    await this.store.transaction((db) => db.source_records.push({ id: id('src'), adapter: 'rest-countries', source_url: 'https://github.com/mledoze/countries', retrieved_at: now(), candidates: candidates.length }));
    return { adapter: 'open-countries', found: candidates.length, ...summarize(result) };
  }
  async stats(categoryId) {
    const db = await this.store.load(); const items = db.knowledge_items.filter((item) => item.category_id === categoryId);
    return { total: items.length, verified: items.filter((x) => x.verification_status === 'verified').length, active: items.filter((x) => x.is_active && !isExpired(x)).length, expired: items.filter(isExpired).length };
  }
  async validate(category) {
    return this.store.transaction((db) => {
      let verified = 0; let outdated = 0; let rejected = 0;
      for (const item of db.knowledge_items.filter((entry) => entry.category_id === category.id)) {
        const valid = Boolean(item.source_name && item.source_url && item.subject && item.predicate && item.object);
        if (!valid) { item.verification_status = 'rejected'; rejected += 1; }
        else if (isExpired(item)) { item.verification_status = 'outdated'; outdated += 1; }
        else { item.verification_status = 'verified'; item.verified_at = now(); verified += 1; }
        item.updated_at = now();
      }
      return { verified, outdated, rejected };
    });
  }
  async verified(categoryId) { const db = await this.store.load(); return db.knowledge_items.filter((item) => item.category_id === categoryId && item.is_active && item.verification_status === 'verified' && !isExpired(item)); }
}

const summarize = ({ accepted, rejected, duplicate }) => ({ accepted: accepted.length, rejected: rejected.length, duplicate: duplicate.length });
