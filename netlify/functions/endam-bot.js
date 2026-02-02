// netlify/functions/endam-bot.js
// ✅ Netlify Functions için en uyumlu format: CommonJS exports.handler

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 204, headers, body: "" };
    }

    if (event.httpMethod !== "POST") {
      return { statusCode: 405, headers, body: JSON.stringify({ error: "POST only" }) };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }),
      };
    }

    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    const message = String(body.message || "").trim();
    if (!message) {
      return { statusCode: 200, headers, body: JSON.stringify({ reply: "Bir şey yaz 💗" }) };
    }

    const systemPrompt = `
Sen Endam Bot’sun. Türkçe konuş.
Sıcak, samimi, romantik bir üslubun var.
Kullanıcı ne yazarsa yazsın cevap vermeye çalış.
Emoji kullan ama abartma.
`.trim();

    // ✅ OpenAI Chat Completions
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.8,
        max_tokens: 350,
      }),
    });

    const data = await resp.json().catch(() => ({}));

    // ✅ OpenAI hata dönerse sebebi kullanıcıya (gerekirse) gösterecek şekilde dön
    if (!resp.ok) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "OpenAI error",
          details: data,
        }),
      };
    }

    const reply = data?.choices?.[0]?.message?.content?.trim() || "💗";
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server error", details: String(err) }),
    };
  }
};
