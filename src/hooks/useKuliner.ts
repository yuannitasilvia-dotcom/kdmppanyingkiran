import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockKuliner } from '../data/mockKuliner';
import { getLocalSellerKuliner } from '../lib/sellerKuliner';
import type { Kuliner, KulinerCategory } from '../types';

interface UseKulinerOptions {
  category?: KulinerCategory | 'all';
  search?: string;
}

export function useKuliner(options: UseKulinerOptions = {}) {
  const [items, setItems] = useState<Kuliner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchKuliner() {
      setLoading(true);
      setError(null);

      try {
        if (isSupabaseConfigured && supabase) {
          let query = supabase
            .from('kuliner')
            .select('*')
            .eq('is_available', true)
            .order('created_at', { ascending: false });

          if (options.category && options.category !== 'all') {
            query = query.eq('category', options.category);
          }

          if (options.search?.trim()) {
            query = query.or(
              `name.ilike.%${options.search.trim()}%,seller_name.ilike.%${options.search.trim()}%`
            );
          }

          const { data, error: fetchError } = await query;
          if (fetchError) throw fetchError;
          if (!cancelled) setItems((data as Kuliner[]) ?? []);
        } else {
          const sellerItems = getLocalSellerKuliner();
          const merged = [
            ...sellerItems,
            ...mockKuliner.filter((m) => !sellerItems.some((s) => s.id === m.id)),
          ];
          let filtered = [...merged];

          if (options.category && options.category !== 'all') {
            filtered = filtered.filter((k) => k.category === options.category);
          }

          if (options.search?.trim()) {
            const q = options.search.trim().toLowerCase();
            filtered = filtered.filter(
              (k) =>
                k.name.toLowerCase().includes(q) ||
                k.seller_name.toLowerCase().includes(q) ||
                k.village.toLowerCase().includes(q)
            );
          }

          if (!cancelled) setItems(filtered);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat kuliner');
          setItems(mockKuliner);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchKuliner();
    return () => {
      cancelled = true;
    };
  }, [options.category, options.search]);

  return { items, loading, error };
}

export function useKulinerItem(id: string | undefined) {
  const [item, setItem] = useState<Kuliner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setItem(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchItem() {
      setLoading(true);
      setError(null);

      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error: fetchError } = await supabase
            .from('kuliner')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError) throw fetchError;
          if (!cancelled) setItem(data as Kuliner);
        } else {
          const sellerItems = getLocalSellerKuliner();
          const found =
            sellerItems.find((k) => k.id === id) ??
            mockKuliner.find((k) => k.id === id) ??
            null;
          if (!cancelled) setItem(found);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Kuliner tidak ditemukan');
          setItem(mockKuliner.find((k) => k.id === id) ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchItem();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { item, loading, error };
}
