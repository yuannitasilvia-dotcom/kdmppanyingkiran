import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Phone, Loader2 } from 'lucide-react';
import { useJasaItem } from '../hooks/useJasa';
import { formatPrice } from '../data/mockProducts';
import { waLink } from '../lib/contact';
import { JASA_CATEGORY_LABELS } from '../types';

export default function JasaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { item, loading, error } = useJasaItem(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat jasa...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 font-medium">Jasa tidak ditemukan</p>
        <Link to="/jasa" className="text-red-600 text-sm mt-2 inline-block hover:underline">
          Kembali ke Jasa Warga
        </Link>
      </div>
    );
  }

  const waMessage = `Halo ${item.provider_name}, saya tertarik dengan jasa "${item.name}" di ArgasariHub.`;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      <Link
        to="/jasa"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Jasa Warga
      </Link>

      {error && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
          <img src={item.image_url} alt={item.name} className="w-full h-64 sm:h-80 md:h-96 object-cover" />
        </div>

        <div>
          <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-2">
            {JASA_CATEGORY_LABELS[item.category]}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{item.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {item.provider_name} · {item.village}
          </p>

          <div className="flex items-center gap-1 mt-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">{item.rating}</span>
          </div>

          <p className="text-2xl font-bold text-red-600 mt-4">
            {formatPrice(item.price)}{' '}
            <span className="text-base font-normal text-gray-500">/ {item.price_unit}</span>
          </p>

          <p className="text-sm text-gray-600 leading-relaxed mt-4">{item.description}</p>

          {!item.is_available && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              Jasa sedang tidak tersedia
            </p>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={waLink(item.phone, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Phone className="w-5 h-5" />
              Hubungi via WhatsApp
            </a>
            <a
              href={`tel:${item.phone}`}
              className="flex items-center justify-center gap-2 border border-gray-300 hover:border-red-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Phone className="w-5 h-5" />
              {item.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
