import { get } from './api';
import type { IproductRes } from '../models/iproduct-res.interface';
import type { IbrandRes } from '../models/ibrand-res.interface';

export const getAllProducts = (param: string = '') => get<IproductRes>(`/products${param}`);
export const getSpecificProduct = (id: string) => get<IproductRes>(`/products/${id}`);
export const getAllBrands = (id: string = '') => get<IbrandRes>(`/brands/${id}`);
