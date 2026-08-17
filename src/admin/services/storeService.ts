import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { StoreProductAdmin, StoreOrder, DeliveryRate } from '../types';

// Coleções no Firestore
const PRODUCTS_COLLECTION = 'store_products';
const ORDERS_COLLECTION = 'store_orders';
const DELIVERY_RATES_COLLECTION = 'store_delivery_rates';

// ─── TAXAS DE ENTREGA PADRÃO EM ANGOLA (Para inicialização) ────────────────
export const DEFAULT_DELIVERY_RATES: DeliveryRate[] = [
  { id: 'luanda-centro', province: 'Luanda', regionOrCity: 'Luanda (Ingombota, Maianga, Maculusso)', feeAOA: 0, estimatedDays: '24 horas (Grátis)', active: true },
  { id: 'luanda-talatona', province: 'Luanda', regionOrCity: 'Talatona, Belas & Kilamba', feeAOA: 3000, estimatedDays: '24 horas', active: true },
  { id: 'luanda-viana', province: 'Luanda', regionOrCity: 'Viana, Cacuaco & Cazenga', feeAOA: 5000, estimatedDays: '24 horas', active: true },
  { id: 'benguela', province: 'Benguela', regionOrCity: 'Benguela & Lobito', feeAOA: 15000, estimatedDays: '24h a 48h (Expresso)', active: true },
  { id: 'huambo', province: 'Huambo', regionOrCity: 'Huambo Cidade & Caála', feeAOA: 15000, estimatedDays: '24h a 48h', active: true },
  { id: 'huila', province: 'Huíla', regionOrCity: 'Lubango', feeAOA: 18000, estimatedDays: '48h a 72h', active: true },
  { id: 'cabinda', province: 'Cabinda', regionOrCity: 'Cabinda Cidade', feeAOA: 25000, estimatedDays: '24h a 48h (Via Aérea)', active: true },
  { id: 'cuanza-sul', province: 'Cuanza Sul', regionOrCity: 'Sumbe & Porto Amboim', feeAOA: 12000, estimatedDays: '24h a 48h', active: true },
  { id: 'uiege', province: 'Uíge', regionOrCity: 'Uíge Cidade', feeAOA: 15000, estimatedDays: '48h', active: true },
  { id: 'namibe', province: 'Namibe', regionOrCity: 'Moçâmedes', feeAOA: 20000, estimatedDays: '48h a 72h', active: true },
  { id: 'malanje', province: 'Malanje', regionOrCity: 'Malanje Cidade', feeAOA: 15000, estimatedDays: '48h', active: true },
  { id: 'bie', province: 'Bié', regionOrCity: 'Kuito', feeAOA: 18000, estimatedDays: '48h a 72h', active: true },
  { id: 'lunda-sul', province: 'Lunda Sul', regionOrCity: 'Saurimo', feeAOA: 25000, estimatedDays: '72h', active: true },
  { id: 'lunda-norte', province: 'Lunda Norte', regionOrCity: 'Dundo', feeAOA: 28000, estimatedDays: '72h', active: true },
  { id: 'moxico', province: 'Moxico', regionOrCity: 'Luena', feeAOA: 25000, estimatedDays: '72h', active: true },
  { id: 'cuanza-norte', province: 'Cuanza Norte', regionOrCity: 'Ndalatando', feeAOA: 12000, estimatedDays: '24h a 48h', active: true },
  { id: 'cunene', province: 'Cunene', regionOrCity: 'Ondjiva', feeAOA: 22000, estimatedDays: '72h', active: true },
  { id: 'cuando-cubango', province: 'Cuando Cubango', regionOrCity: 'Menongue', feeAOA: 25000, estimatedDays: '72h', active: true },
  { id: 'bengo', province: 'Bengo', regionOrCity: 'Caxito', feeAOA: 7000, estimatedDays: '24h', active: true },
  { id: 'zaire', province: 'Zaire', regionOrCity: 'Mbanza Kongo & Soyo', feeAOA: 20000, estimatedDays: '48h', active: true },
];

// ─── GESTÃO DE PRODUTOS DA LOJA ─────────────────────────────────────────────

export async function getStoreProducts(): Promise<StoreProductAdmin[]> {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as StoreProductAdmin[];
  } catch (error) {
    console.error('Erro ao carregar produtos da loja do Firestore:', error);
    return [];
  }
}

export function subscribeToStoreProducts(callback: (products: StoreProductAdmin[]) => void) {
  const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const prods = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as StoreProductAdmin[];
      callback(prods);
    },
    (err) => {
      console.warn('Snapshot listener de produtos:', err);
    }
  );
}

export async function saveStoreProduct(product: Partial<StoreProductAdmin> & { name: string }): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const id = product.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();

    const productData: StoreProductAdmin = {
      id,
      category: product.category || 'accessories',
      categoryLabel: product.categoryLabel || 'Geral',
      name: product.name,
      brand: product.brand || 'KIVORA',
      image: product.image || '/imagens/pos_bundle_kit.jpg',
      galleryImages: product.galleryImages || [],
      priceAOA: Number(product.priceAOA) || 0,
      originalPriceAOA: product.originalPriceAOA ? Number(product.originalPriceAOA) : undefined,
      discountPercent: product.discountPercent ? Number(product.discountPercent) : undefined,
      badge: product.badge || '',
      rating: product.rating || 5.0,
      reviewsCount: product.reviewsCount || 1,
      salesCount: product.salesCount || 0,
      shortDesc: product.shortDesc || '',
      specsTable: product.specsTable || [],
      inStock: product.inStock !== false,
      stockQty: product.stockQty !== undefined ? Number(product.stockQty) : 10,
      stockLocation: product.stockLocation || 'Armazém Luanda',
      warranty: product.warranty || '12 Meses de Garantia Oficial',
      sku: product.sku || `KV-${Date.now().toString().slice(-6)}`,
      active: product.active !== false,
      createdAt: product.createdAt || now,
      updatedAt: now,
    };

    await setDoc(doc(db, PRODUCTS_COLLECTION, id), productData, { merge: true });
    return { success: true, id };
  } catch (error: any) {
    console.error('Erro ao salvar produto:', error);
    return { success: false, error: error.message || 'Falha ao salvar produto no Firebase' };
  }
}

export async function deleteStoreProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao excluir produto:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleProductActive(productId: string, active: boolean): Promise<boolean> {
  try {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), { active, updatedAt: Date.now() });
    return true;
  } catch (error) {
    console.error('Erro ao alternar status do produto:', error);
    return false;
  }
}

// ─── GESTÃO DE VENDAS E ENCOMENDAS ──────────────────────────────────────────

export async function getStoreOrders(): Promise<StoreOrder[]> {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as StoreOrder[];
  } catch (error) {
    console.error('Erro ao buscar encomendas da loja:', error);
    return [];
  }
}

export function subscribeToStoreOrders(callback: (orders: StoreOrder[]) => void) {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as StoreOrder[];
      callback(orders);
    },
    (err) => {
      console.warn('Snapshot listener de pedidos:', err);
    }
  );
}

export async function createStoreOrder(orderData: Omit<StoreOrder, 'id' | 'orderNumber' | 'createdAt'>): Promise<{ success: boolean; id?: string; orderNumber?: string; error?: string }> {
  try {
    const timestamp = Date.now();
    const orderNumber = `KV-PED-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `order_${timestamp}_${Math.random().toString(36).substring(2, 6)}`;

    const newOrder: StoreOrder = {
      ...orderData,
      id,
      orderNumber,
      createdAt: timestamp,
      status: orderData.status || 'pending',
    };

    await setDoc(doc(db, ORDERS_COLLECTION, id), newOrder);
    return { success: true, id, orderNumber };
  } catch (error: any) {
    console.error('Erro ao registar encomenda:', error);
    return { success: false, error: error.message };
  }
}

export async function updateStoreOrderStatus(orderId: string, status: StoreOrder['status'], notes?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const updatePayload: any = { status, updatedAt: Date.now() };
    if (notes !== undefined) updatePayload.notes = notes;

    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updatePayload);
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar status da encomenda:', error);
    return { success: false, error: error.message };
  }
}

// ─── GESTÃO DE TAXAS DE DESLOCAÇÃO / ENTREGA ────────────────────────────────

export async function getDeliveryRates(): Promise<DeliveryRate[]> {
  try {
    const snapshot = await getDocs(collection(db, DELIVERY_RATES_COLLECTION));
    if (snapshot.empty) {
      return DEFAULT_DELIVERY_RATES;
    }
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as DeliveryRate[];
  } catch (error) {
    console.error('Erro ao buscar taxas de entrega:', error);
    return DEFAULT_DELIVERY_RATES;
  }
}

export async function saveDeliveryRate(rate: DeliveryRate): Promise<{ success: boolean; error?: string }> {
  try {
    await setDoc(doc(db, DELIVERY_RATES_COLLECTION, rate.id), rate, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao salvar taxa de deslocação:', error);
    return { success: false, error: error.message };
  }
}

export async function initializeDefaultDeliveryRates(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, DELIVERY_RATES_COLLECTION));
    if (snapshot.empty) {
      for (const rate of DEFAULT_DELIVERY_RATES) {
        await setDoc(doc(db, DELIVERY_RATES_COLLECTION, rate.id), rate);
      }
    }
  } catch (err) {
    console.warn('Aviso ao inicializar taxas de entrega:', err);
  }
}
