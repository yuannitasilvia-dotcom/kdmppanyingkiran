import { useEffect, useState } from 'react';
import {
  Loader2,
  Package,
  UtensilsCrossed,
  Users,
  ClipboardList,
  Shield,
  Newspaper,
  Calendar,
  Tv,
  Wrench,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { fetchAllOrders, updateOrderStatus } from '../lib/sellerOrders';
import {
  fetchAllProfiles,
  fetchAllProducts,
  fetchAllKuliner,
  adminDeleteProduct,
  adminDeleteKuliner,
  setUserRole,
} from '../lib/admin';
import {
  fetchAllEventsAdmin,
  fetchAllVideosAdmin,
  fetchAllJasaAdmin,
  fetchAllWisataAdmin,
  fetchAllLowonganAdmin,
} from '../lib/adminContent';
import { fetchAllVillageNewsAdmin } from '../lib/villageNews';
import { formatPrice } from '../data/mockProducts';
import { ORDER_STATUS_LABELS, type Order, type OrderStatus, type Product, type Kuliner, type Profile } from '../types';
import AdminNewsTab from '../components/admin/AdminNewsTab';
import AdminEventsTab from '../components/admin/AdminEventsTab';
import AdminVideosTab from '../components/admin/AdminVideosTab';
import AdminJasaTab from '../components/admin/AdminJasaTab';
import AdminWisataTab from '../components/admin/AdminWisataTab';
import AdminLowonganTab from '../components/admin/AdminLowonganTab';
import { Trash2 } from 'lucide-react';

type Tab =
  | 'ringkasan'
  | 'pesanan'
  | 'produk'
  | 'kuliner'
  | 'berita'
  | 'event'
  | 'video'
  | 'jasa'
  | 'wisata'
  | 'lowongan'
  | 'pengguna';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>('ringkasan');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [kuliner, setKuliner] = useState<Kuliner[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState({
    news: 0,
    events: 0,
    videos: 0,
    jasa: 0,
    wisata: 0,
    lowongan: 0,
  });

  const loadAll = async () => {
    setLoading(true);
    const [ordersRes, productsRes, kulinerRes, profilesRes, newsRes, eventsRes, videosRes, jasaRes, wisataRes, lowonganRes] =
      await Promise.all([
        fetchAllOrders(),
        fetchAllProducts(),
        fetchAllKuliner(),
        fetchAllProfiles(),
        fetchAllVillageNewsAdmin(),
        fetchAllEventsAdmin(),
        fetchAllVideosAdmin(),
        fetchAllJasaAdmin(),
        fetchAllWisataAdmin(),
        fetchAllLowonganAdmin(),
      ]);
    setOrders(ordersRes.orders);
    setProducts(productsRes.products);
    setKuliner(kulinerRes.items);
    setProfiles(profilesRes.profiles);
    setStats({
      news: newsRes.items.length,
      events: eventsRes.items.length,
      videos: videosRes.items.length,
      jasa: jasaRes.items.length,
      wisata: wisataRes.items.length,
      lowongan: lowonganRes.items.length,
    });
    setError(
      ordersRes.error ??
        productsRes.error ??
        kulinerRes.error ??
        profilesRes.error ??
        newsRes.error ??
        eventsRes.error ??
        videosRes.error ??
        jasaRes.error ??
        wisataRes.error ??
        lowonganRes.error
    );
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error: err } = await updateOrderStatus(orderId, status);
    if (err) setError(err);
    else loadAll();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return;
    const { error: err } = await adminDeleteProduct(id);
    if (err) setError(err);
    else loadAll();
  };

  const handleDeleteKuliner = async (id: string) => {
    if (!confirm('Hapus menu ini?')) return;
    const { error: err } = await adminDeleteKuliner(id);
    if (err) setError(err);
    else loadAll();
  };

  const handleRoleChange = async (userId: string, role: Profile['role']) => {
    const { error: err } = await setUserRole(userId, role);
    if (err) setError(err);
    else loadAll();
  };

  const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: 'ringkasan', label: 'Ringkasan', icon: Shield },
    { id: 'pesanan', label: 'Pesanan', icon: ClipboardList },
    { id: 'produk', label: 'Produk', icon: Package },
    { id: 'kuliner', label: 'Kuliner', icon: UtensilsCrossed },
    { id: 'berita', label: 'Info Desa', icon: Newspaper },
    { id: 'event', label: 'Event', icon: Calendar },
    { id: 'video', label: 'Channel TV', icon: Tv },
    { id: 'jasa', label: 'Jasa', icon: Wrench },
    { id: 'wisata', label: 'Wisata', icon: MapPin },
    { id: 'lowongan', label: 'Lowongan', icon: Briefcase },
    { id: 'pengguna', label: 'Pengguna', icon: Users },
  ];

  const contentTabs: Tab[] = ['berita', 'event', 'video', 'jasa', 'wisata', 'lowongan'];

  if (loading && tab === 'ringkasan') {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat data admin...
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard Admin</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola pesanan, konten desa, event, lowongan, dan pengguna
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'ringkasan' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Pesanan', value: orders.length, color: 'text-blue-600' },
            { label: 'Total Produk', value: products.length, color: 'text-green-600' },
            { label: 'Total Kuliner', value: kuliner.length, color: 'text-orange-600' },
            { label: 'Artikel Info Desa', value: stats.news, color: 'text-indigo-600' },
            { label: 'Event Desa', value: stats.events, color: 'text-red-600' },
            { label: 'Video Channel TV', value: stats.videos, color: 'text-purple-600' },
            { label: 'Jasa Warga', value: stats.jasa, color: 'text-cyan-600' },
            { label: 'Wisata & Homestay', value: stats.wisata, color: 'text-emerald-600' },
            { label: 'Lowongan Kerja', value: stats.lowongan, color: 'text-amber-600' },
            { label: 'Total Pengguna', value: profiles.length, color: 'text-gray-700' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm font-semibold text-gray-800 mb-2">Pesanan Pending</p>
            <p className="text-3xl font-bold text-amber-600">
              {orders.filter((o) => o.status === 'pending').length}
            </p>
          </div>
        </div>
      )}

      {tab === 'pesanan' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada pesanan</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{order.items.map((i) => i.product_name).join(', ')}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                  <p className="font-bold text-red-600">{formatPrice(order.total)}</p>
                  <select
                    value={order.status}
                    onChange={(e) => handleOrderStatus(order.id, e.target.value as OrderStatus)}
                    className="text-xs border border-gray-300 rounded-lg px-2 py-1.5"
                  >
                    {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'produk' && (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.village} · Stok: {p.stock}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <p className="text-sm font-bold text-red-600">{formatPrice(p.price)}</p>
                <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'kuliner' && (
        <div className="space-y-2">
          {kuliner.map((k) => (
            <div key={k.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={k.image_url} alt={k.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{k.name}</p>
                  <p className="text-xs text-gray-500">{k.seller_name} · {k.village}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded ${k.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {k.is_available ? 'Tersedia' : 'Tidak Tersedia'}
                </span>
                <p className="text-sm font-bold text-red-600">{formatPrice(k.price)}</p>
                <button onClick={() => handleDeleteKuliner(k.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'berita' && <AdminNewsTab onError={setError} />}
      {tab === 'event' && <AdminEventsTab onError={setError} />}
      {tab === 'video' && <AdminVideosTab onError={setError} />}
      {tab === 'jasa' && <AdminJasaTab onError={setError} />}
      {tab === 'wisata' && <AdminWisataTab onError={setError} />}
      {tab === 'lowongan' && <AdminLowonganTab onError={setError} />}

      {tab === 'pengguna' && (
        <div className="space-y-2">
          {profiles.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada data pengguna</p>
          ) : (
            profiles.map((p) => (
              <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.full_name || 'Tanpa Nama'}</p>
                  <p className="text-xs text-gray-400 font-mono">{p.id.slice(0, 8)}...</p>
                </div>
                <select
                  value={p.role}
                  onChange={(e) => handleRoleChange(p.id, e.target.value as Profile['role'])}
                  className="text-xs border border-gray-300 rounded-lg px-2 py-1.5"
                >
                  <option value="buyer">Pembeli</option>
                  <option value="seller">Penjual</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))
          )}
        </div>
      )}

      {contentTabs.includes(tab) && (
        <p className="mt-4 text-xs text-gray-400 text-center">
          Perubahan konten langsung tampil di halaman publik setelah disimpan.
        </p>
      )}
    </div>
  );
}
