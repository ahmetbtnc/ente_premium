export async function onRequest({ request, env }) {
  try {
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      return html(renderBody('error', { error: 'Cloudflare GITHUB_CLIENT_ID veya GITHUB_CLIENT_SECRET eksik.' }), 500);
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    if (!code) {
      return html(renderBody('error', { error: 'GitHub giris kodu bulunamadi.' }), 400);
    }

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'ente-metal-plastik-admin'
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const result = await response.json();
    if (!response.ok || result.error || !result.access_token) {
      return html(renderBody('error', result), 401);
    }

    return html(renderBody('success', {
      token: result.access_token,
      provider: 'github'
    }));
  } catch (error) {
    return html(renderBody('error', { error: error && error.message ? error.message : 'GitHub girisi tamamlanamadi.' }), 500);
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
    <p>Bu pencere otomatik kapanmazsa admin paneli sekmesine geri dönebilirsiniz.</p>
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

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
