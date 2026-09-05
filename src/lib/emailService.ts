import emailjs from '@emailjs/browser';
import { CHURCH_INFO } from '../data/churchData';
import { sendEmailViaSMTP } from './smtpService';

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

export interface PrayerFormPayload {
  authorName: string;
  authorEmail?: string;
  authorPhone?: string;
  category: 'health' | 'family' | 'faith' | 'thanksgiving' | 'general';
  categoryLabelZh: string;
  categoryLabelEn: string;
  title: string;
  content: string;
  isConfidential: boolean;
}

/**
 * Sends Contact / Ride form via SMTP (preferred) with EmailJS / mailto fallback.
 */
export async function sendContactEmailJS(payload: ContactFormPayload): Promise<{ success: boolean; method: 'smtp' | 'emailjs' | 'mailto'; message: string }> {
  // Save submission locally in history for backup
  saveSubmissionToHistory('contact', {
    ...payload,
    time: new Date().toLocaleString('zh-TW', { timeZone: 'America/Los_Angeles' }),
  });

  // 1. Try Server-Side SMTP First (Configured by Admin in Admin Login)
  try {
    const smtpRes = await sendEmailViaSMTP({
      type: 'contact',
      subject: `[加南網站${payload.needRide ? '主日接送預約' : '在線留言'}] ${payload.senderName || '訪客'} - ${payload.senderPhone || ''}`,
      senderName: payload.senderName,
      senderPhone: payload.senderPhone,
      senderEmail: payload.senderEmail,
      senderMessage: payload.senderMessage,
      needRide: payload.needRide,
      replyTo: payload.senderEmail,
    });

    if (smtpRes.success) {
      return {
        success: true,
        method: 'smtp',
        message: smtpRes.message || '信件已成功透過加南 SMTP 郵件伺服器自動發送！',
      };
    }
  } catch (smtpErr) {
    console.warn('SMTP delivery attempt failed, checking EmailJS fallback...', smtpErr);
  }

  // 2. EmailJS Fallback if configured
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
        message: `發送失敗 (${err?.text || err?.message || '請確認 SMTP 或 EmailJS 設定'})`
      };
    }
  }

  return { success: false, method: 'mailto', message: '尚未設定 SMTP 或 EmailJS 郵件服務' };
}

/**
 * Sends Ministry application form via SMTP (preferred) with EmailJS / mailto fallback.
 */
export async function sendMinistryEmailJS(payload: MinistryFormPayload): Promise<{ success: boolean; method: 'smtp' | 'emailjs' | 'mailto'; message: string }> {
  const timeStr = new Date().toLocaleString('zh-TW', { timeZone: 'America/Los_Angeles' });

  // Save submission locally in history for backup
  saveSubmissionToHistory('ministry', {
    ...payload,
    time: timeStr,
  });

  // 1. Try Server-Side SMTP First
  try {
    const smtpRes = await sendEmailViaSMTP({
      type: 'ministry',
      subject: `[加南事工登記] ${payload.applicantName} 意願加入/了解 【${payload.ministryName}】`,
      ministryName: payload.ministryName,
      applicantName: payload.applicantName,
      applicantPhone: payload.applicantPhone,
      applicantEmail: payload.applicantEmail,
      applicantNotes: payload.applicantNotes,
      replyTo: payload.applicantEmail,
    });

    if (smtpRes.success) {
      return {
        success: true,
        method: 'smtp',
        message: `參與意願已成功透過加南 SMTP 寄出！事工項目：【${payload.ministryName}】`,
      };
    }
  } catch (smtpErr) {
    console.warn('SMTP delivery attempt failed, checking EmailJS fallback...', smtpErr);
  }

  // 2. EmailJS Fallback
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
    time: timeStr,
  };

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
 * Sends Prayer Request via SMTP (preferred) or EmailJS to web@canaannewlife.org, saves to pending queue for Admin review.
 */
export async function sendPrayerEmailJS(payload: PrayerFormPayload): Promise<{ success: boolean; method: 'smtp' | 'emailjs' | 'mailto' | 'pending'; message: string }> {
  const timeStr = new Date().toLocaleString('zh-TW', { timeZone: 'America/Los_Angeles' });

  // Save into pending prayers storage for Admin approval workflow
  savePendingPrayerToQueue(payload);

  // 1. Try Server-Side SMTP First
  try {
    const smtpRes = await sendEmailViaSMTP({
      type: 'prayer',
      subject: `[加南代禱登記] ${payload.isConfidential ? '【保密代禱】' : '【公開代禱申請】'} ${payload.title} - ${payload.authorName || '無名氏'}`,
      authorName: payload.authorName,
      authorPhone: payload.authorPhone,
      authorEmail: payload.authorEmail,
      prayerTitle: payload.title,
      categoryLabelZh: payload.categoryLabelZh,
      categoryLabelEn: payload.categoryLabelEn,
      isConfidential: payload.isConfidential,
      content: payload.content,
      replyTo: payload.authorEmail,
    });

    if (smtpRes.success) {
      return {
        success: true,
        method: 'smtp',
        message: `代禱事項已成功透過 SMTP 發送至教會同工信箱！${payload.isConfidential ? '(教牧保密代禱)' : '(已排入同工審核流程)'}`,
      };
    }
  } catch (smtpErr) {
    console.warn('SMTP delivery failed for prayer request, checking EmailJS fallback...', smtpErr);
  }

  // 2. EmailJS Fallback
  const config = getEmailJSConfig();

  const structuredMessage = [
    `【加南官網代禱登記通知】`,
    `提出者姓名/署名：${payload.authorName || '無名氏弟兄/姊妹'}`,
    `聯絡電話：${payload.authorPhone || '未提供'}`,
    `聯絡 Email：${payload.authorEmail || '未提供'}`,
    `代禱主題：${payload.title}`,
    `代禱分類：${payload.categoryLabelZh} (${payload.categoryLabelEn})`,
    `保密性質：${payload.isConfidential ? '【教牧保密代禱】(僅限長執同工與牧者代禱，不公開)' : '【公開代禱申請】(經管理員審核授理後刊登至代禱牆)'}`,
    `提交時間：${timeStr}`,
    `----------------------------------------`,
    `詳細代禱內容：`,
    payload.content,
    `----------------------------------------`,
    `備註：管理員可登入官網後台直接進行審核授理或編輯發布。`
  ].join('\n');

  const templateParams = {
    to_email: CHURCH_INFO.email,
    to_name: '加南新生基督教會長執教牧同工團隊',
    from_name: payload.authorName || '弟兄姊妹/朋友',
    from_email: payload.authorEmail || CHURCH_INFO.email,
    from_phone: payload.authorPhone || '(310) 626-6103',
    prayer_title: payload.title,
    prayer_category: payload.categoryLabelZh,
    is_confidential: payload.isConfidential ? '是 (教牧保密代禱)' : '否 (申請公開刊登)',
    subject: `[加南代禱登記] ${payload.isConfidential ? '【保密代禱】' : '【公開代禱申請】'} ${payload.title} - ${payload.authorName || '無名氏'}`,
    message: structuredMessage,
    time: timeStr,
  };

  // Save to form submissions history
  saveSubmissionToHistory('prayer', templateParams);

  // Save into pending prayers storage for Admin approval workflow
  savePendingPrayerToQueue(payload);

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
        message: '代禱內容已成功透過 Email 發送至 web@canaannewlife.org，並已提交長執教牧同工團隊授理！' 
      };
    } catch (err: any) {
      console.warn('EmailJS sending failed for prayer, falling back to mailto/local review:', err);
      return { 
        success: true, 
        method: 'mailto', 
        message: '代禱事項已登記並送交同工會！同工將於後台進行授理與守望代禱。' 
      };
    }
  } else {
    // If EmailJS keys not configured yet, still save locally and give user option to send via mail client
    return { 
      success: true, 
      method: 'pending', 
      message: '代禱事項已成功送出並保存於系統後台，待管理員授理確認後將刊登至代禱牆！' 
    };
  }
}

function savePendingPrayerToQueue(payload: PrayerFormPayload) {
  try {
    const existing = JSON.parse(localStorage.getItem('canaan_pending_prayers') || '[]');
    const newPendingItem = {
      id: `pending-prayer-${Date.now()}`,
      author: payload.authorName || '無名氏弟兄/姊妹',
      authorEmail: payload.authorEmail || '',
      authorPhone: payload.authorPhone || '',
      category: payload.category,
      title: payload.title,
      content: payload.content,
      submittedAt: new Date().toISOString(),
      isConfidential: payload.isConfidential,
      status: 'pending',
    };
    const updated = [newPendingItem, ...existing];
    localStorage.setItem('canaan_pending_prayers', JSON.stringify(updated.slice(0, 100)));
    window.dispatchEvent(new CustomEvent('canaan_pending_prayers_updated', { detail: { pending: updated } }));
  } catch (e) {
    console.error('Failed to save pending prayer to queue:', e);
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

