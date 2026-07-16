import { supabase, isSupabaseConfigured } from './supabase';
import type { Kuliner, Product, Profile } from '../types';

export async function fetchAllProfiles(): Promise<{ profiles: Profile[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { profiles: [], error: error.message };
    return { profiles: (data as Profile[]) ?? [], error: null };
  }

  try {
    const raw = localStorage.getItem('argasarihub-profile');
    const profiles = raw ? Object.values(JSON.parse(raw) as Record<string, Profile>) : [];
    return { profiles, error: null };
  } catch {
    return { profiles: [], error: null };
  }
}

export async function fetchAllProducts(): Promise<{ products: Product[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { products: [], error: error.message };
    return { products: (data as Product[]) ?? [], error: null };
  }

  const { getLocalSellerProducts } = await import('./sellerProducts');
  const { mockProducts } = await import('../data/mockProducts');
  const sellerProducts = getLocalSellerProducts();
  const merged = [
    ...sellerProducts,
    ...mockProducts.filter((m) => !sellerProducts.some((s) => s.id === m.id)),
  ];
  return { products: merged, error: null };
}

export async function fetchAllKuliner(): Promise<{ items: Kuliner[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('kuliner')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { items: [], error: error.message };
    return { items: (data as Kuliner[]) ?? [], error: null };
  }

  const { getLocalSellerKuliner } = await import('./sellerKuliner');
  const { mockKuliner } = await import('../data/mockKuliner');
  const sellerItems = getLocalSellerKuliner();
  const merged = [
    ...sellerItems,
    ...mockKuliner.filter((m) => !sellerItems.some((s) => s.id === m.id)),
  ];
  return { items: merged, error: null };
}

export async function adminDeleteProduct(productId: string): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    return { error: error?.message ?? null };
  }
  return { error: null };
}

export async function adminDeleteKuliner(kulinerId: string): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('kuliner').delete().eq('id', kulinerId);
    return { error: error?.message ?? null };
  }
  return { error: null };
}

export async function setUserRole(
  userId: string,
  role: Profile['role']
): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    return { error: error?.message ?? null };
  }

  try {
    const raw = localStorage.getItem('argasarihub-profile');
    const profiles = raw ? (JSON.parse(raw) as Record<string, Profile>) : {};
    if (profiles[userId]) {
      profiles[userId] = { ...profiles[userId], role };
      localStorage.setItem('argasarihub-profile', JSON.stringify(profiles));
    }
    return { error: null };
  } catch {
    return { error: 'Gagal mengubah role' };
  }
}

export async function becomeAdmin(userId: string): Promise<{ error: string | null }> {
  return setUserRole(userId, 'admin');
}
