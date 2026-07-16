import { useEffect, useState } from 'react';
import { Loader2, Package } from 'lucide-react';
import { fetchSellerOrders, updateOrderStatus } from '../../lib/sellerOrders';
import { formatPrice } from '../../data/mockProducts';
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '../../types';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
};

interface Props {
  userId: string;
}

export default function SellerOrdersTab({ userId }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const { orders: data, error: fetchError } = await fetchSellerOrders(userId);
    setOrders(data);
    setError(fetchError);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    const { error: updateError } = await updateOrderStatus(orderId, status);
    if (updateError) setError(updateError);
    else await loadOrders();
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat pesanan...
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Package className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="font-medium text-gray-800">Belum ada pesanan masuk</p>
          <p className="text-sm text-gray-500 mt-1">Pesanan dari pembeli akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const nextStatus = NEXT_STATUS[order.status];
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id ?? item.product_id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.item_type === 'kuliner' && (
                          <span className="text-orange-600 text-xs mr-1">[Kuliner]</span>
                        )}
                        {item.product_name} x{item.quantity}
                      </span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                    {order.shipping_address}
                  </p>
                </div>

                <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-red-600">{formatPrice(order.total)}</p>
                  <div className="flex gap-2">
                    {nextStatus && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        disabled={updatingId === order.id}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        {updatingId === order.id ? '...' : `→ ${ORDER_STATUS_LABELS[nextStatus]}`}
                      </button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        disabled={updatingId === order.id}
                        className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs"
                      >
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
