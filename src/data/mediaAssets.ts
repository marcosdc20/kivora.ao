/**
 * Catálogo Central de Mídias, Imagens, GIFs e Ilustrações do KIVORA ERP
 * Organizado por categorias para uso consistente em todo o site e portais.
 */

export interface MediaItem {
  id: string;
  title: string;
  category: 'branding' | 'hero' | 'modulos' | 'setores' | 'hardware' | 'fiscal';
  url: string;
  alt: string;
  description?: string;
}

export const KIVORA_MEDIA = {
  // ─── LOGOS & IDENTIDADE VISUAL ─────────────────────────────────────────────
  branding: {
    logoTransparent: '/imagens/logo_sem_fundo.png',
    logoWhiteBg: '/imagens/logo_fundo_branco.png',
    logoOfficial: '/imagens/logo_kivora.png',
    logoSquare: '/logo.png',
  },

  // ─── HERO, TELAS DE SOFTWARE & DEMONSTRAÇÃO ────────────────────────────────
  screens: {
    loginScreen: '/imagens/imagem para a tela de loguin.png',
    erpDashboard: '/imagens/imagem.png',
    posTerminal: '/imagens/imagem2.png',
    installerPack: '/imagens/pacote.png',
    installerDisc: '/imagens/pacote-de-instalação-com-disco.png',
    networkServer: '/imagens/servidor.png',
  },

  // ─── SETORES DE ATIVIDADE & FOTOGRAFIAS REAIS ──────────────────────────────
  sectors: {
    supermarketPos: '/imagens/2148708903.jpg',
    retailStore: '/imagens/2149153824.jpg',
    pharmacyMed: '/imagens/13608.jpg',
    pharmacyCounter: '/imagens/13608 (1).jpg',
    restaurantBar: '/imagens/2150690165.jpg',
    cafeFastFood: '/imagens/2149272217.jpg',
    corporateOffice: '/imagens/1085.jpg',
    accountingConsultancy: '/imagens/1163.jpg',
    businessMeeting: '/imagens/2148892516.jpg',
    warehouseLogistics: '/imagens/2151696448.jpg',
    stockInventory: '/imagens/46908.jpg',
    financialAnalytics: '/imagens/136227.jpg',
    executiveLeadership: '/imagens/9169.jpg',
  },

  // ─── MÓDULOS KIVORA ERP ───────────────────────────────────────────────────
  modules: {
    faturacao: {
      image: '/imagens/136227.jpg',
      badge: 'AGT Certificado',
      caption: 'Emissão ágil de faturas, proformas e notas de crédito com assinatura SHA-256.',
    },
    pos: {
      image: '/imagens/2148708903.jpg',
      badge: 'Frente de Caixa',
      caption: 'Operação ultra-rápida compatível com impressoras térmicas 80mm/58mm e gavetas.',
    },
    stock: {
      image: '/imagens/2151696448.jpg',
      badge: 'Inventário Real',
      caption: 'Controlo de lotes, datas de validade, armazéns múltiplos e alertas de rutura.',
    },
    rh: {
      image: '/imagens/2148892516.jpg',
      badge: 'Salários & IRT',
      caption: 'Processamento de salários, mapas de IRT, Segurança Social (INSS) e folhas de férias.',
    },
    contabilidade: {
      image: '/imagens/1163.jpg',
      badge: 'PGC Angola',
      caption: 'Lançamentos automáticos a partir da faturação, balancetes e balanços fiscais.',
    },
    restauracao: {
      image: '/imagens/2150690165.jpg',
      badge: 'Mesas & Cozinha',
      caption: 'Gestão visual de mesas, pedidos para impressora de cozinha e divisão de contas.',
    },
  },
};

/**
 * Helper para obter a imagem de destaque de um módulo pelo ID
 */
export function getModuleImage(moduleId: string): string {
  switch (moduleId) {
    case 'faturacao':
      return KIVORA_MEDIA.modules.faturacao.image;
    case 'pos':
      return KIVORA_MEDIA.modules.pos.image;
    case 'stock':
      return KIVORA_MEDIA.modules.stock.image;
    case 'rh':
      return KIVORA_MEDIA.modules.rh.image;
    case 'contabilidade':
      return KIVORA_MEDIA.modules.contabilidade.image;
    case 'restauracao':
      return KIVORA_MEDIA.modules.restauracao.image;
    default:
      return KIVORA_MEDIA.screens.erpDashboard;
  }
}
