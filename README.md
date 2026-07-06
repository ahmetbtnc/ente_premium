# Ente Metal Plastik - Web Sitesi

Bu repo Ente Metal Plastik sitesinin canlı kodlarıdır. Site statik çalışır, içerik
JSON dosyalarından gelir, admin paneli Decap CMS kullanır. Önerilen canlı yayın
ortamı Cloudflare Pages'tir.

## Klasör yapısı

```text
index.html                  Ana sayfa
urunler.html                Ürün kataloğu
css/style.css               Tasarım ve responsive düzen
js/main.js                  Site etkileşimleri ve dinamik içerik
data/products.json          Ürünler
data/page_blocks.json       Ek duyuru/CTA blokları
data/settings/              Site ayarları
images/                     Logo ve ürün görselleri
admin/                      İçerik yönetim paneli
functions/api/teklif.js     Cloudflare teklif formu mail servisi
_headers                    Cloudflare güvenlik/dosya başlıkları
_redirects                  Cloudflare kısa link yönlendirmeleri
```

## Admin panelinden yönetilenler

Admin panelinden logo, renkler, site metinleri, hero alanı, hakkımızda metni,
hizmet kartları, iletişim bilgileri, çalışma saatleri, harita adresi, WhatsApp
metinleri, ürün başlıkları, ürünler, teklif formu yazıları ve ek sayfa blokları
düzenlenebilir.

Ürün başlıkları `Site Ayarları > Ana Sayfa - Ürünler Bölümü Metinleri` içindeki
`Katalog Kategori Başlıkları` alanından yönetilir. Yeni başlık eklenince katalog
filtrelerinde görünür; ürün eklerken kategori alanına aynı başlık yazılır.

## Cloudflare Pages kurulumu

Cloudflare Pages ayarları:

- Framework preset: `None`
- Build command: boş
- Build output directory: `.`
- Production branch: `main`

Canlı kısa linkler:

- Ana sayfa: `https://ente-premium.pages.dev`
- Ürünler: `https://ente-premium.pages.dev/urunler`
- Admin: `https://ente-premium.pages.dev/admin`

Detaylı adımlar için `CLOUDFLARE_KURULUM.md` dosyasına bak.

## Teklif formu

Teklif formu Netlify Forms kullanmaz. Form `/api/teklif` adresine gider ve
Cloudflare Pages Function üzerinden direkt mail servisine bağlanır.

Cloudflare Pages > Settings > Environment variables bölümüne şunlar girilir:

- `MAIL_PROVIDER`: `brevo`
- `MAIL_TO`: `entemetal@gmail.com`
- `MAIL_FROM`: `Ente Metal Plastik <dogrulanmis-gonderici-mailin>`
- `BREVO_API_KEY`: Brevo API key

Resend kullanılacaksa `MAIL_PROVIDER=resend` ve `RESEND_API_KEY` girilir. Resend
için domain doğrulaması genelde daha önemlidir; domain almadan önce Brevo daha
rahat başlangıç seçeneğidir.

## Admin paneli

Admin paneli Decap CMS'tir. Netlify Identity/Git Gateway kolaydı ama Netlify kredi
harcadığı için Cloudflare'a geçişte adminin GitHub'a yazabilmesi adına bir defalık
GitHub OAuth ayarı gerekir.

Gerçek admin adresi:

- `https://ente-premium.pages.dev/admin/`

GitHub girişini aktif etmek için GitHub'da OAuth App oluştur:

- Homepage URL: `https://ente-premium.pages.dev`
- Authorization callback URL: `https://ente-premium.pages.dev/api/callback`

GitHub'ın verdiği değerleri Cloudflare Pages > Settings > Variables and secrets
bölümüne ekle:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Kaydettikten sonra Cloudflare'da yeniden deploy başlat. Sonra `/admin/` adresinden
GitHub hesabınla giriş yapabilirsin. Giriş yapan GitHub hesabının
`ahmetbtnc/ente_premium` reposuna yazma yetkisi olmalıdır.

Admin arayüzünü giriş yapmadan gezmek için test paneli vardır:

- `https://ente-premium.pages.dev/admin-test/`

Bu test paneli siteye yayın yapmaz; sadece alanları, formları ve önizleme düzenini
kontrol etmek içindir. Canlı düzenleme için `/admin/` kullanılacaktır.

## Yerel test

Statik siteyi dosyaya çift tıklayarak açmak yerine küçük bir yerel sunucu ile aç:

```bash
npm run dev
```

Admin panelini yerelde denemek için ayrıca:

```bash
npm run cms
```

## Eski Netlify dosyası

`netlify.toml` eskiye dönüş gerekirse diye durur. Güncel canlı kurulum Cloudflare
üzerinden yapılmalıdır.
