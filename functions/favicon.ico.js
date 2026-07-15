export async function onRequestGet({ request }) {
  const origin = new URL(request.url).origin;
  let logoPath = '/site-logo.png';

  try {
    const response = await fetch(`${origin}/data/settings/marka.json`, {
      cf: { cacheEverything: true, cacheTtl: 60 },
    });

    if (response.ok) {
      const marka = await response.json();
      logoPath = normalizeLogoPath(marka.firma_logosu || marka.favicon_resmi || logoPath);
    }
  } catch (error) {
    logoPath = '/site-logo.png';
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(logoPath, origin).toString(),
      'Cache-Control': 'public, max-age=300',
    },
  });
}

function normalizeLogoPath(value) {
  const raw = String(value || '').trim();
  if (!raw) return '/site-logo.png';
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith('/') ? raw : `/${raw}`;
}
