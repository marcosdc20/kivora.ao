import React, { useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import { ArrowRight, CheckCircle2, Users } from 'lucide-react';

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('sr-visible'); obs.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

interface ParceirosPageProps {
  onNavigatePage?: (page: any) => void;
}

export const ParceirosPage: React.FC<ParceirosPageProps> = ({ onNavigatePage }) => {
  useScrollReveal();

  const handleGoCandidatura = () => {
    if (onNavigatePage) {
      onNavigatePage('candidatura-parceiro');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">

      <div className="pt-16">
        <PageHero
          image="/imagens/servidor.png"
          tag="Programa de Parceiros"
          title="Revenda o KIVORA e cresça com nós"
          sub="Torne-se distribuidor oficial da Visual Software e lucre com cada licença vendida na sua região."
        />
      </div>

      {/* Benefícios */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div data-reveal className="sr-init mb-12">
          <h2 className="text-3xl font-black text-slate-950">Por que ser parceiro KIVORA?</h2>
          <p className="text-slate-500 text-sm mt-2">Benefícios exclusivos para distribuidores e revendedores certificados.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { title: 'Preços de Atacado & Margem Livre', desc: 'Preços especiais de custo com liberdade total para definir o preço de venda ao cliente e maximizar o seu lucro.' },
            { title: 'Material de Marketing', desc: 'Acesso a brochuras, apresentações e material promocional com a sua marca.' },
            { title: 'Suporte Técnico Prioritário', desc: 'Canal de suporte exclusivo para parceiros com SLA de 2 horas de resposta.' },
            { title: 'Formação Certificada', desc: 'Formação técnica e comercial gratuita para a sua equipa de vendas e suporte.' },
          ].map((b, i) => (
            <div key={i} data-reveal className="sr-init border border-slate-200 rounded-2xl p-6 hover:border-blue-400/40 hover:shadow-md transition-all" style={{ transitionDelay: `${i * 80}ms` }}>
              <CheckCircle2 className="w-5 h-5 text-blue-600 mb-3" strokeWidth={2} />
              <h3 className="font-black text-slate-950 mb-1">{b.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Formulário / CTA */}
      <section className="bg-slate-950 py-20 px-6 sm:px-10 lg:px-16">
        <div data-reveal className="sr-init max-w-3xl mx-auto text-center text-white space-y-6">
          <Users className="w-10 h-10 text-blue-400 mx-auto" strokeWidth={1.5} />
          <h2 className="text-3xl font-black">Candidate-se ao Programa de Parceiros</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">
            Aceda à página exclusiva de candidatura com todos os requisitos oficiais e formulário de credenciamento.
          </p>
          <button
            onClick={handleGoCandidatura}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5"
          >
            <span>Enviar Candidatura Oficial</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </section>

    </div>
  );
};
