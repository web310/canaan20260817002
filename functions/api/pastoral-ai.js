export async function onRequestPost(context) {
  try {
    const apiKey = context.env.GEMINI_API_KEY || context.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "未在 Cloudflare 平台設定 GEMINI_API_KEY。請至 Cloudflare Pages -> Settings -> Variables and secrets 新增 GEMINI_API_KEY 變數。",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    const body = await context.request.json();
    const contents = body.contents || [{ role: 'user', parts: [{ text: body.prompt || '' }] }];
    const systemInstruction = body.systemInstruction;

    const geminiPayload = {
      contents: contents,
    };

    if (systemInstruction) {
      geminiPayload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(geminiPayload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.error?.message || "Google Gemini API 呼叫失敗",
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "平安，目前無法取得回應，請稍後再試。";

    return new Response(JSON.stringify({ text, reply: text }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "伺服器處理錯誤" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
