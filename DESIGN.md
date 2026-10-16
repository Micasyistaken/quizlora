---
name: Collon
description: Çöz, öğren, yarış — yalın ve yüksek kontrastlı Türkçe quiz deneyimi.
colors:
  light-page: "#F7F7F4"
  light-surface: "#FFFFFF"
  light-soft: "#EEEEEB"
  light-text: "#111112"
  light-muted: "#5D5D5C"
  light-line: "#DADAD6"
  dark-page: "#101011"
  dark-surface: "#1A1A1C"
  dark-soft: "#252527"
  dark-text: "#F5F5F2"
  dark-muted: "#B6B6B2"
  dark-line: "#3A3A3D"
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

Ürün dili enerjik kalır, fakat arayüz çerçevesi siyah/beyaz eksenli, net ve
sakin olmalıdır. Fotoğrafik kategori sahneleri, kategoriye özgü vektörler,
oyunlaştırma görselleri ve işlevsel animasyonlar korunur. Bunlar nötr arayüz
üzerinde içerik olarak dikkat çeker; marka eylemlerinin rengini belirlemez.

## Renk ve tema

Işık tema: sayfa `#F7F7F4`, yüzey `#FFFFFF`, yumuşak yüzey `#EEEEEB`, metin
ve ana eylem `#111112`, ikincil metin `#5D5D5C`, çizgi `#DADAD6`.
Koyu tema: sayfa `#101011`, yüzey `#1A1A1C`, yumuşak yüzey `#252527`, metin
ve ana eylem `#F5F5F2`, ikincil metin `#B6B6B2`, çizgi `#3A3A3D`.
Durum renkleri yalnızca başarı, hata, süre uyarısı ve ödül gibi semantik
bağlamlarda kullanılabilir. Metin anlamı yalnızca renge yüklenmez.

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

- Birincil buton tema metninin rengini zemin, tema sayfasının rengini yazı
  olarak kullanır. İkincil eylem ince çizgi veya metin-link olabilir.
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
