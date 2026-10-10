# Quizlora

Quizlora, tek dosyalı statik bir quiz web uygulamasıdır. Vercel'de `dist` klasörü doğrudan yayınlanır.

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
