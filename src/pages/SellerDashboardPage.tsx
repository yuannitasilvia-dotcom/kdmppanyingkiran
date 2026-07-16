import { useState } from 'react';
import { Package, UtensilsCrossed, ClipboardList } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import SellerProductsTab from '../components/seller/SellerProductsTab';
import SellerKulinerTab from '../components/seller/SellerKulinerTab';
import SellerOrdersTab from '../components/seller/SellerOrdersTab';

type Tab = 'produk' | 'kuliner' | 'pesanan';

const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: 'produk', label: 'Produk', icon: Package },
  { id: 'kuliner', label: 'Kuliner', icon: UtensilsCrossed },
  { id: 'pesanan', label: 'Pesanan', icon: ClipboardList },
];

export default function SellerDashboardPage() {
  const { userId, profile } = useProfile();
  const [activeTab, setActiveTab] = useState<Tab>('produk');

  if (!userId) return null;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard Penjual</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola produk, kuliner, dan pesanan UMKM Anda</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'produk' && <SellerProductsTab userId={userId} />}
      {activeTab === 'kuliner' && (
        <SellerKulinerTab userId={userId} sellerName={profile?.full_name ?? 'Warung Saya'} />
      )}
      {activeTab === 'pesanan' && <SellerOrdersTab userId={userId} />}
    </div>
  );
}
