import React from "react";
import { Sparkles, Mic, Volume2 } from "lucide-react";

interface HeaderProps {
  isLiveConnected: boolean;
  isSpeaking: boolean;
  onOpenAbout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLiveConnected,
  isSpeaking,
  onOpenAbout,
}) => {
  return (
    <header className="border-b border-[#E8DFC8]/60 bg-[#FBF9F5]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Name */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wide text-[#1E1A17]">
              MEÏSSANE GOMA KABISI
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-sans font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EFE8DC] text-[#786C5E] border border-[#DFD3C0]">
              <Sparkles className="w-3 h-3 text-[#A3583C]" />
              Voice AI
            </span>
          </div>
          <p className="text-xs sm:text-sm font-serif italic text-[#786C5E] tracking-normal">
            Assistant Vocal Interactif — <span className="font-semibold text-[#1E1A17] not-italic">Meï</span>
          </p>
        </div>

        {/* Right side status & language accents */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language badges */}
          <div className="hidden md:flex items-center gap-2 bg-[#F5EFE4] px-3 py-1 rounded-full border border-[#E4D8C4] text-xs text-[#574E45]">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
              Français (Accent FR)
            </span>
            <span className="text-[#C4B7A4]">/</span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
              English (American Accent)
            </span>
          </div>

          {/* Real-time status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-sans border border-[#E2D5C1] bg-[#F7F2E8]">
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                isSpeaking
                  ? "bg-[#A3583C] animate-ping"
                  : isLiveConnected
                  ? "bg-emerald-600"
                  : "bg-[#9A8D7E]"
              }`}
            />
            <span className="font-medium text-[#423A31] hidden xs:inline">
              {isSpeaking
                ? "Meï s'exprime..."
                : isLiveConnected
                ? "En direct (Live API)"
                : "Prête à échanger"}
            </span>
          </div>

          {onOpenAbout && (
            <button
              onClick={onOpenAbout}
              className="text-xs font-sans underline underline-offset-4 text-[#786C5E] hover:text-[#1E1A17] transition-colors"
            >
              À propos
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
