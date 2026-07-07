// ==========================================================================
// ENTE METAL PLASTİK — ULTIMATE PREMIUM SYSTEM ENGINE v3.0
// Tüm Hakları Saklıdır. Sıfır Kırpma, Full Dinamik Entegrasyon Matrixi.
// Muğla Sıtkı Koçman Üniversitesi - Bilgisayar Mühendisliği © 2026
// ==========================================================================

let SETTINGS = null;
let ALL_PRODUCTS = [];

// Admin panelinden gelen düz metinleri HTML içine güvenli şekilde yerleştirmek
// için basit bir kaçış (escape) yardımcı fonksiyonu.
function esc(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function applyAccentColor(color) {
  if (!color) return;
  const root = document.documentElement;
  root.style.setProperty('--molten', color);
  root.style.setProperty('--molten-light', `color-mix(in srgb, ${color} 58%, #ffffff 42%)`);
  root.style.setProperty('--accent-soft', `color-mix(in srgb, ${color} 10%, transparent)`);
  root.style.setProperty('--accent-mid', `color-mix(in srgb, ${color} 26%, transparent)`);
  root.style.setProperty('--accent-strong', `color-mix(in srgb, ${color} 45%, transparent)`);
}

document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initNav();
  initScrollSpy();
  initScrollProgress();
  initReveal();
  initMagneticButtons();
  loadSettings();
  loadProducts();
  loadDynamicPageBlocks();
  initTeklifModal();
  
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

function initPageLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hide'), 300);
  });
  setTimeout(() => loader.classList.add('hide'), 2000);
}

function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrollTop = h.scrollTop || document.body.scrollTop;
    const scrollHeight = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

function initNav() {
  const burger = document.getElementById('navBurger');
  const links = document.getElementById('navLinks');
  if (!burger || !links) return;

  if (!links.querySelector('.mobile-nav-cta')) {
    const mobileCta = document.createElement('button');
    mobileCta.type = 'button';
    mobileCta.className = 'mobile-nav-cta js-teklif-tetikleyici';
    mobileCta.textContent = 'Teklif Al';
    links.appendChild(mobileCta);
  }
  
  burger.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open-mobile');
    burger.classList.toggle('active', isOpen);
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.classList.toggle('no-scroll', isOpen);
  });
  
  links.querySelectorAll('a, button').forEach(l => l.addEventListener('click', () => {
    links.classList.remove('open-mobile');
    burger.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }));
}

function initScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = Array.from(document.querySelectorAll('section[id], .hero[id]'));
  if (!navLinks.length || !sections.length) return;
  
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -60% 0px' });
  
  sections.forEach(s => io.observe(s));
}

function initReveal() {
  const seen = new Map();
  document.querySelectorAll('.reveal').forEach(el => {
    const parent = el.parentElement;
    const count = seen.get(parent) || 0;
    el.style.setProperty('--stagger', count);
    seen.set(parent, count + 1);
  });
  
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { 
      if (e.isIntersecting) { 
        e.target.classList.add('in'); 
        io.unobserve(e.target); 
      } 
    });
  }, { threshold: 0.05 });
  
  document.querySelectorAll('.reveal').forEach(i => io.observe(i));
}

function initAdvancedMoldAnimation(duration) {
  const fill = document.getElementById('meltFill');
  const sprue = document.querySelector('.sprue');
  const sprueDot = document.querySelector('.sprue-dot');
  const glow = document.querySelector('.mold-glow');
  if (!fill) return;

  const d = duration || 2600;
  let stage = 'injecting';

  function runCycle() {
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / d, 1);
      if (stage === 'injecting') {
        if (sprue) sprue.classList.add('flowing');
        if (sprueDot) sprueDot.classList.add('flowing');
        if (glow) glow.classList.add('active');
        const h = 210 * (1 - Math.pow(1 - progress, 3));
        fill.setAttribute('height', h);
        fill.setAttribute('y', 330 - h);
        if (progress < 1) requestAnimationFrame(step);
        else {
          stage = 'cooling';
          if (sprue) sprue.classList.remove('flowing');
          if (sprueDot) sprueDot.classList.remove('flowing');
          setTimeout(() => { stage = 'retracting'; runCycle(); }, 1200);
        }
      } else if (stage === 'retracting') {
        if (glow) glow.classList.remove('active');
        const h = 210 * (1 - (progress * progress * progress));
        fill.setAttribute('height', h);
        fill.setAttribute('y', 330 - h);
        if (progress < 1) requestAnimationFrame(step);
        else { stage = 'injecting'; setTimeout(runCycle, 800); }
      }
    }
    requestAnimationFrame(step);
  }
  runCycle();
}

function initCounters() {
  const nums = document.querySelectorAll('.stat-num');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const isDecimal = el.dataset.decimal === 'true';
      const start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / 1200, 1);
        el.textContent = isDecimal ? (target * t).toFixed(2) : Math.floor(target * t);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = isDecimal ? target.toFixed(2) : target;
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.3 });
  nums.forEach(n => io.observe(n));
}

function initParticles() {
  const wrap = document.getElementById('heroParticles');
  if (!wrap) return; 
  wrap.innerHTML = '';
  const count = window.innerWidth < 768 ? 12 : 25;
  for (let i = 0; i < count; i++) {
    const e = document.createElement('span');
    e.className = 'ember';
    e.style.position = 'absolute';
    e.style.background = 'var(--molten)';
    e.style.borderRadius = '50%';
    e.style.bottom = '-10px';
    const size = 2 + Math.random() * 3;
    e.style.width = size + 'px'; 
    e.style.height = size + 'px'; 
    e.style.left = Math.random() * 100 + '%';
    e.style.opacity = Math.random() * 0.6 + 0.1;
    e.style.animation = `rise ${3 + Math.random() * 5}s linear infinite`;
    wrap.appendChild(e);
  }
}

if (!document.getElementById('particleStyles')) {
  const s = document.createElement('style');
  s.id = 'particleStyles';
  s.innerHTML = `@keyframes rise { to { transform: translateY(-105vh) translateX(${Math.random() * 50 - 25}px); opacity: 0; } }`;
  document.head.appendChild(s);
}

function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.btn, .wa-float, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.1}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

function initTeklifModal() {
  const overlay = document.getElementById('teklifModal');
  const form = document.getElementById('teklifAlmaFormu');
  if (!overlay) return;

  document.querySelectorAll('.js-teklif-tetikleyici').forEach(t => t.addEventListener('click', (e) => {
    e.preventDefault();
    if (SETTINGS && SETTINGS.teklif_formu_aktif === false) {
      document.getElementById('iletisim')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    overlay.classList.add('open');
    document.body.classList.add('no-scroll');
  }));

  document.getElementById('teklifModalClose')?.addEventListener('click', () => {
    overlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = (SETTINGS && SETTINGS.form_gonderiliyor_metni) || 'Gönderiliyor...';
      }

      try {
        const formData = new FormData(form);
        if (!formData.get('form-name')) formData.append('form-name', form.getAttribute('name') || 'teklif-talebi');
        const endpoint = form.dataset.submitEndpoint || form.getAttribute('action') || '/api/teklif';
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.ok === false) throw new Error(result.message || 'Form gönderilemedi');
        alert((SETTINGS && SETTINGS.form_basarili_mesaj) || 'Teklif talebiniz başarıyla alındı. Uzman ekibimiz en kısa sürede dönüş sağlayacaktır.');
        overlay.classList.remove('open');
        document.body.classList.remove('no-scroll');
        form.reset();
      } catch (err) {
        console.error(err);
        alert((SETTINGS && SETTINGS.form_hata_mesaj) || 'Form gönderilirken bir sorun oluştu. Lütfen WhatsApp veya e-posta ile iletişime geçin.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }
}

// ==========================================================================
// %100 ADMIN KONTROL ENJEKSİYONU (SETTINGS VE METİN ATAMALARI MATRIXI)
// ==========================================================================
async function loadSettings() {
  try {
    // DÜZELTME: Admin paneli artık tek dev bir "settings.json" yerine, konusuna
    // göre 7 ayrı küçük dosya kullanıyor (Marka, Hero, Hakkımızda, İletişim,
    // Ürünler Bölümü, Teklif Formu, Gelişmiş Ayarlar). Burada hepsi tek seferde
    // çekilip tek bir SETTINGS nesnesinde birleştiriliyor — sitenin geri kalanı
    // hiç değişmeden aynı alan adlarıyla (s.telefon_goruntu, s.slogan vb.)
    // çalışmaya devam ediyor.
    const dosyalar = ['site', 'marka', 'hero', 'hakkimizda', 'iletisim', 'urunler_bolumu', 'teklif_formu', 'ux', 'bolumler'];
    const sonuclar = await Promise.all(
      dosyalar.map(d => fetch(`data/settings/${d}.json`).then(r => r.json()))
    );
    const s = Object.assign({}, ...sonuclar);
    SETTINGS = s;
    applySiteChrome(s);
    
    // Dinamik Tema Renk Atamaları
    if (s.kurumsal_renk) applyAccentColor(s.kurumsal_renk);
    if (s.teknik_renk) document.documentElement.style.setProperty('--spec', s.teknik_renk);

    // Üst Seviye Dinamik Logo Enjeksiyonu
    const logoContainer = document.getElementById('brandLogoContainer');
    if (logoContainer) {
      if (s.firma_logosu) {
        logoContainer.innerHTML = `<img src="${s.firma_logosu}" alt="Logo" class="brand-logo-img">`;
      } else {
        logoContainer.innerHTML = `
          <svg class="brand-logo-svg" viewBox="0 0 32 32">
            <rect x="2" y="2" width="28" height="28" rx="4" />
            <path d="M6 16h20M16 6v20" stroke-dasharray="2 2" />
            <circle cx="16" cy="16" r="6" stroke-width="2" />
          </svg>
        `;
      }
    }

    // Dinamik Favicon Tanımlama
    if (s.favicon_resmi) {
      let fav = document.querySelector("link[rel*='icon']");
      if (!fav) { fav = document.createElement('link'); fav.rel = 'shortcut icon'; document.head.appendChild(fav); }
      fav.href = s.favicon_resmi;
    }

    // Navigasyon ve Buton Metin Atamaları
    const navCta = document.querySelector('.nav-cta');
    if (navCta && s.nav_teklif_btn_metni) navCta.textContent = s.nav_teklif_btn_metni;

    const heroUrunlerBtn = document.querySelector('.hero-actions .btn-primary');
    if (heroUrunlerBtn && s.hero_urunler_btn_metni) heroUrunlerBtn.textContent = s.hero_urunler_btn_metni;
    const heroTeklifBtn = document.querySelector('.hero-actions .js-teklif-tetikleyici');
    if (heroTeklifBtn && s.hero_teklif_btn_metni) heroTeklifBtn.textContent = s.hero_teklif_btn_metni;

    // Hero Başlık ve Alt Metin Yönetimi
    if (s.hero_ust_baslik) {
      const eyebrow = document.querySelector('.hero-copy .eyebrow');
      if (eyebrow) eyebrow.textContent = s.hero_ust_baslik;
    }
    // DÜZELTME: Admin panelinde artık tek bir HTML kodu barındıran alan yok.
    // Başlık 4 ayrı düz-metin parçasından (öncesi / vurgu / arası / alt satır)
    // burada güvenli şekilde birleştiriliyor.
    if (s.hero_baslik_on || s.hero_baslik_vurgu || s.hero_baslik_orta || s.hero_baslik_alt_satir) {
      const mainTitle = document.querySelector('.hero-copy h1');
      if (mainTitle) {
        mainTitle.innerHTML = `${esc(s.hero_baslik_on)} <span class="molten-text">${esc(s.hero_baslik_vurgu)}</span> ${esc(s.hero_baslik_orta)}<br>${esc(s.hero_baslik_alt_satir)}`;
      }
    }
    const heroSub = document.getElementById('heroSub');
    if (heroSub && s.hero_alt_aciklama) heroSub.textContent = s.hero_alt_aciklama;

    // Sayaç Değerleri Güncellemesi
    const stats = document.querySelectorAll('.hero-stats .stat');
    if (stats.length >= 3) {
      if (s.sayac_1_deger) { stats[0].querySelector('.stat-num').dataset.count = s.sayac_1_deger; stats[0].querySelector('.stat-label').textContent = s.sayac_1_isim; }
      if (s.sayac_2_deger) { stats[1].querySelector('.stat-num').dataset.count = s.sayac_2_deger; stats[1].querySelector('.stat-label').textContent = s.sayac_2_isim; }
      if (s.sayac_3_deger) { 
        stats[2].querySelector('.stat-num').dataset.count = s.sayac_3_deger; 
        stats[2].querySelector('.stat-label').textContent = s.sayac_3_isim;
        stats[2].querySelector('.stat-num').dataset.decimal = s.sayac_3_ondalikli ? "true" : "false";
      }
    }

    // Hakkımızda ve Vizyon Alanı Yönetimi
    // DÜZELTME: Başlık artık admin panelinde HTML kodu içermiyor; "öncesi" ve
    // "sonrası" iki düz metinden ve yıl sayısından burada güvenli birleştiriliyor.
    const abTitle = document.querySelector('.about-tag h2');
    if (abTitle && (s.hakkimizda_baslik_on || s.hakkimizda_baslik_son)) {
      const yil = new Date().getFullYear() - (s.kurulus_yili || 1998);
      const suffix = String(s.hakkimizda_baslik_son || '');
      const spacer = suffix.trim().startsWith('+') ? '' : ' ';
      abTitle.innerHTML = `${esc(s.hakkimizda_baslik_on)} <span id="yearsSpan">${yil}</span>${spacer}${esc(suffix)}`;
    }
    const abBody = document.querySelector('.about-body p');
    if (abBody && s.hakkimizda_aciklama) abBody.textContent = s.hakkimizda_aciklama;
    setText('.about-tag .eyebrow', s.hakkimizda_eyebrow);
    
    const abPointsWrap = document.querySelector('.about-points');
    if (abPointsWrap && s.vizyon_maddeleri) {
      abPointsWrap.innerHTML = s.vizyon_maddeleri.map(m => {
        const metin = typeof m === 'string' ? m : (m.madde || '');
        return `<div class="point"><span class="dot"></span>${esc(metin)}</div>`;
      }).join('');
    }

    // Hizmet Kartları Dinamik Yönetimi
    const serviceSection = document.getElementById('hizmetler');
    if (serviceSection && s.hizmetler_listesi) {
      setText('#hizmetler .eyebrow', s.hizmetler_eyebrow);
      setText('#hizmetler .section-title', s.hizmetler_baslik);
      const cardsWrap = serviceSection.querySelector('.service-cards');
      if (cardsWrap) {
        cardsWrap.innerHTML = s.hizmetler_listesi.map(srv => `
          <article class="service-card reveal">
            <div class="service-icon" aria-hidden="true">${srv.ikon_svg || '<svg viewBox="0 0 48 48"><path d="M8 12h32v6H8zM8 22h32v6H8z" fill="none" stroke="currentColor" stroke-width="2"/></svg>'}</div>
            <h3>${esc(srv.baslik)}</h3>
            <p>${esc(srv.aciklama)}</p>
          </article>
        `).join('');
      }
    }

    // Teklif Formu Alanları Ayarları
    const teklifTitle = document.getElementById('teklifFormTitle');
    if (teklifTitle) teklifTitle.textContent = s.teklif_formu_baslik || "Hızlı Teklif İsteyin";
    const teklifDesc = document.getElementById('teklifFormDesc');
    if (teklifDesc) teklifDesc.textContent = s.teklif_formu_aciklama || "";
    applyTeklifFormSettings(s);

    const telInput = document.getElementById('formTelInput');
    if (telInput) {
      if (s.form_tel_zorunlu !== false) telInput.setAttribute('required', 'true');
      else telInput.removeAttribute('required');
    }
    
    const telGroup = document.getElementById('formTelGroup');
    if (telGroup) telGroup.style.display = (s.form_tel_aktif !== false) ? 'flex' : 'none';

    const dosyaGroup = document.getElementById('formDosyaGroup');
    if (dosyaGroup) dosyaGroup.style.display = (s.form_dosya_aktif !== false) ? 'flex' : 'none';

    // WhatsApp İletişim Kanalları Kontrolü
    const waFloat = document.getElementById('waFloat');
    if (waFloat) {
      waFloat.style.display = (s.wa_float_aktif !== false) ? 'flex' : 'none';
      waFloat.href = `https://wa.me/${s.whatsapp_numara}`;
    }

    const waButtonInline = document.getElementById('waButtonInline');
    if (waButtonInline) {
      waButtonInline.style.display = (s.wa_inline_aktif !== false) ? 'inline-flex' : 'none';
      waButtonInline.href = `https://wa.me/${s.whatsapp_numara}`;
      waButtonInline.innerHTML = `
        <span class="wa-btn-icon">${whatsappSvg('22')}</span>
        <span class="wa-btn-copy">
          <strong>${esc(s.wa_inline_metin || 'WhatsApp')}</strong>
          ${s.wa_inline_aciklama ? `<small>${esc(s.wa_inline_aciklama)}</small>` : ''}
        </span>
      `;
    }

    const waFloatLabel = document.querySelector('#waFloat .wa-float-label');
    if (waFloatLabel) waFloatLabel.textContent = s.wa_float_metin || 'WhatsApp';
    if (waFloat) waFloat.title = s.wa_float_metin || 'WhatsApp';

    // Öne Çıkan Ürün Başlıkları
    setText('#urunler .eyebrow', s.urunler_eyebrow);
    const ocb = document.getElementById('oneCikanBaslik');
    if (ocb) ocb.textContent = s.oneCikanBaslik || "Öne Çıkan Üretimlerimiz";
    const oca = document.getElementById('oneCikanAciklama');
    if (oca) oca.textContent = s.oneCikanAciklama || "";

    // Alt Bilgi Kurumsal Verileri
    const footerSlogan = document.getElementById('footerSlogan');
    if (footerSlogan) footerSlogan.textContent = s.slogan || "";
    
    const yearsSpan = document.getElementById('yearsSpan');
    if (yearsSpan) yearsSpan.textContent = new Date().getFullYear() - (s.kurulus_yili || 1998);
    
    // DÜZELTME: infoRows elemanı sadece index.html'de var (urunler.html'de yok).
    // Önceden null kontrolü yapılmadan direkt erişiliyordu, bu da urunler.html
    // sayfasında bir hataya ve loadSettings fonksiyonunun burada durup geri
    // kalan (harita, animasyon hızı gibi) ayarları hiç uygulamamasına yol açıyordu.
    const infoRowsEl = document.getElementById('infoRows');
    if (infoRowsEl) {
      const phoneHref = phoneLink(s.whatsapp_numara || s.telefon_goruntu);
      const mapHref = mapsSearchUrl(s.firma_konumu || s.adres);
      infoRowsEl.innerHTML = `
        <div class="info-row"><span class="k">Telefon</span><a class="v info-link" href="${phoneHref}">${esc(s.telefon_goruntu || "")}</a></div>
        <div class="info-row"><span class="k">E-posta</span><a class="v info-link" href="mailto:${esc(s.eposta || "")}">${esc(s.eposta || "")}</a></div>
        <div class="info-row"><span class="k">Adres</span><a class="v info-link" href="${mapHref}" target="_blank" rel="noopener">${esc(s.adres || "")}</a></div>
        ${s.calisma_saatleri ? `<div class="info-row"><span class="k">Çalışma Saatleri</span><span class="v">${esc(s.calisma_saatleri)}</span></div>` : ''}
      `;
    }

    // Sosyal Medya İkonları (sadece link girilmişse gösterilir)
    const footerSocial = document.getElementById('footerSocial');
    if (footerSocial) {
      let icons = '';
      if (s.instagram) {
        icons += `<a href="${s.instagram}" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>`;
      }
      if (s.linkedin) {
        icons += `<a href="${s.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05C19.9 8 21 10.1 21 13.4V23h-4v-8.7c0-2.08-.04-4.75-2.9-4.75-2.9 0-3.35 2.27-3.35 4.6V23h-4V8z"/></svg></a>`;
      }
      footerSocial.innerHTML = icons;
    }

    // 'Tüm Ürünler' Ana Sayfa Buton Metni
    const tumUrunlerBtn = document.getElementById('tumUrunlerBtn');
    if (tumUrunlerBtn && s.tum_urunler_buton_metni) tumUrunlerBtn.textContent = s.tum_urunler_buton_metni;

    // DÜZELTME: Eskiden burada Google Haritalar'dan kopyalanmış uzun bir "embed
    // link" bekleniyordu (kod bilmeyen kişi için karışıktı). Artık admin
    // panelinden sadece düz bir konum/adres metni giriliyor ve harita adresi
    // buradan otomatik oluşturuluyor. Konum boşsa, "Açık Adres" alanı kullanılır.
    const mapFrame = document.getElementById('mapFrame');
    if (mapFrame) {
      mapFrame.src = mapEmbedUrl(s.firma_konumu || s.adres || "");
    }
    applySectionCopy(s);
    renderLogoStrip(s);
    if (ALL_PRODUCTS.length && document.getElementById('productFilters')) {
      renderFilters(ALL_PRODUCTS);
      applyCatalogFilters();
    }
    
    initAdvancedMoldAnimation(s.hero_animasyon_hizi || 2600);
    if (s.parcacik_efekti_aktif !== false) initParticles();
    initCounters();
    initReveal();
  } catch (err) { 
    console.error(err); 
    initAdvancedMoldAnimation(2600); 
    initCounters();
  }
}

function setText(selector, value) {
  if (!value) return;
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

function setMeta(name, content) {
  if (!content) return;
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function setPropertyMeta(property, content) {
  if (!content) return;
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function brandMarkup(s) {
  return `${esc(s.firma_adi_1 || 'ENTE')} <em>${esc(s.firma_adi_2 || 'Metal Plastik')}</em>`;
}

function applySiteChrome(s) {
  const isCatalog = !!document.getElementById('productGrid');
  const pageTitle = isCatalog ? (s.katalog_site_baslik || document.title) : (s.site_baslik || document.title);
  const pageDesc = isCatalog ? s.katalog_site_aciklama : s.site_aciklama;
  document.title = pageTitle;
  setMeta('description', pageDesc);
  setPropertyMeta('og:title', pageTitle);
  setPropertyMeta('og:description', pageDesc);
  setPropertyMeta('og:type', 'website');
  setPropertyMeta('og:image', absoluteAssetUrl(s.paylasim_gorseli));
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', pageTitle);
  setMeta('twitter:description', pageDesc);
  setMeta('twitter:image', absoluteAssetUrl(s.paylasim_gorseli));
  renderAnnouncementBar(s);

  document.querySelectorAll('.brand-text, .footer-brand').forEach(el => {
    el.innerHTML = brandMarkup(s);
  });

  const loaderText = document.querySelector('.loader-text');
  if (loaderText) {
    loaderText.textContent = isCatalog ? (s.katalog_yukleme || loaderText.textContent) : (s.ana_sayfa_yukleme || loaderText.textContent);
  }

  const footerLegal = document.querySelector('.footer-legal p');
  if (footerLegal && s.footer_telif) footerLegal.innerHTML = `&copy; <span id="footerYear">${new Date().getFullYear()}</span> ${esc(s.footer_telif)}`;

  const navMap = [
    ['#hakkimizda', s.nav_hakkimizda],
    ['index.html#hakkimizda', s.nav_hakkimizda],
    ['#hizmetler', s.nav_hizmetler],
    ['index.html#hizmetler', s.nav_hizmetler],
    ['urunler.html', s.nav_urunler],
    ['/urunler/', s.nav_urunler],
    ['#neden-biz', s.nav_neden_biz],
    ['index.html#neden-biz', s.nav_neden_biz],
    ['#iletisim', s.nav_iletisim],
    ['index.html#iletisim', s.nav_iletisim]
  ];
  navMap.forEach(([href, label]) => {
    if (!label) return;
    document.querySelectorAll(`a[href="${href}"]`).forEach(a => { a.textContent = label; });
  });
}

function absoluteAssetUrl(path) {
  if (!path) return '';
  try {
    return new URL(path, window.location.href).href;
  } catch (err) {
    return path;
  }
}

function renderAnnouncementBar(s) {
  const existing = document.getElementById('siteAnnouncement');
  if (existing) existing.remove();
  document.body.classList.remove('has-announcement');
  if (!s.ust_duyuru_aktif || !s.ust_duyuru_metni) return;

  const bar = document.createElement('div');
  bar.className = 'announcement-bar';
  bar.id = 'siteAnnouncement';
  const link = s.ust_duyuru_link && s.ust_duyuru_link_metni
    ? `<a href="${esc(s.ust_duyuru_link)}">${esc(s.ust_duyuru_link_metni)}</a>`
    : '';
  bar.innerHTML = `<span>${esc(s.ust_duyuru_metni)}</span>${link}`;
  document.body.prepend(bar);
  document.body.classList.add('has-announcement');
}

function applySectionCopy(s) {
  setText('.visual-caption', s.hero_animasyon_baslik);
  setText('#neden-biz .eyebrow', s.neden_biz_eyebrow);
  setText('#neden-biz .section-title', s.neden_biz_baslik);

  const whyGrid = document.querySelector('.why-grid');
  if (whyGrid && Array.isArray(s.neden_biz_maddeler)) {
    whyGrid.innerHTML = s.neden_biz_maddeler.map((item, i) => `
      <div class="why-item reveal" style="--stagger:${i}">
        <span class="why-num">${esc(item.deger)}</span>
        <p>${esc(item.aciklama)}</p>
      </div>
    `).join('');
  }

  setText('.contact-info .eyebrow', s.iletisim_eyebrow);
  setText('.contact-info h2', s.iletisim_baslik);
  setText('.catalog-header .eyebrow', s.katalog_eyebrow);
  setText('.catalog-header .section-title', s.katalog_baslik);
  setText('.catalog-header .section-desc', s.katalog_aciklama);
  setText('.catalog-meta span:first-child', s.katalog_meta_sol);

  const searchInput = document.getElementById('productSearch');
  if (searchInput && s.arama_placeholder) searchInput.placeholder = s.arama_placeholder;
}

function applyTeklifFormSettings(s) {
  document.querySelectorAll('#teklifAlmaFormu').forEach(form => {
    const groups = form.querySelectorAll('.form-group');
    const setGroup = (idx, label, placeholder, required) => {
      const group = groups[idx];
      if (!group) return;
      const labelEl = group.querySelector('label');
      const field = group.querySelector('input, textarea');
      if (labelEl && label) labelEl.textContent = label + (required ? ' *' : '');
      if (field && placeholder) field.placeholder = placeholder;
      if (field) {
        if (required) field.setAttribute('required', 'true');
        else field.removeAttribute('required');
      }
    };

    setGroup(0, s.form_ad_label, s.form_ad_placeholder, true);
    setGroup(1, s.form_eposta_label, s.form_eposta_placeholder, true);
    setGroup(2, s.form_tel_label, s.form_tel_placeholder, s.form_tel_zorunlu !== false);
    setGroup(3, s.form_detay_label, s.form_detay_placeholder, true);
    setGroup(4, s.form_dosya_label, '', false);

    const submit = form.querySelector('button[type="submit"]');
    if (submit && s.form_gonder_btn) submit.textContent = s.form_gonder_btn;
  });
}

function whatsappSvg(size) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.6 0-3.1-.42-4.4-1.16l-.31-.18-3.01.79.8-2.93-.2-.3A7.94 7.94 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/></svg>`;
}

function mapEmbedUrl(value) {
  const konum = String(value || '').trim();
  if (!konum) return '';
  if (/google\.[^/]+\/maps/i.test(konum)) {
    const cidMatch = konum.match(/1s([^?&!]+)/);
    if (cidMatch && cidMatch[1]) {
      return `https://www.google.com/maps?output=embed&q=${encodeURIComponent(cidMatch[1])}`;
    }
    return konum.includes('output=embed') ? konum : konum.replace('/maps/place/', '/maps/embed?pb=');
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(konum)}&output=embed`;
}

function mapsSearchUrl(value) {
  const konum = String(value || '').trim();
  if (!konum) return '#';
  if (/google\.[^/]+\/maps/i.test(konum)) return konum;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(konum)}`;
}

function phoneLink(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '#';
  const normalized = digits.startsWith('90') ? digits : `90${digits.replace(/^0/, '')}`;
  return `tel:+${normalized}`;
}

function productDimensions(p) {
  const vals = [p.uzunluk_mm, p.genislik_mm, p.yukseklik_mm].map(Number);
  if (vals.some(v => !Number.isFinite(v) || v <= 0)) return 'Talebe göre';
  return `${esc(p.uzunluk_mm)}x${esc(p.genislik_mm)}x${esc(p.yukseklik_mm)} mm`;
}

function productWeight(p) {
  const weight = Number(p.agirlik_g);
  return Number.isFinite(weight) && weight > 0 ? `${esc(p.agirlik_g)} g` : 'Talebe göre';
}

function renderLogoStrip(s) {
  const wrap = document.getElementById('altLogolar');
  if (!wrap) return;
  let logos = Array.isArray(s.alt_logolar) ? s.alt_logolar.filter(l => l && l.gorsel) : [];
  if (!logos.length && s.firma_logosu) {
    logos = [{
      ad: `${s.firma_adi_1 || 'ENTE'} ${s.firma_adi_2 || 'Metal Plastik'}`,
      gorsel: s.firma_logosu,
      primary: true
    }];
  }
  if (!logos.length) {
    wrap.hidden = true;
    wrap.innerHTML = '';
    return;
  }

  wrap.hidden = false;
  wrap.innerHTML = `
    <div class="section-inner logo-strip-inner">
      <div class="logo-strip-copy">
        ${s.alt_logo_baslik ? `<h2>${esc(s.alt_logo_baslik)}</h2>` : ''}
        ${s.alt_logo_aciklama ? `<p>${esc(s.alt_logo_aciklama)}</p>` : ''}
      </div>
      <div class="logo-strip-grid">
        ${logos.map(logo => {
          const isPrimary = logo.primary || logos.length === 1;
          const img = `<img src="${esc(logo.gorsel)}" alt="${esc(logo.ad || 'Logo')}" loading="lazy">`;
          const primaryCopy = isPrimary ? `
            <span class="logo-strip-meta">
              <span class="logo-strip-name">${brandMarkup(s)}</span>
              <span class="logo-strip-note">${esc(s.slogan || 'Güvenilir üretim ve pratik ürün çözümleri.')}</span>
            </span>
          ` : '';
          const content = `${img}${primaryCopy}`;
          return logo.link
            ? `<a class="logo-strip-item ${isPrimary ? 'is-primary' : ''}" href="${esc(logo.link)}" target="_blank" rel="noopener" aria-label="${esc(logo.ad || 'Logo')}">${content}</a>`
            : `<div class="logo-strip-item ${isPrimary ? 'is-primary' : ''}">${content}</div>`;
        }).join('')}
      </div>
    </div>
  `;
}

async function loadProducts() {
  try {
    const res = await fetch('data/products.json');
    const data = await res.json();
    ALL_PRODUCTS = (data.urunler || []);

    // DÜZELTME: "sira" alanı admin panelinde ve verilerde mevcuttu ama hiçbir
    // yerde kullanılmıyordu. Artık küçük sayı önce gelecek şekilde sıralanıyor
    // (README'de vaat edildiği gibi).
    ALL_PRODUCTS.sort((a, b) => (a.sira ?? 999) - (b.sira ?? 999));

    initModal();
    
    const featuredWrap = document.getElementById('featuredList');
    if (featuredWrap) {
      // DÜZELTME: Hiçbir ürün "Ana Sayfada Öne Çıkar" olarak işaretlenmezse
      // README'nin vaat ettiği gibi otomatik olarak ilk 3 ürün gösterilir.
      let featured = ALL_PRODUCTS.filter(p => p.on_anasayfa);
      if (featured.length === 0) featured = ALL_PRODUCTS.slice(0, 3);
      renderFeatured(featured);
    }

    const grid = document.getElementById('productGrid');
    if (grid) {
      renderFilters(ALL_PRODUCTS);
      renderProducts(ALL_PRODUCTS);
      initCatalogSearch();
      openModalFromQuery();
    }
  } catch (err) { console.error(err); }
}

// ANA SAYFA: Spoiler Kart Çizimi (Fotoğrafların Sıkışma Problemi Sıfırlandı)
function renderFeatured(products) {
  const wrap = document.getElementById('featuredList');
  if (!wrap) return;
  const targetAttr = (SETTINGS && SETTINGS.urun_kartlari_yeni_pencere) ? 'target="_blank" rel="noopener"' : '';

  wrap.innerHTML = products.map((p, i) => `
    <div class="spoiler-card reveal" style="--stagger:${i}" data-id="${p.id}">
      <button class="spoiler-head" data-toggle="${p.id}">
          <div class="spoiler-thumb"><img src="${esc(p.gorsel || 'images/placeholder.png')}" alt="${esc(p.ad)}" loading="lazy"></div>
        <div class="spoiler-info">
          <span class="spoiler-cat">${esc(p.kategori)}</span>
          <h3>${esc(p.ad)}</h3>
        </div>
        <div class="spoiler-chevron-cell">
          <span class="spoiler-chevron">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        </div>
      </button>
      <div class="spoiler-body">
        <div class="spoiler-body-inner">
          <div class="spoiler-img"><img src="${esc(p.gorsel || 'images/placeholder.png')}" alt="${esc(p.ad)}" loading="lazy"></div>
          <div class="spoiler-text">
            <p>${esc(p.kisa_aciklama)}</p>
            <div class="spoiler-meta">
              <span>Hammadde: ${esc(p.malzeme)}</span>
              <span>Tolerans: ${esc(p.tolerans_mm || '±0.02mm')}</span>
              <span>Boyutlar: ${productDimensions(p)}</span>
              <span>Ağırlık: ${productWeight(p)}</span>
            </div>
            <div class="spoiler-actions">
              <button class="btn btn-primary js-open-modal" data-id="${esc(p.id)}">${esc((SETTINGS && SETTINGS.urun_detay_btn_metni) || 'Detayları Gör')}</button>
              <a class="btn btn-ghost" href="/urunler/?id=${encodeURIComponent(p.id)}" ${targetAttr}>${esc((SETTINGS && SETTINGS.urun_katalog_btn_metni) || 'Katalogda Aç')}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('[data-toggle]').forEach(head => {
    head.addEventListener('click', () => {
      const card = head.closest('.spoiler-card');
      const isOpen = card.classList.contains('open');
      wrap.querySelectorAll('.spoiler-card.open').forEach(c => c.classList.remove('open'));
      if (!isOpen) card.classList.add('open');
    });
  });

  wrap.querySelectorAll('.js-open-modal').forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    openModal(btn.dataset.id);
  }));
  initReveal();
}

function renderFilters(products) {
  const wrap = document.getElementById('productFilters');
  if (!wrap) return;
  const allLabel = (SETTINGS && SETTINGS.filtre_tumu_metni) || 'Tümü';
  const managedCats = getManagedCategories();
  const productCats = products.map(p => p.kategori).filter(Boolean);
  const cats = [allLabel, ...new Set([...managedCats, ...productCats])];
  wrap.innerHTML = cats.map((c, i) => `<button class="filter-chip ${i===0 ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

  wrap.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyCatalogFilters();
    });
  });
}

function getManagedCategories() {
  if (!SETTINGS || !Array.isArray(SETTINGS.kategoriler)) return [];
  return SETTINGS.kategoriler
    .map(item => typeof item === 'string' ? item : (item.kategori || item.ad || ''))
    .map(item => String(item).trim())
    .filter(Boolean);
}

function initCatalogSearch() {
  const input = document.getElementById('productSearch');
  if (!input) return;
  input.addEventListener('input', () => applyCatalogFilters());
}

function applyCatalogFilters() {
  const activeChip = document.querySelector('.filter-chip.active');
  const allLabel = (SETTINGS && SETTINGS.filtre_tumu_metni) || 'Tümü';
  const cat = activeChip ? activeChip.dataset.cat : allLabel;
  const searchInput = document.getElementById('productSearch');
  const q = searchInput ? searchInput.value.trim().toLowerCase() : '';

  let filtered = cat === allLabel ? ALL_PRODUCTS : ALL_PRODUCTS.filter(p => p.kategori === cat);
  if (q) {
    filtered = filtered.filter(p => p.ad.toLowerCase().includes(q) || p.kisa_aciklama.toLowerCase().includes(q) || p.malzeme.toLowerCase().includes(q));
  }
  renderProducts(filtered);
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  const countEl = document.getElementById('catalogCount');
  if (countEl) countEl.textContent = `${products.length} ${((SETTINGS && SETTINGS.katalog_sayac_eki) || 'ürün listeleniyor')}`;

  if (products.length === 0) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1; text-align:center; padding:60px; color:var(--steel); font-family:var(--font-mono); font-size:14px;">${esc((SETTINGS && SETTINGS.katalog_bos_mesaj) || 'Arama kriterlerine uygun ürün bulunamadı.')}</div>`;
    return;
  }
  
  grid.innerHTML = products.map((p, i) => `
    <div class="product-card reveal" style="--stagger:${i % 6}" data-id="${p.id}">
      <div class="product-thumb">
        <span class="product-cat">${esc(p.kategori)}</span>
        <img src="${esc(p.gorsel || 'images/placeholder.png')}" alt="${esc(p.ad)}" loading="lazy">
      </div>
      <div class="product-body">
        <h3>${esc(p.ad)}</h3>
        <p>${esc(p.kisa_aciklama)}</p>
        <div class="product-meta">
          <span>${productDimensions(p)}</span>
          <span>${esc(p.malzeme)}</span>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.product-card').forEach(card => card.addEventListener('click', () => openModal(card.dataset.id)));
  initReveal();
}

function openModalFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) openModal(id);
}

function initModal() {
  const overlay = document.getElementById('productModal');
  document.getElementById('modalClose')?.addEventListener('click', () => {
    overlay.classList.remove('open'); 
    document.body.classList.remove('no-scroll');
  });
}

function openModal(id) {
  const p = ALL_PRODUCTS.find(x => x.id === id); 
  if (!p) return;
  document.getElementById('modalContent').innerHTML = `
    <span class="product-cat-tag">${esc(p.kategori)}</span>
    <h3>${esc(p.ad)}</h3>
    <div class="modal-img"><img src="${esc(p.gorsel || 'images/placeholder.png')}" alt="${esc(p.ad)}" loading="lazy"></div>
    <div class="spec-sheet">
      <div class="spec-cell"><div class="k">Boyutlar</div><div class="v">${productDimensions(p)}</div></div>
      <div class="spec-cell"><div class="k">Malzeme / Hammadde</div><div class="v">${esc(p.malzeme)}</div></div>
      <div class="spec-cell"><div class="k">Ürün Ağırlığı</div><div class="v">${productWeight(p)}</div></div>
      <div class="spec-cell"><div class="k">Üretim Toleransı</div><div class="v">${esc(p.tolerans_mm || '±0.02mm')}</div></div>
    </div>
    <p class="modal-detail-text">${esc(p.detay || p.kisa_aciklama)}</p>
  `;
  document.getElementById('productModal').classList.add('open');
  document.body.classList.add('no-scroll');
}

async function loadDynamicPageBlocks() {
  const container = document.getElementById('dynamicBlocksContainer');
  if (!container) return;
  try {
    const res = await fetch('data/page_blocks.json');
    const data = await res.json();
    container.innerHTML = '';
    (data.bloklar || []).forEach((block, idx) => {
      if (block.type === 'cta_blogu') {
        const targetAttr = block.yeni_pencere ? 'target="_blank" rel="noopener"' : '';
        container.innerHTML += `
          <section class="dynamic-cta-block reveal" id="block-${idx}">
            <div class="section-inner">
              <div class="dynamic-cta-inner">
                <h2>${esc(block.baslik)}</h2>
                <p>${esc(block.aciklama)}</p>
                <a href="${esc(block.btn_link)}" class="btn btn-primary" ${targetAttr}>${esc(block.btn_metni)}</a>
              </div>
            </div>
          </section>
        `;
      }
    });
    initReveal();
  } catch (err) { console.log(err); }
}
