export default function handler(req, res) {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      res.status(500).send('GITHUB_CLIENT_ID Vercel ortam degiskeni eksik.');
      return;
    }

    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const origin = `${proto}://${host}`;
    const redirectUrl = new URL('https://github.com/login/oauth/authorize');
    redirectUrl.searchParams.set('client_id', clientId);
    redirectUrl.searchParams.set('redirect_uri', `${origin}/api/callback`);
    redirectUrl.searchParams.set('scope', 'repo user');
    redirectUrl.searchParams.set('state', Math.random().toString(36).slice(2));

    res.writeHead(302, { Location: redirectUrl.toString() });
    res.end();
  } catch (error) {
    res.status(500).send(error && error.message ? error.message : 'GitHub girisi baslatilamadi.');
  }
}
