import { Grid } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  {
    label: 'Makanan & Minuman',
    slug: 'makanan-minuman',
    img: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
  },
  {
    label: 'Hasil Pertanian',
    slug: 'hasil-pertanian',
    img: 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
  },
  {
    label: 'Kerajinan Tangan',
    slug: 'kerajinan',
    img: 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
  },
  {
    label: 'Fashion & Kain',
    slug: 'fashion',
    img: 'https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
  },
  {
    label: 'Kebutuhan Harian',
    slug: 'kebutuhan-harian',
    img: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
  },
  {
    label: 'Oleh-Oleh Khas',
    slug: 'oleholeh',
    img: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
  },
];

export default function Categories() {
  return (
    <section className="bg-white py-4 border-b border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-start gap-3 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={`/produk?category=${cat.slug}`}
              className="flex flex-col items-center gap-1.5 min-w-[80px] sm:min-w-[100px] group flex-shrink-0 bg-white shadow-sm rounded-xl hover:shadow-md hover:ring-2 hover:ring-red-100 ring-1 ring-red-50 transition"
            >
              <div className="w-[80px] h-[60px] sm:w-[100px] sm:h-[72px] rounded-xl overflow-hidden border border-gray-100 group-hover:border-red-300 transition-colors">
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-700 font-medium text-center leading-tight">{cat.label}</span>
            </Link>
          ))}
          <Link to="/produk" className="flex flex-col items-center gap-1.5 min-w-[80px] sm:min-w-[100px] group flex-shrink-0 bg-white shadow-sm rounded-xl hover:shadow-md hover:ring-2 hover:ring-red-100 ring-1 ring-red-50 transition">
            <div className="w-[80px] h-[60px] sm:w-[100px] sm:h-[72px] rounded-xl border border-gray-200 flex items-center justify-center group-hover:border-red-300 transition-colors bg-gray-50">
              <Grid className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
            </div>
            <span className="text-[10px] sm:text-xs text-gray-700 font-medium">Lihat Semua</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
