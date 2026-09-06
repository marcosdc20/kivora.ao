/**
 * KivoraAssistantBot.tsx
 * Atendimento Virtual & Suporte Oficial KIVORA ERP
 * Flutuante no canto inferior direito do site, responde a dúvidas de visitantes 24/7
 * sobre AGT, modo 100% offline, planos, preços, parceiros e demonstrações.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Headphones,
  User,
  RotateCcw,
  ChevronDown,
  Loader2,
  ShieldCheck,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import {
  ChatMessage,
  AIAssistantConfig,
  subscribeAIAssistantConfig,
  sendChatMessage,
  DEFAULT_AI_CONFIG,
} from '../services/aiAssistantService';

interface KivoraAssistantBotProps {
  onNavigatePage?: (page: any) => void;
  onOpenDemoModal?: (subject?: string) => void;
}

const QUICK_PROMPTS = [
  'Quais são os planos e preços?',
  'O Kivora é certificado pela AGT?',
  'O sistema funciona sem internet?',
  'Como funcionam as 2 licenças a crédito para parceiros?',
  'Quero agendar uma demonstração',
];

export const KivoraAssistantBot: React.FC<KivoraAssistantBotProps> = ({
  onNavigatePage,
  onOpenDemoModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<AIAssistantConfig>(DEFAULT_AI_CONFIG);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscrever configurações do Firestore
  useEffect(() => {
    const unsub = subscribeAIAssistantConfig(setConfig);
    return () => unsub();
  }, []);

  // Inicializar mensagem de boas-vindas profissional e institucional
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            config.welcomeMessage ||
            'Olá! Bem-vindo ao suporte e atendimento oficial do KIVORA ERP. Como podemos ajudar a sua empresa hoje? Pode consultar sobre certificação AGT (Decreto 71/25), funcionamento 100% offline em rede local (LAN), planos de preços ou o nosso programa oficial de parceiros.',
          timestamp: Date.now(),
        },
      ]);
    }
  }, [config.welcomeMessage]);

  // Rolar para o fundo sempre que chegarem novas mensagens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focar no input ao abrir
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setIsTyping(true);

    try {
      const replyText = await sendChatMessage(messages, text);
      const assistantMsg: ChatMessage = {
        id: 'asst_' + Date.now(),
        role: 'assistant',
        content: replyText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (!isOpen) setHasUnread(true);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content:
          'Ocorreu uma breve instabilidade temporária na consulta. Por favor tente novamente ou fale diretamente com a nossa equipa comercial pelo WhatsApp (+244 947 888 333).',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        role: 'assistant',
        content:
          config.welcomeMessage ||
          'Conversa reiniciada. Em que podemos ajudar a sua empresa?',
        timestamp: Date.now(),
      },
    ]);
  };

  // Renderizador limpo e elegante de Markdown
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-900">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Bullet points
          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            const clean = line.replace(/^[•-]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#FF6500] font-black shrink-0 mt-0.5">•</span>
                <span className="text-slate-900">{renderInlineText(clean)}</span>
              </div>
            );
          }

          return <p key={idx} className="text-slate-900">{renderInlineText(line)}</p>;
        })}
      </div>
    );
  };

  const renderInlineText = (text: string) => {
    // Negrito: **texto**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-slate-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  if (config.enabled === false) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end font-sans">
      {/* ─── JANELA DE CHAT EXPANDIDA ─── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Atendimento Oficial Kivora"
          className="mb-3 w-[calc(100vw-2rem)] sm:w-[390px] md:w-[420px] h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-150"
        >
          {/* Cabeçalho do Chat — Cor Sólida Corporativa, Alto Contraste */}
          <div className="bg-[#0B192C] text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-[#FF6500] text-white flex items-center justify-center shadow-xs">
                  <Headphones className="w-5 h-5" strokeWidth={2.2} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0B192C]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-white tracking-tight">
                    Atendimento Kivora
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Suporte Oficial & Certificação AGT</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reiniciar conversa"
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimizar janela"
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100/70">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-[#FF6500] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Headphones className="w-4 h-4" strokeWidth={2.2} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3.5 shadow-xs ${
                    m.role === 'user'
                      ? 'bg-[#1746A2] text-white rounded-tr-xs font-medium'
                      : 'bg-white text-slate-900 border border-slate-300 rounded-tl-xs'
                  }`}
                >
                  {m.role === 'user' ? (
                    <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                      {m.content}
                    </p>
                  ) : (
                    renderFormattedContent(m.content)
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#FF6500] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Headphones className="w-4 h-4" strokeWidth={2.2} />
                </div>
                <div className="bg-white border border-slate-300 rounded-xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" />
                  <span
                    className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugestões de Perguntas Rápidas (Chips) */}
          <div className="px-3 py-2 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {onOpenDemoModal && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenDemoModal('Pedido de Demonstração via Atendimento KIVORA');
                }}
                className="text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg px-2.5 py-1 shrink-0 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Calendar className="w-3 h-3 text-amber-800" />
                <span>Agendar Demo</span>
              </button>
            )}
            {onNavigatePage && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigatePage('pricing');
                }}
                className="text-[11px] font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg px-2.5 py-1 shrink-0 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3 text-blue-800" />
                <span>Tabela de Preços</span>
              </button>
            )}
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isTyping}
                className="text-[11px] font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg px-2.5 py-1 shrink-0 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Campo de Entrada de Mensagem */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escreva a sua dúvida sobre o KIVORA ERP..."
              disabled={isTyping}
              className="flex-1 bg-slate-100 text-slate-900 placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:bg-white border border-slate-300 focus:border-blue-600 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-[#FF6500] hover:bg-[#E05900] active:scale-95 text-white flex items-center justify-center shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
              title="Enviar mensagem"
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}

      {/* ─── BOTÃO FLUTUANTE LAUNCHER (SÓLIDO, ALTO CONTRASTE, SEM GRADIENTE) ─── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex items-center gap-2.5 bg-[#0B192C] hover:bg-[#07111E] text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-slate-900/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-slate-700 cursor-pointer"
        aria-label="Atendimento e Suporte Kivora"
      >
        <div className="relative flex items-center justify-center">
          <div className="w-7 h-7 rounded-lg bg-[#FF6500] text-white flex items-center justify-center shadow-xs shrink-0">
            {isOpen ? (
              <X className="w-4 h-4" strokeWidth={2.5} />
            ) : (
              <MessageSquare className="w-4 h-4" strokeWidth={2.2} />
            )}
          </div>
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0B192C]" />
          )}
        </div>

        <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white select-none">
          {isOpen ? 'Fechar Atendimento' : 'Precisa de Ajuda?'}
        </span>

        {hasUnread && !isOpen && (
          <span className="w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>
    </div>
  );
};

