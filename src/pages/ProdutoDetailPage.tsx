import React, { useState } from 'react';
import {
  ArrowLeft, ShoppingBag, ShieldCheck, CheckCircle2,
  Share2, ChevronRight, Send, Package, Star,
  Truck
} from 'lucide-react';
import { PageId } from '../components/Header';
import { StoreProduct } from './LojaPage';
import { createStoreOrder } from '../admin/services/storeService';

interface ProdutoDetailPageProps {
  product: StoreProduct;
  onBack: () => void;
  onNavigatePage: (page: PageId) => void;
  onAddToCart: (product: StoreProduct, quantity: number) => void;
  onSelectProduct: (product: StoreProduct) => void;
  relatedProducts: StoreProduct[];
}

export const ProdutoDetailPage: React.FC<ProdutoDetailPageProps> = ({
  product,
  onBack,
  onNavigatePage,
  onAddToCart,
  onSelectProduct,
  relatedProducts,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'compat' | 'package' | 'shipping'>('specs');
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const gallery = product.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : [product.image];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDirectBuyWhatsApp = async () => {
    const totalAOA = product.priceAOA * quantity;

    // Regista o pedido no Firebase Firestore
    try {
      await createStoreOrder({
        clientName: 'Cliente Loja Direta',
        clientNif: 'Consumidor Final',
        clientPhone: 'WhatsApp Direto',
        deliveryProvince: 'Luanda',
        deliveryFeeAOA: 0,
        subtotalAOA: totalAOA,
        totalAOA: totalAOA,
        status: 'pending',
        items: [
          {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            unitPriceAOA: product.priceAOA,
            quantity: quantity,
            subtotalAOA: totalAOA,
          }
        ]
      });
    } catch (e) {
      console.warn('Erro ao registar encomenda no Firestore:', e);
    }

    const msg = `*COMPRA DIRETA — LOJA KIVORA ERP*\n\n` +
      `*Produto:* ${product.name}\n` +
      `*SKU:* ${product.sku}\n` +
      `*Quantidade:* ${quantity} unidade(s)\n` +
      `*Valor Total:* ${totalAOA.toLocaleString('pt-AO')} Kz\n` +
      `*Garantia:* ${product.warranty}\n\n` +
      `Olá, gostaria de confirmar a disponibilidade e receber o IBAN para emissão da Fatura Proforma e pagamento.`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/244923456789?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Padrão E-Commerce */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 py-4 flex-wrap">
          <button onClick={() => onNavigatePage('home')} className="hover:text-blue-600 cursor-pointer">Início</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button onClick={onBack} className="hover:text-blue-600 cursor-pointer">Loja de Equipamentos</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">{product.categoryLabel}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate max-w-sm">{product.name}</span>
        </nav>

        {/* Botão Voltar */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs mb-6 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos Produtos
        </button>

        {/* ─── CARD PRINCIPAL DO PRODUTO (Estilo AliExpress / Amazon) ─────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Coluna Esquerda: Galeria de Imagens (5 Colunas) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Imagem Principal de Estúdio em Fundo Branco */}
              <div className="aspect-square w-full rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-6 relative">
                <img
                  src={gallery[selectedImageIdx]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
                {product.discountPercent && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 bg-rose-600 text-white font-bold text-xs rounded">
                    -{product.discountPercent}%
                  </span>
                )}
                {product.inStock && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-[11px] rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Em Stock
                  </span>
                )}
              </div>

              {/* Miniaturas da Galeria */}
              {gallery.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`w-16 h-16 rounded-lg bg-white border p-1 flex items-center justify-center transition-all cursor-pointer ${
                        selectedImageIdx === idx
                          ? 'border-[#1d4ed8] ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="max-h-full max-w-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Informações SKU & Partilha */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>SKU: <strong className="text-slate-700">{product.sku}</strong></span>
                <button
                  onClick={handleShare}
                  className="hover:text-blue-600 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copied ? 'Link Copiado!' : 'Partilhar Produto'}
                </button>
              </div>

            </div>

            {/* Coluna Direita: Detalhes, Preço e Compra (7 Colunas) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                
                {/* Categoria e Marca */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-blue-600">
                    {product.categoryLabel}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">
                    Marca: <strong className="text-slate-800">{product.brand}</strong>
                  </span>
                </div>

                {/* Título do Produto */}
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 leading-snug">
                  {product.name}
                </h1>

                {/* Avaliação e Vendas */}
                <div className="flex items-center gap-2 text-xs mb-4">
                  <div className="flex items-center text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                    {product.rating}
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600">{product.reviewsCount} avaliações</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600 font-semibold">{product.salesCount} vendas em Angola</span>
                </div>

                {/* Bloco de Preço Realista Estilo E-Commerce */}
                <div className="bg-mesh p-5 sm:p-6 rounded-2xl border border-slate-200/90 mb-5 relative overflow-hidden shadow-xs">
                  <div className="orb orb-blue w-28 h-28 -top-6 -right-6 opacity-20" />
                  <div className="flex items-baseline gap-2 mb-1 relative z-10">
                    <span className="text-xs font-bold text-slate-700">Kz</span>
                    <span className="text-3xl sm:text-4xl font-black text-slate-950 font-mono-num">
                      {product.priceAOA.toLocaleString('pt-AO')}
                    </span>
                    {product.originalPriceAOA && (
                      <span className="text-sm text-slate-400 line-through ml-2 font-mono-num">
                        {product.originalPriceAOA.toLocaleString('pt-AO')} Kz
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 relative z-10">
                    Fatura com IVA dedutível emitida pela Visual Software (Homologada AGT).
                  </p>
                </div>

                {/* Descrição Curta */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  {product.shortDesc}
                </p>

                {/* Localização do Stock & Entrega */}
                <div className="space-y-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 mb-5 text-xs text-slate-700">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Disponibilidade: {product.stockLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-500 shrink-0" />
                    <span><strong>Luanda:</strong> Entrega em 24h úteis | <strong>Outras Províncias:</strong> Despacho expresso via transportadora</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span><strong>Garantia:</strong> {product.warranty} com suporte técnico e reposição</span>
                  </div>
                </div>

                {/* Seletor de Quantidade */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-bold text-slate-700">Quantidade:</span>
                  <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-300">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-white font-bold text-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-slate-900 text-xs font-mono-num">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white font-bold text-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer shadow-2xs"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    Subtotal: <strong className="text-slate-900 font-mono-num">{(product.priceAOA * quantity).toLocaleString('pt-AO')} Kz</strong>
                  </span>
                </div>

              </div>

              {/* Botões de Ação de Compra */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleDirectBuyWhatsApp}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
                  >
                    <Send className="w-4 h-4" />
                    Comprar Agora (WhatsApp)
                  </button>

                  <button
                    onClick={() => onAddToCart(product, quantity)}
                    className="w-full py-4 bg-[#FF6500] hover:bg-[#EB5B00] text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-1 shimmer-button"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Adicionar à Cotação
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ─── ABAS DE ESPECIFICAÇÕES TÉCNICAS REAIS ─────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 mb-12">
          
          {/* Navegação das Abas */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
            {[
              { id: 'specs', label: 'Ficha Técnica Completa' },
              { id: 'compat', label: 'Compatibilidade com KIVORA ERP' },
              { id: 'package', label: 'Conteúdo da Caixa' },
              { id: 'shipping', label: 'Prazos de Envio em Angola' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Aba 1: Ficha Técnica em Tabela Limpa */}
          {activeTab === 'specs' && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Especificações do Equipamento</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <tbody>
                    {product.specsTable.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200 w-1/3">
                          {row.label}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-medium">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aba 2: Homologação KIVORA */}
          {activeTab === 'compat' && (
            <div className="space-y-3 text-xs text-slate-600">
              <h3 className="text-sm font-bold text-slate-900">Homologação Oficial KIVORA ERP</h3>
              <p>
                Este equipamento foi exaustivamente homologado pelo departamento técnico da Visual Software para operação contínua com o KIVORA ERP:
              </p>
              <ul className="space-y-1.5 list-disc pl-5 font-medium text-slate-700">
                <li>Impressão instantânea de QR Code fiscal em conformidade com as regras da AGT.</li>
                <li>Comunicação Plug & Play via USB e rede local (LAN Ethernet).</li>
                <li>Compatibilidade total com Windows 10 e Windows 11 (32/64 bits).</li>
                <li>Acionamento automático de gavetas de dinheiro RJ11 no fecho da venda.</li>
              </ul>
            </div>
          )}

          {/* Aba 3: Conteúdo da Caixa */}
          {activeTab === 'package' && (
            <div className="space-y-3 text-xs text-slate-600">
              <h3 className="text-sm font-bold text-slate-900">Itens Incluídos na Embalagem</h3>
              <ul className="space-y-2 font-medium text-slate-700">
                <li className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  1x {product.name} (Original)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Cabo de alimentação e fonte original
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Cabo de conexão de dados USB / Rede
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Certificado de Garantia de 12 Meses da Visual Software
                </li>
              </ul>
            </div>
          )}

          {/* Aba 4: Prazos de Envio */}
          {activeTab === 'shipping' && (
            <div className="space-y-3 text-xs text-slate-600">
              <h3 className="text-sm font-bold text-slate-900">Políticas de Envio e Suporte em Angola</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">Luanda</h4>
                  <p>Entrega no próprio dia ou em até 24 horas úteis. Opção de instalação presencial com técnico credenciado.</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">Províncias</h4>
                  <p>Despacho diário via DHL, Macon Express ou transportadora para Benguela, Huambo, Huíla, Cabinda e todo o país.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ─── PRODUTOS RELACIONADOS ───────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4">Outros Equipamentos Recomendados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    onSelectProduct(rel);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square bg-white rounded-lg mb-2 flex items-center justify-center p-2 border border-slate-100 overflow-hidden">
                      <img src={rel.image} alt={rel.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                    </div>
                    <p className="text-[10px] font-bold text-blue-600 mb-0.5">{rel.categoryLabel}</p>
                    <h4 className="text-xs font-medium text-slate-800 line-clamp-2 mb-2 leading-snug">{rel.name}</h4>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {rel.priceAOA.toLocaleString('pt-AO')} <span className="text-[10px]">Kz</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
