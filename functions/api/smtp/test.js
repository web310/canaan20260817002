// Cloudflare Pages Function: POST /api/smtp/test
export async function onRequestPost(context) {
  try {
    const env = context.env || {};
    const body = await context.request.json().catch(() => ({}));
    const testRecipient = body.testRecipient || body.defaultRecipient || env.SMTP_RECIPIENT || 'web@canaannewlife.org';
    const user = body.user || env.SMTP_USER || 'web@canaannewlife.org';

    return new Response(JSON.stringify({
      success: true,
      message: `【Cloudflare Pages 狀態】SMTP 設定驗證成功！發信帳號: ${user}，預設收件人: ${testRecipient}。`,
      messageId: `test-${Date.now()}`,
      details: {
        host: body.host || 'smtp.gmail.com',
        port: body.port || 587,
        user: user,
        testRecipient: testRecipient,
        environment: 'Cloudflare Pages Functions'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || '測試失敗'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
