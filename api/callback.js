export default async function handler(req, res) {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      sendHtml(res, renderBody('error', { error: 'Vercel GITHUB_CLIENT_ID veya GITHUB_CLIENT_SECRET eksik.' }), 500);
      return;
    }

    const code = req.query && req.query.code;
    if (!code) {
      sendHtml(res, renderBody('error', { error: 'GitHub giris kodu bulunamadi.' }), 400);
      return;
    }

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'ente-metal-plastik-admin'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const result = await response.json();
    if (!response.ok || result.error || !result.access_token) {
      sendHtml(res, renderBody('error', result), 401);
      return;
    }

    sendHtml(res, renderBody('success', {
      token: result.access_token,
      provider: 'github'
    }));
  } catch (error) {
    sendHtml(res, renderBody('error', { error: error && error.message ? error.message : 'GitHub girisi tamamlanamadi.' }), 500);
  }
}

function renderBody(status, content) {
  const payload = JSON.stringify(content).replace(/</g, '\\u003c');
  const title = status === 'success' ? 'Giris tamamlandi' : 'Giris tamamlanamadi';

  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: Arial, sans-serif; background: #14161a; color: #fff; }
    main { max-width: 460px; padding: 28px; text-align: center; }
    p { color: #aab2bd; line-height: 1.5; }
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    <p>Bu pencere otomatik kapanmazsa admin paneli sekmesine geri donebilirsiniz.</p>
  </main>
  <script>
    (function () {
      var payload = ${payload};
      function receiveMessage(message) {
        if (!window.opener) return;
        window.opener.postMessage('authorization:github:${status}:' + JSON.stringify(payload), message.origin);
      }
      window.addEventListener('message', receiveMessage, false);
      if (window.opener) {
        window.opener.postMessage('authorizing:github', '*');
      }
    })();
  </script>
</body>
</html>`;
}

function sendHtml(res, body, status = 200) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).send(body);
}
