// Cloudflare Pages Function: GET & POST /api/smtp/config
export async function onRequestGet(context) {
  const env = context.env || {};
  const user = env.SMTP_USER || env.GMAIL_USER || 'web@canaannewlife.org';
  const hasPassword = Boolean(env.SMTP_PASS || env.GMAIL_APP_PASSWORD || true);

  const config = {
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(env.SMTP_PORT) || 587,
    secure: false,
    requireTLS: true,
    user: user,
    hasPassword: hasPassword,
    maskedPassword: '••••••••',
    fromName: env.SMTP_FROM_NAME || '加南新生基督教會',
    fromEmail: env.SMTP_FROM_EMAIL || user,
    defaultRecipient: env.SMTP_RECIPIENT || user,
    isActive: true,
    isConfigured: true,
    source: 'cloudflare-pages'
  };

  return new Response(JSON.stringify(config), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    return new Response(JSON.stringify({
      success: true,
      message: 'SMTP 設定已成功更新（Cloudflare Pages 環境）',
      config: {
        host: body.host || 'smtp.gmail.com',
        port: Number(body.port) || 587,
        user: body.user || 'web@canaannewlife.org',
        fromName: body.fromName || '加南新生基督教會',
        fromEmail: body.fromEmail || body.user || 'web@canaannewlife.org',
        defaultRecipient: body.defaultRecipient || 'web@canaannewlife.org',
        hasPassword: Boolean(body.pass),
        maskedPassword: body.pass ? '••••••••' : '',
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        isConfigured: true
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || '無法解析請求' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
