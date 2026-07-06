const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

export async function onRequestPost({ request, env }) {
  try {
    const form = await request.formData();

    if (clean(form.get('bot-field'))) {
      return json({ ok: true });
    }

    const lead = {
      adFirma: clean(form.get('ad_firma')),
      eposta: clean(form.get('eposta')),
      telefon: clean(form.get('telefon')),
      detay: clean(form.get('proje_detayi')),
      sayfa: clean(request.headers.get('referer')),
      tarih: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
    };

    if (!lead.adFirma || !lead.eposta || !lead.detay) {
      return json({ ok: false, message: 'Lutfen ad/firma, e-posta ve talep detayini doldurun.' }, 400);
    }

    if (!env.MAIL_TO) {
      return json({ ok: false, message: 'Mail alici adresi henuz ayarlanmamis.' }, 500);
    }

    const file = form.get('teknik_dosya');
    const attachments = await collectAttachments(file);
    const subject = `Yeni teklif talebi - ${lead.adFirma}`;
    const text = buildText(lead, attachments);
    const html = buildHtml(lead, attachments);
    const provider = clean(env.MAIL_PROVIDER || 'brevo').toLowerCase();

    const result = provider === 'resend'
      ? await sendWithResend(env, { subject, text, html, lead, attachments })
      : await sendWithBrevo(env, { subject, text, html, lead, attachments });

    if (!result.ok) {
      return json({ ok: false, message: result.message || 'Mail servisi su an cevap vermedi.' }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, message: err && err.message ? err.message : 'Form gonderilemedi.' }, 500);
  }
}

export async function onRequestGet() {
  return json({ ok: true, message: 'Teklif formu mail servisi calisiyor.' });
}

async function sendWithBrevo(env, payload) {
  if (!env.BREVO_API_KEY) {
    return { ok: false, message: 'BREVO_API_KEY Cloudflare ortam degiskeni eksik.' };
  }

  const sender = parseSender(env.MAIL_FROM || env.MAIL_TO);
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': env.BREVO_API_KEY
    },
    body: JSON.stringify({
      sender,
      to: [{ email: env.MAIL_TO }],
      replyTo: { email: payload.lead.eposta, name: payload.lead.adFirma },
      subject: payload.subject,
      htmlContent: payload.html,
      textContent: payload.text,
      attachment: payload.attachments
        .filter(file => !file.skipped)
        .map(file => ({ name: file.name, content: file.content }))
    })
  });

  return parseProviderResponse(res, 'Brevo');
}

async function sendWithResend(env, payload) {
  if (!env.RESEND_API_KEY) {
    return { ok: false, message: 'RESEND_API_KEY Cloudflare ortam degiskeni eksik.' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.MAIL_FROM || `Ente Metal Plastik <${env.MAIL_TO}>`,
      to: [env.MAIL_TO],
      reply_to: payload.lead.eposta,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      attachments: payload.attachments
        .filter(file => !file.skipped)
        .map(file => ({ filename: file.name, content: file.content }))
    })
  });

  return parseProviderResponse(res, 'Resend');
}

async function parseProviderResponse(res, provider) {
  if (res.ok) return { ok: true };
  const body = await res.text().catch(() => '');
  return { ok: false, message: `${provider} mail hatasi: ${body || res.status}` };
}

async function collectAttachments(file) {
  if (!file || typeof file.arrayBuffer !== 'function' || !file.size) return [];
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return [{ name: `${file.name || 'ek-dosya'} (4 MB ustu, maile eklenmedi)`, content: '', skipped: true }];
  }

  const buffer = await file.arrayBuffer();
  return [{
    name: file.name || 'ek-dosya',
    content: arrayBufferToBase64(buffer),
    skipped: false
  }];
}

function buildText(lead, attachments) {
  const ek = attachments.length
    ? attachments.map(file => file.skipped ? `- ${file.name}` : `- ${file.name}`).join('\n')
    : 'Ek dosya yok';

  return [
    'Yeni teklif talebi',
    '',
    `Ad/Firma: ${lead.adFirma}`,
    `E-posta: ${lead.eposta}`,
    `Telefon: ${lead.telefon || '-'}`,
    `Tarih: ${lead.tarih}`,
    `Geldigi sayfa: ${lead.sayfa || '-'}`,
    '',
    'Talep detayi:',
    lead.detay,
    '',
    'Ekler:',
    ek
  ].join('\n');
}

function buildHtml(lead, attachments) {
  const rows = [
    ['Ad/Firma', lead.adFirma],
    ['E-posta', lead.eposta],
    ['Telefon', lead.telefon || '-'],
    ['Tarih', lead.tarih],
    ['Geldigi sayfa', lead.sayfa || '-']
  ].map(([key, value]) => `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:700;">${escapeHtml(key)}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(value)}</td></tr>`).join('');

  const ekler = attachments.length
    ? attachments.map(file => `<li>${escapeHtml(file.name)}</li>`).join('')
    : '<li>Ek dosya yok</li>';

  return `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
      <h2>Yeni teklif talebi</h2>
      <table style="border-collapse:collapse;margin:12px 0;">${rows}</table>
      <h3>Talep detayi</h3>
      <p style="white-space:pre-line;">${escapeHtml(lead.detay)}</p>
      <h3>Ekler</h3>
      <ul>${ekler}</ul>
    </div>
  `;
}

function parseSender(value) {
  const raw = clean(value);
  const match = raw.match(/^(.*?)<([^>]+)>$/);
  if (match) {
    return { name: clean(match[1]) || 'Ente Metal Plastik', email: clean(match[2]) };
  }
  return { name: 'Ente Metal Plastik', email: raw };
}

function clean(value) {
  return String(value || '').trim();
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
