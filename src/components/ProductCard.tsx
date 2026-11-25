import { lk } from '../utils/qs';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import type { Iproduct } from '../models/iproduct.interface';
import { useApp } from '../context/AppContext';
import { getToken } from '../services/api';
import { addToCart as addToCartApi, addToWithList as addToWishApi, removefromWithList } from '../services/user.service';
import { qs } from '../utils/qs';

export default function ProductCard({ product }: { product: Iproduct }) {
  const { t } = useTranslation();
  const app = useApp();
  const isProductInWishList = app.wishlistIds.has(product._id);
  const [adding, setAdding] = useState(false);
  const [done, setDone] = useState(false);
  const stars = Array(5).fill(0);

  const addToWithList = async (productId: string) => {
    if (getToken() && app.isValidUser) {
      const exists = app.wishlistIds.has(productId);
      try {
        const res: any = exists ? await removefromWithList(productId) : await addToWishApi({ productId });
        app.refreshWishListCount(res.data.length);
        app.setWishlistMembership(productId, !exists);
      } catch {
        /* error toast handled by the api interceptor */
      }
    } else {
      toast.warning('plz login frist!');
    }
  };

  const addToCart = async (id: string) => {
    if (getToken() && app.isValidUser) {
      setAdding(true);
      setDone(false);
      try {
        const res: any = await addToCartApi({ productId: id });
        app.refreshCartCount(res.numOfCartItems);
        toast.success('Product Added To Cart Sucssessfully');
      } catch {
        /* error toast handled by the api interceptor */
      } finally {
        setAdding(false);
        setDone(true);
        setTimeout(() => setDone(false), 1000);
      }
    } else {
      toast.warning('plz login first!');
    }
  };

  const rating = Number(product.ratingsAverage) || 0;
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const pct = product.priceAfterDiscount ? (((product.priceAfterDiscount - product.price) / product.price) * 100).toFixed(0) : '';

  return (
    <>
      <div id="product-card" className="bg-white border border-gray-200 rounded-lg overflow-hidden h-full">
        <div className="relative">
          <img className="w-full h-60 object-contain bg-white" src={product.imageCover} alt={product.title} />
          {product.priceAfterDiscount ? (
            <div className="absolute top-3 left-3">
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">-{Math.abs(Number(pct))}%</span>
            </div>
          ) : null}
          <div className="absolute top-3 right-3 flex flex-col space-y-2">
            <button
              className={`cursor-pointer bg-white h-8 w-8 rounded-full flex items-center justify-center transition shadow-sm text-gray-600 hover:text-red-500 ${isProductInWishList ? 'bg-red-500! text-white!' : ''}`}
              onClick={() => { addToWithList(product.id); }}
              title={t('UI.ADD_TO_WISHLIST')}
              tabIndex={0}
            >
              <i className={`${isProductInWishList ? 'fa-solid' : 'fa-regular'} fa-heart `} />
            </button>
            <button className="cursor-pointer bg-white h-8 w-8 rounded-full flex items-center justify-center text-gray-600 hover:text-primary-600 shadow-sm">
              <i className="fa-solid fa-arrows-rotate " />
            </button>
            <Link to={lk(['/products/', product.id])} className="bg-white h-8 w-8 rounded-full flex items-center justify-center text-gray-600 hover:text-primary-600 shadow-sm">
              <i className="fa-regular fa-eye " />
            </Link>
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-gray-500 mb-1">{product.category?.name}</div>
          <h3 className="font-medium mb-1 cursor-pointer" title={product.title}>
            <Link to={lk(['/products/', product.id])} className="line-clamp-2">{product.title}</Link>
          </h3>
          <div className="flex items-center mb-2">
            <div className="flex text-amber-400 mr-2">
              <div className="text-yellow-400">
                {stars.map((_, i) =>
                  i < full ? (
                    <i key={i} className="fa-solid fa-star " />
                  ) : i === full && half ? (
                    <i key={i} className="fa-regular fa-star-half-stroke " />
                  ) : (
                    <i key={i} className="fa-regular fa-star " />
                  ),
                )}
              </div>
            </div>
            <span className="text-xs text-gray-500">{product.ratingsAverage} ({product.ratingsQuantity})</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              {product.priceAfterDiscount ? (
                <>
                  <span className="text-lg font-bold text-primary-600">{product.priceAfterDiscount} EGP</span>
                  <span className="text-sm text-gray-500 line-through ml-2">{product.price} EGP</span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-800">{product.price} EGP</span>
              )}
            </div>
            <button
              className="cursor-pointer h-10 w-10 rounded-full flex items-center justify-center transition bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-70"
              onClick={() => { addToCart(product._id); }}
              tabIndex={0}
            >
              {adding ? <i className="fa-solid fa-spinner fa-spin-pulse"></i> : done ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-plus " />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
