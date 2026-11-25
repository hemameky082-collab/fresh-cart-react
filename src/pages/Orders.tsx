import { Link } from 'react-router-dom';
//SCOPE:scope-orders
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from 'jwt-decode';
import { getUserOrders } from '../services/user.service';
import { getToken } from '../services/api';
import type { Iorder } from '../models/iorder.interface';

const isValidOrder = (value: Iorder): boolean => {
  if (!value || typeof value !== 'object') return false;
  return typeof value._id === 'string' && Array.isArray(value.cartItems);
};

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrdersRaw] = useState<Iorder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const setOrders = (o: Iorder[]) => { setOrdersRaw(o); setLoaded(true); };
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    try {
      const decoded = jwtDecode<{ id?: string }>(token);
      if (!decoded.id) return;
      getUserOrders(decoded.id)
        .then((response) => setOrders(Array.isArray(response) ? response.filter(isValidOrder) : []))
        .catch(() => setOrders([]));
    } catch {
      setOrders([]);
    }
  }, []);

  const orderId = (order: Iorder): string => order._id;
  const toggleDetails = (order: Iorder) => {
    const id = orderId(order);
    if (id) setExpandedOrderId((current) => (current === id ? null : id));
  };
  const isExpanded = (order: Iorder): boolean => expandedOrderId === orderId(order);
  const orderNumber = (order: Iorder): string => orderId(order).slice(-6).toUpperCase() || '—';
  const items = (order: Iorder): Iorder['cartItems'] => order.cartItems.filter((item) => !!item?.product);
  const itemCount = (order: Iorder): number =>
    items(order).reduce((total, item) => total + (Number(item.count) || 0), 0);
  const firstImage = (order: Iorder): string | null => items(order)[0]?.product?.imageCover || null;
  const shippingIsFree = (order: Iorder): boolean => order.shippingPrice <= 0;

  if (loaded && !orders.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6"><i className="fa-solid fa-box-open text-4xl text-gray-400" /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">When you place orders, they&apos;ll appear here<br />so you can track them.</p>
          <Link to="/" className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3.5 px-8 rounded-xl font-semibold transition-all shadow-lg shadow-primary-600/20 w-full sm:w-auto"><i className="fa-solid fa-bag-shopping" />Start Shopping</Link>
        </div>
      </div>
    );
  }

  const fmt = (n: number) => Number(n).toLocaleString('en-US');
  const fdate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link className="hover:text-primary-600 transition" to="/">Home</Link><span className="text-gray-300">/</span><span className="text-gray-900 font-medium">My Orders</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25"><i className="fa-solid fa-box text-2xl text-white" /></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-500 text-sm mt-0.5">Track and manage your {orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
            </div>
          </div>
          <Link className="self-start sm:self-auto text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-primary-50 transition-all text-sm" to="/"><i className="fa-solid fa-bag-shopping text-xs" />Continue Shopping</Link>
        </div>
      </div>
      <div className="space-y-4">
        {orders.map((order) => {
          const its = items(order);
          const open = isExpanded(order);
          const count = its.reduce((n, i) => n + (Number(i.count) || 0), 0);
          return (
            <div key={order._id} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${open ? 'border-primary-200 shadow-lg' : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'}`}>
              <div className="p-5 sm:p-6">
                <div className="flex gap-5">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-2.5 overflow-hidden"><img alt="" className="w-full h-full object-contain" src={firstImage(order) ?? ''} /></div>
                    {its.length > 1 ? <div className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">+{its.length - 1}</div> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        {order.isDelivered ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-100 rounded-lg mb-2"><i className="fa-solid fa-circle-check text-xs text-primary-600" /><span className="text-xs font-semibold text-primary-600">Delivered</span></div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 rounded-lg mb-2"><i className="fa-solid fa-clock text-xs text-amber-600" /><span className="text-xs font-semibold text-amber-600">Processing</span></div>
                        )}
                        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><i className="fa-solid fa-hashtag text-xs text-gray-400" />{order.id}</h3>
                      </div>
                      <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100"><i className={`fa-solid ${order.paymentMethodType === 'card' ? 'fa-credit-card text-primary-600' : 'fa-money-bill text-gray-600'}`} /></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1.5"><i className="fa-solid fa-calendar-days text-xs text-gray-400" />{fdate(order.createdAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-1.5"><i className="fa-solid fa-box text-xs text-gray-400" />{count} {count === 1 ? 'item' : 'items'}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-1.5"><i className="fa-solid fa-location-dot text-xs text-gray-400" />{order.shippingAddress?.city}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div><span className="text-2xl font-bold text-gray-900">{fmt(order.totalOrderPrice)}</span><span className="text-sm font-medium text-gray-400 ml-1">EGP</span></div>
                      <button type="button" onClick={() => toggleDetails(order)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${open ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{open ? 'Hide' : 'Details'}<i className={`fa-solid fa-chevron-down text-xs transition-transform duration-300 ${open ? 'rotate-180' : ''}`} /></button>
                    </div>
                  </div>
                </div>
              </div>
              {open ? (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  <div className="p-5 sm:p-6">
                    <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-4"><div className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center"><i className="fa-solid fa-receipt text-xs text-primary-600" /></div>Order Items</h4>
                    <div className="space-y-3">
                      {its.map((item) => (
                        <div key={item._id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                          <div className="w-16 h-16 rounded-xl bg-gray-50 p-2 shrink-0"><img alt={item.product.title} className="w-full h-full object-contain" src={item.product.imageCover} /></div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.product.title}</p>
                            <p className="text-sm text-gray-500 mt-1"><span className="font-medium text-gray-700">{item.count}</span> × {fmt(item.price)} EGP</p>
                          </div>
                          <div className="text-right shrink-0"><p className="text-lg font-bold text-gray-900">{fmt(item.count * item.price)}</p><p className="text-xs text-gray-400">EGP</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-gray-100">
                      <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-3"><div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center"><i className="fa-solid fa-location-dot text-xs text-blue-600" /></div>Delivery Address</h4>
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900">{order.shippingAddress?.city}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{order.shippingAddress?.details}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-2 pt-1"><i className="fa-solid fa-phone text-xs text-gray-400" />{order.shippingAddress?.phone}</p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-xl border ${order.isDelivered ? 'bg-primary-100 border-primary-200' : 'bg-amber-100 border-amber-200'}`}>
                      <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-3"><div className={`w-6 h-6 rounded-lg flex items-center justify-center ${order.isDelivered ? 'bg-primary-500' : 'bg-amber-500'}`}><i className={`fa-solid ${order.isDelivered ? 'fa-circle-check' : 'fa-clock'} text-xs text-white`} /></div>Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-medium">{fmt(order.totalOrderPrice - (order.shippingPrice || 0))} EGP</span></div>
                        <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="font-medium">{shippingIsFree(order) ? 'Free' : `${fmt(order.shippingPrice)} EGP`}</span></div>
                        <hr className="border-gray-200/50 my-2" />
                        <div className="flex justify-between pt-1"><span className="font-semibold text-gray-900">Total</span><span className="font-bold text-lg text-gray-900">{fmt(order.totalOrderPrice)} EGP</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
