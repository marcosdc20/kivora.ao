import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag, Search, Star,
  Truck, ArrowUpDown, X,
  ShieldCheck, Package, Trash2, Send
} from 'lucide-react';
import { PageId } from '../components/Header';
import { ProdutoDetailPage } from './ProdutoDetailPage';
import {
  subscribeToStoreProducts,
  createStoreOrder,
  getDeliveryRates,
  DEFAULT_DELIVERY_RATES
} from '../admin/services/storeService';
import { DeliveryRate } from '../admin/types';

// Importação Direta e Confiável das Imagens de Produto Padrão (Vite Asset Pipeline)
import posBundleImg from '../assets/products/pos_bundle_kit.jpg';
import printer80mmImg from '../assets/products/printer_80mm.jpg';
import scanner2dImg from '../assets/products/scanner_2d.jpg';
import posTouchTerminalImg from '../assets/products/pos_touch_terminal.jpg';
import cashDrawerImg from '../assets/products/cash_drawer.jpg';
import paperRollsImg from '../assets/products/paper_rolls.jpg';
import kivoraLogoImg from '../assets/logo.png';

interface LojaPageProps {
  onNavigatePage: (page: PageId) => void;
  onOpenDemo?: (item?: string) => void;
}

export interface StoreProduct {
  id: string;
  category: 'kits' | 'printers' | 'scanners' | 'terminals' | 'accessories' | 'licenses' | 'services';
  categoryLabel: string;
  name: string;
  brand: string;
  image: string;
  galleryImages: string[];
  priceAOA: number;
  originalPriceAOA?: number;
  discountPercent?: number;
  badge?: string;
  rating: number;
  reviewsCount: number;
  salesCount: number;
  shortDesc: string;
  specsTable: { label: string; value: string }[];
  inStock: boolean;
  stockLocation: string;
  warranty: string;
  sku: string;
  active?: boolean;
}

export const STORE_PRODUCTS: StoreProduct[] = [
  // ─── KITS COMPLETOS POS ───────────────────────────────────────────────────
  {
    id: 'kit-pro-pos',
    category: 'kits',
    categoryLabel: 'Kits Completos',
    name: 'Kit Ponto de Venda PRO 15.6" Touch + Impressora 80mm + Gaveta + Leitor',
    brand: 'KIVORA Bundle',
    image: posBundleImg,
    galleryImages: [
      posBundleImg,
      posTouchTerminalImg,
      printer80mmImg,
      cashDrawerImg,
    ],
    priceAOA: 750000,
    originalPriceAOA: 890000,
    discountPercent: 15,
    badge: 'Mais Vendido',
    rating: 4.9,
    reviewsCount: 48,
    salesCount: 142,
    shortDesc: 'Conjunto completo de hardware para caixa comercial. Inclui Terminal Touch 15.6", Impressora Térmica 80mm com guilhotina, Leitor Laser 2D e Gaveta Metálica RJ11.',
    specsTable: [
      { label: 'Terminal', value: 'Touch 15.6" Capacitivo Full HD, 8GB RAM, SSD 128GB' },
      { label: 'Impressora', value: 'Térmica 80mm USB/Rede, Corte Automático, 250 mm/s' },
      { label: 'Leitor', value: 'Imager 1D/2D QR Code com suporte automático' },
      { label: 'Gaveta', value: 'Aço pesado, 5 notas / 8 moedas, abertura RJ11' },
      { label: 'Software', value: 'Compatível com KIVORA ERP (Homologado AGT)' },
    ],
    inStock: true,
    stockLocation: 'Armazém Luanda (Pronto para entrega)',
    warranty: '12 Meses de Garantia Oficial',
    sku: 'KV-KIT-PRO-80',
    active: true,
  },
  {
    id: 'kit-express-pos',
    category: 'kits',
    categoryLabel: 'Kits Completos',
    name: 'Kit Periféricos de Caixa Express 80mm (Impressora + Gaveta + Leitor)',
    brand: 'KIVORA Start',
    image: posBundleImg,
    galleryImages: [
      posBundleImg,
      printer80mmImg,
      scanner2dImg,
      cashDrawerImg,
    ],
    priceAOA: 380000,
    originalPriceAOA: 440000,
    discountPercent: 13,
    badge: 'Oferta',
    rating: 4.8,
    reviewsCount: 31,
    salesCount: 88,
    shortDesc: 'Kit de periféricos essenciais para ligar ao seu computador ou portátil: Impressora Térmica 80mm, Gaveta metálica automática e Leitor de código de barras.',
    specsTable: [
      { label: 'Impressora', value: 'Térmica 80mm com Guilhotina USB/LAN' },
      { label: 'Leitor', value: 'Laser 1D/2D USB com Pedestal articulado' },
      { label: 'Gaveta', value: 'Metálica RJ11 com chave de segurança' },
      { label: 'Bobinas', value: 'Oferta de 10 rolos térmicos 80x80mm' },
    ],
    inStock: true,
    stockLocation: 'Armazém Luanda (Pronto para entrega)',
    warranty: '12 Meses de Garantia',
    sku: 'KV-KIT-EXP-80',
    active: true,
  },

  // ─── IMPRESSORAS TÉRMICAS ──────────────────────────────────────────────────
  {
    id: 'epson-tm-t20iii',
    category: 'printers',
    categoryLabel: 'Impressoras Térmicas',
    name: 'Impressora Térmica de Talões 80mm USB/Ethernet (Corte Automático)',
    brand: 'Epson / Star',
    image: printer80mmImg,
    galleryImages: [
      printer80mmImg,
      paperRollsImg,
    ],
    priceAOA: 165000,
    originalPriceAOA: 185000,
    discountPercent: 11,
    rating: 5.0,
    reviewsCount: 64,
    salesCount: 210,
    shortDesc: 'Impressora térmica comercial de alta velocidade (250 mm/s) para faturas e talões com QR Code fiscal AGT.',
    specsTable: [
      { label: 'Largura do Papel', value: '80mm e 58mm (com guia)' },
      { label: 'Velocidade', value: '250 mm/s' },
      { label: 'Conectividade', value: 'USB 2.0 + Ethernet (LAN) + RJ11' },
      { label: 'Corte', value: 'Guilhotina automática (1.5M cortes)' },
      { label: 'Resolução', value: '203 DPI' },
    ],
    inStock: true,
    stockLocation: 'Armazém Luanda',
    warranty: '12 Meses de Garantia',
    sku: 'KV-PRN-80-USB',
    active: true,
  },
  {
    id: 'xprinter-xp-80c',
    category: 'printers',
    categoryLabel: 'Impressoras Térmicas',
    name: 'Impressora Térmica Económica 80mm USB com Guilhotina',
    brand: 'Xprinter',
    image: printer80mmImg,
    galleryImages: [
      printer80mmImg,
      paperRollsImg,
    ],
    priceAOA: 95000,
    originalPriceAOA: 115000,
    discountPercent: 17,
    badge: 'Preço Baixo',
    rating: 4.7,
    reviewsCount: 42,
    salesCount: 175,
    shortDesc: 'Opção com excelente custo-benefício para balcão de retalho, restauração e lojas.',
    specsTable: [
      { label: 'Largura', value: '80mm' },
      { label: 'Velocidade', value: '160 mm/s' },
      { label: 'Conectividade', value: 'USB + Conexão Gaveta RJ11' },
      { label: 'Compatibilidade', value: 'Windows 10, 11 e KIVORA ERP' },
    ],
    inStock: true,
    stockLocation: 'Armazém Luanda',
    warranty: '12 Meses de Garantia',
    sku: 'KV-PRN-XP80',
    active: true,
  },

  // ─── LEITORES DE CÓDIGO DE BARRAS ──────────────────────────────────────────
  {
    id: 'honeywell-voyager-1400g',
    category: 'scanners',
    categoryLabel: 'Leitores de Código',
    name: 'Leitor de Código de Barras 1D/2D QR Code com Suporte Automático',
    brand: 'Honeywell / ScanPro',
    image: scanner2dImg,
    galleryImages: [
      scanner2dImg,
      posBundleImg,
    ],
    priceAOA: 95000,
    originalPriceAOA: 110000,
    discountPercent: 14,
    rating: 4.9,
    reviewsCount: 39,
    salesCount: 130,
    shortDesc: 'Leitor imager omnidirecional de alta precisão. Lê códigos de barras em papel e ecrãs de telemóvel.',
    specsTable: [
      { label: 'Tipo de Leitura', value: '1D (EAN-13, Code 128) e 2D (QR Code, DataMatrix)' },
      { label: 'Interface', value: 'USB Plug & Play (sem drivers)' },
      { label: 'Modo', value: 'Manual por gatilho ou automático no suporte' },
      { label: 'Resistência', value: 'Quedas até 1.5m em betão' },
    ],
    inStock: true,
    stockLocation: 'Armazém Luanda',
    warranty: '12 Meses de Garantia',
    sku: 'KV-SCN-2D-USB',
    active: true,
  },
  {
    id: 'zebra-ds2208',
    category: 'scanners',
    categoryLabel: 'Leitores de Código',
    name: 'Leitor Industrial 1D/2D de Longo Alcance USB',
    brand: 'Zebra DS',
    image: scanner2dImg,
    galleryImages: [
      scanner2dImg,
    ],
    priceAOA: 110000,
    rating: 5.0,
    reviewsCount: 27,
    salesCount: 94,
    shortDesc: 'Leitor robusto para ambientes de alta rotatividade, armazéns e supermercados com filas.',
    specsTable: [
      { label: 'Tecnologia', value: 'Imager Linear e 2D' },
      { label: 'Alcance', value: 'Até 36.8 cm de distância' },
      { label: 'Cabo', value: 'USB 2.0 blindado reforçado' },
    ],
    inStock: true,
    stockLocation: 'Armazém Luanda',
    warranty: '12 Meses de Garantia',
    sku: 'KV-SCN-ZB-2208',
    active: true,
  },

  // ─── TERMINAIS TOUCH POS ──────────────────────────────────────────────────
  {
    id: 'terminal-touch-pos-15',
    category: 'terminals',
    categoryLabel: 'Terminais Touch',
    name: 'Terminal All-in-One POS 15.6" Capacitivo True-Flat (Intel / 8GB / SSD)',
    brand: 'PosLab Pro',
    image: posTouchTerminalImg,
    galleryImages: [
      posTouchTerminalImg,
      posBundleImg,
    ],
    priceAOA: 495000,
    originalPriceAOA: 560000,
    discountPercent: 12,
    badge: 'Industrial',
    rating: 4.9,
    reviewsCount: 19,
    salesCount: 52,
    shortDesc: 'Computador integrado para ponto de venda com ecrã tátil industrial resistente a líquidos e pó.',
    specsTable: [
      { label: 'Ecrã', value: '15.6" True-Flat Touch Capacitivo Full HD' },
      { label: 'Processador', value: 'Intel Core i3 / Celeron Quad-Core Fanless' },
      { label: 'Memória & Armazenamento', value: '8GB RAM DDR4 + SSD 128GB M.2' },
      { label: 'Portas', value: '6x USB, 2x COM Serial, 1x LAN Gigabit, 1x VGA/HDMI' },
      { label: 'Construção', value: 'Base em alumínio fundido de alta estabilidade' },
    ],
    inStock: true,
    stockLocation: 'Armazém Luanda',
    warranty: '12 Meses de Garantia',
    sku: 'KV-POS-156-TOUCH',
    active: true,
  },

  // ─── GAVETAS & CONSUMÍVEIS ─────────────────────────────────────────────────
  {
    id: 'gaveta-dinheiro-rj11',
    category: 'accessories',
    categoryLabel: 'Gavetas & Consumíveis',
    name: 'Gaveta de Dinheiro Metálica Pesada RJ11 (5 Notas / 8 Moedas)',
    brand: 'KIVORA Safe',
    image: cashDrawerImg,
    galleryImages: [
      cashDrawerImg,
      posBundleImg,
    ],
    priceAOA: 65000,
    originalPriceAOA: 75000,
    discountPercent: 13,
    rating: 4.8,
    reviewsCount: 56,
    salesCount: 220,
    shortDesc: 'Gaveta em chapa de aço reforçada com abertura automática pela impressora de talões.',
    specsTable: [
      { label: 'Divisórias', value: '5 Compartimentos de notas com presilhas de metal + 8 para moedas' },
      { label: 'Fechadura', value: '3 Posições (Trancada, Automática, Abertura Manual)' },
      { label: 'Conexão', value: 'Cabo RJ11 para impressora térmica' },
      { label: 'Dimensões', value: '410mm x 420mm x 100mm' },
    ],
    inStock: true,
    stockLocation: 'Armazém Luanda',
    warranty: '12 Meses de Garantia',
    sku: 'KV-ACC-GAV-410',
    active: true,
  },
  {
    id: 'caixa-bobinas-80',
    category: 'accessories',
    categoryLabel: 'Gavetas & Consumíveis',
    name: 'Caixa de Bobinas Térmicas 80x80mm para Impressora (50 Rolos)',
    brand: 'KIVORA Paper',
    image: paperRollsImg,
    galleryImages: [
      paperRollsImg,
      printer80mmImg,
    ],
    priceAOA: 35000,
    rating: 4.9,
    reviewsCount: 88,
    salesCount: 450,
    shortDesc: 'Papel térmico de alta alvura e contraste. Preserva a cabeça térmica e garante leitura nítida de QR Code.',
    specsTable: [
      { label: 'Quantidade', value: 'Caixa com 50 Rolos' },
      { label: 'Medidas', value: '80mm de largura x 80 metros de comprimento' },
      { label: 'Qualidade', value: 'Papel térmico livre de BPA, gramagem 55g/m²' },
    ],
    inStock: true,
    stockLocation: 'Armazém Luanda',
    warranty: 'Garantia de Qualidade',
    sku: 'KV-ACC-BOB-80',
    active: true,
  },

  // ─── LICENÇAS KIVORA ───────────────────────────────────────────────────────
  {
    id: 'licenca-vitalicia',
    category: 'licenses',
    categoryLabel: 'Licenças de Software',
    name: 'Licença KIVORA ERP Vitalícia (5 Postos de Trabalho LAN)',
    brand: 'KIVORA ERP',
    image: kivoraLogoImg,
    galleryImages: [
      kivoraLogoImg,
    ],
    priceAOA: 650000,
    badge: 'Vitalícia',
    rating: 5.0,
    reviewsCount: 44,
    salesCount: 95,
    shortDesc: 'Software de faturação definitivo para Windows em rede local sem mensalidades. Inclui 5 computadores.',
    specsTable: [
      { label: 'Tipo', value: 'Licença Perpétua (Sem mensalidades)' },
      { label: 'Postos LAN', value: '5 Computadores em rede local incluídos' },
      { label: 'Homologação', value: 'Certificado AGT e SAF-T AO incluídos' },
    ],
    inStock: true,
    stockLocation: 'Entrega Imediata por Email / Chave Digital',
    warranty: 'Suporte e Atualizações Homologadas',
    sku: 'KV-LIC-VIT-5P',
    active: true,
  },
];

export const LojaPage: React.FC<LojaPageProps> = ({ onNavigatePage }) => {
  const [productsList, setProductsList] = useState<StoreProduct[]>(STORE_PRODUCTS);
  const [deliveryRates, setDeliveryRates] = useState<DeliveryRate[]>(DEFAULT_DELIVERY_RATES);
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'sales'>('featured');
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [cart, setCart] = useState<{ product: StoreProduct; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [deliveryProvince, setDeliveryProvince] = useState<string>('Luanda');
  const [companyName, setCompanyName] = useState<string>('');
  const [companyNif, setCompanyNif] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);

  // Sincronização em Tempo Real com o Firebase Firestore
  useEffect(() => {
    // Carregar taxas de entrega
    getDeliveryRates().then((rates) => {
      if (rates && rates.length > 0) setDeliveryRates(rates);
    });

    // Ouvinte em tempo real de produtos cadastrados no Firebase
    const unsubscribe = subscribeToStoreProducts((firebaseProds) => {
      if (firebaseProds && firebaseProds.length > 0) {
        const activeProds = firebaseProds
          .filter((p) => p.active !== false)
          .map((p) => ({
            id: p.id,
            category: p.category,
            categoryLabel: p.categoryLabel,
            name: p.name,
            brand: p.brand,
            image: p.image,
            galleryImages: p.galleryImages && p.galleryImages.length > 0 ? p.galleryImages : [p.image],
            priceAOA: p.priceAOA,
            originalPriceAOA: p.originalPriceAOA,
            discountPercent: p.discountPercent,
            badge: p.badge,
            rating: p.rating || 5.0,
            reviewsCount: p.reviewsCount || 1,
            salesCount: p.salesCount || 0,
            shortDesc: p.shortDesc,
            specsTable: p.specsTable || [],
            inStock: p.inStock ?? true,
            stockLocation: p.stockLocation || 'Armazém Luanda',
            warranty: p.warranty || '12 Meses',
            sku: p.sku || `KV-${p.id}`,
            active: p.active !== false,
          }));
        setProductsList(activeProds);
      }
    });

    return () => unsubscribe();
  }, []);

  const categories = [
    { id: 'todas', label: 'Todos os Produtos' },
    { id: 'kits', label: 'Kits Completos POS' },
    { id: 'printers', label: 'Impressoras Térmicas' },
    { id: 'scanners', label: 'Leitores de Código' },
    { id: 'terminals', label: 'Terminais Touch' },
    { id: 'accessories', label: 'Gavetas & Bobinas' },
    { id: 'services', label: 'Serviços & Instalação' },
    { id: 'licenses', label: 'Licenças Software' },
  ];

  // Filtragem e Ordenação dos Produtos
  const filteredProducts = useMemo(() => {
    let list = productsList.filter((p) => {
      const matchCat = selectedCategory === 'todas' || p.category === selectedCategory;
      const matchSearch = searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.priceAOA - b.priceAOA);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.priceAOA - a.priceAOA);
    } else if (sortBy === 'sales') {
      list.sort((a, b) => b.salesCount - a.salesCount);
    }

    return list;
  }, [productsList, selectedCategory, searchQuery, sortBy]);

  const addToCart = (product: StoreProduct, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.product.id === productId ? { ...item, quantity: qty } : item
    ));
  };

  const subtotalAOA = cart.reduce((sum, item) => sum + (item.product.priceAOA * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Taxa de entrega da província selecionada
  const selectedRate = deliveryRates.find(r => r.province === deliveryProvince) || deliveryRates[0];
  const deliveryFeeAOA = selectedRate ? selectedRate.feeAOA : 0;
  const totalWithDeliveryAOA = subtotalAOA + deliveryFeeAOA;

  const handleCheckoutWhatsApp = async () => {
    if (cart.length === 0) return;
    setSubmittingOrder(true);

    try {
      // 1. Registar automaticamente o pedido no Firebase Firestore
      const orderItems = cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        unitPriceAOA: item.product.priceAOA,
        quantity: item.quantity,
        subtotalAOA: item.product.priceAOA * item.quantity,
      }));

      const res = await createStoreOrder({
        clientName: companyName || 'Cliente da Loja Web',
        clientNif: companyNif || 'Consumidor Final',
        clientPhone: clientPhone || 'Não informado',
        deliveryProvince: deliveryProvince,
        deliveryFeeAOA,
        subtotalAOA,
        totalAOA: totalWithDeliveryAOA,
        status: 'pending',
        items: orderItems,
      });

      const orderRef = res.orderNumber || `KV-PED-${Date.now().toString().slice(-4)}`;

      // 2. Abrir mensagem pré-formatada no WhatsApp Oficial
      let msg = `*PEDIDO OFICIAL — LOJA KIVORA ERP*\n`;
      msg += `*Ref. Encomenda:* ${orderRef}\n\n`;
      if (companyName) msg += `*Empresa / Cliente:* ${companyName}\n`;
      if (companyNif) msg += `*NIF:* ${companyNif}\n`;
      if (clientPhone) msg += `*Contacto:* ${clientPhone}\n`;
      msg += `*Província de Entrega:* ${deliveryProvince} (Taxa: ${deliveryFeeAOA === 0 ? 'Grátis' : deliveryFeeAOA.toLocaleString('pt-AO') + ' Kz'})\n\n`;
      msg += `*ITENS ENCOMENDADOS:*\n`;

      cart.forEach((item, idx) => {
        msg += `${idx + 1}. ${item.product.name} (x${item.quantity}) — ${(item.product.priceAOA * item.quantity).toLocaleString('pt-AO')} Kz\n`;
      });

      msg += `\n*TOTAL A PAGAR:* ${totalWithDeliveryAOA.toLocaleString('pt-AO')} Kz\n\n`;
      msg += `Gostaria de confirmar a encomenda e receber a Fatura Proforma oficial para pagamento via Transferência Bancária / Multicaixa.`;

      const encoded = encodeURIComponent(msg);
      window.open(`https://wa.me/244923456789?text=${encoded}`, '_blank');
      setIsCartOpen(false);
    } catch (err) {
      console.error('Erro ao registar encomenda:', err);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Se um produto estiver selecionado, renderiza a Página de Detalhe do Produto
  if (selectedProduct) {
    const related = productsList.filter(
      p => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.category === 'kits')
    ).slice(0, 4);

    return (
      <ProdutoDetailPage
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onNavigatePage={onNavigatePage}
        onAddToCart={(prod, qty) => addToCart(prod, qty)}
        onSelectProduct={(prod) => {
          setSelectedProduct(prod);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        relatedProducts={related}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-24 pb-20">
      
      {/* ─── BARRA DE TOPO DO MARKETPLACE ─────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Campo de Pesquisa */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar impressoras 80mm, leitores 2D, kits, gavetas..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Ordenação e Carrinho */}
            <div className="flex items-center gap-3">
              
              {/* Seletor de Ordenação */}
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200/60">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Destaques</option>
                  <option value="sales">Mais Vendidos</option>
                  <option value="price_asc">Menor Preço</option>
                  <option value="price_desc">Maior Preço</option>
                </select>
              </div>

              {/* Botão Carrinho */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-4 py-2 bg-[#1d4ed8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Cotação</span>
                {totalItems > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                    {totalItems}
                  </span>
                )}
              </button>

            </div>

          </div>

          {/* Categorias Rápidas em Pílulas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 border-t border-slate-100 mt-3 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ─── CONTEÚDO PRINCIPAL: GRELHA DE PRODUTOS ─────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Banner Informativo de Entrega */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Entrega Rápida em Luanda</strong> em até 24h e envio diário para as outras 17 províncias de Angola.</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 shrink-0">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Todos os equipamentos com <strong>12 Meses de Garantia</strong>.</span>
          </div>
        </div>

        {/* Quantidade de Itens Encontrados */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500">
            Mostrando <strong>{filteredProducts.length}</strong> produtos homologados
          </p>
        </div>

        {/* Grelha de Produtos Estilo E-Commerce Autêntico */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mb-16">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => {
                setSelectedProduct(prod);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              <div>
                
                {/* Imagem do Produto em Fundo Branco Limpo */}
                <div className="aspect-square bg-white p-4 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                    onError={(e: any) => { e.target.src = '/imagens/pos_bundle_kit.jpg'; }}
                  />
                  {prod.discountPercent && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded">
                      -{prod.discountPercent}%
                    </span>
                  )}
                  {prod.badge && !prod.discountPercent && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded">
                      {prod.badge}
                    </span>
                  )}
                </div>

                {/* Dados do Produto */}
                <div className="p-3.5">
                  
                  {/* Preço em Kwanzas */}
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-700">Kz</span>
                    <span className="text-lg sm:text-xl font-black text-slate-900">
                      {prod.priceAOA.toLocaleString('pt-AO')}
                    </span>
                  </div>

                  {/* Preço Original Riscado */}
                  {prod.originalPriceAOA && (
                    <p className="text-[11px] text-slate-400 line-through -mt-1 mb-1.5">
                      {prod.originalPriceAOA.toLocaleString('pt-AO')} Kz
                    </p>
                  )}

                  {/* Nome do Produto (2 linhas) */}
                  <h3 className="text-xs sm:text-sm font-medium text-slate-800 line-clamp-2 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {prod.name}
                  </h3>

                  {/* Avaliação e Vendas */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                      {prod.rating}
                    </span>
                    <span>•</span>
                    <span>{prod.salesCount} vendidos</span>
                  </div>

                  {/* Selo de Envio */}
                  <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <Truck className="w-3 h-3 text-emerald-600" />
                    <span>Entrega em Luanda & Províncias</span>
                  </div>

                </div>

              </div>

              {/* Botão de Ver Detalhes */}
              <div className="p-3.5 pt-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(prod);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-2 bg-slate-50 hover:bg-[#1d4ed8] hover:text-white text-slate-700 rounded-lg font-bold text-xs border border-slate-200 hover:border-transparent transition-all cursor-pointer"
                >
                  Ver Detalhes do Produto
                </button>
              </div>

            </div>
          ))}
        </div>

      </main>

      {/* ─── MODAL / GAVETA DO CARRINHO DE COTAÇÃO ──────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            
            {/* Header Carrinho */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#1d4ed8]" />
                  <h3 className="text-base font-bold text-slate-900">Carrinho de Cotação</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de Itens no Carrinho */}
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">O seu carrinho está vazio.</p>
                  <p className="text-xs mt-1">Selecione qualquer produto na loja para adicionar.</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-slate-200"
                        onError={(e: any) => { e.target.src = '/imagens/pos_bundle_kit.jpg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-[#1d4ed8] font-bold">
                          {(item.product.priceAOA * item.quantity).toLocaleString('pt-AO')} Kz
                        </p>
                      </div>

                      {/* Controles de Quantidade */}
                      <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="text-slate-500 hover:text-slate-900 text-xs font-bold px-1 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="text-slate-500 hover:text-slate-900 text-xs font-bold px-1 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulário de Encomenda */}
              {cart.length > 0 && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Dados para Fatura Proforma
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Empresa / Nome Comercial
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: Comercial Luanda Lda"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      NIF (Número de Identificação Fiscal)
                    </label>
                    <input
                      type="text"
                      value={companyNif}
                      onChange={(e) => setCompanyNif(e.target.value)}
                      placeholder="Ex: 5001234567 ou Consumidor Final"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Contacto WhatsApp
                    </label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Ex: +244 923 456 789"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Província de Entrega (com taxa calculada)
                    </label>
                    <select
                      value={deliveryProvince}
                      onChange={(e) => setDeliveryProvince(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      {deliveryRates.map((r) => (
                        <option key={r.id} value={r.province}>
                          {r.province} — {r.feeAOA === 0 ? 'Entrega Grátis' : `${r.feeAOA.toLocaleString('pt-AO')} Kz`} ({r.estimatedDays})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé Carrinho com Subtotal, Taxa de Entrega e Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Subtotal Equipamentos:</span>
                  <span>{subtotalAOA.toLocaleString('pt-AO')} Kz</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Taxa de Deslocação / Envio:</span>
                  <span className="font-semibold text-emerald-600">
                    {deliveryFeeAOA === 0 ? 'Grátis' : `${deliveryFeeAOA.toLocaleString('pt-AO')} Kz`}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Total com Entrega:</span>
                  <span className="text-xl font-black text-slate-900">
                    {totalWithDeliveryAOA.toLocaleString('pt-AO')} <span className="text-xs font-bold">Kz</span>
                  </span>
                </div>

                <button
                  onClick={handleCheckoutWhatsApp}
                  disabled={submittingOrder}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submittingOrder ? 'A registar encomenda...' : 'Enviar Cotação para WhatsApp Oficial'}
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  O pedido é registado no sistema KIVORA e receberá a fatura proforma para pagamento bancário.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
