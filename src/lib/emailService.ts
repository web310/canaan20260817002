import emailjs from '@emailjs/browser';
import { CHURCH_INFO } from '../data/churchData';

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

const CONFIG_STORAGE_KEY = 'canaan_emailjs_config';

export function getEmailJSConfig(): EmailJSConfig {
  const envService = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
  const envTemplate = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
  const envPublic = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.serviceId || parsed.templateId || parsed.publicKey) {
        return {
          serviceId: parsed.serviceId || envService,
          templateId: parsed.templateId || envTemplate,
          publicKey: parsed.publicKey || envPublic,
        };
      }
    }
  } catch (e) {
    console.error('Failed to read emailjs config', e);
  }

  return {
    serviceId: envService,
    templateId: envTemplate,
    publicKey: envPublic,
  };
}

export function saveEmailJSConfig(config: EmailJSConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save emailjs config', e);
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

export interface ContactFormPayload {
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderMessage: string;
  needRide: boolean;
}

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
      return { success: true, method: 'emailjs', message: '信件已成功透過 EmailJS 背景自動發送至 web@canaannewlife.org！' };
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
      return { success: true, method: 'emailjs', message: `信件已成功發送！登記事工：【${payload.ministryName}】` };
    } catch (err: any) {
      console.warn('EmailJS sending failed, falling back to mailto:', err);
      triggerMailtoFallback(templateParams);
      return { success: true, method: 'mailto', message: `已自動為您調起郵件軟體，主旨已帶入【${payload.ministryName}】！` };
    }
  } else {
    // Fallback: Mailto link
    triggerMailtoFallback(templateParams);
    return { success: true, method: 'mailto', message: `已調起郵件軟體！主旨與內容已標明【${payload.ministryName}】。` };
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
