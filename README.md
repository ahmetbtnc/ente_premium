# Ente Metal Plastik — Web Sitesi

## Klasör yapısı
```
ente-metal-plastik/
├── index.html              → Ana sayfa (öne çıkan ürünler + tüm bölümler)
├── urunler.html             → Ayrı ürün kataloğu sayfası (arama + filtre + tüm ürünler)
├── css/style.css            → Tüm tasarım + animasyonlar
├── js/main.js               → Tüm etkileşim/animasyon mantığı (her iki sayfada ortak)
├── data/products.json       → ÜRÜNLER (admin panelinden yönetilir)
├── data/page_blocks.json    → Esnek reklam/duyuru blokları (admin panelinden yönetilir)
├── data/settings/           → Site ayarları, konusuna göre 7 ayrı dosyaya bölünmüş:
│     marka.json               → Logo, favicon, slogan, renkler
│     hero.json                → Ana sayfa giriş (hero) metinleri + sayaçlar
│     hakkimizda.json          → Hakkımızda metni + vizyon maddeleri + hizmet kartları
│     iletisim.json            → Telefon, adres, WhatsApp, harita/konum, sosyal medya
│     urunler_bolumu.json      → Ana sayfadaki "Öne Çıkanlar" bölümü metinleri
│     teklif_formu.json        → Teklif formu ayarları
│     ux.json                  → WhatsApp butonlarının açık/kapalı ayarları
├── images/                  → Ürün görselleri ve logo buraya yüklenir
└── admin/                   → Kod bilmeyen kişi için içerik yönetim paneli
```

## Admin panelinden neler değiştirilebilir?
`siteadresi.com/admin` adresine giren kişi, sol menüde şu bölümleri görür:

- **Site Ayarları** (7 alt bölüme ayrılmıştır, her biri kendi başlığıyla listelenir):
  1. Marka & Görünüm — **logo dahil** her şey (favicon, slogan, ana renkler)
  2. Ana Sayfa Giriş Bölümü (Hero) — büyük başlık, alt yazı, sayaçlar
  3. Hakkımızda & Hizmetlerimiz — açıklama metni, vizyon maddeleri, hizmet kartları
  4. İletişim Bilgileri & Konum — telefon, e-posta, adres, çalışma saatleri, harita
     konumu (**artık sadece adres/konum adını yazmak yeterli**, Google Haritalar'dan
     link kopyalamaya gerek yok), Instagram/LinkedIn linkleri
  5. Ana Sayfa - Ürünler Bölümü Metinleri
  6. Teklif Formu Ayarları
  7. Gelişmiş Ayarlar — WhatsApp butonlarının açık/kapalı durumu
- **Ürün Kataloğu Yönetimi** — ürün ekle/düzenle/sil (fotoğraf, ölçüler, malzeme,
  açıklama, "Ana Sayfada Öne Çıkar" ve "Sıralama" dahil — hepsi form alanı, kod yok).
- **Esnek Sayfa Blokları** — istenirse ana sayfaya ek duyuru/reklam blokları eklenir.

Her alanın üstünde ne işe yaradığını açıklayan bir ipucu (hint) metni vardır.
Bir alanı değiştirdiğinizde sağ tarafta (masaüstünde) canlı bir önizleme paneli
açılır; renkler kutu, görseller küçük resim, açık/kapalı alanlar rozet olarak
gösterilir.

## 1) VS Code'da canlı önizleme (domain almadan)
Bilgisayarında bunu görmek için dosyayı çift tıklayıp tarayıcıda AÇMA — çünkü veriler
`fetch` ile JSON'dan okunuyor ve tarayıcılar güvenlik nedeniyle `file://` üzerinden
buna izin vermiyor. Bunun yerine:

1. VS Code'da **"Live Server"** eklentisini kur (Extensions sekmesinden ara, kur).
2. `index.html` dosyasına sağ tıkla → **"Open with Live Server"**.
3. Tarayıcıda `http://127.0.0.1:5500` gibi bir adreste site açılacak.

**Admin panelini yerelde test etmek için** (isteğe bağlı):
1. Node.js kuruluysa proje klasöründe `npm run dev` ile siteyi, ayrı bir terminalde `npm run cms` ile admin backend'i başlat.
2. `http://127.0.0.1:8080/admin/` adresine git (decap-server portu terminalde yazar).

## 2) Netlify'a yükleme ve domain bağlama
1. Bu proje klasörünü bir GitHub reposuna yükle (`main` branch olmalı — admin paneli bunu kullanır).
2. [netlify.com](https://netlify.com) üzerinde hesap aç, **"Add new site" → "Import an
   existing project"** ile bu repoyu bağla. Build ayarı gerekmiyor (statik site),
   **Publish directory: `.`** (kök klasör) olarak bırak. Direkt yayınlanır.
3. **Site settings → Identity** kısmından Identity'yi aktif et.
4. Aynı yerde **Identity → Services → Git Gateway**'i de aktif et.
5. Identity sekmesinden yönetecek kişiye e-posta ile davet gönder ("Invite users").
   Davet linkine tıklandığında site açılır, giriş yapınca otomatik `/admin/` sayfasına yönlendirilir.
6. Admin paneline doğrudan `siteniz.com/admin` adresinden girin. Giriş yapılmamışsa
   otomatik olarak Netlify giriş penceresi açılır.
7. Kendi domainini (`entemetalplastik.com` gibi) **Domain settings** kısmından bu
   siteye bağlayabilirsin. Domain bağladıktan sonra `admin/config.yml` dosyasındaki
   `site_url` ve `display_url` satırlarının başındaki `#` işaretini kaldırıp kendi
   domainini yaz.
8. Sorun yaşarsan **Deploys → Trigger deploy → Clear cache and deploy site** ile
   yeniden yayınla.

> **Sık karşılaşılan admin hataları:**
> - "Failed to load settings" → Identity ve Git Gateway aktif mi kontrol et, yeniden davet gönder.
> - Panel sürekli "Yükleniyor" → Reklam engelleyiciyi kapat, gizli sekmede dene.
> - Değişiklikler sitede görünmüyor → Admin'de "Publish" butonuna bastığından emin ol.

## 3) WhatsApp numarasını değiştirme
Admin panelinden **Site Ayarları → İletişim Bilgileri & Konum** kısmından,
başında + ve boşluk OLMADAN, ülke kodlu numarayı gir. Örnek: `905551112233`

## 4) Google Haritalar konumu
Artık iframe/embed linki kopyalamaya gerek yok. **Site Ayarları → İletişim
Bilgileri & Konum** kısmındaki "Haritada Görünecek Konum" alanına firma adını
veya adresini yazman yeterli, harita otomatik oluşur.

## 5) Ürün görselleri
Admin panelinden ürün eklerken/düzenlerken fotoğrafı sürükle-bırak ile
yüklemen yeterli, otomatik olarak `images/` klasörüne kaydedilir.

---
Herhangi bir adımda takılırsan (Netlify kurulumu, GitHub'a yükleme, domain
bağlama, Identity/Git Gateway hataları) söyle, birlikte adım adım çözelim.
