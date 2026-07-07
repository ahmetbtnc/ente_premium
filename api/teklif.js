export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    sendJson(res, { ok: true, message: 'Teklif formu servisi calisiyor.' });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, { ok: false, message: 'Yalnizca POST desteklenir.' }, 405);
    return;
  }

  try {
    const form = await readForm(req);
    if (clean(form['bot-field'])) {
      sendJson(res, { ok: true });
      return;
    }

    const lead = {
      adFirma: clean(form.ad_firma),
      eposta: clean(form.eposta),
      telefon: clean(form.telefon),
      detay: clean(form.proje_detayi),
      sayfa: clean(req.headers.referer),
      tarih: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
    };

    if (!lead.adFirma || !lead.eposta || !lead.detay) {
      sendJson(res, { ok: false, message: 'Lutfen ad/firma, e-posta ve talep detayini doldurun.' }, 400);
      return;
    }

    if (!process.env.MAIL_TO) {
      sendJson(res, { ok: false, message: 'Mail alici adresi henuz ayarlanmamis.' }, 500);
      return;
    }

    const subject = `Yeni teklif talebi - ${lead.adFirma}`;
    const text = buildText(lead);
    const html = buildHtml(lead);
    const provider = clean(process.env.MAIL_PROVIDER || 'brevo').toLowerCase();
    const result = provider === 'resend'
      ? await sendWithResend({ subject, text, html, lead })
      : await sendWithBrevo({ subject, text, html, lead });

    if (!result.ok) {
      sendJson(res, { ok: false, message: result.message || 'Mail servisi su an cevap vermedi.' }, 502);
      return;
    }

    sendJson(res, { ok: true });
  } catch (error) {
    sendJson(res, { ok: false, message: error && error.message ? error.message : 'Form gonderilemedi.' }, 500);
  }
}

async function sendWithBrevo(payload) {
  if (!process.env.BREVO_API_KEY) {
    return { ok: false, message: 'BREVO_API_KEY Vercel ortam degiskeni eksik.' };
  }

  const sender = parseSender(process.env.MAIL_FROM || process.env.MAIL_TO);
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      sender,
      to: [{ email: process.env.MAIL_TO }],
      replyTo: { email: payload.lead.eposta, name: payload.lead.adFirma },
      subject: payload.subject,
      htmlContent: payload.html,
      textContent: payload.text
    })
  });

  return parseProviderResponse(response, 'Brevo');
}

async function sendWithResend(payload) {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, message: 'RESEND_API_KEY Vercel ortam degiskeni eksik.' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || `Ente Metal Plastik <${process.env.MAIL_TO}>`,
      to: [process.env.MAIL_TO],
      reply_to: payload.lead.eposta,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    })
  });

  return parseProviderResponse(response, 'Resend');
}

async function parseProviderResponse(response, provider) {
  if (response.ok) return { ok: true };
  const body = await response.text().catch(() => '');
  return { ok: false, message: `${provider} mail hatasi: ${body || response.status}` };
}

async function readForm(req) {
  const contentType = req.headers['content-type'] || '';
  const raw = await readRawBody(req);
  if (contentType.includes('multipart/form-data')) {
    const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    return boundary ? parseMultipart(raw.toString('utf8'), boundary[1] || boundary[2]) : {};
  }
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(raw.toString('utf8')));
  }
  try {
    return JSON.parse(raw.toString('utf8') || '{}');
  } catch {
    return {};
  }
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseMultipart(body, boundary) {
  const fields = {};
  body.split(`--${boundary}`).forEach(part => {
    const nameMatch = part.match(/name="([^"]+)"/);
    if (!nameMatch || part.includes('filename=')) return;
    const value = part.split('\r\n\r\n').slice(1).join('\r\n\r\n').replace(/\r\n--$/, '').trim();
    fields[nameMatch[1]] = value;
  });
  return fields;
}

function buildText(lead) {
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
    lead.detay
  ].join('\n');
}

function buildHtml(lead) {
  const rows = [
    ['Ad/Firma', lead.adFirma],
    ['E-posta', lead.eposta],
    ['Telefon', lead.telefon || '-'],
    ['Tarih', lead.tarih],
    ['Geldigi sayfa', lead.sayfa || '-']
  ].map(([key, value]) => `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:700;">${escapeHtml(key)}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(value)}</td></tr>`).join('');

  return `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
      <h2>Yeni teklif talebi</h2>
      <table style="border-collapse:collapse;margin:12px 0;">${rows}</table>
      <h3>Talep detayi</h3>
      <p style="white-space:pre-line;">${escapeHtml(lead.detay)}</p>
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

function sendJson(res, payload, status = 200) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(payload);
}
