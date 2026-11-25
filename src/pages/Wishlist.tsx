import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { lk } from '../utils/qs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addToCart, getCart, getWishList, removefromWithList } from '../services/user.service';
import { useApp } from '../context/AppContext';
import type { Iwishlist } from '../models/iwishlist.interface';

export default function Wishlist() {
  const { t } = useTranslation();
  const app = useApp();
  const [wishList, setWishList] = useState<Iwishlist[]>([]);
  const [done, setDone] = useState(false);
  const [cartIds, setCartIds] = useState<string[]>([]);
  const fmt = (n: number) => Number(n).toLocaleString('en-US');
  const loadCart = async () => {
    try {
      const r: any = await getCart();
      setCartIds((r.data?.products ?? []).map((x: any) => x.product._id ?? x.product));
      app.refreshCartCount((r.data?.products ?? []).length);
    } catch { /* ignore */ }
  };
  const addItem = async (id: string) => {
    await addToCart({ productId: id });
    loadCart();
  };

  const loadWishList = async () => {
    const res: any = await getWishList();
    setWishList(res.data ?? []);
    setTimeout(() => setDone(true), 500);
  };

  useEffect(() => {
    loadWishList();
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeItem = async (id: string) => {
    const res: any = await removefromWithList(id);
    loadWishList();
    app.refreshWishListCount(res.data.length);
    app.setWishlistMembership(id, false);
  };

  return (
    <>
      {done ? (<>
        <div className="min-h-screen bg-gray-50/50">
          <div className="bg-white border-b border-gray-100">
            <div className="container mx-auto px-4 py-8">
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Link to={'/'} className="hover:text-primary-600 transition-colors">{t('UI.HOME')}</Link><span>/</span><span className="text-gray-900 font-medium">{t('UI.WISHLIST')}</span>
              </nav>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                    <svg className="svg-inline--fa fa-heart text-xl text-red-500" data-prefix="fas" data-icon="heart" role="img" viewBox="0 0 512 512" aria-hidden="true">
                      <path fill="currentColor" d="M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z"></path>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('UI.MY_WISHLIST')}</h1>
                    <p className="text-gray-500 text-sm">{wishList.length} {wishList.length === 1 ? 'item' : 'items'} saved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {wishList.length ? (<>
            <div className="container mx-auto px-4 py-8">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
                  <div className="col-span-6">{t('UI.PRODUCT')}</div>
                  <div className="col-span-2 text-center">{t('UI.PRICE')}</div>
                  <div className="col-span-2 text-center">{t('UI.STATUS')}</div>
                  <div className="col-span-2 text-center">{t('UI.ACTIONS')}</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {wishList.map((item, $index) => (<Fragment key={$index}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-5 items-center hover:bg-gray-50/50 transition-colors">
                      <div className="md:col-span-6 flex items-center gap-4">
                        <Link to={lk(['/products/', item.id])} className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0"><img className="w-full h-full object-contain p-2" alt={item.title} src={item.imageCover} /></Link>
                        <div className="min-w-0">
                          <Link to={lk(['/products/', item.id])} className="font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">{item.title}</Link>
                          <p className="text-sm text-gray-400 mt-1">{item.category.name}</p>
                        </div>
                      </div>
                      <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                        <span className="md:hidden text-sm text-gray-500">Price:</span>
                        <div className="text-right md:text-center">
                          {item.priceAfterDiscount ? (<>
                            <div className="font-semibold text-gray-900">
                              {fmt(item.priceAfterDiscount)} EGP
                            </div>
                            <div className="text-sm text-gray-400 line-through">{fmt(item.price)} EGP</div>
                          </>) : (<>
                            <div className="font-semibold text-gray-900">{fmt(item.price)} EGP</div>
                          </>)}
                        </div>
                      </div>
                      <div className="md:col-span-2 flex md:justify-center">
                        <span className="md:hidden text-sm text-gray-500 mr-2">Status:</span>
                        {cartIds.includes(item.id) ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700"><i className="fa-solid fa-cart-shopping text-[10px]" />In Cart</span>
                        ) : item.quantity ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>{t('UI.IN_STOCK')}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{t('UI.OUT_OF_STOCK')}</span>
                        )}
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2 md:justify-center">
                        {cartIds.includes(item.id) ? (
                          <Link to="/cart" className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"><i className="fa-solid fa-check" /><span className="md:hidden lg:inline">View Cart</span></Link>
                        ) : (
                          <button className="flex-1 cursor-pointer md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all bg-primary-600 text-white hover:bg-primary-700" onClick={() => addItem(item.id)}><i className="fa-solid fa-cart-shopping text-xs" /><span className="md:hidden lg:inline">{t('UI.ADD_TO_CART')}</span></button>
                        )}
                        <button className="w-10 cursor-pointer h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all disabled:opacity-50" onClick={(e) => { removeItem(item.id); }} title="Remove">
                          <svg className="svg-inline--fa fa-trash text-sm" data-prefix="fas" data-icon="trash" role="img" viewBox="0 0 448 512" aria-hidden="true">
                            <path fill="currentColor" d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </Fragment>))}
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <Link to={'/shop'} className="text-gray-500 hover:text-primary-600 text-sm font-medium transition-colors">← Continue Shopping</Link>
              </div>
            </div>
          </>) : (<>
            <div className="container mx-auto px-4 py-20">
              <div className="max-w-sm mx-auto text-center">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <svg className="svg-inline--fa fa-heart text-3xl text-gray-400" data-prefix="far" data-icon="heart" role="img" viewBox="0 0 512 512" aria-hidden="true">
                    <path fill="currentColor" d="M378.9 80c-27.3 0-53 13.1-69 35.2l-34.4 47.6c-4.5 6.2-11.7 9.9-19.4 9.9s-14.9-3.7-19.4-9.9l-34.4-47.6c-16-22.1-41.7-35.2-69-35.2-47 0-85.1 38.1-85.1 85.1 0 49.9 32 98.4 68.1 142.3 41.1 50 91.4 94 125.9 120.3 3.2 2.4 7.9 4.2 14 4.2s10.8-1.8 14-4.2c34.5-26.3 84.8-70.4 125.9-120.3 36.2-43.9 68.1-92.4 68.1-142.3 0-47-38.1-85.1-85.1-85.1zM271 87.1c25-34.6 65.2-55.1 107.9-55.1 73.5 0 133.1 59.6 133.1 133.1 0 68.6-42.9 128.9-79.1 172.8-44.1 53.6-97.3 100.1-133.8 127.9-12.3 9.4-27.5 14.1-43.1 14.1s-30.8-4.7-43.1-14.1C176.4 438 123.2 391.5 79.1 338 42.9 294.1 0 233.7 0 165.1 0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1l15 20.7 15-20.7z"></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{t('UI.YOUR_WISHLIST_IS_EMPTY')}</h2>
                <p className="text-gray-500 text-sm mb-6">{t('UI.BROWSE_PRODUCTS_AND_SAVE_YOUR_FAVORITES_HERE')}</p>
                <div className="flex flex-col gap-3">
                  <Link to={'/shop'} className="inline-flex cursor-pointer items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">{t('UI.BROWSE_PRODUCTS')}
                    <svg className="svg-inline--fa fa-arrow-right text-sm" data-prefix="fas" data-icon="arrow-right" role="img" viewBox="0 0 512 512" aria-hidden="true">
                      <path fill="currentColor" d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"></path></svg></Link>
                </div>
              </div>
            </div>
          </>)}
        </div>
      </>) : (<>
        <section className="container mx-auto px-4 py-6">
          <div className="mb-6 h-7 w-40 rounded-lg bg-gray-200 animate-pulse"></div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item, $index) => (<Fragment key={$index}>
              <div className="overflow-hidden rounded-lg border border-gray-100">
                <div className="aspect-square bg-gray-200 animate-pulse"></div>

                <div className="space-y-3 p-3">
                  <div className="h-4 w-full rounded bg-gray-200 animate-pulse"></div>
                  <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse"></div>
                  <div className="h-3 w-1/3 rounded bg-gray-200 animate-pulse"></div>
                  <div className="h-5 w-1/2 rounded bg-gray-200 animate-pulse"></div>
                </div>
              </div>
            </Fragment>))}
          </div>
        </section>
      </>)}
    </>
  );
}
