/** Every adapter returns source-backed candidate facts, never questions. */
export class SourceAdapter {
  constructor(name) { this.name = name; }
  async searchKnowledge() { throw new Error(`${this.name}: searchKnowledge uygulanmadı.`); }
  async fetchEntity() { throw new Error(`${this.name}: fetchEntity uygulanmadı.`); }
  async normalizeResult(result) { return result; }
  async extractFacts() { return []; }
  async validateSource(result) { return Boolean(result?.source_url); }
}
