import React, { useState, useEffect } from 'react';
import {
  Video, Monitor, Maximize2, Minimize2,
  PhoneOff, Copy, Check, ExternalLink, ShieldCheck, Headphones,
  Share2, X
} from 'lucide-react';

export interface VideoConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName?: string;
  userName?: string;
  userRole?: 'cliente' | 'parceiro' | 'admin' | 'tecnico';
  ticketNumber?: string;
  companyName?: string;
}

export const VideoConferenceModal: React.FC<VideoConferenceModalProps> = ({
  isOpen,
  onClose,
  roomName,
  userName = 'Utilizador Kivora',
  userRole = 'cliente',
  ticketNumber,
  companyName = 'Kivora Angola'
}) => {
  const [provider, setProvider] = useState<'jitsi' | 'google_meet'>('jitsi');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callActive, setCallActive] = useState(false);

  // Gera nome de sala único e seguro baseado no ticket ou timestamp
  const sanitizedRoom = (roomName || `kivora-suporte-${ticketNumber ? ticketNumber.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : Date.now().toString().slice(-6)}`).toLowerCase();
  
  // URL Jitsi Meet 100% Gratuito sem registo
  const jitsiUrl = `https://meet.jit.si/${sanitizedRoom}#userInfo.displayName="${encodeURIComponent(userName)} (${userRole.toUpperCase()})"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.disableDeepLinking=true`;

  // URL Google Meet para abertura rápida alternativa
  const googleMeetUrl = `https://meet.google.com/new`;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOpen && callActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, callActive]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    const link = provider === 'jitsi' ? `https://meet.jit.si/${sanitizedRoom}` : googleMeetUrl;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const link = provider === 'jitsi' ? `https://meet.jit.si/${sanitizedRoom}` : googleMeetUrl;
    const msg = encodeURIComponent(
      `*KIVORA ERP — Convite de Videochamada de Assistência Remota*\n\n` +
      `Olá! Foi aberta uma sala de videoconferência para assistência técnica.\n` +
      `🏢 *Empresa:* ${companyName}\n` +
      `${ticketNumber ? `🎫 *Ticket:* ${ticketNumber}\n` : ''}` +
      `🔗 *Link da Videochamada:* ${link}\n\n` +
      `_Pode aceder pelo computador ou telemóvel com câmara, microfone e partilha de ecrã ativa._`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className={`bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-5xl h-[92vh] max-h-[850px]'
        }`}
      >
        {/* ── BARRA SUPERIOR (HEADER DA VIDEOCHAMADA) ── */}
        <div className="bg-slate-950/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Assistência Remota por Videochamada
                </h3>
                {callActive && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    EM DIRETO • {formatTime(callDuration)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {companyName} {ticketNumber ? `• Ticket ${ticketNumber}` : ''} • Sala: <span className="font-mono text-slate-300">{sanitizedRoom}</span>
              </p>
            </div>
          </div>

          {/* Ações Rápidas do Cabeçalho */}
          <div className="flex items-center gap-2">
            {/* Seletor de Provedor */}
            <div className="hidden sm:flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setProvider('jitsi')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  provider === 'jitsi'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Jitsi Integrado
              </button>
              <button
                onClick={() => setProvider('google_meet')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  provider === 'google_meet'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Google Meet
              </button>
            </div>

            {/* Copiar Link */}
            <button
              onClick={handleCopyLink}
              title="Copiar link da reunião"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 text-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden md:inline">{copied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>

            {/* Partilhar WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              title="Convidar via WhatsApp"
              className="p-2 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            {/* Maximizar / Ecrã Inteiro */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Sair de ecrã inteiro' : 'Ecrã inteiro'}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Fechar */}
            <button
              onClick={onClose}
              title="Fechar janela"
              className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── ÁREA PRINCIPAL DA VIDEOCONFERÊNCIA ── */}
        <div className="relative flex-1 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
          {provider === 'jitsi' ? (
            <div className="relative w-full h-full flex flex-col">
              {!callActive ? (
                /* Ecrã de Boas-Vindas antes de entrar na sala */
                <div className="m-auto max-w-md p-6 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-5 shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 mx-auto flex items-center justify-center">
                    <Headphones className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white">Sala de Assistência Pronta</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Sessão encriptada de ponta a ponta com suporte para áudio HD, câmara e <strong className="text-blue-400">partilha de ecrã</strong> para diagnóstico do KIVORA ERP.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-left space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Participante:</span>
                      <span className="font-semibold text-white">{userName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Perfil:</span>
                      <span className="uppercase font-bold text-blue-400">{userRole}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-500">Ferramenta:</span>
                      <span className="text-emerald-400 font-semibold">WebRTC HD Ilimitado</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 pt-2">
                    <button
                      onClick={() => setCallActive(true)}
                      className="w-full py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                    >
                      <Video className="w-4 h-4" />
                      <span>Entrar na Videochamada Agora</span>
                    </button>

                    <button
                      onClick={() => window.open(jitsiUrl, '_blank')}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Abrir em Nova Aba do Navegador</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Iframe Embutido da Reunião */
                <iframe
                  src={jitsiUrl}
                  title="Kivora Video Conference"
                  allow="camera; microphone; display-capture; autoplay; clipboard-write;"
                  className="w-full h-full border-0"
                />
              )}
            </div>
          ) : (
            /* Opção Alternativa: Google Meet */
            <div className="m-auto max-w-md p-6 bg-slate-900/90 border border-slate-800 rounded-2xl text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                <Video className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">Google Meet</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Inicie ou aceda a uma sala instantânea do Google Meet no seu navegador ou telemóvel.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1 text-left">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Compatível com Contas Google</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Ao clicar abaixo, será aberta uma nova sala do Google Meet onde pode partilhar o link com o técnico de suporte.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <a
                  href={googleMeetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Criar Sala no Google Meet</span>
                </a>

                <button
                  onClick={() => setProvider('jitsi')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Voltar ao Jitsi Integrado
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── BARRA INFERIOR DE INFORMAÇÕES & ATALHOS ── */}
        <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Monitor className="w-3.5 h-3.5 text-blue-400" />
              <span>Para partilhar o ecrã, clique no ícone de ecrã dentro da chamada.</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {callActive && (
              <button
                onClick={() => setCallActive(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Desconectar Chamada</span>
              </button>
            )}
            <span className="text-[11px] text-slate-500 font-mono">
              Suporte KIVORA 24/7
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
