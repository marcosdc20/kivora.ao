import React, { useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import { ArrowRight, Mail, Phone, MessageCircle } from 'lucide-react';
import { KIVORA_INFO } from '../data/kivoraData';

interface SuportePageProps {
  initialSubject?: string;
}

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

export const SuportePage: React.FC<SuportePageProps> = () => {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">

      <div className="pt-16">
        <PageHero
          image="/imagens/imagem2.png"
          tag="Suporte Técnico"
          title="Estamos aqui para ajudar"
          sub="Equipa técnica disponível para instalações, configurações de rede local e resolução de problemas."
        />
      </div>

      <section className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <MessageCircle className="w-6 h-6" strokeWidth={1.75} />,
              title: 'Chat ao Vivo & WhatsApp',
              desc: 'Resposta imediata em dias úteis das 08h às 18h.',
              action: 'Iniciar WhatsApp',
              href: KIVORA_INFO.whatsapp,
              color: 'blue',
            },
            {
              icon: <Mail className="w-6 h-6" strokeWidth={1.75} />,
              title: 'Email de Suporte',
              desc: `${KIVORA_INFO.supportEmail} — resposta em até 4 horas úteis.`,
              action: 'Enviar Email',
              href: `mailto:${KIVORA_INFO.supportEmail}`,
              color: 'slate',
            },
            {
              icon: <Phone className="w-6 h-6" strokeWidth={1.75} />,
              title: 'Linha Telefónica',
              desc: `${KIVORA_INFO.phoneDisplay} — Segunda a Sexta, 08h–17h30.`,
              action: 'Ligar Agora',
              href: `tel:${KIVORA_INFO.phoneRaw}`,
              color: 'slate',
            },
          ].map((item, i) => (
            <div
              key={i}
              data-reveal
              className="sr-init bg-white border border-slate-200 rounded-3xl p-8 flex flex-col gap-5 hover:shadow-lg hover:border-slate-300 transition-all"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${
                item.color === 'blue' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-slate-950 mb-1.5">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
              <a
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`inline-flex items-center gap-2 font-bold text-sm group ${
                  item.color === 'blue' ? 'text-blue-600 hover:text-blue-800' : 'text-slate-700 hover:text-slate-950'
                } transition-colors`}
              >
                <span>{item.action}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 border-t border-slate-100 py-20 px-6 sm:px-10 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div data-reveal className="sr-init mb-10">
            <h2 className="text-2xl font-black text-slate-950">Perguntas Frequentes</h2>
          </div>
          <div className="space-y-5">
            {[
              { q: 'O KIVORA funciona sem internet?', a: 'Sim. O sistema foi desenhado para funcionar 100% offline. A ligação à internet apenas é necessária para comunicação com o portal AGT e ativação de licença.' },
              { q: 'Posso instalar em vários computadores?', a: 'Sim, em modo Rede Local. Um PC funciona como servidor central e os restantes ligam-se a ele por LAN.' },
              { q: 'Como faço backup dos dados?', a: 'O KIVORA permite backup automático para pasta local ou Pen USB com um clique. Recomendamos backups diários.' },
              { q: 'O suporte inclui visitas ao local?', a: 'Sim, para planos Ilimitados e por contratação separada para planos Mensal e Anual. Consulte os técnicos.' },
            ].map((faq, i) => (
              <div key={i} data-reveal className="sr-init border-b border-slate-200 pb-5" style={{ transitionDelay: `${i * 60}ms` }}>
                <h4 className="font-bold text-slate-900 mb-1.5">{faq.q}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
