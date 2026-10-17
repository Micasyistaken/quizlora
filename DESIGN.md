---
name: Collon
description: Çöz, öğren, yarış — kontrollü renk vurgulu, yüksek kontrastlı Türkçe quiz deneyimi.
colors:
  light-page: "#F7F8FC"
  light-surface: "#FFFFFF"
  light-soft: "#EEF0FA"
  light-text: "#171A2B"
  light-muted: "#515A70"
  light-line: "#D9DEED"
  light-action: "#3E4FAE"
  light-mint: "#087D69"
  light-amber: "#9C610E"
  dark-page: "#11141F"
  dark-surface: "#1B2030"
  dark-soft: "#252C40"
  dark-text: "#F5F7FF"
  dark-muted: "#BBC4D8"
  dark-line: "#3D4760"
  dark-action: "#9AA6FF"
  dark-mint: "#70DAC0"
  dark-amber: "#F2BF68"
typography:
  family: "Collon UI (self-hosted Manrope), Arial, sans-serif"
  body: "16px / 1.5"
  heading-weight: "750"
  heading-tracking: "-0.045em"
shape:
  surface: "14–18px"
  control: "8–10px"
  pill: "only for genuine compact status or counters"
---

# Collon tasarım sistemi

## Marka yönü

Kaynak marka görselindeki bölünmüş iki dikey gövde ve küçük harfli `collon`
kelime logosu esas alınır. Yerel vektör uyarlamaları `dist/assets/collon-mark.svg`
ve `dist/assets/collon-wordmark.svg` dosyalarındadır. Orijinal tasarımın
vektör dosyası bulunmadığı için bunlar referanstan yeniden çizilmiştir.

Ürün dili enerjik kalır; arayüz çerçevesi sakin, net ve ölçülü renk vurgulu
olmalıdır. Wordmark tema metni renginde kalır. Fotoğrafik kategori sahneleri,
kategoriye özgü vektörler, oyunlaştırma görselleri ve işlevsel animasyonlar
korunur. Arayüz vurguları bu görsellerle yarışmaz.

## Renk ve tema

Işık tema: sayfa `#F7F8FC`, yüzey `#FFFFFF`, yumuşak yüzey `#EEF0FA`, metin
`#171A2B`, ikincil metin `#515A70`, çizgi `#D9DEED`.
Koyu tema: sayfa `#11141F`, yüzey `#1B2030`, yumuşak yüzey `#252C40`, metin
`#F5F7FF`, ikincil metin `#BBC4D8`, çizgi `#3D4760`.
Birincil eylem ve seçili gezinme indigo (`#3E4FAE` / `#9AA6FF`), günlük ve
ilerleme mint (`#087D69` / `#70DAC0`), ödül ve rekabet amber (`#9C610E` /
`#F2BF68`) kullanır. Geniş tanıtım yüzeyleri bu vurguların koyu, metni
okunur tonlarını kullanır. Hata ve başarı semantiği ayrı kalır. Anlam yalnızca
renge yüklenmez.

## Tipografi ve kompozisyon

Arayüz fontu yerel Manrope'tur (`Collon UI`); font lisansı
`dist/assets/fonts/OFL.txt` dosyasındadır. Başlıklar 750 ağırlık ve sıkı
harf aralığı kullanır. Gövde 16px/1.5; yardımcı metin düşük ağırlıklı ama
okunur kontrasttadır. Büyük başlık her sayfada tek bir odak kurmalı; kart
başlıkları, yardımcı açıklamalar ve sayaçlar aynı görsel ağırlıkta olmamalıdır.

Kapsayıcı genişliği yaklaşık 1220px'tir. İçerik türüne göre bilinçli yoğunluk
kurulur: kategori/quiz başlangıçlarında fotoğraf sahnesi, soru ekranında
odaklı dar çalışma alanı, sıralamada taranabilir satırlar, profil ve mağazada
özelleştirme içeriği. Her şeyi aynı kart ızgarasına dökmeyin.

## Bileşen ve etkileşim

- Birincil buton indigo eylem rengini ve ona karşıt yazıyı kullanır. Fotoğraf
  ya da koyu tanıtım yüzeyindeki buton okunur beyaz olabilir. İkincil eylem
  ince çizgi veya metin-link olabilir.
- Genel yüzeyde 14–18px, kontrollerde 8–10px köşe yarıçapı kullanılır.
  Belirgin gölge yalnızca gerçek yükseklik/etkileşim gösterdiğinde eklenir.
- Desktop üst gezinme, Türkiye saati ve yalnızca Günlük/Keşfet/Modlar için
  alt menüler korunur. Mobil alt gezinme ve minimum 44px dokunma hedefi sürer.
- Quiz ilerlemesi `x/toplam` ve boş bırakılan soru sayısını metinle sunar.
  Mevcut cevap, süre, puan ve mod kuralları tasarımla değiştirilmez.
- Tilt, fan, magnetic ve tema geçişi mevcut amaçlarında kalır;
  `prefers-reduced-motion` seçeneğinde hareket azaltılır veya kaldırılır.
- Klavye odağı her temada görünür, durum ve hata mesajları okunabilir olmalıdır.

Uygulama CSS temelinde `dist/index.html` ve marka katmanında
`dist/assets/collon.css` bulunur. Eski Quizlora teknik kimlikleri (`qz_db`,
hash rotaları ve veri şeması) geçiş uyumluluğu için korunur; yeni ekranda
görünür marka adı olarak kullanılmaz.
