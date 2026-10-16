import { createHash, randomUUID } from 'node:crypto';

export const now = () => new Date().toISOString();
export const id = (prefix) => `${prefix}_${randomUUID()}`;
export const hash = (value) => createHash('sha256').update(String(value), 'utf8').digest('hex');
export const normalize = (value = '') => String(value)
  .toLocaleLowerCase('tr-TR')
  .replace(/ı/g, 'i')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ').trim();
export const slugify = (value) => normalize(value).replace(/\s+/g, '-');
export const unique = (items) => [...new Set(items.filter(Boolean))];
export const isExpired = (item, at = Date.now()) => Boolean(item.expires_at && Date.parse(item.expires_at) <= at);
export const shuffleStable = (items, seed) => {
  const copy = [...items]; let state = Number.parseInt(hash(seed).slice(0, 8), 16) || 1;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1); [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
