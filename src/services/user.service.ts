import { del, get, post, put } from './api';
import { environment } from '../config';
import type { ICartRes } from '../models/icart.interface';
import type { Iorder } from '../models/iorder.interface';

type Shipping = { city: string; details: string; phone: string };

// Wishlist
export const getWishList = () => get('/wishlist');
export const addToWithList = (productId: { productId: string }) => post('/wishlist', productId);
export const removefromWithList = (productId: string) => del(`/wishlist/${productId}`);

// Cart
export const applyCoupon = (couponName: string) => put(`${environment.basUrlV2}/cart/applyCoupon`, { couponName });
export const getCart = () => get<ICartRes>('/cart');
export const addToCart = (productId: { productId: string }) => post<ICartRes>('/cart', productId);
export const removefromCart = (productId: string) => del<ICartRes>(`/cart/${productId}`);
export const clearCart = () => del<ICartRes>('/cart');
export const updateCartProductQuantity = (id: string, count: { count: string }) =>
  put<ICartRes>(`/cart/${id}`, count);

// Orders
export const createCashOrder = (cartId: string, shippingAddress: Shipping) =>
  post(`/orders/${cartId}`, { shippingAddress });
export const createCardCheckout = (shippingAddress: Shipping, cartId: string, url: string) =>
  post(`/orders/checkout-session/${cartId}?url=${encodeURIComponent(url)}`, { shippingAddress });
export const getUserOrders = (userID: string) => get<Iorder[]>(`/orders/user/${userID}`);

// Reviews
export const createReviewForProduct = (productId: string, body: { review: string; rating: number }) =>
  post(`/products/${productId}/reviews`, body);
export const updateReviewForProduct = (reviewId: string, body: { review: string; rating: number }) =>
  put(`/reviews/${reviewId}`, body);
export const deleteReviewForProduct = (reviewId: string) => del(`/reviews/${reviewId}`);
export const getReviewsForProduct = (productId: string) => get(`/products/${productId}/reviews`);

export const verifyToken = () => get('/auth/verifyToken');
