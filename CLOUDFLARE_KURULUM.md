# Ente Metal Plastik - Cloudflare kurulum notları

Bu proje artık Cloudflare Pages üzerinde çalışmaya hazırdır. Netlify kredisi yememek
için canlı siteyi Cloudflare Pages üzerinden kullanmak en mantıklı yoldur.

## 1. Cloudflare Pages ayarları

Cloudflare panelinde proje ayarları şöyle olmalı:

- Framework preset: `None`
- Build command: boş
- Build output directory: `.`
- Production branch: `main`

Kısa linkler:

- Ana sayfa: `https://ente-premium.pages.dev`
- Ürünler: `https://ente-premium.pages.dev/urunler`
- Admin: `https://ente-premium.pages.dev/admin`

## 2. Teklif formunun direkt mail atması

Teklif formu artık Netlify Forms kullanmaz. Form `/api/teklif` adresine gider ve
Cloudflare Pages Function üzerinden mail servisine bağlanır.

Cloudflare Pages > Settings > Environment variables bölümüne şunları ekle:

- `MAIL_PROVIDER`: `brevo`
- `MAIL_TO`: `entemetal@gmail.com`
- `MAIL_FROM`: `Ente Metal Plastik <dogrulanmis-gonderici-mailin>`
- `BREVO_API_KEY`: Brevo hesabından alınan API key

Brevo yerine Resend kullanmak istersen:

- `MAIL_PROVIDER`: `resend`
- `MAIL_TO`: `entemetal@gmail.com`
- `MAIL_FROM`: domain doğrulandıktan sonra örn. `Ente Metal Plastik <teklif@domainin.com>`
- `RESEND_API_KEY`: Resend API key

Not: Cloudflare SMTP bağlantısı açmaz; bu yüzden mail için Brevo/Resend gibi HTTP
API veren servis kullanıyoruz. Bu yöntem ayrı hosting gerektirmez.

## 3. Form testi

Ortam değişkenlerini girdikten sonra Cloudflare'da yeniden deploy başlat.
Sonra siteden Teklif Al formunu doldur:

- Başarılıysa ekranda başarılı mesajı çıkar.
- Mail `MAIL_TO` adresine gelir.
- Dosya eki 4 MB altındaysa maile eklenir.
- Dosya eki 4 MB üstündeyse mail gelir ama ek dosya not olarak yazılır.

## 4. Admin paneli

Admin paneli Decap CMS kullanır. İçerikler GitHub reposundaki JSON dosyalarını
düzenler. Cloudflare Pages canlı siteyi GitHub'dan otomatik yayınlar.

Cloudflare, Netlify Identity gibi hazır admin giriş sistemi vermediği için adminin
GitHub'a yazabilmesi adına bir defalık GitHub OAuth ayarı gerekir. Bu proje içinde
Cloudflare Pages Function olarak `/api/auth` ve `/api/callback` hazırdır.

GitHub'da OAuth App oluştur:

- Homepage URL: `https://ente-premium.pages.dev`
- Authorization callback URL: `https://ente-premium.pages.dev/api/callback`

Sonra Cloudflare Pages > Settings > Variables and secrets bölümüne ekle:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Kaydettikten sonra yeni deploy başlat. Admin adresi:

- `https://ente-premium.pages.dev/admin/`

Not: Giriş yapan GitHub hesabının `ahmetbtnc/ente_premium` reposuna yazma yetkisi
olmalıdır.

## 5. Domain alınca

Domaini Cloudflare Pages projesine bağla. Sonra:

- `admin/config.yml` içinde `site_url` ve `display_url` alanlarını domainle güncelle.
- Mail gönderiminde Resend kullanacaksan domain doğrulaması yap.
- Brevo kullanacaksan gönderen mail adresini Brevo'da doğrula.

## 6. Netlify dosyaları

`netlify.toml` dosyası eskiye dönüş gerekirse diye duruyor. Canlı kullanımda asıl
Cloudflare dosyaları `_headers`, `_redirects` ve `functions/api/teklif.js` dosyalarıdır.
