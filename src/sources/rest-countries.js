import { SourceAdapter } from './base.js';

/** Versioned open country dataset used only for country/capital geography facts. */
export class RestCountriesAdapter extends SourceAdapter {
  constructor() { super('rest-countries'); }
  async extractFacts() {
    const url = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json';
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000), headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`REST Countries HTTP ${response.status}`);
    const countries = await response.json();
    if (!Array.isArray(countries)) throw new Error('Open Countries dataset geçerli bir dizi döndürmedi.');
    return countries
      .filter((country) => Array.isArray(country.capital) && country.capital.length === 1 && country.name?.common && country.cca3)
      .flatMap((country) => {
        const subject = country.translations?.tur?.common || country.name.common;
        const provenance = { entity: subject, subject, source_name: 'mledoze/countries open dataset', source_url: `https://github.com/mledoze/countries/blob/master/countries.json#${country.cca3}`, source_type: 'open-data', source_date: null, confidence_score: 0.96, fact_type: 'static', external_id: country.cca3 };
        const currencies = Object.values(country.currencies || {}).map((currency) => currency?.name).filter(Boolean);
        return [{ ...provenance, predicate: 'başkent', object: country.capital[0] }, ...(currencies.length === 1 ? [{ ...provenance, predicate: 'para birimi', object: currencies[0] }] : [])];
      });
  }
  async validateSource(result) { return Boolean(result?.source_url?.startsWith('https://github.com/mledoze/countries/')); }
}
