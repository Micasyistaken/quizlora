import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { id, now, slugify } from './utils.js';

const DEFAULT_SOURCE = 'https://quizlora.vercel.app/';

function parseTree(script) {
  const match = script.match(/const\s+TREE\s*=\s*(\[[\s\S]*?\]);\s*\nconst\s+QZ\s*=/);
  if (!match) throw new Error('Quizlora kategori ağacı (TREE) bulunamadı.');
  const text = match[1]; let cursor = 0;
  const whitespace = () => { while (/\s/.test(text[cursor] || '')) cursor += 1; };
  const string = () => {
    const quote = text[cursor++]; let value = '';
    while (cursor < text.length) {
      const character = text[cursor++];
      if (character === quote) return value;
      if (character === '\\') value += text[cursor++] || ''; else value += character;
    }
    throw new Error('Kategori ağacında tamamlanmamış metin var.');
  };
  const array = () => {
    whitespace(); if (text[cursor++] !== '[') throw new Error('Kategori ağacı dizi olmalıdır.');
    const values = []; whitespace();
    while (text[cursor] !== ']') {
      whitespace(); values.push(text[cursor] === '[' ? array() : string()); whitespace();
      if (text[cursor] === ',') { cursor += 1; whitespace(); } else if (text[cursor] !== ']') throw new Error('Kategori ağacında beklenmeyen karakter var.');
    }
    cursor += 1; return values;
  };
  // Parse the data literal instead of evaluating code delivered by the public page.
  const tree = array();
  if (!Array.isArray(tree)) throw new Error('Kategori ağacı geçerli bir dizi değil.');
  return tree;
}

export class CategoryService {
  constructor(store, { sourceUrl = process.env.QUIZLORA_CATEGORIES_URL || DEFAULT_SOURCE, localFile = resolve('dist', 'index.html') } = {}) {
    this.store = store; this.sourceUrl = sourceUrl; this.localFile = localFile;
  }

  async fetchTree() {
    try {
      const response = await fetch(this.sourceUrl, { headers: { accept: 'text/html' }, signal: AbortSignal.timeout(12_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { tree: parseTree(await response.text()), origin: this.sourceUrl };
    } catch (remoteError) {
      try {
        return { tree: parseTree(await readFile(this.localFile, 'utf8')), origin: `local:${this.localFile}`, fallbackReason: remoteError.message };
      } catch { throw new Error(`Kategori kaynağı okunamadı: ${remoteError.message}`); }
    }
  }

  async sync() {
    const { tree, origin, fallbackReason } = await this.fetchTree();
    return this.store.transaction((db) => {
      const seen = new Set();
      const upsert = (input) => {
        const key = slugify(input.name);
        let category = db.categories.find((entry) => entry.slug === key && entry.parent_id === (input.parent_id || null));
        if (!category) {
          category = { id: id('cat'), slug: key, language: 'tr', knowledge_description: '', source_queries: [], created_at: now() };
          db.categories.push(category);
        }
        Object.assign(category, input, { is_active: true, updated_at: now(), source_origin: origin });
        if (!category.knowledge_description) category.knowledge_description = `${category.name}: ${input.subcategories?.join(', ') || 'genel bilgi'}.`;
        seen.add(category.id); return category;
      };
      for (const [name, icon, color, subcategories = []] of tree) {
        const parent = upsert({ name, icon, color, parent_id: null, description: `${name} ana kategorisi`, subcategories });
        for (const subcategory of subcategories) upsert({ name: subcategory, icon, color, parent_id: parent.id, description: `${name} / ${subcategory}` });
      }
      for (const category of db.categories) if (!seen.has(category.id)) category.is_active = false;
      return { origin, fallbackReason, active: db.categories.filter((c) => c.is_active).length, main: db.categories.filter((c) => c.is_active && !c.parent_id).length };
    });
  }

  async list({ activeOnly = true } = {}) { const db = await this.store.load(); return db.categories.filter((c) => !activeOnly || c.is_active); }
  async bySlug(slug) { return (await this.list()).find((c) => c.slug === slugify(slug)); }
  async getContext(slug) {
    const category = await this.bySlug(slug);
    if (!category) throw new Error(`Aktif kategori bulunamadı: ${slug}`);
    const all = await this.list();
    return { ...category, subcategories: all.filter((c) => c.parent_id === category.id) };
  }
  async configure(slug, { knowledgeDescription, sourceQueries }) {
    const category = await this.bySlug(slug);
    if (!category) throw new Error(`Aktif kategori bulunamadı: ${slug}`);
    return this.store.transaction((db) => {
      const record = db.categories.find((c) => c.id === category.id);
      if (knowledgeDescription) record.knowledge_description = knowledgeDescription;
      if (sourceQueries) record.source_queries = sourceQueries;
      record.updated_at = now(); return record;
    });
  }
}
