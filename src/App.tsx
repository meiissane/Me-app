import React, { useState } from "react";
import { Header } from "./components/Header";
import { VoiceExperience } from "./components/VoiceExperience";
import { ResumeOverview } from "./components/ResumeOverview";
import { AboutModal } from "./components/AboutModal";
import { PROFILE_DATA } from "./data/profile";
import {
  Mic,
  FileText,
  Sparkles,
  Volume2,
  Mail,
  Linkedin,
  MapPin,
  Globe,
  ArrowRight,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"voice" | "resume">("voice");
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  const handleAskAboutExperience = (question: string) => {
    setPendingQuestion(question);
    setActiveTab("voice");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1E1A17] font-serif flex flex-col selection:bg-[#EADBCE]">
      {/* Editorial Header */}
      <Header
        isLiveConnected={isLiveConnected}
        isSpeaking={isSpeaking}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Editorial Sub-hero Introduction */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3ECE0] border border-[#E2D5C0] text-xs font-sans text-[#786C5E]">
            <Sparkles className="w-3.5 h-3.5 text-[#A3583C]" />
            <span>Marketing Digital & Influence • Voice Assistant</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#1E1A17] leading-[1.15]">
            Meïssane Goma Kabisi
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-[#665B4E] leading-relaxed">
            Assistante marketing & communication à Paris. Échangez en direct avec{" "}
            <span className="font-semibold text-[#1E1A17] not-italic underline decoration-[#A3583C]/40 underline-offset-4">
              Meï
            </span>
            , son assistante vocale en français soigné ou en anglais américain.
          </p>

          {/* Navigation Pill Switcher */}
          <div className="inline-flex items-center p-1.5 rounded-full bg-[#EFE7D8] border border-[#DFCFC] shadow-2xs font-sans text-xs">
            <button
              onClick={() => setActiveTab("voice")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 font-medium ${
                activeTab === "voice"
                  ? "bg-[#1E1A17] text-[#FAF7F0] shadow-sm"
                  : "text-[#6E6152] hover:text-[#1E1A17]"
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-[#A3583C]" />
              <span>Assistant Vocal (Meï)</span>
            </button>

            <button
              onClick={() => setActiveTab("resume")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 font-medium ${
                activeTab === "resume"
                  ? "bg-[#1E1A17] text-[#FAF7F0] shadow-sm"
                  : "text-[#6E6152] hover:text-[#1E1A17]"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#A3583C]" />
              <span>Curriculum & Expériences</span>
            </button>
          </div>
        </section>

        {/* Dynamic View: Voice Experience or Resume */}
        <div className="transition-all duration-300">
          {activeTab === "voice" ? (
            <VoiceExperience
              onSpeakingChange={setIsSpeaking}
              onLiveConnectedChange={setIsLiveConnected}
              pendingQuestion={pendingQuestion}
              onClearPendingQuestion={() => setPendingQuestion(null)}
            />
          ) : (
            <ResumeOverview
              onAskQuestion={handleAskAboutExperience}
              isSpeaking={isSpeaking}
            />
          )}
        </div>

        {/* Quick Contact & Info Strip */}
        <section className="bg-[#FAF7F0] border border-[#E8DFC8] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-serif text-lg sm:text-xl font-semibold text-[#1E1A17]">
              Opportunités professionnelles & Projets
            </h4>
            <p className="text-xs sm:text-sm font-serif italic text-[#706456]">
              À la recherche d'opportunités en marketing digital, stratégie d'influence et communication de marque.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 font-sans text-xs">
            <a
              href={`mailto:${PROFILE_DATA.email}`}
              className="inline-flex items-center gap-2 bg-[#1E1A17] hover:bg-[#38332E] text-[#FAF7F0] px-4 py-2.5 rounded-xl transition-colors font-medium shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contacter par Email</span>
            </a>

            <button
              onClick={() => setIsAboutOpen(true)}
              className="inline-flex items-center gap-2 bg-[#F2EADB] hover:bg-[#E8DFC8] text-[#1E1A17] border border-[#DFCFC] px-4 py-2.5 rounded-xl transition-colors font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A3583C]" />
              <span>Spécifications de la Voix</span>
            </button>
          </div>
        </section>
      </main>

      {/* Floating Speaking Pill if user is scrolled */}
      {isSpeaking && (
        <div className="fixed bottom-6 right-6 z-40 bg-[#1E1A17] text-[#FAF7F0] px-4 py-2.5 rounded-full shadow-xl border border-[#A3583C] flex items-center gap-3 animate-bounce">
          <Volume2 className="w-4 h-4 text-[#A3583C] animate-pulse" />
          <span className="text-xs font-sans font-medium">Meï est en train de parler...</span>
        </div>
      )}

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Editorial Footer */}
      <footer className="border-t border-[#E8DFC8]/60 bg-[#FAF7F0] mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-serif text-[#786C5E]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Meïssane GOMA KABISI</span>
            <span>•</span>
            <span className="italic">Voice Assistant "Meï"</span>
          </div>

          <div className="flex items-center gap-4 text-[#5C5247] font-sans">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#A3583C]" />
              Paris, France
            </span>
            <span>•</span>
            <span>Gemini Live API & Flash TTS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
