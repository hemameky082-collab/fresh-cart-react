import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { environment } from '../config';

export const api = axios.create({ baseURL: environment.basUrlV1 });

export const getToken = (): string | null =>
  localStorage.getItem('token') || sessionStorage.getItem('token');

const TOKEN_URLS = ['cart', 'wishlist', '/reviews', 'orders', 'addresses', 'users', 'verifyToken'];

// Equivalent of the Angular http-header interceptor
api.interceptors.request.use((config) => {
  const url = config.url ?? '';
  if (TOKEN_URLS.some((part) => url.includes(part))) {
    const token = getToken();
    if (token) config.headers.set('token', token);
  }
  return config;
});

// Equivalent of the Angular error interceptor
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string }>) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong!';
    const url = error.config?.url ?? '';
    const isCheckoutDataRequest =
      error.config?.method?.toLowerCase() === 'get' &&
      (url.includes('/addresses') || url.includes('/cart'));
    if (!(isCheckoutDataRequest && error.response?.status === 401)) {
      toast.error(message);
    }
    return Promise.reject(error);
  },
);

export const get = <T = any>(url: string, params?: object) => api.get<T>(url, { params }).then((r) => r.data);
export const post = <T = any>(url: string, body?: unknown) => api.post<T>(url, body).then((r) => r.data);
export const put = <T = any>(url: string, body?: unknown) => api.put<T>(url, body).then((r) => r.data);
export const del = <T = any>(url: string) => api.delete<T>(url).then((r) => r.data);
