# Quizlora Soru Havuzu Botu

## Mimari

```text
Quizlora kategori ağacı → CategoryService → kaynak adaptörleri → Knowledge Pool
                                                          ↓
                                      fact doğrulama / tekilleştirme
                                                          ↓
                                       QuestionService → validator → Question Pool
                                                          ↓
                                                 QuizService → quiz çıktısı
```

Bot Node.js 20'nin yerleşik modüllerini kullanır; çalışma zamanında üçüncü taraf paket, LLM veya hazır-quiz kaynağı gerektirmez. `data/quizlora-bot.json` atomik yazılan taşınabilir veri tabanıdır. Eşzamanlı çok süreçli üretim veya çok kullanıcılı bir dağıtım gerektiğinde aynı servis sözleşmesi PostgreSQL'e taşınmalıdır.

## Kategori sistemi

`categories:sync`, canlı Quizlora paketinin `TREE` veri yapısını okur ve `categories` kaydını upsert eder. Uzaktaki sayfa okunamazsa `dist/index.html` kullanılır ve raporda `fallbackReason` görünür. Alanlar: `id`, `name`, `slug`, `description`, `language`, `is_active`, `knowledge_description`, `source_queries`, `parent_id`, `source_origin`.

Kategori sisteme bir sonraki senkronizasyonda eklendiğinde aktif olur; kaynaktan kaldırılmışsa pasife alınır. Bot bilinmeyen kategori oluşturmaya çalışmaz.

## Veri şeması

| Koleksiyon | Temel alanlar |
| --- | --- |
| `categories` | Kimlik, isim/slug, dil, aktiflik, açıklama, kaynak planı |
| `knowledge_items` | `category_id`, subject/predicate/object, fact/fact_key, provenance, doğrulama, confidence, expiry |
| `questions` | `category_id`, `knowledge_item_id`, soru, doğru/yanlış seçenekler, zorluk, status, validation score, kullanım sayacı |
| `question_stats` | Gelecekte shown/correct/wrong/skip/report/answer time için ayrılmış koleksiyon |
| `quiz_sets` | Seçim parametreleri ve soru kimlikleri |
| `source_records` | Kaynak adaptörü, sorgu, dış kimlik, URL, erişim zamanı |
| `generation_jobs` | Arka plan iş kuyruğu adaptasyonu için ayrılmış koleksiyon |

`knowledge_items.fact_key = normalize(subject)|normalize(predicate)|normalize(object)` relation-level tekillik sağlar. `content_hash` ilave güvence sağlar. Soru `question_key = fact_key|question_type` ile aynı ilişkiyi aynı formatta yeniden sormaz.

## Bilgi ve kaynak pipeline'ı

1. Kategori için editoryal olarak onaylı entity sorgularını `source_queries` alanına verin.
2. `knowledge:populate` Wikidata'nın resmi API'sinden belirli varlıkları ve desteklenen structured claim'leri alır. Alternatif olarak `knowledge:import`, manuel olarak gözden geçirilmiş JSON fact dosyası alır.
3. Kaynak adı, URL'si ve subject/predicate/object olmayan adaylar reddedilir.
4. Aynı fact key/content hash atılır; kalanlar `verified` olarak provenance ile kaydedilir.
5. Volatile fact'ler için son kullanma tarihi gerekir. Süresi dolan kayıtlar soru üretimine girmez.

Bu tasarım kasten kontrolsüz arama/crawl yapmaz; robots, lisans ve kaynak kalitesi riskini azaltır. Yeni kaynaklar `SourceAdapter` sözleşmesiyle eklenir: `searchKnowledge`, `fetchEntity`, `normalizeResult`, `extractFacts`, `validateSource`.

Manuel import örneği:

```json
[
  {
    "subject": "Türkiye",
    "predicate": "başkent",
    "object": "Ankara",
    "source_name": "Resmî kaynak",
    "source_url": "https://ornek.gov.tr/kaynak",
    "source_type": "official",
    "confidence_score": 0.99,
    "fact_type": "static"
  }
]
```

## Soru üretimi ve doğrulama

Şu an etkin format `multiple_choice`'tır. Generator yalnızca `verified`, aktif, süresi geçmemiş fact kullanır. Şablon, fact'in predicate alanına göre oluşturulur; yeni fact eklemez. Yanlış seçenekler sadece aynı predicate'e sahip diğer doğrulanmış fact'lerden alınır. Bu nedenle üç makul seçenek yoksa soru üretmek yerine atlar.

Validator şunları kontrol eder: fact ile doğru cevap eşleşmesi, üç benzersiz yanlış seçenek, tek doğru cevap, doğru kategori/dil, doğrulanmış ve güncel kaynak, cevabı ele vermeme, anlaşılabilir uzunluk. `QUESTION_VALIDATION_THRESHOLD` varsayılan `0.90`; onaylanan tek status `approved`dır.

Varsayılan `MAX_QUESTIONS_PER_KNOWLEDGE_ITEM=3`'tür. Aynı fact + aynı format duplicate sayıldığından, mevcut çoktan seçmeli sürüm bir fact için pratikte bir özgün soru yayınlar. Yeni format eklendiğinde kap devreye girer.

## Komutlar

```powershell
npm run bot -- doctor
npm run bot -- categories:sync
npm run bot -- categories:list
npm run bot -- categories:set-context --category cografya --description "Countries, capitals, rivers and landforms." --sources "Türkiye,Fransa,İtalya,Japonya"
npm run bot -- knowledge:populate --category cografya --entities "Türkiye,Fransa,İtalya,Japonya"
npm run bot -- knowledge:import --category cografya --file .\facts.json
npm run bot -- knowledge:stats --category cografya
npm run bot -- knowledge:validate --category cografya
npm run bot -- questions:generate --category cografya --count 30
npm run bot -- questions:revalidate --category cografya
npm run bot -- questions:deduplicate --category cografya
npm run bot -- questions:stats --category cografya
npm run bot -- questions:fill --category cografya --target 100
npm run bot -- questions:fill-all --target 500
npm run bot -- quiz:generate --category cografya --count 20 --difficulty medium
```

`questions:fill` önce onaylı havuzu sayar, eksikse yalnızca kategoriye tanımlı explicit kaynak planından bilgi toplar, üretir, validate eder ve duplicate temizler. Kaynak planı tanımlı değilse rapor `source_plan_required: true` döndürür; bot tahmin ederek bilgi üretmez. `questions:revalidate`, fact'in güncelliğini, kaynak bağlantısını, seçenekleri ve ilişkiyi tekrar kontrol ederek sorunlu kayıtları `review` durumuna alır.

## Doğal dil örnekleri

```powershell
npm run bot -- run "Coğrafya kategorisini 1000 soruya tamamla."
npm run bot -- run "Bilim için 100 soru hazırla."
npm run bot -- run "Tarih kategorisindeki duplicate soruları temizle."
npm run bot -- run "Spor kategorisinden 20 soruluk orta quiz oluştur."
```

Codex'e verilebilecek örnek istekler:

1. “Coğrafya kategorisini 1000 soruya tamamla.”
2. “Bilim için 100 yeni soru hazırla.”
3. “Teknoloji havuzunun durumunu kontrol et.”
4. “Tarih kategorisindeki tekrar eden soruları temizle.”
5. “Spor için bilgi kaynağı planını göster.”
6. “Müzik kategorisine bu onaylı fact dosyasını içe aktar.”
7. “Film ve Diziler için önce bilgi havuzu oluştur, sonra 300 soru hedefle.”
8. “Coğrafyadan 20 soruluk orta zorlukta quiz oluştur.”
9. “Yapay zekâ alt kategorisinin sorularını yeniden doğrula.”
10. “Tüm aktif kategorilerin onaylı soru sayılarını raporla.”

Toplu kategori raporu sonraki iterasyon için bir komut adaptörü gerektirir; temel servis modeli bunu destekleyecek ayrı veri ve status alanlarını şimdiden tutar.

## Ortam değişkenleri

| Değişken | Varsayılan | Görev |
| --- | --- | --- |
| `QUIZLORA_DATA_FILE` | `data/quizlora-bot.json` | Yerel veri tabanı konumu |
| `QUIZLORA_CATEGORIES_URL` | `https://quizlora.vercel.app/` | Canlı kategori kaynağı |
| `MAX_QUESTIONS_PER_KNOWLEDGE_ITEM` | `3` | Fact başına maksimum soru |
| `QUESTION_VALIDATION_THRESHOLD` | `0.90` | Onay eşiği |
| `MAX_RETRIES` | `2` | Geçici kaynak hataları için sınırlı yeniden deneme |

`GENERATION_BATCH_SIZE`, `VALIDATION_BATCH_SIZE`, `MAX_LLM_CONCURRENCY` ve `DAILY_GENERATION_LIMIT` bir LLM/queue çalışma zamanı bağlanınca eklenmelidir; bu yerleşik template üreticisinde LLM çağrısı yoktur.

## Test ve bilinen sınırlar

`npm test` kategori keşfi, idempotent fact ekleme, kaynaksız fact reddi, expiry, duplicate soru key'i ve difficulty seçimini sınar. `npm run validate` mevcut statik web uygulamasını doğrular.

İlk sürümde uzun süreli iş kuyruğu, PostgreSQL/pgvector, semantic embedding, görsel format, LLM JSON-schema sağlayıcısı ve admin review UI'si bağlanmamıştır. Bunlar servis sınırları korunarak eklenebilir. Öncelik güvenilirliktir: kaynak planı ve yeterli distractor yoksa bot daha az soru üretir.
