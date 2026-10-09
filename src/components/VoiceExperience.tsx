import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  RotateCcw,
  Languages,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { AudioVisualizer } from "./AudioVisualizer";
import { AudioPlaybackQueue, floatTo16BitPCM, arrayBufferToBase64 } from "../utils/audio";
import { PROFILE_DATA } from "../data/profile";

export interface Message {
  id: string;
  sender: "user" | "mei";
  text: string;
  audioUrl?: string;
  timestamp: string;
  language?: "fr" | "en";
}

interface VoiceExperienceProps {
  onSpeakingChange: (isSpeaking: boolean) => void;
  onLiveConnectedChange: (connected: boolean) => void;
  pendingQuestion?: string | null;
  onClearPendingQuestion?: () => void;
}

export const VoiceExperience: React.FC<VoiceExperienceProps> = ({
  onSpeakingChange,
  onLiveConnectedChange,
  pendingQuestion,
  onClearPendingQuestion,
}) => {
  // Connection states
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isMeiSpeaking, setIsMeiSpeaking] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    "Cliquez sur le microphone pour démarrer une conversation vocale en direct avec Meï."
  );
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Chat conversation history
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "mei",
      text: "Bonjour ! Je suis Meï, l'assistante vocale représentant Meïssane GOMA KABISI. Je parle français avec un accent soigné et anglais avec un authentique accent américain. Que souhaitez-vous découvrir sur son parcours, son expérience chez Publicis ou The Sauce ?",
      timestamp: "À l'instant",
      language: "fr",
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [isGeneratingResponse, setIsGeneratingResponse] = useState<boolean>(false);

  // Audio references
  const wsRef = useRef<WebSocket | null>(null);
  const audioQueueRef = useRef<AudioPlaybackQueue | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize playback queue
  useEffect(() => {
    audioQueueRef.current = new AudioPlaybackQueue((playing) => {
      setIsMeiSpeaking(playing);
      onSpeakingChange(playing);
    });

    return () => {
      stopLiveSession();
      audioQueueRef.current?.stopAll();
    };
  }, []);

  // Handle external pending questions (e.g. from CV section)
  useEffect(() => {
    if (pendingQuestion) {
      handleSendPrompt(pendingQuestion);
      onClearPendingQuestion?.();
    }
  }, [pendingQuestion]);

  // Scroll to bottom of transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isMeiSpeaking, isGeneratingResponse]);

  // Start Live API WebSocket & Mic Stream
  const startLiveSession = async () => {
    setErrorNotice(null);
    setIsConnecting(true);
    setStatusMessage("Connexion au modèle Gemini Live 3.8 en cours...");

    try {
      // 1. Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Set up AudioContext for capturing 16kHz PCM
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      // Buffer size 4096 = ~256ms chunk at 16kHz
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      // 3. Connect WebSocket to /live
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnecting(false);
        setIsLiveActive(true);
        onLiveConnectedChange(true);
        setStatusMessage("En direct avec Meï — Parlez en français ou en anglais américain.");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "ready") {
            console.log("[Live API] Ready for input");
          } else if (data.type === "audio" && data.audio) {
            audioQueueRef.current?.enqueueChunk(data.audio, 24000);
            setAudioLevel(0.7);
          } else if (data.type === "text" && data.text) {
            // Append streaming text to latest message or create new
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.sender === "mei" && last.id.startsWith("live-streaming-")) {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: last.text + data.text },
                ];
              } else {
                return [
                  ...prev,
                  {
                    id: `live-streaming-${Date.now()}`,
                    sender: "mei",
                    text: data.text,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  },
                ];
              }
            });
          } else if (data.type === "interrupted") {
            audioQueueRef.current?.stopAll();
            setIsMeiSpeaking(false);
            onSpeakingChange(false);
          } else if (data.type === "error") {
            setErrorNotice(data.error || "Erreur de connexion Live API");
          }
        } catch (e) {
          console.error("Error parsing WS message", e);
        }
      };

      ws.onerror = (e) => {
        console.error("WS error", e);
        setErrorNotice("Échec de connexion au serveur vocal en direct.");
        stopLiveSession();
      };

      ws.onclose = () => {
        setIsLiveActive(false);
        onLiveConnectedChange(false);
        setIsConnecting(false);
        setStatusMessage("Session vocale en direct terminée.");
      };

      // 4. Hook microphone processor to send PCM
      processor.onaudioprocess = (e) => {
        if (!isLiveActive && ws.readyState !== WebSocket.OPEN) return;
        if (isMicMuted) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Compute volume level for visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setAudioLevel(Math.min(1, rms * 5));

        // Convert to 16-bit PCM and base64
        const pcmBuffer = floatTo16BitPCM(inputData);
        const base64Audio = arrayBufferToBase64(pcmBuffer);

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "audio", audio: base64Audio }));
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
    } catch (err: any) {
      console.error("Failed to start voice live session:", err);
      setIsConnecting(false);
      setIsLiveActive(false);
      onLiveConnectedChange(false);
      setErrorNotice(
        err.name === "NotAllowedError"
          ? "L'accès au microphone a été refusé. Vous pouvez tout de même utiliser les boutons ou la saisie écrite avec réponses vocales !"
          : "Impossible d'accéder au microphone."
      );
    }
  };

  const stopLiveSession = () => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        // cleanup
      }
      wsRef.current = null;
    }

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch (e) {}
      scriptProcessorRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch (e) {}
      inputAudioCtxRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    setIsLiveActive(false);
    onLiveConnectedChange(false);
    setIsConnecting(false);
    setAudioLevel(0);
    setStatusMessage("Microphone désactivé. Prêt à reprendre à tout moment.");
  };

  const toggleLiveSession = () => {
    if (isLiveActive || isConnecting) {
      stopLiveSession();
    } else {
      startLiveSession();
    }
  };

  // Play audio WAV from base64
  const playWavAudio = (base64Wav: string) => {
    audioQueueRef.current?.stopAll();
    const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
    setIsMeiSpeaking(true);
    onSpeakingChange(true);

    audio.onended = () => {
      setIsMeiSpeaking(false);
      onSpeakingChange(false);
    };
    audio.onerror = () => {
      setIsMeiSpeaking(false);
      onSpeakingChange(false);
    };
    audio.play().catch((err) => {
      console.warn("Audio autoplay blocked:", err);
      setIsMeiSpeaking(false);
      onSpeakingChange(false);
    });
  };

  // Send a text prompt (works whether Live API is connected or via REST)
  const handleSendPrompt = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt) return;

    setInputPrompt("");
    setErrorNotice(null);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // If Live API WebSocket is active, send prompt over Live API
    if (isLiveActive && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "text", text: prompt }));
      return;
    }

    // Otherwise use backend /api/chat with Gemini Flash + Gemini TTS
    setIsGeneratingResponse(true);
    setStatusMessage("Meï formule sa réponse vocale...");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          history: messages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            text: m.text,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Erreur serveur (${res.status})`);
      }

      const data = await res.json();
      const meiMsg: Message = {
        id: `mei-${Date.now()}`,
        sender: "mei",
        text: data.text,
        audioUrl: data.audio ? `data:audio/wav;base64,${data.audio}` : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, meiMsg]);
      setStatusMessage("Prête pour la suite de la conversation.");

      if (data.audio) {
        playWavAudio(data.audio);
      }
    } catch (err: any) {
      console.error("Chat request failed:", err);
      setErrorNotice(err.message || "Erreur lors de la génération de la réponse.");
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const handleInterrupt = () => {
    audioQueueRef.current?.stopAll();
    setIsMeiSpeaking(false);
    onSpeakingChange(false);
    if (isLiveActive && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "interrupted" }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Voice Assistant Centerpiece Card */}
      <div className="relative bg-[#FAF7F0] border border-[#E8DFC8] rounded-3xl p-6 sm:p-10 shadow-sm overflow-hidden">
        {/* Subtle Luxury Gradient Background Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#EEDCC8]/40 via-[#F3E7D7]/30 to-[#FDFBF7]/0 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Persona Header */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE7D8] border border-[#DFD3BE] text-xs font-sans text-[#706456]">
              <span className="w-2 h-2 rounded-full bg-[#A3583C] animate-pulse" />
              <span>Incarnation Vocale Interactive</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1E1A17] tracking-tight">
              Parlez avec Meï
            </h2>
            <p className="text-sm sm:text-base font-serif italic text-[#63584B] max-w-xl mx-auto">
              Ambassadrice vocale de Meïssane GOMA KABISI — accent français soigné & American accent bilingue.
            </p>
          </div>

          {/* Interactive Voice Orb / Button */}
          <div className="relative my-4 flex flex-col items-center">
            {/* Animated Glow Rings when live or speaking */}
            {(isLiveActive || isMeiSpeaking) && (
              <>
                <div className="absolute -inset-4 rounded-full bg-[#A3583C]/10 animate-ping" />
                <div className="absolute -inset-8 rounded-full bg-[#C29B38]/10 animate-pulse-subtle" />
              </>
            )}

            <button
              onClick={toggleLiveSession}
              disabled={isConnecting}
              aria-label={isLiveActive ? "Couper le microphone" : "Activer la voix en direct"}
              className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-lg border ${
                isLiveActive
                  ? "bg-[#1E1A17] text-[#FAF7F0] border-[#A3583C] ring-4 ring-[#A3583C]/20 scale-105"
                  : isConnecting
                  ? "bg-[#EFE7D8] text-[#8C7E6E] border-[#DACBB4] cursor-wait"
                  : "bg-[#FDFBF7] text-[#1E1A17] border-[#DFD3BF] hover:border-[#A3583C] hover:shadow-xl hover:scale-105"
              }`}
            >
              {isConnecting ? (
                <div className="w-8 h-8 border-2 border-[#A3583C] border-t-transparent rounded-full animate-spin" />
              ) : isLiveActive ? (
                <div className="flex flex-col items-center">
                  <Mic className="w-8 h-8 text-[#E2835E] animate-pulse" />
                  <span className="text-[11px] font-sans font-medium uppercase tracking-wider mt-1 text-[#E5D7C5]">
                    En direct
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center group">
                  <Mic className="w-8 h-8 text-[#A3583C] group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-sans font-medium uppercase tracking-wider mt-1 text-[#665B4E]">
                    Démarrer
                  </span>
                </div>
              )}
            </button>

            {/* Quick helper tip below button */}
            <p className="mt-3 text-xs font-sans text-[#786C5E] max-w-xs">
              {isLiveActive
                ? "Microphone actif (Gemini 3.8 Live). Cliquez pour couper."
                : "Activez le mode vocal ou cliquez sur une question ci-dessous."}
            </p>
          </div>

          {/* Sound Wave Visualizer */}
          <div className="w-full max-w-md bg-[#F4EDE0] border border-[#E2D6C2] rounded-2xl p-3 flex flex-col items-center">
            <AudioVisualizer
              isActive={isLiveActive}
              isSpeaking={isMeiSpeaking}
              audioLevel={audioLevel}
            />
            <div className="w-full flex items-center justify-between text-[11px] font-sans text-[#706456] px-3 pt-1 border-t border-[#E8DFC8]">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isLiveActive ? "bg-emerald-600 animate-pulse" : "bg-[#A89C8C]"
                  }`}
                />
                {statusMessage}
              </span>
              {isMeiSpeaking && (
                <button
                  onClick={handleInterrupt}
                  className="text-[#A3583C] hover:underline font-medium text-[11px]"
                >
                  Interrompre
                </button>
              )}
            </div>
          </div>

          {/* Error Notice if any */}
          {errorNotice && (
            <div className="w-full max-w-md flex items-start gap-2.5 bg-[#FAF0ED] text-[#8C341F] border border-[#F2C9BE] rounded-xl p-3 text-xs text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#A3583C]" />
              <div className="flex-1">
                <span>{errorNotice}</span>
              </div>
            </div>
          )}

          {/* Curated Question Chips */}
          <div className="w-full space-y-2 pt-2">
            <span className="text-xs font-sans uppercase tracking-widest text-[#786C5E]">
              Exemples de questions à poser à Meï
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
              {PROFILE_DATA.suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPrompt(q.query)}
                  disabled={isGeneratingResponse}
                  className="group flex items-center gap-2 text-xs font-serif text-[#3D352B] bg-[#FDFBF7] hover:bg-[#F2EADB] border border-[#E5DAC6] hover:border-[#A3583C] px-3.5 py-2 rounded-full transition-all duration-200 hover:shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A3583C] group-hover:scale-125 transition-transform" />
                  <span>{q.labelFr}</span>
                  <ChevronRight className="w-3 h-3 text-[#A89B8B] group-hover:text-[#A3583C] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transcript & Conversation Log */}
      <div className="bg-[#FAF7F0] border border-[#E8DFC8] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E4D8C4] pb-4">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1E1A17]">
              Transcription de l'échange
            </h3>
            <p className="text-xs font-serif italic text-[#706456]">
              Retranscription en direct des échanges avec Meï (voix et texte)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setMessages([
                  {
                    id: `reset-${Date.now()}`,
                    sender: "mei",
                    text: "Bonjour ! Je suis Meï, à votre écoute pour vous parler de Meïssane GOMA KABISI.",
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    language: "fr",
                  },
                ])
              }
              title="Réinitialiser l'historique"
              className="p-2 rounded-lg text-[#786C5E] hover:text-[#1E1A17] hover:bg-[#F0E6D4] transition-colors text-xs flex items-center gap-1 font-sans"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Effacer</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-xl rounded-2xl p-4 sm:p-5 text-sm font-serif leading-relaxed space-y-2 border ${
                  msg.sender === "user"
                    ? "bg-[#1E1A17] text-[#FAF7F0] border-[#38332E] rounded-br-none"
                    : "bg-[#FDFBF7] text-[#241F1A] border-[#E8DFC8] rounded-bl-none shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[11px] font-sans pb-1 border-b border-white/10">
                  <span className="font-semibold tracking-wide">
                    {msg.sender === "user" ? "Vous" : "Meï (Assistante)"}
                  </span>
                  <span className="opacity-70 text-[10px]">{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Audio playback button for saved message audio */}
                {msg.audioUrl && (
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => {
                        const b64 = msg.audioUrl?.replace("data:audio/wav;base64,", "");
                        if (b64) playWavAudio(b64);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-sans text-[#A3583C] bg-[#F4EDE0] hover:bg-[#EAE0CE] px-3 py-1 rounded-full transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Réécouter la réponse</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isGeneratingResponse && (
            <div className="flex items-start">
              <div className="bg-[#FDFBF7] border border-[#E8DFC8] rounded-2xl rounded-bl-none p-4 text-xs font-serif italic text-[#786C5E] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#A3583C] animate-pulse" />
                <span>Meï réfléchit et prépare sa réponse vocale...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar (Text + Voice trigger) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="pt-2 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Posez une question à Meï (en français ou en anglais)..."
            className="flex-1 bg-[#FDFBF7] border border-[#DECDB7] focus:border-[#A3583C] focus:ring-1 focus:ring-[#A3583C] rounded-xl px-4 py-3 text-sm font-serif text-[#1E1A17] placeholder:text-[#9A8D7E] outline-none transition-all"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isGeneratingResponse}
            className="bg-[#1E1A17] hover:bg-[#38332E] disabled:bg-[#C9BEAE] text-[#FAF7F0] px-5 py-3 rounded-xl font-sans text-xs font-medium flex items-center gap-2 transition-colors shadow-xs"
          >
            <span>Envoyer</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
