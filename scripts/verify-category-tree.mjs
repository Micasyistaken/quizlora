import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const match = html.match(/const\s+TREE\s*=\s*(\[[\s\S]*?\]);\s*\nconst\s+QZ\s*=/);
assert.ok(match, 'Kategori ağacı bulunamadı.');

const tree = new Function(`return (${match[1]});`)();
const byMain = new Map(tree.map(([name, , , children]) => [name, children]));
const expectedMains = [
  'Genel Kültür', 'Tarih', 'Coğrafya', 'Bilim', 'Teknoloji', 'Mantık',
  'Diller ve Edebiyat', 'Oyunlar ve E-spor', 'Film ve Diziler',
  'Anime, Manga ve Çizgi Roman', 'Spor', 'Müzik', 'Kültür ve Sanat',
  'İnsan ve Toplum', 'Yaşam ve Hobiler', 'Yeme ve İçme', '3N 1K', 'Diğer'
];
assert.deepEqual([...byMain.keys()], expectedMains, 'Ana kategori sırası veya birleşimi beklenen yapıda değil.');

const required = {
  'Genel Kültür': ['Bulmaca', 'İlkler'],
  Tarih: ['Keşifler tarihi', 'Tarihi şahsiyetler', 'Avrupa tarihi'],
  Bilim: ['Popüler bilim'],
  Teknoloji: ['Yapay zekâ ve teknoloji'],
  'Diller ve Edebiyat': ['Atasözleri ve deyimler'],
  'Film ve Diziler': ['Çizgi diziler', 'Çizgi filmler', 'Türk filmleri', 'Eski Türk dizileri'],
  Spor: ['Tenis', 'Süper Lig', 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Dünya Kupası'],
  Müzik: ['Pop', 'Karaoke modu', 'Rap ve hip-hop', 'Elektronik müzik', 'K-pop', 'Latin müzik', 'Opera'],
  'Kültür ve Sanat': ['Müzeler seçkisi', 'Dans', 'Mitoloji', 'Arkeoloji'],
  'İnsan ve Toplum': ['Psikoloji', 'Felsefe', 'Hukuk ve vatandaşlık'],
  'Yaşam ve Hobiler': ['Hayvanlar alemi', 'Bitkiler'],
  'Yeme ve İçme': ['Gastronomi', 'Fast food', 'Sokak lezzetleri', 'Anadolu mutfağı', 'Asya mutfağı'],
  '3N 1K': ['Ben kimim?', 'Ben neredeyim?', 'Ne zaman oldu?', 'Kim ne dedi?'],
  Diğer: ['Magazin', 'Astroloji'],
  'Oyunlar ve E-spor': ['Tahta oyunları', 'Dijital oyunlar', 'Kart oyunları']
};

for (const [main, children] of Object.entries(required)) {
  const available = byMain.get(main);
  assert.ok(available, `${main} ana kategorisi eksik.`);
  for (const child of children) assert.ok(available.includes(child), `${main} / ${child} eksik.`);
}

const allChildren = [...byMain.values()].flat();
for (const removed of ['Dünya hakkında bilgiler', 'Valorant', 'Günlük hayattan bilgiler', 'Temel matematik']) {
  assert.ok(!allChildren.includes(removed), `${removed} katalogdan kaldırılmalı.`);
}
assert.ok(!byMain.has('Matematik ve Mantık'), 'Eski ana kategori adı görünmemeli.');
assert.equal(new Set(byMain.keys()).size, byMain.size, 'Yinelenen ana kategori var.');
assert.equal(allChildren.filter((name) => name === 'Mitoloji').length, 1, 'Mitoloji birden fazla dala ayrılmış.');
assert.ok(html.includes("const PREMIUM_CATEGORY_NAMES=new Set(['Dijital oyunlar','Ne zaman oldu?','Magazin','Felsefe','Bitkiler'])"), 'Premium kategori işaretleri eksik.');

console.log('Category tree verification passed.');
