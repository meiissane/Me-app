import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export const MEI_SYSTEM_PROMPT = `
Tu es "Meï", l'assistante vocale exclusive et incarnation digitale de Meïssane GOMA KABISI.

À PROPOS DE MEÏSSANE GOMA KABISI :
- Étudiante en Marketing & Communication (Programme Grande École / Master en École de Commerce à Paris).
- Basée à Paris, France.
- Contact : meissane.gomakabisi@email.com / meissanegoma@gmail.com, téléphone : 06 12 34 56 78.
- Profil : Passionnée par le marketing digital, le branding moderne, la direction artistique, les stratégies de contenu social media et le marketing d'influence à dimension multiculturelle et internationale.
- Expériences professionnelles clés :
  1. THE SAUCE (Paris / Remote) - Marketing & Communication Assistant :
     - Élaboration et déploiement de stratégies de contenu captivantes adaptées à une audience Franco-Camerounaise et panafricaine.
     - Gestion opérationnelle de campagnes d'influence avec des créateurs de contenu de premier plan (locaux et internationaux).
     - Analyse approfondie des KPIs (taux d'engagement, portée, conversions) et reporting de performance.
  2. PUBLICIS (Paris) - Expérience agence :
     - Élaboration de recommandations stratégiques de communication et de contenu pour des marques d'envergure.
     - Coordination de campagnes d'influence et activation de créateurs.
     - Veille créative, benchmarks de marques et mesure d'impact.
  3. REACT NOW (2020 - 2022) - Membre Actif puis Manager :
     - Coordination globale d'événements, mobilisation de communautés et pilotage de la communication associative.
- Compétences : Marketing digital, Branding & identité visuelle, Marketing d'influence, Storytelling & Social Media, Reporting analytique & KPIs, Coordination d'équipes.

DIRECTIVES VOCALES ET COMPORTEMENTALES IMPÉRATIVES :
1. LANGUES & ACCENTS :
   - Français : Parle avec un accent français parisien raffiné, moderne, clair et chaleureux.
   - Anglais : Parle avec un accent américain fluide et authentique ("American accent"), articulé, confiant et élégant.
   - Si l'interlocuteur parle français, réponds en français. S'il parle anglais, réponds en anglais avec un accent américain. Tu peux également passer d'une langue à l'autre sans hésiter.
2. STYLE ORAL :
   - Garde tes réponses relativement concises (2 à 4 phrases bien ciselées), idéales pour une écoute vocale fluide.
   - Ton ton est professionnel, sophistiqué, chaleureux et engageant, à l'image d'une jeune professionnelle du marketing de la mode, du luxe et du digital.
   - N'hésite pas à valoriser les accomplissements de Meïssane, son sens esthétique et sa capacité à connecter les marques à leurs audiences.
`.trim();

// WebSocket server for Gemini Live API real-time audio
const wss = new WebSocketServer({ server, path: "/live" });

wss.on("connection", async (clientWs: WebSocket) => {
  console.log("[Live API] Client connected to /live");

  let liveSession: any = null;
  let isConnected = true;

  try {
    liveSession = await ai.live.connect({
      model: "gemini-3.8-live",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
        systemInstruction: MEI_SYSTEM_PROMPT,
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          if (!isConnected) return;
          try {
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts && parts.length > 0) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(
                    JSON.stringify({
                      type: "audio",
                      audio: part.inlineData.data,
                    })
                  );
                }
                if (part.text) {
                  clientWs.send(
                    JSON.stringify({
                      type: "text",
                      text: part.text,
                    })
                  );
                }
              }
            }

            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: "turnComplete" }));
            }

            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: "interrupted" }));
            }
          } catch (err) {
            console.error("[Live API] Error forwarding server message:", err);
          }
        },
        onerror: (err) => {
          console.error("[Live API] Session error:", err);
          if (isConnected) {
            clientWs.send(
              JSON.stringify({
                type: "error",
                error: "Erreur de connexion avec le service vocal Gemini Live.",
              })
            );
          }
        },
        onclose: () => {
          console.log("[Live API] Session closed");
        },
      },
    });

    clientWs.send(JSON.stringify({ type: "ready" }));
  } catch (err: any) {
    console.error("[Live API] Failed to connect to Gemini Live:", err);
    clientWs.send(
      JSON.stringify({
        type: "error",
        error: "Impossible d'initialiser la session Live API. Vérifiez la clé API.",
      })
    );
  }

  clientWs.on("message", (raw: Buffer) => {
    try {
      const data = JSON.parse(raw.toString());

      if (data.type === "audio" && data.audio && liveSession) {
        liveSession.sendRealtimeInput({
          audio: {
            data: data.audio,
            mimeType: "audio/pcm;rate=16000",
          },
        });
      } else if (data.type === "text" && data.text && liveSession) {
        liveSession.sendClientContent({
          turns: [
            {
              role: "user",
              parts: [{ text: data.text }],
            },
          ],
          turnComplete: true,
        });
      }
    } catch (err) {
      console.error("[Live API] Error parsing client message:", err);
    }
  });

  clientWs.on("close", () => {
    isConnected = false;
    console.log("[Live API] Client disconnected");
    if (liveSession && typeof liveSession.close === "function") {
      try {
        liveSession.close();
      } catch (e) {
        // session cleanup
      }
    }
  });
});

// REST Endpoint for text chat with voice synthesis response (robust fallback & fast audio)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Le message est requis." });
    }

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-6)) {
        contents.push({
          role: turn.role === "assistant" ? "model" : "user",
          parts: [{ text: turn.text }],
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // 1. Generate text response with Gemini Flash
    const chatResponse = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: MEI_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const replyText = chatResponse.text || "Bonjour, je suis Meï. Comment puis-je vous aider ?";

    // 2. Generate spoken audio using Gemini 3.8 Flash Lite TTS
    let base64Audio = null;
    try {
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: replyText,
                speechMetadata: {
                  style: "Warm, sophisticated, articulate young marketing professional",
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" },
            },
          },
        },
      });

      base64Audio =
        ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (ttsErr) {
      console.warn("TTS generation non-blocking fallback:", ttsErr);
    }

    return res.json({
      text: replyText,
      audio: base64Audio,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({
      error: error?.message || "Erreur lors du traitement de la requête.",
    });
  }
});

// Direct TTS audio generator endpoint
app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Texte manquant." });
    }

    const ttsResponse = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text,
              speechMetadata: {
                style: "Sophisticated and articulate French-American voice",
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio =
      ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;

    if (!base64Audio) {
      return res.status(500).json({ error: "Impossible de synthétiser la voix." });
    }

    return res.json({ audio: base64Audio });
  } catch (err: any) {
    console.error("Error in /api/tts:", err);
    return res.status(500).json({ error: err?.message || "Erreur TTS" });
  }
});

// Vite middleware for development, or static files for production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  server.listen(port, () => {
    console.log(`[Meï Server] Listening on http://localhost:${port}`);
  });
});
