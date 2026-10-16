import { readFile } from 'node:fs/promises';
import { SourceAdapter } from './base.js';

/** Imports facts reviewed by a human or an internal editorial workflow. */
export class ManualSourceAdapter extends SourceAdapter {
  constructor() { super('manual'); }
  async importFile(file) {
    const parsed = JSON.parse(await readFile(file, 'utf8'));
    if (!Array.isArray(parsed)) throw new Error('Manuel fact dosyası JSON dizisi olmalıdır.');
    return parsed.map((item) => ({ ...item, source_name: item.source_name || 'Manual verified', source_type: 'manual' }));
  }
  async validateSource(result) { return Boolean(result?.source_url && result?.source_name); }
}
