import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Package, Plus, Search,
  Edit2, Trash2, CheckCircle2, XCircle,
  Truck, MessageCircle,
  RefreshCw, Save, X
} from 'lucide-react';
import { StoreProductAdmin, StoreOrder, DeliveryRate } from './types';
import {
  getStoreProducts,
  saveStoreProduct,
  deleteStoreProduct,
  toggleProductActive,
  getStoreOrders,
  updateStoreOrderStatus,
  getDeliveryRates,
  saveDeliveryRate,
  initializeDefaultDeliveryRates
} from './services/storeService';
import { STORE_PRODUCTS } from '../pages/LojaPage';

export const AdminLoja: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'produtos' | 'encomendas' | 'taxas'>('produtos');
  const [products, setProducts] = useState<StoreProductAdmin[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [deliveryRates, setDeliveryRates] = useState<DeliveryRate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>('todos');

  // Modais
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Partial<StoreProductAdmin> | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState<boolean>(false);
  const [editingRate, setEditingRate] = useState<DeliveryRate | null>(null);

  // Form State para Ficha Técnica Dinâmica
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Carregamento de Dados do Firebase
  const loadData = async () => {
    setLoading(true);
    try {
      await initializeDefaultDeliveryRates();
      const [prodsData, ordersData, ratesData] = await Promise.all([
        getStoreProducts(),
        getStoreOrders(),
        getDeliveryRates()
      ]);

      // Se a coleção de produtos no Firebase estiver vazia, sincroniza com os produtos iniciais
      if (prodsData.length === 0 && STORE_PRODUCTS.length > 0) {
        for (const p of STORE_PRODUCTS) {
          await saveStoreProduct({
            ...p,
            active: true,
            createdAt: Date.now(),
          });
        }
        const syncedProds = await getStoreProducts();
        setProducts(syncedProds);
      } else {
        setProducts(prodsData);
      }

      setOrders(ordersData);
      setDeliveryRates(ratesData);
    } catch (err) {
      console.error('Erro ao carregar dados da Loja no Admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ─── HANDLERS DE PRODUTOS ──────────────────────────────────────────────────
  const handleOpenNewProduct = () => {
    setEditingProduct({
      category: 'kits',
      categoryLabel: 'Kits Completos',
      name: '',
      brand: 'KIVORA Hardware',
      image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&q=80',
      galleryImages: [],
      priceAOA: 250000,
      originalPriceAOA: 290000,
      discountPercent: 0,
      badge: 'Novo',
      rating: 5.0,
      reviewsCount: 1,
      salesCount: 0,
      shortDesc: 'Equipamento de alta robustez homologado para o KIVORA ERP.',
      specsTable: [
        { label: 'Garantia', value: '12 Meses' },
        { label: 'Compatibilidade', value: 'Windows 10 / 11 e AGT' },
      ],
      inStock: true,
      stockLocation: 'Armazém Luanda',
      warranty: '12 Meses de Garantia',
      sku: `KV-PROD-${Math.floor(1000 + Math.random() * 9000)}`,
      active: true,
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod: StoreProductAdmin) => {
    setEditingProduct({ ...prod });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.priceAOA) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    const payload: Partial<StoreProductAdmin> & { name: string } = {
      ...editingProduct,
      name: editingProduct.name,
      priceAOA: Number(editingProduct.priceAOA),
      originalPriceAOA: editingProduct.originalPriceAOA ? Number(editingProduct.originalPriceAOA) : undefined,
      discountPercent: editingProduct.discountPercent ? Number(editingProduct.discountPercent) : 0,
      rating: editingProduct.rating ? Number(editingProduct.rating) : 5.0,
      reviewsCount: editingProduct.reviewsCount ? Number(editingProduct.reviewsCount) : 1,
      salesCount: editingProduct.salesCount ? Number(editingProduct.salesCount) : 0,
    };

    const res = await saveStoreProduct(payload);
    if (res.success) {
      setIsProductModalOpen(false);
      setEditingProduct(null);
      await loadData();
    } else {
      alert('Erro ao gravar produto: ' + res.error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este produto?')) return;
    const res = await deleteStoreProduct(id);
    if (res.success) {
      await loadData();
    } else {
      alert('Erro ao eliminar produto.');
    }
  };

  const handleToggleActive = async (id: string, currentStatus?: boolean) => {
    const nextStatus = currentStatus === false ? true : false;
    const ok = await toggleProductActive(id, nextStatus);
    if (ok) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, active: nextStatus } : p));
    }
  };

  const handleAddSpec = () => {
    if (!newSpecLabel.trim() || !newSpecValue.trim() || !editingProduct) return;
    const currentSpecs = editingProduct.specsTable || [];
    setEditingProduct({
      ...editingProduct,
      specsTable: [...currentSpecs, { label: newSpecLabel.trim(), value: newSpecValue.trim() }]
    });
    setNewSpecLabel('');
    setNewSpecValue('');
  };

  const handleRemoveSpec = (index: number) => {
    if (!editingProduct || !editingProduct.specsTable) return;
    setEditingProduct({
      ...editingProduct,
      specsTable: editingProduct.specsTable.filter((_, i) => i !== index)
    });
  };

  // ─── HANDLERS DE ENCOMENDAS ───────────────────────────────────────────────
  const handleUpdateOrderStatus = async (orderId: string, status: StoreOrder['status']) => {
    const res = await updateStoreOrderStatus(orderId, status);
    if (res.success) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    }
  };

  const handleSendWhatsAppUpdate = (order: StoreOrder) => {
    let msg = `Olá *${order.clientName}*,\n\n`;
    msg += `Atualização sobre o seu pedido *${order.orderNumber}* no valor de *${order.totalAOA.toLocaleString('pt-AO')} Kz*:\n`;
    
    if (order.status === 'paid') {
      msg += `• Confirmamos a receção do seu pagamento! O seu equipamento está a ser preparado para envio para ${order.deliveryProvince}.\n`;
    } else if (order.status === 'shipped') {
      msg += `• A sua encomenda já está a caminho para ${order.deliveryProvince}! Em breve receberá o contacto do estafeta/transportadora.\n`;
    } else if (order.status === 'delivered') {
      msg += `• A sua encomenda foi entregue com sucesso! A equipa da KIVORA agradece a sua preferência.\n`;
    } else {
      msg += `• O seu pedido está registado. Em anexo enviamos a Fatura Proforma para pagamento via Transferência Bancária / Multicaixa.\n`;
    }

    const cleanPhone = order.clientPhone.replace(/\D/g, '');
    const phoneWithDDI = cleanPhone.startsWith('244') ? cleanPhone : `244${cleanPhone}`;
    window.open(`https://wa.me/${phoneWithDDI}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ─── HANDLERS DE TAXAS DE DESLOCAÇÃO ───────────────────────────────────────
  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;

    const res = await saveDeliveryRate(editingRate);
    if (res.success) {
      setIsRateModalOpen(false);
      setEditingRate(null);
      await loadData();
    }
  };

  // Filtros de Produtos
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'todas' || p.category === selectedCategory;
    const matchSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtros de Encomendas
  const filteredOrders = orders.filter(o => {
    const matchStatus = selectedOrderStatus === 'todos' || o.status === selectedOrderStatus;
    const matchSearch = searchQuery === '' ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.clientNif.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Métricas
  const totalSalesAOA = orders.filter(o => o.status === 'paid' || o.status === 'delivered').reduce((sum, o) => sum + o.totalAOA, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'proforma_sent').length;
  const activeProductsCount = products.filter(p => p.active !== false).length;

  return (
    <div className="space-y-6 pb-20 w-full max-w-7xl mx-auto font-sans">
      
      {/* ─── CABEÇALHO DO MÓDULO DE LOJA (TEMA CLARO) ─────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl text-slate-900 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" /> Gestão da Loja Oficial & Vendas
          </div>
          <h1 className="text-2xl font-black text-slate-950">Loja, Encomendas & Taxas de Deslocação</h1>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre produtos com fotos em URL, controle vendas, gere proformas e configure taxas por província em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Atualizar dados do Firebase"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {activeTab === 'produtos' && (
            <button
              onClick={handleOpenNewProduct}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Produto / Serviço
            </button>
          )}
        </div>
      </div>

      {/* ─── CARDS DE MÉTRICAS RÁPIDAS (TEMA CLARO) ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Faturação da Loja</p>
          <p className="text-2xl font-black text-emerald-600">
            {totalSalesAOA.toLocaleString('pt-AO')} <span className="text-xs font-bold text-slate-500">Kz</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Vendas confirmadas e pagas</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pedidos Pendentes</p>
          <p className="text-2xl font-black text-amber-600">{pendingOrdersCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Aguardando confirmação/envio</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Produtos Ativos</p>
          <p className="text-2xl font-black text-blue-600">{activeProductsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Exibidos na Loja Pública</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rotas de Deslocação</p>
          <p className="text-2xl font-black text-purple-600">{deliveryRates.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Províncias e zonas ativas</p>
        </div>
      </div>

      {/* ─── NAVEGAÇÃO DE ABAS (TEMA CLARO) ──────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('produtos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'produtos'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          Produtos & Serviços ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('encomendas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'encomendas'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Vendas & Encomendas ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('taxas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'taxas'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          Taxas de Deslocação (18 Províncias)
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ABA 1: PRODUTOS & SERVIÇOS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'produtos' && (
        <div className="space-y-4">
          
          {/* Filtros e Pesquisa */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por nome, SKU ou marca..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 text-xs text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none focus:bg-white cursor-pointer"
              >
                <option value="todas">Todas as Categorias</option>
                <option value="kits">Kits Completos POS</option>
                <option value="printers">Impressoras Térmicas</option>
                <option value="scanners">Leitores de Código</option>
                <option value="terminals">Terminais Touch</option>
                <option value="accessories">Gavetas & Bobinas</option>
                <option value="services">Serviços & Instalação</option>
                <option value="licenses">Licenças de Software</option>
              </select>
            </div>
          </div>

          {/* Tabela de Produtos */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Produto</th>
                    <th className="py-3.5 px-4">SKU / Marca</th>
                    <th className="py-3.5 px-4">Categoria</th>
                    <th className="py-3.5 px-4">Preço (AOA)</th>
                    <th className="py-3.5 px-4">Stock</th>
                    <th className="py-3.5 px-4">Status Loja</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Nenhum produto encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg bg-slate-50 p-1 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="max-h-full max-w-full object-contain"
                                onError={(e: any) => { e.target.src = '/imagens/pos_bundle_kit.jpg'; }}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{prod.name}</p>
                              <p className="text-[11px] text-slate-500">{prod.warranty}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs text-blue-600 font-bold">{prod.sku}</span>
                          <p className="text-[11px] text-slate-500">{prod.brand}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                            {prod.categoryLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 text-sm">
                            {prod.priceAOA.toLocaleString('pt-AO')} Kz
                          </span>
                          {prod.originalPriceAOA && (
                            <p className="text-[11px] text-slate-400 line-through">
                              {prod.originalPriceAOA.toLocaleString('pt-AO')} Kz
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {prod.inStock ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {prod.stockLocation}
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              Esgotado
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleActive(prod.id, prod.active)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                              prod.active !== false
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {prod.active !== false ? 'Ativo na Loja' : 'Oculto'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditProduct(prod)}
                              className="p-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 rounded-lg transition-colors cursor-pointer"
                              title="Editar Produto"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 rounded-lg transition-colors cursor-pointer"
                              title="Excluir Produto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ABA 2: ENCOMENDAS & VENDAS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'encomendas' && (
        <div className="space-y-4">
          
          {/* Filtros de Encomendas */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por N.º pedido, Cliente ou NIF..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 text-xs text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <select
              value={selectedOrderStatus}
              onChange={(e) => setSelectedOrderStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl focus:outline-none focus:bg-white cursor-pointer"
            >
              <option value="todos">Todos os Estados</option>
              <option value="pending">Pendente</option>
              <option value="proforma_sent">Proforma Enviada</option>
              <option value="paid">Pago / Confirmado</option>
              <option value="shipped">Em Trânsito / Enviado</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Tabela de Encomendas */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Pedido / Data</th>
                    <th className="py-3.5 px-4">Cliente & NIF</th>
                    <th className="py-3.5 px-4">Contacto</th>
                    <th className="py-3.5 px-4">Província</th>
                    <th className="py-3.5 px-4">Total (AOA)</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Nenhuma encomenda registada ainda.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold font-mono text-blue-600 text-xs">{order.orderNumber}</p>
                          <p className="text-[11px] text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString('pt-AO')} {new Date(order.createdAt).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{order.clientName}</p>
                          <p className="text-[11px] text-slate-500">NIF: {order.clientNif || 'Consumidor Final'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleSendWhatsAppUpdate(order)}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            {order.clientPhone}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{order.deliveryProvince}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 text-sm">
                            {order.totalAOA.toLocaleString('pt-AO')} Kz
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            order.status === 'delivered' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {order.status === 'paid' ? 'Pago' :
                             order.status === 'shipped' ? 'Em Trânsito' :
                             order.status === 'delivered' ? 'Entregue' :
                             order.status === 'cancelled' ? 'Cancelado' :
                             order.status === 'proforma_sent' ? 'Proforma Enviada' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsOrderModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ABA 3: TAXAS DE DESLOCAÇÃO (18 PROVÍNCIAS)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'taxas' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-slate-900 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-950">Tabela Oficial de Taxas de Envio e Deslocação</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Valores cobrados automaticamente na Loja Pública ao cliente selecionar a respetiva província de entrega.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Província</th>
                  <th className="py-3.5 px-4">Região / Zonas Cobertas</th>
                  <th className="py-3.5 px-4">Taxa de Envio (AOA)</th>
                  <th className="py-3.5 px-4">Tempo Estimado</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deliveryRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      {rate.province}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {rate.regionOrCity}
                    </td>
                    <td className="py-3 px-4">
                      {rate.feeAOA === 0 ? (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Grátis (0 Kz)
                        </span>
                      ) : (
                        <span className="font-bold text-slate-900">{rate.feeAOA.toLocaleString('pt-AO')} Kz</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {rate.estimatedDays}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        rate.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {rate.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingRate(rate);
                          setIsRateModalOpen(true);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Configurar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: CADASTRAR / EDITAR PRODUTO (TEMA CLARO)
      ══════════════════════════════════════════════════════════════════════ */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleUp">
            
            {/* Header Modal */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-black">
                  {editingProduct.id ? 'Editar Produto / Serviço' : 'Novo Produto para a Loja'}
                </h3>
                <p className="text-xs text-slate-400">
                  Cadastre fotos diretas via URL para poupar armazenamento no Firebase.
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Linha 1: Nome & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Ex: Terminal Touch POS 15.6 True-Flat"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">SKU / Código *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    placeholder="Ex: KV-POS-156"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-600 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Linha 2: Categoria & Marca & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Categoria *</label>
                  <select
                    value={editingProduct.category || 'kits'}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      const labels: any = {
                        kits: 'Kits Completos',
                        printers: 'Impressoras Térmicas',
                        scanners: 'Leitores de Código',
                        terminals: 'Terminais Touch',
                        accessories: 'Gavetas & Bobinas',
                        services: 'Serviços & Instalação',
                        licenses: 'Licenças de Software',
                      };
                      setEditingProduct({
                        ...editingProduct,
                        category: cat,
                        categoryLabel: labels[cat] || 'Geral'
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="kits">Kits Completos POS</option>
                    <option value="printers">Impressoras Térmicas</option>
                    <option value="scanners">Leitores de Código</option>
                    <option value="terminals">Terminais Touch</option>
                    <option value="accessories">Gavetas & Bobinas</option>
                    <option value="services">Serviços & Instalação</option>
                    <option value="licenses">Licenças de Software</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Marca / Fabricante</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    placeholder="Ex: KIVORA Hardware / PosLab"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Destaque (Badge)</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    placeholder="Ex: Mais Vendido, Novo, Oferta"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Linha 3: Preços & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Preço de Venda (AOA) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.priceAOA || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, priceAOA: Number(e.target.value) })}
                    placeholder="750000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Preço Anterior (Riscado)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPriceAOA || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPriceAOA: Number(e.target.value) })}
                    placeholder="890000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Local do Stock</label>
                  <input
                    type="text"
                    value={editingProduct.stockLocation || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockLocation: e.target.value })}
                    placeholder="Ex: Armazém Luanda"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Linha 4: Imagem por URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  URL Direto da Imagem Principal *
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    required
                    value={editingProduct.image || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    placeholder="https://exemplo.com/imagem-do-produto.jpg"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  {editingProduct.image && (
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={editingProduct.image}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(e: any) => { e.target.src = '/imagens/pos_bundle_kit.jpg'; }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Linha 5: Descrição & Garantia */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Descrição Curta *</label>
                  <textarea
                    rows={3}
                    required
                    value={editingProduct.shortDesc || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, shortDesc: e.target.value })}
                    placeholder="Resumo das principais características do produto..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Garantia Oficial</label>
                  <input
                    type="text"
                    value={editingProduct.warranty || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, warranty: e.target.value })}
                    placeholder="Ex: 12 Meses de Garantia"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <div className="pt-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.inStock ?? true}
                        onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>Disponível em Stock</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Ficha Técnica Dinâmica */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Ficha Técnica & Especificações Detalhadas
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpecLabel}
                    onChange={(e) => setNewSpecLabel(e.target.value)}
                    placeholder="Característica (Ex: Processador)"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    placeholder="Valor (Ex: Intel Core i3 / 8GB RAM)"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    + Adicionar
                  </button>
                </div>

                {editingProduct.specsTable && editingProduct.specsTable.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {editingProduct.specsTable.map((spec, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs border border-slate-100">
                        <span className="font-bold text-slate-700">{spec.label}:</span>
                        <span className="text-slate-600 flex-1 ml-2 truncate">{spec.value}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(i)}
                          className="text-rose-500 hover:text-rose-700 ml-2"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botões Finais */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Gravar Produto no Firebase
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: DETALHES DA ENCOMENDA
      ══════════════════════════════════════════════════════════════════════ */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleUp">
            
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-black">
                  Pedido #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('pt-AO')} às {new Date(selectedOrder.createdAt).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
              
              {/* Dados do Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <p className="text-slate-500 font-bold uppercase text-[10px]">Cliente / Empresa</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedOrder.clientName}</p>
                  <p className="text-slate-600 mt-1">NIF: {selectedOrder.clientNif || 'Consumidor Final'}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-bold uppercase text-[10px]">Contacto & Entrega</p>
                  <p className="font-bold text-emerald-700 text-sm mt-0.5">{selectedOrder.clientPhone}</p>
                  <p className="text-slate-600 mt-1">Província: <span className="font-bold text-slate-900">{selectedOrder.deliveryProvince}</span></p>
                </div>
              </div>

              {/* Itens do Pedido */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase">Equipamentos e Serviços Solicitados</p>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        <p className="text-[11px] text-slate-500">{item.quantity}x @ {item.unitPriceAOA.toLocaleString('pt-AO')} Kz</p>
                      </div>
                      <p className="font-bold text-slate-900 text-sm">{item.subtotalAOA.toLocaleString('pt-AO')} Kz</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totalizador */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-slate-900">
                <div>
                  <p className="text-xs text-blue-700 font-bold uppercase">Total da Fatura Proforma</p>
                  <p className="text-[11px] text-slate-600">Inclui taxa de deslocação para {selectedOrder.deliveryProvince}</p>
                </div>
                <p className="text-2xl font-black text-blue-900">
                  {selectedOrder.totalAOA.toLocaleString('pt-AO')} <span className="text-xs">Kz</span>
                </p>
              </div>

              {/* Atualização de Estado */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase">Alterar Estado da Encomenda</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'pending', label: 'Pendente' },
                    { id: 'proforma_sent', label: 'Proforma Enviada' },
                    { id: 'paid', label: 'Pago' },
                    { id: 'shipped', label: 'Em Trânsito' },
                    { id: 'delivered', label: 'Entregue' },
                    { id: 'cancelled', label: 'Cancelado' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, st.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedOrder.status === st.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ação de WhatsApp */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppUpdate(selectedOrder)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar Mensagem e Proforma via WhatsApp
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: CONFIGURAR TAXA DE DESLOCAÇÃO
      ══════════════════════════════════════════════════════════════════════ */}
      {isRateModalOpen && editingRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
            
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">Taxa de Deslocação</h3>
                <p className="text-xs text-slate-400">{editingRate.province}</p>
              </div>
              <button
                onClick={() => setIsRateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="p-6 space-y-4 text-slate-800">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Região / Zonas Cobertas *</label>
                <input
                  type="text"
                  required
                  value={editingRate.regionOrCity}
                  onChange={(e) => setEditingRate({ ...editingRate, regionOrCity: e.target.value })}
                  placeholder="Ex: Luanda Cidade, Talatona, Viana"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Taxa de Envio (AOA) *</label>
                <input
                  type="number"
                  required
                  value={editingRate.feeAOA}
                  onChange={(e) => setEditingRate({ ...editingRate, feeAOA: Number(e.target.value) })}
                  placeholder="0 para Grátis"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
                <p className="text-[11px] text-slate-500">Coloque 0 para entrega gratuita nesta província.</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Tempo Estimado de Entrega</label>
                <input
                  type="text"
                  value={editingRate.estimatedDays || ''}
                  onChange={(e) => setEditingRate({ ...editingRate, estimatedDays: e.target.value })}
                  placeholder="Ex: 24h a 48h úteis"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRate.active}
                    onChange={(e) => setEditingRate({ ...editingRate, active: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Rota de Entrega Ativa na Loja</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20"
                >
                  Gravar Taxa
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
