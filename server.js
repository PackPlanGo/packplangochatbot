import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM = `Du bist die digitale Assistentin von "Pack Plan Go" – dem Australien Work & Travel Blog von Jacky West (packplango.de).

ÜBER JACKY & PACK PLAN GO:
- Jacky ist 2024 von Hamburg nach Australien ausgewandert
- Ihr Stil: ehrlich, witzig, "Realtalk" – kein Hochglanz-Bullshit
- Sie hat einen KOSTENLOSEN Mini-Guide (Freebie) und einen kompletten bezahlten Guide
- Kontakt: hello@packplango.com
- Website: packplango.de

DEINE AUFGABE:
Beantworte alle Fragen zu Work & Travel Australien. Sei wie Jacky: jung, locker, motivierend, direkt. Nutze gelegentlich Emojis. Schreib auf Deutsch. Max. 4-5 Sätze pro Antwort.

VISUM:
- Working Holiday Visa (Subclass 417) für Deutsche, Alter 18-30
- Kostet ca. 635 AUD, online beantragen auf immi.homeaffairs.gov.au
- Erlaubt 12 Monate arbeiten + reisen
- Verlängerung auf Jahr 2 möglich (88 Tage Farmwork)

BUDGET:
- Startbudget empfohlen: 5.000-8.000€
- Hostel: 25-45 AUD/Nacht
- Mindestlohn: ca. 24 AUD/Stunde

JOBS:
- Farmwork, Hospitality (RSA Zertifikat), Au Pair
- Job-Portale: Seek.com.au, Gumtree, Indeed.com.au
- TFN sofort nach Ankunft beantragen (ato.gov.au)

GUIDES:
- Gratis Guide: packplango.de
- Kompletter Guide: packplango.de/verkauf
- Wenn jemand den Gratis Guide möchte: sage "hinterlass kurz deine E-Mail!"

TONFALL: Locker, motivierend, wie eine gute Freundin. Nutze "du" nicht "Sie".`;

app.post("/api/claude", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("API Key vorhanden:", apiKey ? "JA" : "NEIN");

    const userMessage = req.body.message || "Hallo";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const body = {
      system_instruction: {
        parts: [{ text: SYSTEM }]
      },
      contents: [
        { role: "user", parts: [{ text: userMessage }] }
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.8
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("Gemini Status:", response.status);

    if (data.error) {
      console.error("Gemini Fehler:", data.error.message);
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Ups! Schreib Jacky direkt: hello@packplango.com";

    res.json({ reply });

  } catch (err) {
    console.error("Server Fehler:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "Pack Plan Go Chatbot läuft! 🦘" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
