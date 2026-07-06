export async function onRequest({ request, env }) {
  try {
    if (!env.GITHUB_CLIENT_ID) {
      return new Response('GITHUB_CLIENT_ID Cloudflare ortam degiskeni eksik.', { status: 500 });
    }

    const url = new URL(request.url);
    const redirectUrl = new URL('https://github.com/login/oauth/authorize');
    redirectUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
    redirectUrl.searchParams.set('redirect_uri', `${url.origin}/api/callback`);
    redirectUrl.searchParams.set('scope', 'repo user');
    redirectUrl.searchParams.set('state', crypto.randomUUID());

    return Response.redirect(redirectUrl.toString(), 302);
  } catch (error) {
    return new Response(error && error.message ? error.message : 'GitHub girisi baslatilamadi.', { status: 500 });
  }
}
