import { KivoraModule, PricingPlan, AGTRuleInfo, KivoraFaq, NewsPost, SoftwareRelease, InstallationStep, ResourceGuide } from '../types/kivora';

// ============================
// INFORMAÇÕES DA EMPRESA E SOFTWARE KIVORA
// ============================
export const KIVORA_INFO = {
  name: 'Kivora',
  fullName: 'Kivora – Sistema de Gestão Empresarial & Faturação Eletrónica AGT',
  company: 'Visual Software',
  tagline: 'Faturação e gestão empresarial diretamente no seu computador com base de dados local',
  agtCertificate: 'Programa Validado nº XXX/AGT/2026',
  phone: '+244 923 456 789',
  phoneRaw: '244923456789',
  phoneDisplay: '+244 923 456 789',
  email: 'comercial@kivora.ao',
  supportEmail: 'suporte@kivora.ao',
  address: 'Luanda, Angola – Atendimento Presencial & Assistência Técnica',
  whatsapp: 'https://wa.me/244923456789',
  facebook: 'https://facebook.com/kivora.ao',
  instagram: 'https://instagram.com/kivora.ao',
  website: 'https://kivora.ao',
  officialLogo: '/imagens/logo_kivora.png',
  logoSemFundo: '/imagens/logo_sem_fundo.png',
  heroDashboardImage: '/imagens/imagem.png',
  appOverviewImage: '/imagens/imagem2.png',
  packageBoxImage: '/imagens/pacote.png',
  installerDiskImage: '/imagens/pacote-de-instalação-com-disco.png',
  cloudServerImage: '/imagens/servidor.png',
  loginScreenImage: '/imagens/imagem para a tela de loguin.png',
};

// ============================
// DADOS DO DOWNLOAD DO KIVORA SETUP (DESKTOP)
// ============================
export const CURRENT_RELEASE: SoftwareRelease = {
  version: '2026.08.13',
  date: '13 de Agosto de 2026',
  fileSize: '48.5 MB',
  architecture: '64 bits (x64)',
  os: 'Windows 10 / 11 / Windows Server',
  downloadUrl: '/imagens/pacote-de-instalação-com-disco.png',
  changelog: [
    'Atualização das tabelas fiscais de IRT e retenção de INSS 2026',
    'Melhorias no motor de numeração sequencial de séries da AGT',
    'Otimização do desempenho da base de dados local em rede LAN',
    'Suporte aprimorado para impressoras térmicas de recibos de 58mm e 80mm',
    'Exportação direta do ficheiro SAF-T (AO) sem erros de validação',
  ],
};

export const RELEASE_HISTORY: SoftwareRelease[] = [
  CURRENT_RELEASE,
  {
    version: '2026.07.20',
    date: '20 de Julho de 2026',
    fileSize: '46.2 MB',
    architecture: '64 bits',
    os: 'Windows 10/11',
    downloadUrl: '#',
    changelog: [
      'Validação automática de NIF no cadastro de clientes',
      'Novos mapas de relatórios de caixa e fecho diário cego',
      'Ajustes na assinatura digital criptográfica RS256',
    ],
  },
  {
    version: '2026.06.10',
    date: '10 de Junho de 2026',
    fileSize: '45.0 MB',
    architecture: '64 bits',
    os: 'Windows 10/11',
    downloadUrl: '#',
    changelog: [
      'Melhoria na sincronização de stock inter-filiais',
      'Suporte para leitor de código de barras em modo POS rápido',
    ],
  },
];

// ============================
// PASSOS DE INSTALAÇÃO & ATIVAÇÃO (01-05)
// ============================
export const INSTALLATION_STEPS: InstallationStep[] = [
  {
    stepNumber: '01',
    title: 'Baixe o Kivora Setup',
    description: 'Faça download do ficheiro instalador oficial para Windows no computador da sua empresa.',
    icon: 'Download',
  },
  {
    stepNumber: '02',
    title: 'Instale no Computador',
    description: 'Execute o Setup e siga o assistente rápido de instalação em menos de 2 minutos.',
    icon: 'HardDrive',
  },
  {
    stepNumber: '03',
    title: 'Configure a Sua Empresa',
    description: 'Cadastre a denominação da empresa, NIF, dados de faturação, utilizadores e produtos.',
    icon: 'Settings',
  },
  {
    stepNumber: '04',
    title: 'Ative a Licença',
    description: 'Introduza a chave de licença fornecida pela Visual Software ou pelo seu parceiro revendedor.',
    icon: 'Key',
  },
  {
    stepNumber: '05',
    title: 'Comece a Faturar',
    description: 'Utilize o Kivora localmente com total independência e velocidade na sua loja ou escritório.',
    icon: 'FileCheck',
  },
];

// ============================
// ARGUMENTOS DE BASE DE DADOS LOCAL & REDE LAN
// ============================
export const LOCAL_DB_ARGUMENTS = [
  {
    title: '🔒 Dados Ficam na Sua Empresa',
    description: 'A base de dados é mantida no ambiente físico da sua empresa. Você mantém a posse e privacidade total das suas vendas.',
    icon: 'Database',
  },
  {
    title: '⚡ Funcionamento Ultra-Rápido',
    description: 'Sem tempos de espera de carregamento de páginas web. Abertura instantânea de ecrãs e emissão de recibos em milissegundos.',
    icon: 'Zap',
  },
  {
    title: '📡 Resiliência sem Depender de Internet',
    description: 'Realize as operações diárias de caixa, vendas e stock sem interrupções mesmo quando os serviços de telecomunicações falham.',
    icon: 'WifiOff',
  },
  {
    title: '💾 Copias de Segurança Locais',
    description: 'Faça backup automático da sua base de dados para um disco externo, pen drive USB ou servidor da rede local.',
    icon: 'Save',
  },
];

// ============================
// MÓDULOS DE GESTÃO DO ERP KIVORA
// ============================
export const KIVORA_MODULES: KivoraModule[] = [
  {
    id: 'faturacao-agt',
    title: 'Faturação Eletrónica AGT',
    shortDesc: 'Emissão de Facturas, Recibos e Notas com validação digital e conformidade AGT.',
    description: 'Sistema 100% alinhado com a Especificação Técnica DS.120 da AGT. Emita Facturas, Facturas-Recibo, Recibos, Notas de Crédito, Notas de Débito e Guias de Transporte com código QR, numeração em série autorizada e assinatura digital RS256.',
    category: 'faturacao',
    icon: 'FileCheck',
    color: 'bg-[#2563EB]/10 text-blue-600',
    badge: 'Certificado AGT',
    image: '/imagens/imagem.png',
    features: [
      'Assinatura Digital RS256 e validação local prévia',
      'Impressão oficial com QR Code e menção legal AGT',
      'Séries automáticas autorizadas pela AGT',
      'Modo de Contingência automático de 45 dias sem parar vendas',
      'Retenções na fonte (IRT, II, IS, IVA) automáticas',
      'Emissão de Factura, FT, FR, NC, ND, RC, GT e Proformas',
    ],
    benefits: [
      'Elimina o risco de coimas fiscais e não-conformidade',
      'Emissão rápida em menos de 3 segundos',
      'Submissão segura sem dependência permanente da internet',
    ],
    agtSpec: 'Conforme Decreto Presidencial n.º 71/25 e Norma Técnica DS.120 SETIC-FP/AGT.',
  },
  {
    id: 'pos-multicaixa',
    title: 'Ponto de Venda (POS) Local',
    shortDesc: 'Vendas ultra-rápidas ao balcão com suporte a impressoras térmicas e gavetas.',
    description: 'Um Ponto de Venda intuitivo projetado para alta rotatividade em lojas, restaurantes, supermercados e farmácias. Funciona diretamente no computador local e abre gavetas e impressoras térmicas.',
    category: 'pos',
    icon: 'ShoppingCart',
    color: 'bg-emerald-500/10 text-emerald-600',
    badge: 'Vendas Locais',
    image: '/imagens/imagem2.png',
    features: [
      'Interface tátil rápida para vendas ao balcão',
      'Integração com gavetas de dinheiro e leitor de código de barras',
      'Impressão direta em impressoras térmicas de talões (58mm e 80mm)',
      'Fecho de Caixa cego e abertura por operador com fundo de maneio',
      'Aceita múltiplos meios de pagamento (Multicaixa, Transferência, Numerário)',
      'Operação contínua local sem paragens por quebra de sinal',
    ],
    benefits: [
      'Agilidade no atendimento e fim das filas no balcão',
      'Controlo total de sangrias e entradas de caixa',
      'Operação resiliente e imune a instabilidades da internet',
    ],
  },
  {
    id: 'gestao-financeira',
    title: 'Gestão Financeira & Tesouraria',
    shortDesc: 'Contas a pagar/receber, conciliação bancária e fluxo de caixa em Kwanzas e divisas.',
    description: 'Tenha total controlo sobre a saúde financeira do seu negócio. Acompanhe entradas e saídas, gerencie pagamentos a fornecedores, cobranças de clientes e retenções fiscais.',
    category: 'financas',
    icon: 'TrendingUp',
    color: 'bg-indigo-500/10 text-indigo-600',
    image: '/imagens/imagem.png',
    features: [
      'Contas a Pagar e a Receber com alertas de vencimento',
      'Gestão de Bancos, Caixas e Conciliação Bancária',
      'Fluxo de Caixa projetado e em tempo real',
      'Controlo de Retenção na Fonte de 6.5% e imposto de selo',
      'Suporte Multimoeda (AOA, USD, EUR) com taxa de câmbio atualizável',
      'Relatórios detalhados de pendências financeiras por cliente',
    ],
    benefits: [
      'Visão clara do lucro real da empresa',
      'Redução da inadimplência com avisos automáticos',
      'Gestão rigorosa de liquidez e tesouraria',
    ],
  },
  {
    id: 'gestao-stock',
    title: 'Gestão de Stock & Armazéns',
    shortDesc: 'Controlo de inventário, lotes, validades e transferências entre armazéns.',
    description: 'Gestão precisa de produtos e inventário em tempo real na base de dados local. Evite rutura de stock, controle datas de validade de produtos perecíveis e gira transferências.',
    category: 'stock',
    icon: 'Boxes',
    color: 'bg-amber-500/10 text-amber-600',
    image: '/imagens/136227.jpg',
    features: [
      'Multiarmazém com saldo individual e consolidado',
      'Controlo de Lotes e Prazos de Validade',
      'Alertas automáticos de Stock Mínimo e Ponto de Encomenda',
      'Fichas técnicas de produtos e artigos compostos',
      'Guias de Transferência entre lojas com código de acompanhamento',
      'Inventário físico com ajuste rápido de quebras e contagens',
    ],
    benefits: [
      'Fim dos prejuízos por perda de validade de mercadorias',
      'Rastreabilidade total desde a compra ao fornecedor até à venda',
      'Stock sempre otimizado e correto',
    ],
  },
  {
    id: 'recursos-humanos',
    title: 'Recursos Humanos & Salários 2026',
    shortDesc: 'Processamento salarial em Angola com tabelas atualizadas de IRT e INSS.',
    description: 'Módulo especialista de RH ajustado à legislação laboral angolana. Calcule vencimentos, IRT 2026, INSS (3% trabalhador / 8% empresa), subsídios de alimentação e transporte com regras de isenção fiscal.',
    category: 'rh',
    icon: 'Users',
    color: 'bg-[#2563EB]/10 text-blue-600',
    badge: 'Legislação 2026',
    image: '/imagens/2149153824.jpg',
    features: [
      'Processamento automático da folha de salários',
      'Cálculo exato de IRT 2026 e escalões progressivos',
      'Cálculo automático de INSS (Trabalhador e Entidade Empregadora)',
      'Gestão de Subsídios (Alimentação, Transporte, Natal, Férias)',
      'Emissão de Recibos de Vencimento em PDF e Mapa de Salários',
      'Gerador de Ficheiro bancário para pagamento de salários por lote',
    ],
    benefits: [
      'Processamento de salários em minutos em vez de dias',
      'Conformidade integral com o MAPTSS e AGT',
      'Emissão direta de guias para liquidação de impostos',
    ],
  },
  {
    id: 'contabilidade-saft',
    title: 'Contabilidade PGC & SAF-T AO',
    shortDesc: 'Plano Geral de Contabilidade de Angola e exportação do ficheiro auditável SAF-T AO.',
    description: 'Automatize a sua contabilidade empresarial. Gerencie o Plano Geral de Contabilidade de Angola (PGC-AO), emita Balancetes, Demonstração de Resultados e exporte o SAF-T AO sem erros de validação pela AGT.',
    category: 'contabilidade',
    icon: 'ShieldCheck',
    color: 'bg-emerald-500/10 text-emerald-600',
    badge: 'SAF-T AO 100%',
    image: '/imagens/46908.jpg',
    features: [
      'Exportação do Ficheiro Mensal e Anual SAF-T (AO)',
      'Plano Geral de Contabilidade de Angola (PGC-AO) pré-carregado',
      'Lançamentos contabilísticos automáticos a partir das facturas',
      'Balancete Razão, Balancete Analítico e Diários Contabilísticos',
      'Relatórios para submissão do Modelo 1 e Modelo 2 da AGT',
      'Pista de auditoria e integridade de dados inalterável',
    ],
    benefits: [
      'Simplifica a prestação de contas aos contabilistas e à AGT',
      'Exportação rápida do SAF-T em segundos',
      'Dados fiscais totalmente auditáveis e blindados',
    ],
  },
];

// ============================
// OPÇÕES DE LICENÇAS KIVORA
// ============================
export const KIVORA_PLANS: PricingPlan[] = [
  {
    id: 'mensal',
    name: 'Licença Mensal / Standalone',
    target: 'Para 1 Computador isolado em pequenas lojas ou escritórios',
    priceAOA: 'Sob Consulta',
    billingPeriod: 'por mês / por computador',
    icon: 'Monitor',
    features: [
      'Instalação no Computador da Empresa (BD Local)',
      '1 Licença de Computador ativada',
      'Faturação Eletrónica AGT Certificada',
      'Ponto de Venda (POS) com impressão térmica',
      'Exportação SAF-T AO Mensal',
      'Suporte Técnico por Telefone e WhatsApp em Luanda',
    ],
  },
  {
    id: 'anual',
    name: 'Licença Anual PME',
    target: 'Para empresas comerciais com necessidade de 2 a 5 computadores em Rede Local (LAN)',
    priceAOA: 'Mais Recomendado',
    billingPeriod: 'por ano / licença empresarial',
    popular: true,
    badge: 'Mais Vendido',
    icon: 'Network',
    features: [
      'Tudo da Licença Mensal',
      'Instalação em Rede Local LAN (PC Servidor + Caixas/Gerência)',
      'Até 5 Computadores ligados à mesma base de dados local',
      'Gestão de Stock, Lotes e Multiarmazém',
      'Retenções automáticas de IRT, II, IS e IVA',
      'Atualizações fiscais gratuitas durante a anuidade',
      'Suporte Técnico Prioritário Presencial e Remoto',
    ],
  },
  {
    id: 'ilimitada',
    name: 'Licença Ilimitada / Grandes Redes',
    target: 'Para médias e grandes empresas com múltiplos postos em rede e filiais',
    priceAOA: 'Personalizado',
    billingPeriod: 'licença definitiva / corporativa',
    icon: 'Building',
    features: [
      'Tudo da Licença Anual',
      'Postos e Computadores em Rede Local Ilimitados',
      'Módulo de RH & Processamento Salarial 2026',
      'Contabilidade Geral PGC Angola & Balancetes',
      'Configuração do Servidor da Empresa pela equipa técnica',
      'Formação presencial dos operadores e gestores',
      'Gestor de Conta Dedicado em Angola',
    ],
  },
];

// ============================
// RECURSOS & MANUAIS TÉCNICOS
// ============================
export const RESOURCE_GUIDES: ResourceGuide[] = [
  {
    id: 'guia-instalacao',
    title: 'Como Instalar o Kivora Setup no Windows',
    category: 'instalacao',
    readTime: '3 min',
    summary: 'Passo a passo detalhado para descarregar e executar o instalador no seu PC.',
    steps: [
      'Descarregue o ficheiro KIVORA_Setup_2026.exe na página de Downloads.',
      'Dê um duplo clique no ficheiro e aceite as permissões do Windows.',
      'Siga as instruções do assistente e escolha a pasta de instalação.',
      'Ao concluir, abra o ícone KIVORA no seu ambiente de trabalho.',
    ],
  },
  {
    id: 'guia-rede-lan',
    title: 'Como Configurar o Kivora em Rede Local (LAN)',
    category: 'rede',
    readTime: '5 min',
    summary: 'Aprenda a interligar os computadores de Caixa, Gerência e Administração ao PC Servidor.',
    steps: [
      'No PC Principal (Servidor), instale o Kivora e selecione "Modo Servidor com Base de Dados".',
      'Anote o Endereço IP local do computador principal (ex: 192.168.1.100).',
      'Nos computadores dos caixas e gerência, instale o Kivora e selecione "Modo Cliente de Rede".',
      'Introduza o IP do PC Principal para conectar os postos à mesma base de dados.',
    ],
  },
  {
    id: 'guia-backup',
    title: 'Como Fazer Backup e Restauração da Base de Dados Local',
    category: 'backup',
    readTime: '4 min',
    summary: 'Mantenha os seus dados seguros através de cópias de segurança em disco externo ou USB.',
    steps: [
      'Aceda ao menu Utilitários > Cópia de Segurança no Kivora.',
      'Selecione a pasta de destino (Pen Drive, Disco Externo ou pasta da rede).',
      'Clique em "Criar Backup Agora" para gerar o ficheiro encriptado .kivbak.',
      'Para restaurar em caso de troca de PC, utilize a opção "Restaurar Backup".',
    ],
  },
  {
    id: 'guia-saft-agt',
    title: 'Guia de Exportação do SAF-T (AO) para a AGT',
    category: 'fiscalidade',
    readTime: '3 min',
    summary: 'Como emitir o ficheiro XML mensal para submissão no Portal do Contribuinte.',
    steps: [
      'No final de cada mês, aceda ao menu Faturação > Exportar SAF-T (AO).',
      'Selecione o ano e o mês de referência.',
      'O Kivora valida a numeração das séries e assina o documento.',
      'Submeta o ficheiro gerado no Portal da AGT.',
    ],
  },
];

// ============================
// REGRAS FISCAIS AGT DE DESTAQUE
// ============================
export const AGT_RULES_INFO: AGTRuleInfo[] = [
  {
    code: 'DS.120 SETIC-FP',
    title: 'Faturação Eletrónica Homologada',
    description: 'O Kivora cumpre rigorosamente todos os requisitos de validação, formato JSON/XML e integração com os webservices da AGT.',
    legalReference: 'Decreto Presidencial n.º 71/25',
  },
  {
    code: 'RS256 & QR Code',
    title: 'Assinatura Digital & Código QR',
    description: 'Cada documento emitido contém assinatura criptográfica RS256 e QR Code verificado para autenticidade no Portal da AGT.',
    legalReference: 'Código do IVA & Regulamento da Faturação',
  },
  {
    code: 'Contingência 45 Dias',
    title: 'Emissão sem Interrupção',
    description: 'Caso a API da AGT ou a internet fique indisponível, o Kivora continua a emitir documentos com aviso de contingência e reenvia automaticamente.',
    legalReference: 'Especificação Técnica de Contingência AGT',
  },
  {
    code: 'IRT & INSS 2026',
    title: 'Legislação Laboral Atualizada',
    description: 'Cálculos de retenção de IRT por escalões progressivos de 2026 e contribuições de INSS (3% trabalhador / 8% empresa).',
    legalReference: 'Tabelas Fiscais de Rendimento do Trabalho 2026',
  },
];

// ============================
// PERGUNTAS FREQUENTES (FAQ)
// ============================
export const KIVORA_FAQS: KivoraFaq[] = [
  {
    id: 'faq-1',
    category: 'Geral',
    question: 'Onde fica armazenada a base de dados do Kivora?',
    answer: 'A base de dados fica armazenada no computador ou servidor local da sua empresa. Você mantém total privacidade, controlo e velocidade no acesso aos seus dados sem depender de servidores remotos de terceiros.',
  },
  {
    id: 'faq-2',
    category: 'Rede',
    question: 'Posso utilizar o Kivora em múltiplos computadores na minha loja ou escritório?',
    answer: 'Sim! Através do Modo Rede Local (LAN), pode definir um computador principal como servidor da base de dados e conectar os computadores dos caixas, gerência, administração e armazém na mesma rede física.',
  },
  {
    id: 'faq-3',
    category: 'Internet',
    question: 'O Kivora necessita de internet para faturar no dia a dia?',
    answer: 'Não. O Kivora foi desenvolvido para funcionar localmente, permitindo realizar as principais operações de vendas, caixa e emissão de documentos mesmo quando não existe ligação à Internet.',
  },
  {
    id: 'faq-4',
    category: 'Instalação',
    question: 'Como funciona a ativação da licença após descarregar o Setup?',
    answer: 'Após descarregar e instalar o Kivora no seu computador, insira a chave de licença que recebe na Área do Cliente ou através do seu parceiro revendedor. O License Manager do Kivora ativa o sistema imediatamente.',
  },
  {
    id: 'faq-5',
    category: 'Contabilidade',
    question: 'Como é gerado o ficheiro SAF-T (AO)?',
    answer: 'Com apenas um clique no menu do Kivora, o sistema compila todas as séries, documentos comerciais e cadastros do mês num ficheiro XML SAF-T (AO) 100% válido para submissão no Portal do Contribuinte da AGT.',
  },
  {
    id: 'faq-6',
    category: 'Suporte',
    question: 'Como funciona a formação de utilizadores e o suporte técnico em Angola?',
    answer: 'A nossa equipa em Luanda e os nossos parceiros revendedores autorizados oferecem suporte telefónico, remoto e presencial, além de auxílio na configuração inicial da empresa e impressoras térmicas.',
  },
];

// ============================
// NOTÍCIAS & ATUALIZÇÕES DA KIVORA
// ============================
export const KIVORA_NEWS: NewsPost[] = [
  {
    id: 'faturacao-eletronica-angola-2026',
    title: 'Faturação Eletrónica em Angola: O que muda com o Decreto Presidencial n.º 71/25',
    date: '10 de Fevereiro de 2026',
    category: 'Legislação Fiscal',
    excerpt: 'Entenda as principais exigências da AGT para a obrigatoriedade da faturação eletrónica e como manter o seu programa local em conformidade.',
    content: [
      'A Administração Geral Tributária (AGT) intensificou a transição para a Faturação Eletrónica obrigatória em Angola. O novo quadro regulatório exige que os softwares emitam documentos com assinatura digital e validação prévia de séries.',
      'Com o Kivora ERP instalado no seu computador, a sua empresa beneficia de automatização completa: desde a validação local até à emissão instantânea com QR Code.',
      'Evite bloqueios no NIF e multas fiscais garantindo que o seu sistema comercial atende a 100% dos requisitos legais.',
    ],
    image: '/imagens/9169.jpg',
    author: 'Equipa Fiscal Kivora',
    readTime: '4 min de leitura',
  },
  {
    id: 'pos-offline-para-supermercados',
    title: 'Como manter o Ponto de Venda a funcionar localmente em rede LAN',
    date: '02 de Janeiro de 2026',
    category: 'Tecnologia & POS',
    excerpt: 'Descubra como a arquitetura local do Kivora evita perda de faturação durante interrupções de internet em Luanda.',
    content: [
      'As quebras de conetividade à internet podem comprometer a operação de supermercados, farmácias e restaurantes. Para responder a este desafio, o Kivora foi arquitetado como um software local.',
      'O operador continua a registar vendas, imprimir recibos térmicos e abrir a gaveta sem interrupções. Todos os computadores do estabelecimento operam na rede local (LAN).',
    ],
    image: '/imagens/13608.jpg',
    author: 'Eng.º de Sistemas Visual Software',
    readTime: '3 min de leitura',
  },
];
