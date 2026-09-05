import { CHURCH_INFO } from '../data/churchData';

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  requireTLS: boolean;
  user: string;
  pass?: string;
  hasPassword?: boolean;
  maskedPassword?: string;
  fromName: string;
  fromEmail: string;
  defaultRecipient: string;
  isActive: boolean;
  isConfigured?: boolean;
  updatedAt?: string;
  source?: 'server' | 'local' | 'env';
}

export interface SMTPTestResult {
  success: boolean;
  message: string;
  messageId?: string;
  advice?: string;
  code?: string;
  details?: any;
}

export interface SMTPSendResult {
  success: boolean;
  message: string;
  messageId?: string;
  recipient?: string;
  method: 'smtp' | 'emailjs' | 'mailto';
}

const LOCAL_STORAGE_KEY = 'canaan_smtp_config';

export const DEFAULT_SMTP_CONFIG: SMTPConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  user: 'web@canaannewlife.org',
  pass: '',
  hasPassword: false,
  maskedPassword: '',
  fromName: '加南新生基督教會',
  fromEmail: 'web@canaannewlife.org',
  defaultRecipient: 'web@canaannewlife.org',
  isActive: true,
  isConfigured: false,
};

/**
 * Synchronous local read for immediate component initialization
 */
export function getStoredSMTPConfigSync(): SMTPConfig {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SMTP_CONFIG,
        ...parsed,
        hasPassword: Boolean(parsed.hasPassword || (parsed.pass && parsed.pass.length > 0)),
      };
    }
  } catch (e) {
    console.warn('Failed to parse local SMTP config:', e);
  }
  return DEFAULT_SMTP_CONFIG;
}

/**
 * Asynchronous fetch from server /api/smtp/config
 */
export async function fetchServerSMTPConfig(): Promise<SMTPConfig> {
  try {
    const res = await fetch('/api/smtp/config');
    if (res.ok) {
      const data = await res.json();
      const merged: SMTPConfig = {
        host: data.host || '',
        port: Number(data.port) || 587,
        secure: Boolean(data.secure),
        requireTLS: data.requireTLS !== undefined ? Boolean(data.requireTLS) : true,
        user: data.user || '',
        hasPassword: Boolean(data.hasPassword),
        maskedPassword: data.maskedPassword || (data.hasPassword ? '••••••••' : ''),
        fromName: data.fromName || '加南新生基督教會',
        fromEmail: data.fromEmail || data.user || 'web@canaannewlife.org',
        defaultRecipient: data.defaultRecipient || 'web@canaannewlife.org',
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        isConfigured: Boolean(data.isConfigured),
        updatedAt: data.updatedAt,
        source: 'server',
      };

      // Save sanitized non-secret config to localStorage for offline access
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
          host: merged.host,
          port: merged.port,
          secure: merged.secure,
          requireTLS: merged.requireTLS,
          user: merged.user,
          hasPassword: merged.hasPassword,
          fromName: merged.fromName,
          fromEmail: merged.fromEmail,
          defaultRecipient: merged.defaultRecipient,
          isActive: merged.isActive,
          isConfigured: merged.isConfigured,
        }));
      } catch (err) {
        // Ignore storage quota errors
      }

      return merged;
    }
  } catch (e) {
    console.warn('Could not reach /api/smtp/config, using local fallback:', e);
  }

  return getStoredSMTPConfigSync();
}

/**
 * Save SMTP Configuration to Server & Local Cache
 */
export async function saveServerSMTPConfig(config: Partial<SMTPConfig>): Promise<{ success: boolean; config?: SMTPConfig; message: string }> {
  try {
    const payload = {
      host: config.host?.trim(),
      port: Number(config.port) || 587,
      secure: Boolean(config.secure),
      requireTLS: config.requireTLS !== undefined ? Boolean(config.requireTLS) : true,
      user: config.user?.trim(),
      pass: config.pass?.trim(),
      fromName: config.fromName?.trim() || '加南新生基督教會',
      fromEmail: config.fromEmail?.trim() || config.user?.trim() || 'web@canaannewlife.org',
      defaultRecipient: config.defaultRecipient?.trim() || 'web@canaannewlife.org',
      isActive: config.isActive !== undefined ? Boolean(config.isActive) : true,
    };

    const res = await fetch('/api/smtp/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      const updatedConfig = data.config as SMTPConfig;
      
      // Update local storage
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        ...updatedConfig,
        pass: undefined, // Never store password in cleartext in localStorage
      }));

      return {
        success: true,
        config: updatedConfig,
        message: data.message || 'SMTP 設定已成功儲存！',
      };
    } else {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        message: err.error || `儲存失敗 (${res.status})`,
      };
    }
  } catch (e: any) {
    console.error('Failed to save SMTP config to server:', e);
    return {
      success: false,
      message: `網路連線異常: ${e.message || '無法儲存設定'}`,
    };
  }
}

/**
 * Send a verification test email via SMTP
 */
export async function testSMTPConnection(
  config: Partial<SMTPConfig>, 
  testRecipient?: string
): Promise<SMTPTestResult> {
  try {
    const res = await fetch('/api/smtp/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: config.host?.trim(),
        port: Number(config.port) || 587,
        secure: Boolean(config.secure),
        requireTLS: config.requireTLS !== undefined ? Boolean(config.requireTLS) : true,
        user: config.user?.trim(),
        pass: config.pass?.trim(),
        fromName: config.fromName?.trim(),
        fromEmail: config.fromEmail?.trim(),
        testRecipient: (testRecipient || config.defaultRecipient || config.user || 'web@canaannewlife.org').trim(),
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message || 'SMTP 伺服器驗證與測試發信成功！',
        messageId: data.messageId,
        details: data.details,
      };
    } else {
      return {
        success: false,
        message: data.error || 'SMTP 測試連線失敗',
        advice: data.advice,
        code: data.code,
      };
    }
  } catch (e: any) {
    return {
      success: false,
      message: `無法連線至伺服器測試端點: ${e.message}`,
      advice: '請確認後端 Node.js Express 伺服器正在運行 (Port 3000)。',
    };
  }
}

/**
 * Core SMTP Send Function: Posts to /api/smtp/send
 */
export async function sendEmailViaSMTP(payload: {
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
  replyTo?: string;
  type?: 'contact' | 'prayer' | 'ministry' | 'general';
  [key: string]: any;
}): Promise<SMTPSendResult> {
  try {
    const res = await fetch('/api/smtp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      return {
        success: true,
        method: 'smtp',
        message: data.message || `信件已成功透過 SMTP 郵件伺服器發送至 ${data.recipient || CHURCH_INFO.email}！`,
        messageId: data.messageId,
        recipient: data.recipient,
      };
    } else {
      return {
        success: false,
        method: 'smtp',
        message: data.error || `SMTP 發送失敗 (${res.status})`,
      };
    }
  } catch (e: any) {
    console.error('SMTP API Network Failure:', e);
    return {
      success: false,
      method: 'smtp',
      message: `網路傳輸錯誤: ${e.message || '伺服器無回應'}`,
    };
  }
}
