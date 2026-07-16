import { supabase, isSupabaseConfigured } from './supabase';
import type { Order, OrderItemRecord, OrderStatus } from '../types';
import { getLocalSellerProducts } from './sellerProducts';
import { getLocalSellerKuliner } from './sellerKuliner';
import { notifyOrderStatusChanged } from './notifications';

const STORAGE_KEY = 'argasarihub-orders';

export function getAllLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function mapOrderRow(row: {
  id: string;
  buyer_id: string;
  status: OrderStatus;
  total: number;
  shipping_address: string | null;
  created_at: string;
  order_items: Array<{
    id: string;
    item_type: 'product' | 'kuliner';
    product_id: string | null;
    kuliner_id: string | null;
    item_name: string | null;
    item_image_url: string | null;
    quantity: number;
    price: number;
    products?: { name: string; image_url: string } | { name: string; image_url: string }[] | null;
  }>;
}): Order {
  const items: OrderItemRecord[] = (row.order_items ?? []).map((item) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    return {
      id: item.id,
      item_type: item.item_type ?? 'product',
      product_id: item.product_id ?? item.kuliner_id ?? '',
      product_name: item.item_name ?? product?.name ?? 'Item',
      product_image_url: item.item_image_url ?? product?.image_url ?? '',
      quantity: item.quantity,
      price: item.price,
    };
  });

  return {
    id: row.id,
    buyer_id: row.buyer_id,
    status: row.status,
    total: row.total,
    shipping_address: row.shipping_address ?? '',
    created_at: row.created_at,
    items,
  };
}

function getSellerItemIds(sellerId: string): Set<string> {
  const productIds = getLocalSellerProducts()
    .filter((p) => p.seller_id === sellerId)
    .map((p) => p.id);
  const kulinerIds = getLocalSellerKuliner()
    .filter((k) => k.seller_id === sellerId)
    .map((k) => k.id);
  return new Set([...productIds, ...kulinerIds]);
}

function orderHasSellerItems(order: Order, sellerItemIds: Set<string>): boolean {
  return order.items.some((item) => sellerItemIds.has(item.product_id));
}

export async function fetchSellerOrders(
  sellerId: string
): Promise<{ orders: Order[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('seller_id', sellerId);

    const { data: kuliner } = await supabase
      .from('kuliner')
      .select('id')
      .eq('seller_id', sellerId);

    const productIds = (products ?? []).map((p) => p.id);
    const kulinerIds = (kuliner ?? []).map((k) => k.id);

    if (productIds.length === 0 && kulinerIds.length === 0) {
      return { orders: [], error: null };
    }

    const orderIds: string[] = [];

    if (productIds.length > 0) {
      const { data: productItems } = await supabase
        .from('order_items')
        .select('order_id')
        .in('product_id', productIds);
      orderIds.push(...(productItems ?? []).map((i) => i.order_id));
    }

    if (kulinerIds.length > 0) {
      const { data: kulinerItems } = await supabase
        .from('order_items')
        .select('order_id')
        .in('kuliner_id', kulinerIds);
      orderIds.push(...(kulinerItems ?? []).map((i) => i.order_id));
    }

    const uniqueOrderIds = [...new Set(orderIds)];
    if (uniqueOrderIds.length === 0) return { orders: [], error: null };

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, buyer_id, status, total, shipping_address, created_at,
        order_items (id, item_type, product_id, kuliner_id, item_name, item_image_url, quantity, price, products (name, image_url))
      `)
      .in('id', uniqueOrderIds)
      .order('created_at', { ascending: false });

    if (error) return { orders: [], error: error.message };

    const orders = (data ?? []).map((row) => mapOrderRow(row as Parameters<typeof mapOrderRow>[0]));
    return { orders, error: null };
  }

  const sellerItemIds = getSellerItemIds(sellerId);
  const orders = getAllLocalOrders().filter((o) => orderHasSellerItems(o, sellerItemIds));
  return { orders, error: null };
}

export async function fetchAllOrders(): Promise<{ orders: Order[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, buyer_id, status, total, shipping_address, created_at,
        order_items (id, item_type, product_id, kuliner_id, item_name, item_image_url, quantity, price, products (name, image_url))
      `)
      .order('created_at', { ascending: false });

    if (error) return { orders: [], error: error.message };
    const orders = (data ?? []).map((row) => mapOrderRow(row as Parameters<typeof mapOrderRow>[0]));
    return { orders, error: null };
  }

  return { orders: getAllLocalOrders(), error: null };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ order: Order | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select(`
        id, buyer_id, status, total, shipping_address, created_at,
        order_items (id, item_type, product_id, kuliner_id, item_name, item_image_url, quantity, price)
      `)
      .single();

    if (error) return { order: null, error: error.message };

    const order = mapOrderRow(data as Parameters<typeof mapOrderRow>[0]);
    await notifyOrderStatusChanged(order, status);
    return { order, error: null };
  }

  const orders = getAllLocalOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return { order: null, error: 'Pesanan tidak ditemukan' };

  const updated = { ...orders[index], status };
  orders[index] = updated;
  saveLocalOrders(orders);
  await notifyOrderStatusChanged(updated, status);
  return { order: updated, error: null };
}

export async function collectSellerIdsFromItems(
  items: OrderItemRecord[]
): Promise<string[]> {
  const sellerIds: string[] = [];

  if (isSupabaseConfigured && supabase) {
    const productIds = items.filter((i) => i.item_type === 'product').map((i) => i.product_id);
    const kulinerIds = items.filter((i) => i.item_type === 'kuliner').map((i) => i.product_id);

    if (productIds.length > 0) {
      const { data } = await supabase
        .from('products')
        .select('seller_id')
        .in('id', productIds);
      sellerIds.push(...(data ?? []).map((p) => p.seller_id).filter(Boolean));
    }

    if (kulinerIds.length > 0) {
      const { data } = await supabase
        .from('kuliner')
        .select('seller_id')
        .in('id', kulinerIds);
      sellerIds.push(...(data ?? []).map((k) => k.seller_id).filter(Boolean));
    }
  } else {
    const allProducts = getLocalSellerProducts();
    const allKuliner = getLocalSellerKuliner();

    for (const item of items) {
      if (item.item_type === 'product') {
        const p = allProducts.find((x) => x.id === item.product_id);
        if (p?.seller_id) sellerIds.push(p.seller_id);
      } else {
        const k = allKuliner.find((x) => x.id === item.product_id);
        if (k?.seller_id) sellerIds.push(k.seller_id);
      }
    }
  }

  return [...new Set(sellerIds)];
}
