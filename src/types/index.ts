export interface Reference {
  id: string;
  title: string;
  source: string;
  url: string;
  year: number;
  accessed: string;
}

export type SupplementCategory =
  | 'protein'
  | 'amino-acid'
  | 'creatine'
  | 'stimulant'
  | 'electrolyte'
  | 'pre-workout'
  | 'mass-gainer'
  | 'other';

export type GoalType =
  | 'muscle-gain'
  | 'fat-loss'
  | 'strength'
  | 'endurance'
  | 'recovery'
  | 'general-health';

export type EvidenceLevel = 'strong' | 'moderate' | 'limited' | 'insufficient';

export interface Supplement {
  id: string;
  slug: string;
  nameTH: string;
  nameEN: string;
  category: SupplementCategory;
  goals: GoalType[];
  shortDescription: string;
  fullDescription: string;
  howItWorks: string;
  benefits: { title: string; description: string }[];
  limitations: string[];
  suitableFor: string[];
  notNecessaryFor: string[];
  usage: {
    dosage: string;
    timing: string;
    method: string;
    dailyRequired: boolean;
    notes: string;
  };
  sideEffects: {
    name: string;
    description: string;
    severity: 'mild' | 'moderate' | 'severe';
  }[];
  precautions: string[];
  interactions: string[];
  evidenceSummary: string;
  evidenceLevel: EvidenceLevel;
  references: Reference[];
  lastReviewed: string;
  icon: string;
  color: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  readingTime: number;
  publishedAt: string;
  references: Reference[];
}

export interface Goal {
  id: string;
  slug: string;
  nameTH: string;
  icon: string;
  description: string;
  nutritionBasics: string[];
  relatedSupplements: string[];
  supplementReasons: { slug: string; reason: string }[];
  warnings: string[];
  color: string;
}
