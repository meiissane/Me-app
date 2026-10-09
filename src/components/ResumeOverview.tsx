import React from "react";
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  Globe,
  Award,
  ArrowUpRight,
  Volume2,
} from "lucide-react";
import { PROFILE_DATA } from "../data/profile";

interface ResumeOverviewProps {
  onAskQuestion: (query: string) => void;
  isSpeaking: boolean;
}

export const ResumeOverview: React.FC<ResumeOverviewProps> = ({
  onAskQuestion,
  isSpeaking,
}) => {
  return (
    <section className="bg-[#FAF7F0] border border-[#E8DFC8] rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden transition-all">
      {/* Editorial Decorative watermark */}
      <div className="absolute right-4 top-2 text-[120px] font-serif font-bold text-[#EBE2CF]/40 pointer-events-none select-none -z-0">
        CV
      </div>

      <div className="relative z-10 space-y-10">
        {/* Top Header Card mimicking the resume identity */}
        <div className="border-b border-[#E4D8C4] pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-sans tracking-widest text-[#A3583C] uppercase font-semibold">
              Curriculum Vitae & Dossier Professionnel
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1E1A17] tracking-tight">
              {PROFILE_DATA.fullName}
            </h2>
            <p className="text-sm sm:text-base font-serif italic text-[#63584B]">
              {PROFILE_DATA.subtitle}
            </p>

            {/* Contact details */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 text-xs font-sans text-[#706456]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#A3583C]" />
                {PROFILE_DATA.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#A3583C]" />
                {PROFILE_DATA.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#A3583C]" />
                {PROFILE_DATA.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#A3583C]" />
                Paris / International
              </span>
            </div>
          </div>

          {/* Quick Voice Trigger Banner */}
          <div className="bg-[#F2ECE0] p-4 rounded-xl border border-[#DFD3BE] max-w-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1E1A17]">
              <Volume2 className="w-4 h-4 text-[#A3583C]" />
              <span>Interagir avec Meï</span>
            </div>
            <p className="text-xs text-[#5C5247] font-serif leading-relaxed">
              Toutes les rubriques ci-dessous peuvent être commentées et approfondies à la voix par l'assistante Meï, en français ou en américain.
            </p>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="space-y-3">
          <h3 className="font-serif text-xl font-semibold text-[#1E1A17] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A3583C]" />
            Profil & Vision Professionnelle
          </h3>
          <p className="text-sm sm:text-base text-[#4A4237] font-serif leading-relaxed bg-[#FDFBF7] p-5 rounded-xl border border-[#ECE2D2]">
            {PROFILE_DATA.bio}
          </p>
        </div>

        {/* Main Grid: Experiences & Education / Compétences */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Experiences (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between border-b border-[#E4D8C4] pb-2">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1E1A17] flex items-center gap-2.5">
                <Briefcase className="w-5 h-5 text-[#A3583C]" />
                Expériences Professionnelles
              </h3>
            </div>

            <div className="space-y-6">
              {PROFILE_DATA.experiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="group bg-[#FDFBF7] hover:bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E9DFCE] transition-all duration-200 hover:shadow-md hover:border-[#DACBB4]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-lg sm:text-xl font-semibold text-[#1E1A17]">
                          {exp.company}
                        </h4>
                        {exp.tag && (
                          <span className="text-[10px] uppercase font-sans font-medium px-2 py-0.5 rounded-full bg-[#EFE8DA] text-[#6E6152] border border-[#DECDB7]">
                            {exp.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-serif italic text-[#786C5E]">
                        {exp.role} • <span className="font-sans not-italic text-[#5C5246]">{exp.period}</span> ({exp.location})
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        onAskQuestion(
                          `Meï, peux-tu me détailler les missions et les résultats obtenus par Meïssane chez ${exp.company} ?`
                        )
                      }
                      title="Écouter les détails vocaux"
                      className="p-2 rounded-lg bg-[#F5EFE3] hover:bg-[#EAE0CE] text-[#706456] hover:text-[#1E1A17] transition-colors"
                    >
                      <Volume2 className="w-4 h-4 text-[#A3583C]" />
                    </button>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs sm:text-sm text-[#4E453A] font-serif">
                    {exp.missions.map((mission, mIdx) => (
                      <li key={mIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A3583C] mt-2 flex-shrink-0" />
                        <span>{mission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Formation, Compétences, Langues (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Formation */}
            <div className="space-y-4">
              <div className="border-b border-[#E4D8C4] pb-2">
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1E1A17] flex items-center gap-2.5">
                  <GraduationCap className="w-5 h-5 text-[#A3583C]" />
                  Formation
                </h3>
              </div>

              <div className="bg-[#FDFBF7] p-5 rounded-xl border border-[#E9DFCE] space-y-3">
                {PROFILE_DATA.education.map((edu, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="font-serif text-lg font-semibold text-[#1E1A17]">
                      {edu.institution}
                    </h4>
                    <p className="text-xs sm:text-sm font-serif italic text-[#786C5E]">
                      {edu.degree}
                    </p>
                    <p className="text-xs text-[#8C7E6E] font-sans">{edu.location}</p>
                    <ul className="pt-2 space-y-1 text-xs text-[#52493E] font-serif">
                      {edu.details.map((detail, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-[#A3583C] mt-1.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Compétences Clés */}
            <div className="space-y-4">
              <div className="border-b border-[#E4D8C4] pb-2 flex items-center justify-between">
                <h3 className="font-serif text-xl font-semibold text-[#1E1A17] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#A3583C]" />
                  Compétences Clés
                </h3>
                <span className="text-[11px] font-sans text-[#786C5E]">Expertise</span>
              </div>

              <div className="bg-[#FDFBF7] p-5 rounded-xl border border-[#E9DFCE] space-y-4">
                {PROFILE_DATA.competences.map((comp, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-serif font-medium text-[#1E1A17] text-sm">
                        {comp.name}
                      </span>
                      <span className="font-sans text-[11px] text-[#786C5E] font-semibold">
                        {comp.level}%
                      </span>
                    </div>
                    {/* Minimalist elegant progress bar */}
                    <div className="h-1.5 w-full bg-[#EAE1D1] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#A3583C] rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${comp.level}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#7A6E5E] font-serif italic">
                      {comp.highlight}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Langues & Accents */}
            <div className="space-y-4">
              <div className="border-b border-[#E4D8C4] pb-2">
                <h3 className="font-serif text-xl font-semibold text-[#1E1A17] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#A3583C]" />
                  Langues & Accents Vocaux
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PROFILE_DATA.languages.map((lang, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E9DFCE] space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{lang.flag}</span>
                      <h5 className="font-serif font-semibold text-[#1E1A17]">
                        {lang.name}
                      </h5>
                    </div>
                    <p className="text-xs font-sans text-[#786C5E]">{lang.level}</p>
                    <p className="text-[11px] font-serif italic text-[#A3583C]">
                      {lang.accent}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
