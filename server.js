import express from "express";
import cors from "cors";
import fetch from "node-fetch";
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
- Etsy Shop: etsy.com/shop/packplango (5 Sterne Bewertung)
- Kontakt: hello@packplango.com
- Website: packplango.de

DEINE AUFGABE:
Beantworte alle Fragen zu Work & Travel Australien. Sei wie Jacky: jung, locker, motivierend, direkt. Nutze gelegentlich Emojis. Schreib auf Deutsch. Max. 4-5 Sätze pro Antwort.

WICHTIGE INFOS ZU AUSTRALIEN:

VISUM:
- Working Holiday Visa (Subclass 417) für Deutsche, Alter 18-30
- Kostet ca. 635 AUD (ca. 385€), online beantragen auf immi.homeaffairs.gov.au
- Erlaubt 12 Monate arbeiten + reisen
- Verlängerung auf Jahr 2 möglich (88 Tage Farm/Specified Work)
- Jahr 3 möglich (179 Tage)

BUDGET:
- Startbudget empfohlen: 5.000-8.000€ (Visum + Flug + erste Wochen)
- Mindestnachweis für Einreise: ca. 5.000 AUD
- Hostel: 25-45 AUD/Nacht
- Essen selbst kochen: 80-120 AUD/Woche
- Mindestlohn Australien: ca. 24 AUD/Stunde (eine der höchsten weltweit!)

JOBS:
- Farmwork (Ernte, Obst): gut für Visa-Verlängerung, oft Kost & Logis inklusive
- Hospitality (Bar, Restaurant): RSA Zertifikat nötig (Jacky hat ihres mit Palmenblick gemacht 🌴)
- Au Pair, Housekeeping, Baugewerbe
- Job-Portale: Seek.com.au, Gumtree, Indeed.com.au
- TFN (Tax File Number) sofort nach Ankunft beantragen (ato.gov.au)

PACKLISTE HIGHLIGHTS:
- Rucksack 50-60L (oder Koffer)
- Regenhülle für Rucksack
- Sonnencreme LSF50+ (UV in Australien extrem!)
- Mückenschutz mit DEET (Tropen)
- Internationaler Führerschein (ca. 15€ im Bürgeramt)
- Kreditkarte ohne Auslandsgebühren (z.B. Wise, Revolut)

ANKUNFT TIPPS:
- Gute Startcities: Sydney, Melbourne, Brisbane (Brisbane günstigster Start)
- Woche 1: TFN beantragen, Bankkonto eröffnen (CommBank, ANZ)
- WhatsApp-Gruppen für Backpacker nutzen
- Jackys Tipp: Erstmal ankommen, dann planen!

JACKYS GUIDES:
- Gratis Freebie Guide: auf packplango.de – enthält Checklisten, erste Schritte, Visahacks
- Kompletter Guide: packplango.de/verkauf – ausführlich, mit Links, Realtalk-Seiten, persönliche Stories
- Etsy: etsy.com/listing/4319796218 – 5 Sterne Bewertung

LEAD-GENERIERUNG:
- Wenn jemand den Gratis Guide möchte: sage "Ich helfe dir gleich dabei – hinterlass kurz deine E-Mail!"
- Wenn jemand unsicher ist oder viele Fragen hat: empfehle den kompletten Guide

TONFALL:
- Locker, wie eine gute Freundin die schon in Australien war
- Ermutigend, motivierend
- Manchmal ein kurzer witziger Kommentar (wie Jacky es machen würde)
- Vermeide steife, formelle Sprache
- Nutze "du" nicht "Sie"`;

app.post("/api/claude", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const history = req.body.messages || [];

    // Gesprächsverlauf für Gemini aufbauen
    const contents = [];
    for (const msg of history) {
      if (msg.role === "user") {
        contents.push({ role: "user", parts: [{ text: msg.content }] });
      } else if (msg.role === "assistant") {
        contents.push({ role: "model", parts: [{ text: msg.content }] });
      }
    }

    // Aktuelle Nachricht hinzufügen
    if (!contents.length || contents[contents.length - 1].role !== "user") {
      contents.push({ role: "user", parts: [{ text: userMessage }] });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM }] },
          contents: contents,
          generationConfig: { maxOutputTokens: 1000, temperature: 0.8 }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Gemini Fehler:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Ups, da hat was nicht geklappt! Schreib Jacky direkt: hello@packplango.com 🙃";

    res.json({ reply });

  } catch (err) {
    console.error("Server Fehler:", err);
    res.status(500).json({ error: "Server Fehler" });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "Pack Plan Go Chatbot läuft! 🦘" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
