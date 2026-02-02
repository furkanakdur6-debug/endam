export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "POST only" }),
    };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reply: "Bana bir şey yaz 💗" }),
      };
    }

    const systemPrompt = `
Sen Endam Bot’sun.
Türkçe konuş.
Sıcak, samimi, romantik bir üslubun var.
Kullanıcı ne yazarsa yazsın cevap vermeye çalış.
Kısa soruya kısa, uzun soruya detaylı cevap ver.
Emoji kullan ama abartma.
Gerektiğinde sitenin bölümlerini hatırlat:
- Fotoğraflarımız
- Şarkılarımız
- Hikâyemiz
- Çark Oyunu
- Küçük sürpriz
- Evim
Kullanıcıya asla soğuk davranma.
`.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      "Bir şey ters gitti ama buradayım 💗";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Bir şey ters gitti 😅 ama seni bırakmam 💗",
        error: err.message,
      }),
    };
  }
}
