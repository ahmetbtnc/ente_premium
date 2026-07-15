const FALLBACK_LOGO = '/images/favicon-512.png';

export async function onRequestGet({ request }) {
  const origin = new URL(request.url).origin;
  let logoPath = FALLBACK_LOGO;

  try {
    const response = await fetch(`${origin}/data/settings/marka.json`, {
      cf: { cacheEverything: true, cacheTtl: 60 },
    });

    if (response.ok) {
      const marka = await response.json();
      logoPath = normalizeLogoPath(marka.firma_logosu || marka.favicon_resmi || FALLBACK_LOGO);
    }
  } catch (error) {
    logoPath = FALLBACK_LOGO;
  }

  const logoUrl = new URL(logoPath, origin).toString();
  return new Response(null, {
    status: 302,
    headers: {
      Location: logoUrl,
      'Cache-Control': 'public, max-age=300',
    },
  });
}

function normalizeLogoPath(value) {
  const raw = String(value || '').trim();
  if (!raw) return FALLBACK_LOGO;
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith('/') ? raw : `/${raw}`;
}
