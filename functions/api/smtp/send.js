// Cloudflare Pages Function: POST /api/smtp/send
export async function onRequestPost(context) {
  try {
    const env = context.env || {};
    const body = await context.request.json();
    const recipient = body.to || env.SMTP_RECIPIENT || 'web@canaannewlife.org';
    const fromEmail = body.fromEmail || env.SMTP_FROM_EMAIL || 'web@canaannewlife.org';
    const fromName = body.fromName || '加南新生基督教會';
    const subject = body.subject || '【加南網站來信通知】';
    
    // Construct HTML content if not provided
    let htmlContent = body.html;
    let textContent = body.text || '';

    if (!htmlContent) {
      if (body.type === 'contact') {
        htmlContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="background-color: #78350f; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 18px;">加南新生基督教會 - 網站在線留言 / 接送預約</h2>
            </div>
            <p><b>留言者姓名：</b>${body.senderName || '訪客'}</p>
            <p><b>聯絡電話：</b>${body.senderPhone || '未提供'}</p>
            <p><b>電子郵件：</b>${body.senderEmail || '未提供'}</p>
            <p><b>主日免費接送：</b>${body.needRide ? '是（需要接送）' : '否（一般留言）'}</p>
            <div style="background-color: #f8fafc; padding: 14px; border-left: 4px solid #d97706; margin-top: 15px; border-radius: 4px;">
              <b>心聲留言內容：</b>
              <p style="white-space: pre-wrap; margin-top: 6px;">${body.senderMessage || '無具體內容'}</p>
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">此郵件由加南新生基督教會官方網站系統自動發送。</p>
          </div>
        `;
      } else if (body.type === 'prayer') {
        htmlContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="background-color: #78350f; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 18px;">加南新生基督教會 - 代禱牆代禱請求</h2>
            </div>
            <p><b>代禱者：</b>${body.authorName || '弟兄姊妹'}</p>
            <p><b>聯絡電話：</b>${body.authorPhone || '未提供'}</p>
            <p><b>電子郵件：</b>${body.authorEmail || '未提供'}</p>
            <p><b>代禱類別：</b>${body.categoryLabelZh || body.category || '一般代禱'}</p>
            <p><b>代禱私密性：</b>${body.isConfidential ? '保密（僅長執同工牧者代求）' : '公開（可刊登於代禱牆）'}</p>
            <div style="background-color: #f8fafc; padding: 14px; border-left: 4px solid #d97706; margin-top: 15px; border-radius: 4px;">
              <b>代禱標題：</b>${body.title || '無標題'}<br/><br/>
              <b>詳細代禱內容：</b>
              <p style="white-space: pre-wrap; margin-top: 6px;">${body.content || '無具體內容'}</p>
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">此郵件由加南新生基督教會官方網站系統自動發送。</p>
          </div>
        `;
      } else if (body.type === 'ministry') {
        htmlContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="background-color: #78350f; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 18px;">加南新生基督教會 - 事工登記意願報名</h2>
            </div>
            <p><b>事工項目：</b>${body.ministryName || '事工服事'}</p>
            <p><b>申請同工姓名：</b>${body.applicantName || '同工'}</p>
            <p><b>聯絡電話：</b>${body.applicantPhone || '未提供'}</p>
            <p><b>電子郵件：</b>${body.applicantEmail || '未提供'}</p>
            <div style="background-color: #f8fafc; padding: 14px; border-left: 4px solid #d97706; margin-top: 15px; border-radius: 4px;">
              <b>備註與負擔分享：</b>
              <p style="white-space: pre-wrap; margin-top: 6px;">${body.applicantNotes || '無特殊備註'}</p>
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">此郵件由加南新生基督教會官方網站系統自動發送。</p>
          </div>
        `;
      } else {
        htmlContent = `<div style="font-family:sans-serif;padding:20px;">${body.content || body.message || '加南新生基督教會通知'}</div>`;
      }
    }

    // 1. Try Resend API if configured
    if (env.RESEND_API_KEY) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `${fromName} <${env.RESEND_FROM || 'onboarding@resend.dev'}>`,
            to: [recipient],
            reply_to: body.replyTo || body.senderEmail,
            subject: subject,
            html: htmlContent,
            text: textContent
          })
        });

        if (resendRes.ok) {
          const rData = await resendRes.json();
          return new Response(JSON.stringify({
            success: true,
            message: `信件已成功送達至 ${recipient}！`,
            messageId: rData.id,
            recipient
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          });
        }
      } catch (rErr) {
        console.warn('Resend API attempt error:', rErr);
      }
    }

    // 2. Try MailChannels Transactional API (Built into Cloudflare Workers/Pages)
    try {
      const mcPayload = {
        personalizations: [
          {
            to: [{ email: recipient, name: '加南新生基督教會' }]
          }
        ],
        from: {
          email: fromEmail,
          name: fromName
        },
        subject: subject,
        content: [
          {
            type: 'text/html',
            value: htmlContent
          }
        ]
      };

      if (body.replyTo || body.senderEmail) {
        mcPayload.reply_to = {
          email: body.replyTo || body.senderEmail,
          name: body.senderName || body.authorName || '訪客'
        };
      }

      const mcRes = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mcPayload)
      });

      if (mcRes.ok || mcRes.status === 202) {
        return new Response(JSON.stringify({
          success: true,
          message: `信件已成功透過 Cloudflare 發送至 ${recipient}！`,
          messageId: `cf-${Date.now()}`,
          recipient
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
      }
    } catch (mcErr) {
      console.warn('MailChannels attempt error:', mcErr);
    }

    // If Cloudflare serverless direct send is unconfigured, return clear fallback signal
    return new Response(JSON.stringify({
      success: false,
      error: 'Cloudflare Pages 邊緣端點尚未設定發信憑證',
      fallbackToEmailJS: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || '發送失敗',
      fallbackToEmailJS: true
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
