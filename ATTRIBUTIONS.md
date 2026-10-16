# Marka işaretleri ve görsel kaynaklar

## Collon kimliği

`dist/assets/collon-mark.svg` ve `dist/assets/collon-wordmark.svg`, kullanıcının
sağladığı marka referansından bu proje için yeniden çizilmiş vektörlerdir; özgün
tasarım dosyası olarak sunulmaz. Arayüzdeki Manrope fontunun Latin ve Latin Extended
WOFF2 alt kümeleri Google Fonts üzerinden yerel varlık olarak sunulur. Lisans:
`dist/assets/fonts/OFL.txt` (SIL Open Font License 1.1).

Quizlora, aşağıdaki adlarla açıkça tanımlanmış quiz kategorilerinde yalnızca
tanımlayıcı amaçla yerel vektör marka işaretleri kullanır. SVG silüetleri CSS
maskesiyle Quizlora'nın mevcut renk paletinde gösterilir; logolar markaların
resmî renk kullanımını temsil etmez. Kaynak sayfalar telif ve marka durumunu
ayrıntılı olarak taşır. Markalar ilgili hak sahiplerine aittir.

| Kategori | Yerel dosya | Kaynak |
| --- | --- | --- |
| Süper Lig | `dist/assets/official-marks/super-lig-new.svg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Trendyol_S%C3%BCper_Lig_logo_dikey.svg) |
| Premier League | `dist/assets/official-marks/premier-league.svg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Premier_League_wordmark.svg) |
| La Liga | `dist/assets/official-marks/laliga-vertical.svg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:LaLiga_2023_Vertical_Logo.svg) |
| Serie A | `dist/assets/official-marks/serie-a-symbol.svg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Serie_A.svg) |
| Bundesliga | `dist/assets/official-marks/bundesliga.svg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Bundesliga_logo.svg) |
| Ligue 1 | `dist/assets/official-marks/ligue-1-2024.svg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Logo_Ligue_1_McDonald%27s_2024.svg) |
| Dünya Kupası | `dist/assets/official-marks/world-cup.svg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:FIFA_World_Cup_wordmark_(2023).svg) |
| League of Legends | `dist/assets/official-marks/league-of-legends-icon.svg` | [theSVG](https://thesvg.org/icon/league-of-legends), ayırt edici L simgesi |
| Minecraft | `dist/assets/official-marks/minecraft-creeper.svg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Minecraft-creeper-face.svg), kare zemin kaldırılarak yalnızca yüz geometrisi kullanıldı |
| Naruto | `dist/assets/official-marks/naruto.svg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Naruto_logo.svg) |
| One Piece | `dist/assets/official-marks/one-piece.svg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:One_piece_logo_1.svg) |
| Dragon Ball | `dist/assets/official-marks/dragon-ball.svg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dragon_Ball_Funimation_logo.svg) |

Kavramsal kategori işaretleri [Material Design Icons](https://pictogrammers.com/library/mdi/)
vektör yollarını kullanır (Apache-2.0). Kaynak paket, yeniden üretilebilir görsel
derleme için geliştirme bağımlılığıdır; son kullanıcıya yalnızca seçilmiş
vektör yolları gönderilir. Emoji veya simge arka planı kullanılmaz.

## Kategori giriş sahneleri

`dist/assets/category-scenes/` altındaki 18 JPEG, Quizlora kategori girişleri için
OpenAI görsel üretimiyle hazırlanmış fotoğrafik sahnelerdir; üçüncü taraf stok
fotoğraf veya gerçek bir mekânın belgesel görüntüsü olarak sunulmazlar.
Her ana kategori için ayrı bir sahne vardır; alt kategoriler ana başlığın sahnesini
kullanır. Üretim istemleri kategoriye özgü fiziksel mekânı tarif eder ve metin,
logo, emoji, vektör/çizgi film görünümü ile filigranı dışlar.
