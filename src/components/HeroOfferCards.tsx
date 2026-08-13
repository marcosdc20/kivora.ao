import React from 'react';
import { Users, BookOpen, GraduationCap, School } from 'lucide-react';

const STATS = [
  {
    icon: <Users className="w-5 h-5" />,
    value: '5.000+',
    label: 'Alunos Geridos',
    color: 'text-brand-gold',
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    value: '120+',
    label: 'Turmas Activas',
    color: 'text-brand-green',
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    value: '8',
    label: 'Módulos do Sistema',
    color: 'text-blue-400',
  },
  {
    icon: <School className="w-5 h-5" />,
    value: '30+',
    label: 'Escolas Parceiras',
    color: 'text-purple-400',
  },
];

interface HeroOfferCardsProps {
  onNavigate?: (page: string) => void;
}

export const HeroOfferCards: React.FC<HeroOfferCardsProps> = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
      {STATS.map((stat, i) => (
        <div
          key={i}
          className="glass-card rounded-xl px-4 py-4 flex flex-col items-center gap-2 border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/15 transition-all duration-300 group cursor-default"
        >
          <div className={`${stat.color} transition-transform duration-300 group-hover:scale-110`}>
            {stat.icon}
          </div>
          <span className="text-xl font-extrabold text-white">{stat.value}</span>
          <span className="text-[11px] font-semibold text-gray-300 text-center leading-tight">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};
