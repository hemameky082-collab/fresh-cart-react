import { Fragment } from 'react';
//SCOPE:scope-checkout
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ErrorMsg from '../components/ErrorMsg';
import { useFormGroup, Validators } from '../hooks/useFormGroup';
import { getAddresses, createCashOrder, checkoutSession } from '../services/auth.service';
import { getCart } from '../services/user.service';
import type { Iaddress } from '../models/iaddress.interface';
import type { Icart } from '../models/icart.interface';
import { fc } from '../utils/format';

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Iaddress[]>([]);
  const [cart, setCart] = useState<Icart[]>([]);
  const [cartId, setCartId] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<Iaddress | null>(null);
  const addressForm = useFormGroup({
    city: ['', [Validators.required]],
    details: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
  });
  const [cash, setCash] = useState(true);
  const [card, setCard] = useState(false);
  const [adding, setAdding] = useState(false);
  const [done, setDone] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [subtotal, setSubtotal] = useState(0);

  const shippingCost = subtotal >= 500 ? 0 : 50;
  const finalTotal = subtotal + shippingCost;

  useEffect(() => {
    getAddresses()
      .then((res: any) => {
        const data = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.addresses)
            ? res.data.addresses
            : Array.isArray(res?.addresses)
              ? res.addresses
              : [];
        setAddresses(data.filter((a: Iaddress) => Boolean(a?._id)));
      })
      .catch(() => setAddresses([]));
    getCart()
      .then((res: any) => {
        setCart(res.data?.products ?? []);
        setSubtotal(res.data?.totalCartPrice ?? 0);
        setCartId(res.cartId);
      })
      .catch(() => {
        setCart([]);
        setSubtotal(0);
      });
  }, []);

  const selectAddress = (address: Iaddress) => {
    setSelectedAddress(address);
    addressForm.reset();
    setErrorMessage('');
  };

  const onAddressFormInput = () => {
    setTimeout(() => {
      const v = addressForm.value as Record<string, any>;
      const hasCustomAddress = Object.values(v).some((x) => String(x ?? '').trim());
      if (hasCustomAddress) setSelectedAddress(null);
    }, 0);
    setErrorMessage('');
  };

  const selectPayment = (method: 'cash' | 'card') => {
    setCash(method === 'cash');
    setCard(method === 'card');
    setErrorMessage('');
  };

  const placeOrder = async () => {
    setAttemptedSubmit(true);
    setErrorMessage('');
    if (!selectedAddress && addressForm.invalid) {
      addressForm.markAllAsTouched();
      setErrorMessage('UI.PAYMENT_ADDRESS_REQUIRED');
      return;
    }
    if (!cash && !card) {
      setErrorMessage('UI.PAYMENT_METHOD_REQUIRED');
      return;
    }
    if (!cart.length) {
      setErrorMessage('UI.PAYMENT_EMPTY_CART');
      return;
    }
    setAdding(true);
    const shippingAddress = selectedAddress
      ? { details: selectedAddress.details, phone: selectedAddress.phone, city: selectedAddress.city }
      : addressForm.value;
    const payload = { shippingAddress };
    try {
      const res: any = card ? await checkoutSession(cartId, payload) : await createCashOrder(cartId, payload);
      if (card) {
        const checkoutUrl = res?.session?.url ?? res?.url;
        if (checkoutUrl) {
          window.location.assign(checkoutUrl);
          return;
        }
        setAdding(false);
        setErrorMessage('UI.PAYMENT_PAGE_FAILED');
        return;
      }
      setDone(true);
      setTimeout(() => navigate('/orders'), 700);
    } catch (error: any) {
      setAdding(false);
      setErrorMessage(error?.response?.data?.message ?? error?.message ?? 'UI.ORDER_FAILED');
    }
  };

  const fmt = (n: number) => Number(n).toLocaleString('en-US');
  return (
    <>
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-8"><div className="container mx-auto px-4"><div className="mb-8"><nav className="flex items-center gap-2 text-sm text-gray-500 mb-6"><Link className="hover:text-primary-600 transition" to="/">Home</Link><span className="text-gray-300">/</span><Link className="hover:text-primary-600 transition" to="/cart">Cart</Link><span className="text-gray-300">/</span><span className="text-gray-900 font-medium">Checkout</span></nav><div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div><h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><span className="bg-gradient-to-br from-primary-600 to-primary-700 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20"><i className="fa-solid fa-receipt" /></span>Complete Your Order</h1><p className="text-gray-500 mt-2">Review your items and complete your purchase</p></div><Link className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary-50 transition-all" to="/cart"><i className="fa-solid fa-arrow-left" />Back to Cart</Link></div></div>{errorMessage ? <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{t(errorMessage)}</div> : null}<form onChange={onAddressFormInput} onSubmit={(e) => { e.preventDefault(); placeOrder(); }}><div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><div className="lg:col-span-2 space-y-6"><div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"><div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4"><h2 className="text-lg font-bold text-white flex items-center gap-2"><i className="fa-solid fa-house" />Shipping Address</h2><p className="text-primary-100 text-sm mt-1">Where should we deliver your order?</p></div><div className="p-6 space-y-5"><div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><i className="fa-solid fa-circle-info text-blue-600 text-sm" /></div><div><p className="text-sm text-blue-800 font-medium">Delivery Information</p><p className="text-xs text-blue-600 mt-0.5">Please ensure your address is accurate for smooth delivery</p></div></div><div><label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">City <span className="text-red-500">*</span></label><div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><i className="fa-solid fa-city text-gray-500 text-sm" /></div><input id="city" className="w-full px-4 py-3.5 pl-14 border-2 rounded-xl focus:outline-none transition-all border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="e.g. Cairo, Alexandria, Giza" type="text" {...addressForm.register('city')} /></div>{addressForm.get('city')?.touched && addressForm.get('city')?.invalid ? <ErrorMsg errorMsg={'UI.ERROR_CITY_REQUIRED'}></ErrorMsg> : null}</div><div><label htmlFor="details" className="block text-sm font-semibold text-gray-700 mb-2">Street Address <span className="text-red-500">*</span></label><div className="relative"><div className="absolute left-4 top-4 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><i className="fa-solid fa-location-dot text-gray-500 text-sm" /></div><textarea id="details" rows={3} className="w-full px-4 py-3.5 pl-14 border-2 rounded-xl focus:outline-none transition-all resize-none border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="Street name, building number, floor, apartment..." {...addressForm.register('details')}></textarea></div>{addressForm.get('details')?.touched && addressForm.get('details')?.invalid ? <ErrorMsg errorMsg={'UI.ERROR_ADDRESS_REQUIRED'}></ErrorMsg> : null}</div><div><label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label><div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><i className="fa-solid fa-phone text-gray-500 text-sm" /></div><input id="phone" className="w-full px-4 py-3.5 pl-14 border-2 rounded-xl focus:outline-none transition-all border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100" placeholder="01xxxxxxxxx" type="tel" {...addressForm.register('phone')} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">Egyptian numbers only</span></div>{addressForm.get('phone')?.touched && addressForm.get('phone')?.invalid ? <ErrorMsg errorMsg={'UI.ERROR_PHONE_INVALID'}></ErrorMsg> : null}</div></div></div><div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"><div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4"><h2 className="text-lg font-bold text-white flex items-center gap-2"><i className="fa-solid fa-wallet" />Payment Method</h2><p className="text-primary-100 text-sm mt-1">Choose how you&apos;d like to pay</p></div><div className="p-6 space-y-4"><button type="button" onClick={() => selectPayment('cash')} className={`w-full p-5 rounded-xl border-2 transition-all flex items-center gap-4 group ${cash ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-emerald-50 shadow-sm' : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'}`}><div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${cash ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}><i className="fa-solid fa-money-bill text-xl" /></div><div className="flex-1 text-left"><h3 className={`font-bold ${cash ? 'text-primary-700' : 'text-gray-900'}`}>Cash on Delivery</h3><p className="text-sm text-gray-500 mt-0.5">Pay when your order arrives at your doorstep</p></div><div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${cash ? 'bg-primary-600 text-white' : 'border-2 border-gray-200'}`}>{cash ? <i className="fa-solid fa-check text-xs" /> : null}</div></button><button type="button" onClick={() => selectPayment('card')} className={`w-full p-5 rounded-xl border-2 transition-all flex items-center gap-4 group ${card ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-emerald-50 shadow-sm' : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'}`}><div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${card ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}><i className="fa-solid fa-credit-card text-xl" /></div><div className="flex-1 text-left"><h3 className={`font-bold ${card ? 'text-primary-700' : 'text-gray-900'}`}>Pay Online</h3><p className="text-sm text-gray-500 mt-0.5">Secure payment with Credit/Debit Card via Stripe</p><div className="flex items-center gap-2 mt-2"><img alt="Visa" className="h-5" src="https://img.icons8.com/color/48/visa.png" /><img alt="Mastercard" className="h-5" src="https://img.icons8.com/color/48/mastercard.png" /><img alt="Amex" className="h-5" src="https://img.icons8.com/color/48/amex.png" /></div></div><div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${card ? 'bg-primary-600 text-white' : 'border-2 border-gray-200'}`}>{card ? <i className="fa-solid fa-check text-xs" /> : null}</div></button><div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 mt-4"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0"><i className="fa-solid fa-shield-halved text-green-600" /></div><div><p className="text-sm font-medium text-green-800">Secure &amp; Encrypted</p><p className="text-xs text-green-600 mt-0.5">Your payment info is protected with 256-bit SSL encryption</p></div></div></div></div></div><div className="lg:col-span-1"><div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm sticky top-4"><div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4"><h2 className="text-lg font-bold text-white flex items-center gap-2"><i className="fa-solid fa-bag-shopping" />Order Summary</h2><p className="text-primary-100 text-sm mt-1">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p></div><div className="p-5"><div className="space-y-3 max-h-56 overflow-y-auto mb-5 pr-1">{cart.map((item, $index) => (<div key={$index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"><div className="w-14 h-14 rounded-lg bg-white p-1 border border-gray-100 shrink-0"><img alt={item.product.title} className="w-full h-full object-contain" src={item.product.imageCover} /></div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{item.product.title}</p><p className="text-xs text-gray-500 mt-0.5">{item.count} × {fmt(item.price)} EGP</p></div><p className="text-sm font-bold text-gray-900 shrink-0">{fmt(item.count * item.price)}</p></div>))}</div><hr className="border-gray-100 my-4" /><div className="space-y-3"><div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-medium">{fmt(subtotal)} EGP</span></div><div className="flex justify-between text-gray-600"><span className="flex items-center gap-2"><i className="fa-solid fa-truck text-gray-400" />Shipping</span>{shippingCost === 0 ? <span className="text-green-600 font-semibold">FREE</span> : <span className="font-semibold">{shippingCost} EGP</span>}</div><hr className="border-gray-100" /><div className="flex justify-between items-center"><span className="text-lg font-bold text-gray-900">Total</span><div className="text-right"><span className="text-2xl font-bold text-primary-600">{fmt(finalTotal)}</span><span className="text-sm text-gray-500 ml-1">EGP</span></div></div></div><button type="submit" disabled={adding} className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 active:scale-[0.98]"><i className="fa-solid fa-box" />Place Order</button><div className="flex items-center justify-center gap-4 mt-4 py-3 border-t border-gray-100"><div className="flex items-center gap-1.5 text-xs text-gray-500"><i className="fa-solid fa-shield-halved text-green-500" /><span>Secure</span></div><div className="w-px h-4 bg-gray-200"></div><div className="flex items-center gap-1.5 text-xs text-gray-500"><i className="fa-solid fa-truck text-blue-500" /><span>Fast Delivery</span></div><div className="w-px h-4 bg-gray-200"></div><div className="flex items-center gap-1.5 text-xs text-gray-500"><i className="fa-solid fa-box text-orange-500" /><span>Easy Returns</span></div></div></div></div></div></div></form></div></div>
    </>
  );
}
