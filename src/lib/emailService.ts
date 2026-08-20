import emailjs from '@emailjs/browser';
import { CHURCH_INFO } from '../data/churchData';

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  source?: 'env' | 'custom' | 'none';
}

const CONFIG_STORAGE_KEY = 'canaan_emailjs_config';

/**
 * Reads EmailJS configuration.
 * Priority:
 * 1. Cloudflare Pages / Vite Environment Variables (import.meta.env.VITE_EMAILJS_*)
 * 2. Local storage overrides configured by authenticated Admin
 */
export function getEmailJSConfig(): EmailJSConfig {
  // Read from Vite environment variables (Cloudflare Pages build / deployment settings)
  const envService = (import.meta.env.VITE_EMAILJS_SERVICE_ID || '').trim();
  const envTemplate = (import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '').trim();
  const envPublic = (import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '').trim();

  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.serviceId || parsed.templateId || parsed.publicKey) {
        return {
          serviceId: parsed.serviceId || envService,
          templateId: parsed.templateId || envTemplate,
          publicKey: parsed.publicKey || envPublic,
          source: 'custom',
        };
      }
    }
  } catch (e) {
    console.error('Failed to read emailjs custom config:', e);
  }

  const hasEnv = Boolean(envService && envTemplate && envPublic);

  return {
    serviceId: envService,
    templateId: envTemplate,
    publicKey: envPublic,
    source: hasEnv ? 'env' : 'none',
  };
}

/**
 * Saves manual EmailJS configuration to local storage (Admin only).
 */
export function saveEmailJSConfig(config: EmailJSConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({
      serviceId: config.serviceId.trim(),
      templateId: config.templateId.trim(),
      publicKey: config.publicKey.trim(),
    }));
  } catch (e) {
    console.error('Failed to save emailjs config:', e);
  }
}

/**
 * Clears custom local overrides to revert back to Cloudflare Pages environment variables.
 */
export function resetEmailJSConfigToEnv(): void {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to reset emailjs config:', e);
  }
}

export interface MinistryFormPayload {
  ministryName: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  applicantNotes: string;
}

export interface ContactFormPayload {
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderMessage: string;
  needRide: boolean;
}

/**
 * Sends Contact / Ride form via EmailJS.
 */
export async function sendContactEmailJS(payload: ContactFormPayload): Promise<{ success: boolean; method: 'emailjs' | 'mailto'; message: string }> {
  const config = getEmailJSConfig();

  const templateParams = {
    to_email: CHURCH_INFO.email,
    to_name: '加南新生基督教會同工',
    from_name: payload.senderName || '訪客',
    from_email: payload.senderEmail,
    from_phone: payload.senderPhone,
    subject: `[加南網站${payload.needRide ? '主日接送預約' : '在線留言'}] ${payload.senderName} - ${payload.senderPhone}`,
    message: payload.senderMessage,
    need_ride: payload.needRide ? '是 (需要主日車輛免費接送)' : '否 (一般心聲留言)',
    time: new Date().toLocaleString('zh-TW', { timeZone: 'America/Los_Angeles' }),
  };

  // Save submission locally in history for backup
  saveSubmissionToHistory('contact', templateParams);

  if (config.serviceId && config.templateId && config.publicKey) {
    try {
      await emailjs.send(
        config.serviceId,
        config.templateId,
        templateParams,
        config.publicKey
      );
      return { 
        success: true, 
        method: 'emailjs', 
        message: '信件已成功透過 EmailJS 背景自動發送至 web@canaannewlife.org！' 
      };
    } catch (err: any) {
      console.warn('EmailJS sending failed:', err);
      return {
        success: false,
        method: 'emailjs',
        message: `EmailJS 發送失敗 (${err?.text || err?.message || '請檢查 Service ID / Template ID / Public Key'})`
      };
    }
  }

  return { success: false, method: 'mailto', message: '尚未設定 EmailJS 金鑰' };
}

/**
 * Sends Ministry application form via EmailJS.
 */
export async function sendMinistryEmailJS(payload: MinistryFormPayload): Promise<{ success: boolean; method: 'emailjs' | 'mailto'; message: string }> {
  const config = getEmailJSConfig();

  const templateParams = {
    to_email: CHURCH_INFO.email,
    to_name: '加南新生基督教會同工',
    from_name: payload.applicantName || '弟兄姊妹',
    from_email: payload.applicantEmail,
    from_phone: payload.applicantPhone,
    ministry_name: payload.ministryName,
    message: payload.applicantNotes || '無備註事項',
    subject: `[加南事工登記] ${payload.applicantName} 意願加入/了解 【${payload.ministryName}】`,
    time: new Date().toLocaleString('zh-TW', { timeZone: 'America/Los_Angeles' }),
  };

  // Save submission locally in history for backup
  saveSubmissionToHistory('ministry', templateParams);

  if (config.serviceId && config.templateId && config.publicKey) {
    try {
      await emailjs.send(
        config.serviceId,
        config.templateId,
        templateParams,
        config.publicKey
      );
      return { 
        success: true, 
        method: 'emailjs', 
        message: `信件已成功發送！登記事工：【${payload.ministryName}】` 
      };
    } catch (err: any) {
      console.warn('EmailJS sending failed, falling back to mailto:', err);
      triggerMailtoFallback(templateParams);
      return { 
        success: true, 
        method: 'mailto', 
        message: `已自動為您調起郵件軟體，主旨已帶入【${payload.ministryName}】！` 
      };
    }
  } else {
    // Fallback: Mailto link
    triggerMailtoFallback(templateParams);
    return { 
      success: true, 
      method: 'mailto', 
      message: `已調起郵件軟體！主旨與內容已標明【${payload.ministryName}】。` 
    };
  }
}

/**
 * Sends a test email using currently active EmailJS config (Admin only).
 */
export async function sendTestEmailJS(testEmailRecipient: string): Promise<{ success: boolean; message: string }> {
  const config = getEmailJSConfig();

  if (!config.serviceId || !config.templateId || !config.publicKey) {
    return { success: false, message: '尚未填寫完整的 Service ID、Template ID 或 Public Key！' };
  }

  try {
    const testParams = {
      to_email: testEmailRecipient || CHURCH_INFO.email,
      to_name: '加南教會管理員 (測試)',
      from_name: 'EmailJS 測試連線精靈',
      from_email: testEmailRecipient || CHURCH_INFO.email,
      from_phone: '(310) 626-6103',
      subject: `[測試成功] 加南新生基督教會 EmailJS 自動連線測試 (${new Date().toLocaleTimeString()})`,
      message: '這是一封來自加南新生基督教會官方網站的 EmailJS 自動寄信功能連線測試信。收到此信表示您的 Cloudflare Pages / EmailJS 環境變數已正確配置！',
      time: new Date().toLocaleString('zh-TW', { timeZone: 'America/Los_Angeles' }),
    };

    await emailjs.send(config.serviceId, config.templateId, testParams, config.publicKey);
    return { success: true, message: `測試信發送成功！請檢查 ${testParams.to_email} 收件匣。` };
  } catch (err: any) {
    return { success: false, message: `發送失敗: ${err?.text || err?.message || '請確認 EmailJS 參數與白名單網域'}` };
  }
}

function triggerMailtoFallback(params: any) {
  const subject = encodeURIComponent(params.subject || '加南新生基督教會表單');
  const body = encodeURIComponent(
`加南新生基督教會 - 事工登記意願表

事工類別: ${params.ministry_name || '未指定'}
申請者姓名: ${params.from_name}
聯絡電話: ${params.from_phone}
聯絡 Email: ${params.from_email}

留言/備註:
${params.message}

---
此郵件由加南新生基督教會官網自動產生`
  );
  window.location.href = `mailto:${CHURCH_INFO.email}?subject=${subject}&body=${body}`;
}

function saveSubmissionToHistory(type: string, data: any) {
  try {
    const existing = JSON.parse(localStorage.getItem('canaan_form_submissions') || '[]');
    existing.unshift({
      id: `sub_${Date.now()}`,
      type,
      data,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('canaan_form_submissions', JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.error('Failed to store history', e);
  }
}

