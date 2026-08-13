// ============================
// Kivora – Tipos do Sistema Escolar & Gestão
// ============================

export interface Student {
  id: string;
  name: string;
  photo: string;
  grade: string;        // ex: "8ª Classe"
  classRoom: string;    // ex: "Turma A"
  shift: 'Manhã' | 'Tarde' | 'Noite';
  enrollmentStatus: 'Matriculado' | 'Pendente' | 'Trancado' | 'Concluído';
  enrollmentYear: number;
  age: number;
  guardian: string;
  guardianPhone: string;
  averageGrade?: number;
  attendancePercent?: number;
  subjects?: string[];
}

export interface SchoolModule {
  id: string;
  title: string;
  shortDesc: string;
  description: string;
  icon: string;         // nome do ícone Lucide
  color: string;        // classe Tailwind de cor de fundo do ícone
  features: string[];
  benefits: string[];
  image: string;
  badge?: string;
}

export interface ClassRoom {
  id: string;
  name: string;         // ex: "8ª A Manhã"
  grade: string;        // ex: "8ª Classe"
  shift: 'Manhã' | 'Tarde' | 'Noite';
  teacher: string;
  teacherPhoto: string;
  studentCount: number;
  maxCapacity: number;
  room: string;
  schedule: string[];
  subjects: string[];
  image: string;
}

export interface Teacher {
  id: string;
  name: string;
  photo: string;
  role: string;
  subjects: string[];
  experience: string;
  qualification: string;
  email: string;
  bio: string;
}

export interface NewsPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Comunicado' | 'Evento' | 'Notícia' | 'Aviso';
  date: string;
  author: string;
  image: string;
  tags: string[];
}

export interface FinancialPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
  ctaLabel: string;
}

export interface DifferentialItem {
  icon: string;
  title: string;
  description: string;
}
