// Cloudflare Pages Function: POST /api/send-email (Alias for /api/smtp/send)
import { onRequestPost as handleSmtpSend } from './smtp/send.js';

export async function onRequestPost(context) {
  return handleSmtpSend(context);
}
