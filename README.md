# Collon

Collon, Quizlora temelindeki soru ve oyun akışlarını koruyan yeni marka
kimliğidir. Uygulama statik bir web sitesidir; Vercel `dist/` klasörünü
yayınlar. Eski `qz_db` yerel veri anahtarı ve `#/...` bağlantıları geçiş
uyumluluğu için değişmeden kalır. Arayüz `dist/index.html` ve
`dist/assets/collon.css` dosyalarındadır; marka sistemi `DESIGN.md` içindedir.

## Eski adresten veri taşıma

Tarayıcıdaki profil ve quiz ilerlemesi alan adına bağlıdır. Eski adreste
[quizlora.vercel.app/#/aktar](https://quizlora.vercel.app/#/aktar) sayfasından yerel yedeği indir; yeni
[collon.vercel.app/#/aktar](https://collon.vercel.app/#/aktar) sayfasından
dosyayı seç, özeti kontrol et ve mevcut verinin üzerine yazma onayını ver.
İçe aktarma dosyayı sunucuya göndermez. Yedek e-posta ve hesap bilgileri
içerebileceğinden özel tutulmalıdır. Eski adresteki kayıt otomatik silinmez;
yeni adreste profilini doğrulayana kadar yedeği koru.

## Soru havuzu oluşturucu bot

Collon, uygulamadan bağımsız, kaynak-temelli bir soru havuzu botu da içerir. Sistem hazır quiz sorularını kopyalamaz: önce kaynak bilgiyi (`knowledge_items`) toplar, doğrular ve tekilleştirir; sonra yalnızca bu fact'lerden soru üretir.

Hızlı başlangıç:

```powershell
npm run bot -- categories:sync
npm run bot -- categories:list
npm run bot -- categories:set-context --category cografya --sources "Türkiye,Fransa,İtalya,Japonya"
npm run bot -- questions:fill --category cografya --target 20
npm run bot -- quiz:generate --category cografya --count 10 --difficulty medium
```

Kategori listesi sabit değildir: geçiş döneminde senkronizasyon eski `https://quizlora.vercel.app/` adresindeki kategori ağacını okur; bağlantı yoksa depodaki güncel `dist/index.html` güvenli fallback olur. Ayrıntılı kullanım, veri şeması, kaynak politikası ve komut örnekleri için [dokümantasyona](docs/question-pool-bot.md) bakın.

Collon, statik bir quiz web uygulamasıdır. Vercel'de `dist` klasörü doğrudan yayınlanır.

## Düzenleme

Uygulamanın güncel ve kanonik kaynak dosyası:

```text
dist/index.html
```

Tasarım, içerik verisi ve istemci tarafı davranışları bu dosyadadır. Düzenlemelerden sonra aşağıdaki doğrulamayı çalıştırın:

```bash
npm run validate
```

Yerelde önizlemek için:

```bash
npm run dev
```

Ardından tarayıcıda `http://localhost:3000` adresini açın.

## Yayınlama

Vercel yapılandırması [`vercel.json`](./vercel.json) içindedir ve çıktı klasörü `dist` olarak ayarlanmıştır. Vercel projesine bağlı bir dalı güncellediğinizde veya Vercel panelinden yayınlama yaptığınızda bu klasör yayınlanır.

## Depodaki dışa aktarma kopyaları

- `.site-package-stage/`: Önceki Sites paketi için oluşturulmuş dışa aktarma klasörü.
- `quizlora-site.tar.gz`: Aynı paketin sıkıştırılmış arşivi.

Bu iki öğe istek üzerine tarihsel/export kopyası olarak saklanır. Uygulamayı düzenlerken `dist/index.html` dosyasını kullanın.
