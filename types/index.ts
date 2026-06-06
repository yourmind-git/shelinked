export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface CareerProfileData {
  currentRole: string;
  industry: string;
  yearsExperience: number;
  leadershipExp: string;
  careerGoals: string;
  desiredRole: string;
}

export interface AssessmentAnswer {
  questionId: string;
  answer: number;
}

export interface AssessmentResultData {
  leadershipScore: number;
  promotionReadiness: string;
  strengths: string[];
  growthAreas: string[];
  recommendedNextRole: string;
  summary: string;
}

export interface RoadmapData {
  currentSituation: string;
  threeMonthPlan: string;
  sixMonthPlan: string;
  twelveMonthPlan: string;
  skillsToDevelop: string[];
  networkingStrategy: string;
  promotionStrategy: string;
  successMetrics: string[];
}

export type MentorPersona =
  | "executive-leader"
  | "product-leader"
  | "startup-founder"
  | "agile-coach";

export const MENTOR_PERSONAS: Record<
  MentorPersona,
  { label: string; description: string; icon: string }
> = {
  "executive-leader": {
    label: "Executive Leader",
    description: "C-suite veteran with 20+ years leading large organizations",
    icon: "🏛️",
  },
  "product-leader": {
    label: "Product Leader",
    description: "VP of Product with deep expertise in product strategy",
    icon: "🚀",
  },
  "startup-founder": {
    label: "Startup Founder",
    description: "Serial entrepreneur who has built and scaled startups",
    icon: "💡",
  },
  "agile-coach": {
    label: "Agile Coach",
    description: "Expert in Agile, Scrum, and organizational transformation",
    icon: "⚡",
  },
};
