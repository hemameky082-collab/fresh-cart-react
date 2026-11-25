import { get } from './api';
import type { IcatgoryRes, IspecificCatgoryRes } from '../models/icatgory-res.interface';

export const getAllCatgories = () => get<IcatgoryRes>('/categories');
export const getSpecificCatgories = (id: string) => get<IspecificCatgoryRes>(`/categories/${id}`);
export const getAllSubCatgories = () => get<IcatgoryRes>('/subcategories');
export const getSpecificSubCatgories = (id: string) => get<IspecificCatgoryRes>(`/subcategories/${id}`);
export const getAllSubCategoriesOnCategory = (id: string) =>
  get<IspecificCatgoryRes>(`/categories/${id}/subcategories`);
