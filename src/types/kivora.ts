export type ModuleCategory =
  | 'faturacao'
  | 'pos'
  | 'financas'
  | 'stock'
  | 'rh'
  | 'contabilidade'
  | 'multiloja';

export interface KivoraModule {
  id: string;
  title: string;
  shortDesc: string;
  description: string;
  category: ModuleCategory;
  icon: string;
  color: string;
  badge?: string;
  image: string;
  features: string[];
  benefits: string[];
  agtSpec?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  target: string;
  priceAOA: string;
  billingPeriod: string;
  popular?: boolean;
  features: string[];
  icon: string;
  badge?: string;
}

export interface AGTRuleInfo {
  code: string;
  title: string;
  description: string;
  legalReference: string;
}

export interface KivoraFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface NewsPost {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string[];
  image: string;
  author: string;
  readTime: string;
}

export interface SoftwareRelease {
  version: string;
  date: string;
  fileSize: string;
  architecture: string;
  os: string;
  downloadUrl: string;
  changelog: string[];
}

export interface InstallationStep {
  stepNumber: string;
  title: string;
  description: string;
  icon: string;
}

export interface ResourceGuide {
  id: string;
  title: string;
  category: 'instalacao' | 'rede' | 'backup' | 'fiscalidade' | 'licencas';
  readTime: string;
  summary: string;
  steps: string[];
}
