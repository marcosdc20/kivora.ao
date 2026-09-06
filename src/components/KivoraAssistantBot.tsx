/**
 * KivoraAssistantBot.tsx
 * Bot Assistente Virtual de IA Oficial do KIVORA ERP
 * Flutuante no canto inferior direito do site, responde a dúvidas de visitantes 24/7
 * sobre AGT, offline, planos, preços, parceiros, demonstrações e contactos.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
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

  // Inicializar mensagem de boas-vindas
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content:
            config.welcomeMessage ||
            'Olá! Sou o Assistente Virtual Oficial do KIVORA ERP. Como posso ajudar o seu negócio hoje? Pode perguntar sobre certificação AGT, funcionamento 100% offline, planos de preços ou o nosso programa de parceiros com licenças a crédito.',
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
          'Lamento, ocorreu uma breve instabilidade na resposta. Por favor tente novamente ou contacte o nosso WhatsApp comercial (+244 947 888 333).',
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
          'Conversa reiniciada! Em que posso ajudar a sua empresa agora?',
        timestamp: Date.now(),
      },
    ]);
  };

  // Renderizador simples e elegante de Markdown
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Bullet points
          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            const clean = line.replace(/^[•-]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-orange-500 font-bold shrink-0 mt-0.5">•</span>
                <span>{renderInlineText(clean)}</span>
              </div>
            );
          }

          return <p key={idx}>{renderInlineText(line)}</p>;
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
    <div className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end">
      {/* ─── JANELA DE CHAT EXPANDIDA ─── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Assistente Virtual Kivora"
          className="mb-3 w-[calc(100vw-2rem)] sm:w-[380px] md:w-[410px] h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        >
          {/* Cabeçalho do Chat */}
          <div className="bg-gradient-to-r from-slate-950 via-[#0F172A] to-[#1746A2] text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6500] to-amber-400 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold tracking-tight">
                    KIVORA Assistente
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    IA 24/7
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Especialista em Faturação AGT
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reiniciar conversa"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimizar assistente"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FF6500] to-amber-400 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
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
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FF6500] to-amber-400 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                  <span
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugestões de Perguntas Rápidas (Chips) */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {onOpenDemoModal && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenDemoModal('Pedido de Demonstração via Assistente KIVORA');
                }}
                className="text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full px-3 py-1 shrink-0 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Calendar className="w-3 h-3 text-amber-600" />
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
                className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full px-3 py-1 shrink-0 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3 text-blue-600" />
                <span>Ver Preços</span>
              </button>
            )}
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isTyping}
                className="text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-full px-3 py-1 shrink-0 transition-colors cursor-pointer"
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
              placeholder="Escreva a sua dúvida sobre o KIVORA..."
              disabled={isTyping}
              className="flex-1 bg-slate-100 text-slate-900 placeholder:text-slate-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white border border-transparent focus:border-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#FF6500] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
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

      {/* ─── BOTÃO FLUTUANTE LAUNCHER ─── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-slate-950 via-[#0F172A] to-[#1746A2] text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-2xl hover:shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
        aria-label="Abrir assistente de inteligência artificial"
      >
        <div className="relative">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FF6500] to-amber-400 flex items-center justify-center text-white shadow-xs">
            {isOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            )}
          </div>
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-ping" />
          )}
        </div>

        <span className="hidden sm:inline font-extrabold text-xs tracking-tight">
          {isOpen ? 'Fechar Assistente' : 'Dúvidas? Fale com a IA'}
        </span>

        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>
    </div>
  );
};
