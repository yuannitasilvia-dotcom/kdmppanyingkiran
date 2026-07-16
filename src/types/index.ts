export type ProductCategory =
  | 'makanan-minuman'
  | 'hasil-pertanian'
  | 'kerajinan'
  | 'fashion'
  | 'kebutuhan-harian'
  | 'oleholeh';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  village: string;
  category: ProductCategory;
  rating: number;
  stock: number;
  image_url: string;
  seller_id?: string;
  created_at?: string;
}

export type KulinerCategory =
  | 'makanan-berat'
  | 'camilan'
  | 'minuman'
  | 'kue-tradisional'
  | 'masakan-rumahan';

export interface Kuliner {
  id: string;
  name: string;
  description: string;
  price: number;
  seller_name: string;
  village: string;
  category: KulinerCategory;
  rating: number;
  delivery_time: string;
  is_available: boolean;
  image_url: string;
  seller_id?: string;
  created_at?: string;
}

export type CartItem =
  | { type: 'product'; product: Product; quantity: number }
  | { type: 'kuliner'; kuliner: Kuliner; quantity: number };

export type OrderItemType = 'product' | 'kuliner';

export type NotificationType = 'order' | 'promo' | 'info' | 'kuliner';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: 'buyer' | 'seller' | 'admin';
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItemRecord {
  id?: string;
  item_type: OrderItemType;
  product_id: string;
  product_name: string;
  product_image_url: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  buyer_id: string;
  status: OrderStatus;
  total: number;
  shipping_address: string;
  created_at: string;
  items: OrderItemRecord[];
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'makanan-minuman': 'Makanan & Minuman',
  'hasil-pertanian': 'Hasil Pertanian',
  kerajinan: 'Kerajinan Tangan',
  fashion: 'Fashion & Kain',
  'kebutuhan-harian': 'Kebutuhan Harian',
  oleholeh: 'Oleh-Oleh Khas',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Menunggu Konfirmasi',
  confirmed: 'Dikonfirmasi',
  shipped: 'Dikirim',
  delivered: 'Selesai',
  cancelled: 'Dibatalkan',
};

export const KULINER_CATEGORY_LABELS: Record<KulinerCategory, string> = {
  'makanan-berat': 'Makanan Berat',
  camilan: 'Camilan',
  minuman: 'Minuman',
  'kue-tradisional': 'Kue Tradisional',
  'masakan-rumahan': 'Masakan Rumahan',
};

export function getCartItemId(item: CartItem): string {
  return item.type === 'product' ? item.product.id : item.kuliner.id;
}

export function getCartItemPrice(item: CartItem): number {
  return item.type === 'product' ? item.product.price : item.kuliner.price;
}

export function getCartItemName(item: CartItem): string {
  return item.type === 'product' ? item.product.name : item.kuliner.name;
}

export function getCartItemImage(item: CartItem): string {
  return item.type === 'product' ? item.product.image_url : item.kuliner.image_url;
}

export type VillageNewsCategory = 'berita' | 'pengumuman' | 'kegiatan' | 'cerita-umkm';

export interface VillageNews {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: VillageNewsCategory;
  village: string;
  image_url: string;
  author: string;
  published: boolean;
  created_at: string;
}

export const VILLAGE_NEWS_CATEGORY_LABELS: Record<VillageNewsCategory, string> = {
  berita: 'Berita',
  pengumuman: 'Pengumuman',
  kegiatan: 'Kegiatan',
  'cerita-umkm': 'Cerita UMKM',
};

export type JasaCategory =
  | 'tukang'
  | 'fotografi'
  | 'pengajaran'
  | 'kebersihan'
  | 'transportasi'
  | 'lainnya';

export interface Jasa {
  id: string;
  name: string;
  description: string;
  provider_name: string;
  village: string;
  category: JasaCategory;
  price: number;
  price_unit: string;
  rating: number;
  phone: string;
  is_available: boolean;
  image_url: string;
  created_at?: string;
}

export const JASA_CATEGORY_LABELS: Record<JasaCategory, string> = {
  tukang: 'Tukang & Bangunan',
  fotografi: 'Fotografi & Video',
  pengajaran: 'Les & Pengajaran',
  kebersihan: 'Kebersihan & Laundry',
  transportasi: 'Transportasi',
  lainnya: 'Lainnya',
};

export type EventCategory = 'olahraga' | 'agama' | 'budaya' | 'sosial' | 'pelatihan';

export interface VillageEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  village: string;
  category: EventCategory;
  event_date: string;
  end_date?: string;
  sponsors_count: number;
  image_url: string;
  created_at?: string;
}

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  olahraga: 'Olahraga',
  agama: 'Keagamaan',
  budaya: 'Budaya & Seni',
  sosial: 'Sosial Kemasyarakatan',
  pelatihan: 'Pelatihan & Workshop',
};

export interface ChannelVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  image_url: string;
  is_live: boolean;
  viewer_count?: number;
  video_url?: string;
  village: string;
  created_at?: string;
}

export type WisataType = 'wisata' | 'homestay';

export interface Wisata {
  id: string;
  name: string;
  description: string;
  village: string;
  type: WisataType;
  price: number;
  price_label: string;
  rating: number;
  facilities: string[];
  phone: string;
  image_url: string;
  created_at?: string;
}

export const WISATA_TYPE_LABELS: Record<WisataType, string> = {
  wisata: 'Destinasi Wisata',
  homestay: 'Homestay',
};

export type EmploymentType = 'penuh-waktu' | 'paruh-waktu' | 'freelance' | 'magang';

export interface Lowongan {
  id: string;
  title: string;
  company: string;
  village: string;
  description: string;
  salary_range: string;
  employment_type: EmploymentType;
  requirements: string[];
  deadline: string;
  image_url: string;
  contact_phone: string;
  created_at?: string;
}

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  'penuh-waktu': 'Penuh Waktu',
  'paruh-waktu': 'Paruh Waktu',
  freelance: 'Freelance',
  magang: 'Magang',
};
