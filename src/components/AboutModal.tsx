import React from "react";
import { X, Sparkles, Volume2, Globe, Check, Award, Mail } from "lucide-react";
import { PROFILE_DATA } from "../data/profile";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF7F0] border border-[#E4D8C4] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#786C5E] hover:text-[#1E1A17] hover:bg-[#EFE7D8] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2 border-b border-[#E4D8C4] pb-4">
          <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#A3583C] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spécifications de l'Assistant Vocal</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E1A17]">
            À propos de Meï
          </h3>
          <p className="text-xs sm:text-sm font-serif italic text-[#706456]">
            Incarnation vocale et digitale de Meïssane GOMA KABISI
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm font-serif text-[#423A31] leading-relaxed">
          <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E9DFCE] space-y-2">
            <h4 className="font-semibold text-[#1E1A17] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#A3583C]" />
              Directives Vocales & Linguistiques
            </h4>
            <ul className="space-y-1.5 pl-2">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-700 mt-1 flex-shrink-0" />
                <span>
                  <strong>Français :</strong> Parle avec un accent français naturel, articulé, chaleureux et professionnel.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-700 mt-1 flex-shrink-0" />
                <span>
                  <strong>Anglais :</strong> Parle avec un accent américain fluide et confiant ("American accent").
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-700 mt-1 flex-shrink-0" />
                <span>
                  <strong>Bilinguisme dynamique :</strong> L'assistante s'adapte en temps réel à la langue de l'utilisateur ou bascule sur simple demande.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E9DFCE] space-y-2">
            <h4 className="font-semibold text-[#1E1A17] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#A3583C]" />
              Parcours de Meïssane GOMA KABISI
            </h4>
            <p>
              Étudiante en Master Marketing & Communication en École de Commerce à Paris. Expériences probantes chez <strong>The Sauce</strong> (marché Franco-Camerounais et marketing d'influence) et en agence chez <strong>Publicis</strong> (stratégies de marque et influence créative).
            </p>
          </div>

          <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E9DFCE] space-y-1 text-xs">
            <h4 className="font-semibold text-[#1E1A17] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#A3583C]" />
              Coordonnées de Contact
            </h4>
            <p>Email pro : {PROFILE_DATA.email}</p>
            <p>Localisation : {PROFILE_DATA.location}</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#1E1A17] hover:bg-[#38332E] text-[#FAF7F0] px-6 py-2.5 rounded-xl font-sans text-xs font-medium transition-colors"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};
