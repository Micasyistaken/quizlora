# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Collon; gündelik eğlence için kısa bir test çözmek isteyenlerden konu bilgisini tekrar etmek isteyen kullanıcılara, quiz meraklılarına ve rekabetçi oyunculara kadar doğrudan quiz çözmek isteyen herkese yöneliktir.

Kullanıcılar çoğunlukla boş zamanlarında, bir konu hakkında bilgisini denemek istediğinde veya puan, seviye ve sıralama motivasyonuyla geri döner. Tek bir kullanıcı hem rahat keşif hem de rekabetçi oyun akışlarını kullanabilir.

## Product Purpose

Collon, zengin ve çeşitli soru havuzuyla kullanıcıların ilgi alanlarına göre test keşfetmesini, çözmesini ve bilgisini geliştirmesini sağlar. Başarı; kullanıcıların ilk testten sonra düzenli olarak geri dönmesi, farklı kategorilere yönelmesi ve tercih ettikleri oyun akışında aktif kalmasıdır.

## Positioning

Collon; kategori keşfi, özelleştirilebilir kullanıcı profili, günlük hazırlanan testler, sıralama motivasyonu ve rekabetçi oyun modlarını tek bir bilgi-eğlence deneyiminde birleştirir. Bu bileşim, yalnızca soru-cevap sunan bir quiz sayfasından farklı olarak tekrar eden, ilerleme odaklı bir kullanıcı akışı oluşturur.

## Operating Context

Kullanıcılar kategoriler ve arama üzerinden quiz bulur; sabit quizler, süreli sınav, yolculuk ve düello gibi modlar arasında geçiş yapar. Hesabı olan kullanıcılar profilini kişiselleştirir, ilerlemesini saklar, kategorileri takip eder ve sıralama ya da sosyal rekabet mekaniklerine katılır.

Günlük oluşturulmuş testler, yeni soru çeşitliliği ve tekrar çözme akışları düzenli ziyaret için başlıca temas noktalarıdır.

## Capabilities and Constraints

- Kategori ve quiz keşfi, arama, sabit quiz çözümü, soru ilerlemesi ve sonuç değerlendirmesi.
- Süreli sınav, yolculuk ve düello gibi farklı çözüm ve rekabet modları.
- Profil, avatar/çerçeve/tema gibi kişiselleştirme öğeleri, takip edilen kategoriler ve kullanıcı ilerlemesinin korunması.
- Sıralama, seviye, puan ve kredi gibi rekabeti ve geri dönüşü destekleyen sistemler.
- Kaynak-temelli soru havuzu botu; sorular yalnızca doğrulanmış bilgi kayıtlarından türetilir, kaynak uydurulmaz ve hazır quiz sitelerinden soru kopyalanmaz.
- Mevcut web uygulamasının yayın çıktısı `dist/` klasörüdür; ana istemci yüzeyi `dist/index.html` dosyasında bulunur.

## Brand Commitments

Ürün adı Collon'dur. Bölünmüş dikey işaret ve küçük harfli geometrik kelime logosu marka imzasıdır. Marka sesi eğlenceli, öğretici, rekabetçi ve her seviyeye açık olmalıdır. Ürün, öğrenmeyi oyunlaştırır; ancak gündelik kullanım için erişilebilir kalır ve kullanıcıları tek bir başarı tanımına zorlamaz.

## Evidence on Hand

- Çalışan web yüzeyi: `dist/index.html`
- Uygulama soru verisi: `dist/question-pool.json`
- Kaynak-temelli soru havuzu botu ve kaynak politikası: `src/`, `docs/question-pool-bot.md`, `AGENTS.md`
- Vercel yapılandırması: `vercel.json`

Gelecekte gerçek kullanıcı sayısı, tutma oranı, liderlik tablosu performansı veya içerik kalitesi hakkında doğrulanmamış metrik ve iddia üretilmemelidir.

## Product Principles

1. Her ziyaretçi, uzmanlık düzeyinden bağımsız olarak hızlıca bir quiz çözmeye başlayabilmelidir.
2. Soru çeşitliliği, kategori keşfi ve yeni testler tekrar ziyaret için sürekli neden sunmalıdır.
3. Rekabet; puan, seviye, sıralama ve modlarla güçlü olmalı, fakat gündelik eğlence ve öğrenme akışlarını gölgelememelidir.
4. Profil özelleştirmesi ve ilerleme, kullanıcıya kişisel sahiplik ve devamlılık hissi vermelidir.
5. Üretim soru içeriği doğrulanabilir kaynaklara dayanmalıdır.

## Accessibility & Inclusion

Collon, farklı bilgi seviyelerindeki kullanıcıların anlayabileceği açık Türkçe arayüz, klavye ile kullanılabilir temel etkileşimler, anlamlı etiketler ve azaltılmış hareket tercihlerine saygı gösteren bir web deneyimi sunmalıdır.
