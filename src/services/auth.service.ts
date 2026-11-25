import { environment } from '../config';
import { del, get, post, put } from './api';

export type NewAddress = { name: string; details: string; phone: string; city: string };

export const signup = (body: unknown) => post('/auth/signup', body);
export const signin = (body: unknown) => post('/auth/signin', body);
export const forgotPassword = (email: { email: string }) => post('/auth/forgotPasswords', email);
export const verifyResetCode = (code: { resetCode: string }) => post('/auth/verifyResetCode', code);
export const resetPassword = (body: { email: string; newPassword: string }) =>
  put('/auth/resetPassword', body);
export const changePassword = (body: { currentPassword: string; password: string; rePassword: string }) =>
  put('/users/changeMyPassword', body);
export const saveUserData = (body: { name: string; email: string; phone: string }) =>
  put('/users/updateMe/', body);
export const getAddresses = () => get('/addresses');
export const addAddresse = (body: NewAddress) => post('/addresses', body);
export const deleteAddresse = (id: string) => del(`/addresses/${id}`);
export const createCashOrder = (cartId: string, body: unknown) => post(`/orders/${cartId}`, body);
export const checkoutSession = (cartId: string, body: unknown) =>
  post(`/orders/checkout-session/${cartId}?url=${encodeURIComponent(environment.url)}`, body);
