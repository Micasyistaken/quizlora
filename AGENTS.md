# Collon (eski Quizlora) Soru Havuzu Botu — Agent Talimatları

> Marka geçişi: Geçerli görünür ürün adı Collon'dur. Yeni görsel otorite
> `DESIGN.md` içindeki nötr Collon sistemidir. `quizlora` geçen teknik veri
> anahtarları, bot yolu ve eski URL geçiş uyumluluğu için korunur; aşağıdaki
> eski görsel marka tarifleri artık uygulanmaz. Bot ve veri güvenliği kuralları
> aynen yürürlüktedir.

Bu depo, Quizlora uygulamasıyla birlikte bağımsız çalışan kaynak-temelli soru havuzu botunu içerir. Soru yazmaya doğrudan başlamayın: yalnızca doğrulanmış `knowledge_items` kayıtlarından üretin.

## Kullanıcının doğal dil istekleri

- “X kategorisini 500 soruya tamamla.” → `npm run bot -- run "X kategorisini 500 soruya tamamla."`
- “X için 100 soru hazırla.” → `npm run bot -- run "X için 100 soru hazırla."`
- “X kategorisinden 20 soruluk orta quiz oluştur.” → `npm run bot -- run "X kategorisinden 20 soruluk orta quiz oluştur."`
- “X duplicate'lerini temizle.” → `npm run bot -- run "X duplicate'lerini temizle."`
- “X sorularını yeniden doğrula.” → `npm run bot -- questions:revalidate --category <slug>`
- “Tüm aktif kategorileri minimum 500 soruya çıkar.” → `npm run bot -- run "Tüm aktif kategorileri minimum 500 soruya çıkar."`

Önce `categories:sync` çalışır; böylece kategori listesi Quizlora'nın güncel ağacından okunur. Kategori yoksa yeni kategori uydurmayın veya oluşturmayın.

## Güvenli üretim akışı

1. `npm run bot -- categories:sync`
2. Kategori için güvenilir, açık bir bilgi planı tanımlayın: `categories:set-context --category <slug> --sources "Türkiye,Fransa,..."`. Sorgular yalnızca editoryal olarak onaylanmış varlık adları olmalıdır.
3. `knowledge:populate` (Wikidata) veya kaynak URL'si içeren `knowledge:import` (manuel/onaylı kaynak) ile fact ekleyin.
4. `questions:fill` ya da `questions:generate` kullanın. Bot, aynı predicate'teki doğrulanmış diğer fact'lerden üç mantıklı distractor bulamazsa soru üretmez.
5. Her zaman rapordaki `approved`, `review`, `rejected`, `duplicate` ve `remaining` değerlerini aktarın. Quantity için doğrulama veya duplicate kontrolü atlanmaz.

Kaynağı olmayan fact, süresi geçmiş volatile fact veya modelin kendi bilgisinden türetilen bilgi production havuzuna alınmaz. Hazır quiz sitelerinden soru scrape etmeyin.

## Veri ve bakım

- Çalışma verisi git'e alınmayan `data/quizlora-bot.json` içindedir; `QUIZLORA_DATA_FILE` ile konumu değiştirilebilir.
- Soru/fact ilişkisini koruyun: `questions.knowledge_item_id` silinmez ya da keyfi değiştirilmez.
- Yeni kaynak için `src/sources/base.js` arayüzünü uygulayın ve provenance döndürün.
- Yeni soru türü için üretim/validator ekleyin; `multiple_choice` davranışını bozmayın.
- Değişiklikten sonra `npm test` ve `npm run validate` çalıştırın.

## UI tasarım otoritesi ve çalışma akışı

- Mevcut Quizlora arayüzü kaynak gerçektir. `PRODUCT.md` ürün bağlamını, `DESIGN.md` ise görsel sistemin otoritesini taşır.
- Yeni özellik ve ekranlarda mevcut UI, component yapısı, tipografi, spacing, renk sistemi ve görsel dili sürdürün; açıkça istenmedikçe yeniden tasarım yapmayın.
- UI/UX Pro Max'i bilgi mimarisi, yapı ve kullanılabilirlik için; Design Taste'i görsel refinement için kullanın.
- Scroll Craft yalnızca landing veya marketing yüzeylerinde belirgin değer kattığında kullanılmalıdır.
- Büyük kapsamlı işler için Unlazy ile kabul kriterlerini ve tamamlanma kontrollerini yönetin.
- UI değişiminden sonra Impeccable ile audit/polish, gerçek tarayıcı doğrulaması için Playwright kullanın.
- Her görevde bütün skill'leri çalıştırmak zorunlu değildir; yalnızca görevin gerektirdiklerini seçin.

## Otomatik skill orkestrasyonu

Bu bölüm, kullanıcının skill adını tekrar yazmasına gerek kalmadan gelecekteki görevlerde uygulanır. Her görevin başında isteği; veri/soru havuzu, ürün mantığı, UI, landing/marketing, hata düzeltme ve yayın/doğrulama kapsamlarına ayırın. Yalnızca göreve anlamlı katkı sağlayan skill'leri seçin; bir skill adı geçiyorsa sadece anmakla yetinmeyin, ilgili `SKILL.md` dosyasını okuyup talimatlarını uygulayın.

### Değişmeyen kaynak gerçekler

- `PRODUCT.md` kullanıcı kitlesi, ürün amacı, gamification ve akış öncelikleri için ürün bağlamıdır.
- `DESIGN.md` mevcut Quizlora görsel sistemi için otoritedir. Uygulama ekranlarında mevcut renk rolleri, tipografi, boşluk, kontrol biçimleri ve responsive davranış korunur; kullanıcı açıkça yeniden tasarım istemedikçe yeni bir görsel dünya icat edilmez.
- Çalışan istemci yüzeyi `dist/index.html`, uygulama verisi `dist/question-pool.json` dosyasındadır. Soru havuzu ve veri güvenliği kuralları bu dosyanın üstündeki bölümlerdeki akışla yönetilir.
- Bu orkestrasyon, kaynak temelli fact/question üretim, provenance, duplicate kontrolü veya doğrulama kurallarını gevşetmez. Kategori ya da soru havuzu talebinde önce mevcut kategori ağacını senkronize edin; kategori uydurmayın.

### Seçim ve koordinasyon protokolü

1. Önce talebin kapsamını, etkilediği kullanıcı akışlarını ve kabul ölçütlerini belirleyin. Küçük, tek dosyalık veya salt metin/dokümantasyon değişikliklerinde ağır süreçleri zorlamayın.
2. Anlamlı frontend/UI görevlerinde `PRODUCT.md` ve `DESIGN.md` dosyalarını okuyun. Yapı, kullanılabilirlik ve erişilebilirlik için `ui-ux-pro-max`; görsel hiyerarşi ve rafinman için `design-taste-frontend` kullanın. App/quiz/dashboard ekranlarında bu skill'lerin ürün-UI ile ilgili ilkelerini uygulayın; landing odaklı varsayılanları körlemesine taşımayın.
3. Landing, marketing veya showcase yüzeylerinde scroll hareketi ziyaretçi yolculuğuna gerçekten değer katıyorsa `scroll-craft` kullanın. Quiz çözümü, dashboard, profil, ayarlar ve diğer işlevsel ekranlara sırf hareket eklemek için kullanmayın.
4. Büyük, çok aşamalı, çok dosyalı veya kolayca eksik kalabilecek işlerde `unlazy` kullanın. Uygulamadan önce ölçülebilir kabul kriterleri/gates oluşturun, işi doğal parçalara ayırın, eksik veya placeholder bırakmayın ve kanıtla yeniden doğrulayın. Trivial değişikliklerde gate dosyası oluşturmayın.
5. Anlamlı UI implementasyonundan sonra `impeccable` ile bağlamı yükleyin, ilgili audit/polish talimatlarını izleyin ve bulunan kapsam içi sorunları düzeltin. Denetimi yalnızca liste olarak bırakmayın; en fazla iki sınırlandırılmış polish turunda çözün. Mevcut projeden gelen, değişiklikle ilgisiz uyarıları ayrı belirtin; bunları sessizce tasarım sistemi değişikliğine çevirmeyin.
6. Anlamlı frontend değişikliklerinde `playwright-cli` ile gerçek tarayıcıda doğrulama yapın. Değişikliğe uygun desktop ve mobile görünümleri, etkilenen rotaları, klavye/focus davranışını, etkileşimleri ve console hatalarını kontrol edin. Gerekliyse reduced-motion ile açık/koyu tema durumlarını da doğrulayın.
7. Tamamlamadan önce hedeflenen kullanıcı akışını baştan sona yeniden kontrol edin. UI işi için tasarım denetimi ve tarayıcı doğrulaması olmadan “tamamlandı” demeyin; UI dışı işlerde ilgili test/validator akışlarını çalıştırın.

### Skill sorumlulukları

- **unlazy:** Büyük işlerde kabul kriteri, kapsam ağacı, doğrulama kanıtı ve completeness review sahibidir. Doğrulaması yapılmamış işi tamamlanmış saymaz.
- **ui-ux-pro-max:** Bilgi mimarisi, kullanıcı akışı, component hiyerarşisi, responsive yapı, erişilebilirlik, dokunma/klavye davranışı, yoğunluk ve kullanılabilirlik sahibidir.
- **design-taste-frontend:** Spacing, tipografi, kompozisyon, hizalama, gruplama, oran, boşluk, görsel ritim ve generic/template hissinin azaltılmasında estetik rehberdir. Güncel Collon nötr marka dilini korur; yalnızca kontrast değiştirerek kalite sonucu çıkarmaz. Gerekliyse layout ve hierarchy seviyesinde gerçek iyileştirme önerir.
- **impeccable:** Uygulama sonrası AI-template belirtileri, tipografik hiyerarşi, spacing, grouping, hizalama, dekorasyon, responsive ayrıntılar ve interaction state'ler için sert ama kapsamlı audit/polish yapar.
- **playwright-cli:** Canlı veya yerel tarayıcıda yükleme, route, navigation, buton/form/modal/quiz etkileşimleri, responsive taşma ve console hataları için kanıt üretir.
- **scroll-craft:** Yalnızca landing/marketing/showcase yüzeylerinde, amaçlı scroll anlatısı veya imza etkileşimi gerekiyorsa kullanılır. Ürün işlevselliği yerine dekoratif hareket üretmez.

### Görsel kalite ve güvenlik sınırları

- Gereksiz büyük rounded card, tekrarlanan eşit grid, merkezlenmiş başlık-açıklama-kart kalıbı, anlamsız pill/badge, icon kutusu, gradient/glow, glassmorphism veya shadow tekrarlarını varsayılan çözüm olarak eklemeyin.
- Her öğeye eşit görsel ağırlık vermeyin; ana eylem, ikincil bilgi ve destekleyici öğeler açıkça ayrışsın. Tasarım kararları Quizlora'nın keşif, çözüm, ilerleme ve rekabet akışlarına hizmet etsin.
- Motion; kullanıcıya durum, yön veya geri bildirim sağlamalı; `prefers-reduced-motion` tercihini korumalıdır.
- Kullanıcı yeni bir kronometre, geri sayım ya da süre göstergesi istediğinde Unlumen Animate Digits referansını (`https://ui.unlumen.com/components/animate-digits`) varsayılan sayı animasyonu kabul edin: yalnız değişen rakamlar yön duyarlı blur/slide ile hareket etsin, ayraçlar sabit kalsın, azaltılmış harekette rakamlar doğrudan güncellensin. Mevcut süre mantığını değiştirmeden, Quizlora'nın düz HTML/JS yapısına uyarlayın.
- Yeni bağımlılık eklemeden önce proje yapılandırmasını ve mevcut paketleri inceleyin. Çalışan özellikleri, route'ları, içerik yapısını ve doğrulanabilir ürün iddialarını gerekçe olmadan değiştirmeyin.
- Son raporda kullanılan skill'leri, değişen dosyaları, çalıştırılan doğrulamaları ve kalan gerçek sınırlamaları kısa biçimde belirtin.

## Automatic Tool and Skill Orchestration

Bu bölüm yukarıdaki bot, veri güvenliği ve UI kurallarını **tamamlar**; hiçbirini geçersiz kılmaz. Her görevde önce kapsamı ve etkilediği akışı belirleyin, ardından yalnızca ilgili ve o oturumda gerçekten erişilebilir skill/araçları seçin. Kullanıcı bunları tek tek anmak zorunda değildir. Seçilen bir skill'in güncel `SKILL.md` dosyasını okuyup uygulayın; erişilemeyen aracı kullanılmış gibi raporlamayın.

### Otorite ve rol dağılımı

- `PRODUCT.md`: ürün amacı, kullanıcı ve doğrulanabilir ürün iddiaları.
- `DESIGN.md`: mevcut Quizlora görsel sistemi; açıkça istenmeyen yeniden tasarımı engeller.
- `AGENTS.md`: uygulama, veri güvenliği ve araç yönlendirme protokolü.
- **Superpowers:** anlamlı yazılım işlerinde problemi anlama, gereksinimi netleştirme, planlama, TDD, hata ayıklama, uygulama ve son doğrulama metodolojisi.
- **Unlazy:** özellikle büyük işlerde ölçülebilir completeness gate'leri ve yarım bırakmama denetimi. Superpowers planını veya testlerini ikinci kez üretmez; kendi kabul ölçütleriyle sonucun eksiksizliğini kontrol eder.
- **Context7:** kütüphane, framework, SDK, API, paket, CLI ve bulut servisi davranışı için güncel dokümantasyon otoritesi. Kullanıcı bunlar hakkında soru sorduğunda, sürüm bilindik görünse bile önce Context7'de kütüphane kimliğini çözümleyip ilgili kavramın dokümanını sorgulayın. Sadece genel programlama, ürün iş mantığı, refactor veya mevcut koddan açıkça anlaşılabilen kütüphane dışı işler için çağırmayın. MCP erişimi yoksa resmi dokümantasyonla doğrulayın ve bu sınırlamayı belirtin.
- **Firecrawl:** gerektiğinde dış web araştırması, güvenilir kaynak toplama, crawl ve yapılandırılmış veri çıkarma katmanı; bilgi doğrulama veya soru üretme otoritesi değildir. Erişilemiyorsa güvenilir kaynakları mevcut araçlarla araştırın ve bunu belirtin.

### Göreve göre yönlendirme

1. **Frontend özelliği veya ekranı:** İsteği, `PRODUCT.md`, `DESIGN.md` ve ilgili kodu inceleyin. İş anlamlı veya belirsizse uygun Superpowers akışını seçin (`brainstorming`, `writing-plans`, `test-driven-development`, `executing-plans`; bağımsız ve gerçekten paralel işler için `subagent-driven-development`). Güncel harici API/paket davranışı gerekiyorsa Context7; dış kaynak araştırması gerekiyorsa Firecrawl kullanın. Ardından mevcut `ui-ux-pro-max` ve `design-taste-frontend` sorumluluklarıyla uygulayın; büyükse Unlazy completeness gate'lerini ekleyin; `impeccable` audit/polish, `playwright-cli` masaüstü/mobil etkileşim kontrolü ve `verification-before-completion` ile bitirin. `scroll-craft` yalnızca yukarıda tanımlanan landing/marketing koşulunda devreye girer.
2. **Backend veya ürün mantığı:** Mimariyi inceleyin; kapsam gerektiriyorsa Superpowers ile gereksinim/plan ve test odaklı uygulama yürütün. Kütüphane davranışı için Context7'yi, dış veri için Firecrawl'ı yalnız ilgiliyse kullanın. Test edin; büyük işte Unlazy tamamlık denetimi, sonrasında `verification-before-completion` uygulayın.
3. **Hata düzeltme:** Önce hatayı yeniden üretin, ardından `systematic-debugging` ile kök nedeni bulun. Gerekirse Context7 ile sürüm/API davranışını doğrulayın. Düzeltmeyi ilgili regresyon testiyle kanıtlayın; tarayıcı akışı etkileniyorsa Playwright kullanın ve son doğrulamayı tekrar yapın.
4. **Quiz verisi ve araştırma:** Önce mevcut kategori ağacını `categories:sync` ile doğrulayın. Gerekliyse Firecrawl ile güvenilir kaynak adayları toplayın; bunları doğrudan production fact'e çevirmeyin. Kaynak URL'si ve provenance ile mevcut `knowledge_items` akışına aktarın; doğrulama, güncellik ve duplicate kontrolünden sonra soru üretin. Hazır quiz sitelerinden soru scrape etmeyin; sonuçta `approved`, `review`, `rejected`, `duplicate` ve `remaining` değerlerini raporlayın.

Küçük metin veya tek dosyalık trivial değişikliklere ağır spec/plan/gate zinciri zorlamayın. Bir araç veya skill, güvenlik sınırlarını, kullanıcı onayını ya da yukarıdaki kaynak-temelli soru üretimi kurallarını aşamaz. Kod yazılmış olması tek başına tamamlanma kanıtı değildir: işe uygun test, audit, tarayıcı kontrolü, completeness ve son doğrulamanın sonuçlarını görerek bitirin.
