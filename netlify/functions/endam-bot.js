import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Basit: konuşma geçmişini client gönderiyor (prod'da server-side session önerilir)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // Sistem talimatı (personality/kurallar)
    const instructions =
      "Sen Endam Bot'sun. Kısa, net ve Türkçe cevap ver. " +
      "Gereksiz uzatma. Kullanıcıya asla API anahtarı gibi gizli bilgi isteme.";

    const response = await client.responses.create({
      model: "gpt-5",
      reasoning: { effort: "low" },
      instructions,
      input: [
        // messages: [{role:"user"|"assistant", content:"..."}]
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    });

    // Responses API'de text'i güvenli şekilde çekelim:
    const text =
      response.output_text ??
      (response.output?.[0]?.content?.[0]?.text ?? "");

    return res.json({ text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

app.listen(3001, () => console.log("API listening on http://localhost:3001"));
