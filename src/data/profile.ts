export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  missions: string[];
  tag?: string;
}

export interface Education {
  institution: string;
  degree: string;
  location: string;
  details: string[];
}

export interface SkillCategory {
  name: string;
  level: number;
  highlight: string;
}

export const PROFILE_DATA = {
  fullName: "MEÏSSANE GOMA KABISI",
  assistantName: "Meï",
  title: "Marketing & Communication Specialist",
  subtitle: "Étudiante en Marketing | Stratégie d'Influence, Branding & Digital",
  location: "Paris, France",
  email: "meissane.gomakabisi@email.com",
  contactEmail: "meissanegoma@gmail.com",
  phone: "06 12 34 56 78",
  linkedin: "linkedin.com/in/meissane-goma-kabisi",
  bio: "Étudiante dynamique et créative en École de Commerce à Paris, spécialisée en marketing digital, stratégie d'influence multiculturelle et branding. Dotée d'une double sensibilité linguistique et culturelle (Français natif & Anglais américain bilingue), je conçois des campagnes engageantes axées sur le ROI et l'impact de marque.",
  
  languages: [
    {
      name: "Français",
      level: "Langue maternelle",
      accent: "Accent français parisien élégant",
      code: "fr-FR",
      flag: "🇫🇷",
    },
    {
      name: "English",
      level: "Bilingue & Professionnel",
      accent: "American Accent (fluent & articulate)",
      code: "en-US",
      flag: "🇺🇸",
    },
  ],

  competences: [
    { name: "Marketing Digital", level: 95, highlight: "Stratégies 360°, acquisition et fidélisation" },
    { name: "Stratégie d'Influence", level: 95, highlight: "Ciblage talents, négociation & briefs créatifs" },
    { name: "Branding & Storytelling", level: 90, highlight: "Positionnement de marque et identité éditoriale" },
    { name: "Social Media & Content", level: 92, highlight: "Production créative, calendriers éditoriaux" },
    { name: "Reporting KPIs & Data", level: 88, highlight: "Analyse d'engagement, ROI et recommandations" },
  ] as SkillCategory[],

  experiences: [
    {
      company: "THE SAUCE",
      role: "Marketing & Communication Assistant",
      period: "2021 – 2022",
      location: "Paris / Remote",
      tag: "Influence & International",
      missions: [
        "Définition et déploiement de stratégies de contenu ciblées pour une audience Franco-Camerounaise et diaspora.",
        "Gestion intégrale de campagnes d'influence de bout en bout avec des créateurs locaux et internationaux.",
        "Suivi rigoureux des KPIs clés (reach, impressions, conversions) et reporting analytique régulier.",
      ],
    },
    {
      company: "PUBLICIS",
      role: "Assistant Marketing & Chef de Projet",
      period: "Paris",
      location: "Paris, France",
      tag: "Agence de premier rang",
      missions: [
        "Participation à l'élaboration de stratégies de communication et de contenu pour des marques référentes.",
        "Gestion et activation de campagnes de marketing d'influence avec des créateurs prescripteurs.",
        "Analyse de performance concurrentielle, benchmark des tendances et synthèse des métriques d'impact.",
      ],
    },
    {
      company: "REACT NOW",
      role: "Membre Actif puis Manager",
      period: "2020 – 2022",
      location: "Paris, France",
      tag: "Engagement & Management",
      missions: [
        "Responsable de la coordination opérationnelle d'événements et de la communication globale.",
        "Mobilisation et gestion d'équipes de bénévoles autour de projets à fort impact.",
        "Conception de supports visuels et animation des réseaux sociaux de l'association.",
      ],
    },
  ] as Experience[],

  education: [
    {
      institution: "École de Commerce, Paris",
      degree: "Master / Programme Grande École — Marketing & Communication",
      location: "Paris, France",
      details: [
        "Spécialisation en Stratégies Digitales, Comportement du consommateur et Brand Management.",
        "Gestion de projets d'équipe et études de cas réels d'entreprises.",
      ],
    },
  ] as Education[],

  suggestedQuestions: [
    {
      labelFr: "Présente-toi et ton parcours",
      labelEn: "Introduce yourself and your background",
      query: "Bonjour Meï, présente-toi et résume le parcours de Meïssane en marketing.",
      lang: "fr",
    },
    {
      labelFr: "Expérience chez Publicis",
      labelEn: "Publicis experience",
      query: "Tell me about your role at Publicis and how you managed influencer marketing campaigns.",
      lang: "en",
    },
    {
      labelFr: "Stratégie Franco-Camerounaise chez The Sauce",
      labelEn: "The Sauce & African Diaspora Market",
      query: "Comment as-tu développé les stratégies de contenu pour The Sauce ciblant le public Franco-Camerounais ?",
      lang: "fr",
    },
    {
      labelFr: "Switch to English (American Accent)",
      labelEn: "Speak with American accent",
      query: "Switch to English and tell me what drives your passion for brand strategy in your American accent.",
      lang: "en",
    },
    {
      labelFr: "Compétences clés & Outils",
      labelEn: "Key skills & KPIs",
      query: "Quels sont tes points forts en matière d'analyse de KPIs et de retour sur investissement d'influence ?",
      lang: "fr",
    },
  ],
};
