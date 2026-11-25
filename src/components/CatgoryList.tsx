import { lk } from '../utils/qs';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllCatgories } from '../services/categories.service';
import type { Icatgory } from '../models/icatgory.interface';

export default function CatgoryList() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Icatgory[]>([]);

  useEffect(() => {
    getAllCatgories().then((res) => setCategories(res.data));
  }, []);

  return (
    <>
      <section id="categories" className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8">
            <div className="flex items-center gap-3 my-8">
              <div className="h-8 w-1.5 bg-linear-to-b from-emerald-500 to-emerald-700 rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {t('UI.SHOP_BY')} <span className="text-emerald-600">{t('UI.CATEGORY')}</span>
              </h2>
            </div>
            <Link to="/categories" className="text-primary-600 self-end sm:self-auto hover:text-primary-700 font-medium flex items-center gap-2 cursor-pointer">
              {t('UI.VIEW_ALL_CATEGORIES')}
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={lk(['/categories', category._id])}
                className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition group cursor-pointer"
              >
                <div className="h-20 w-20 overflow-hidden bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-200 transition">
                  <img className="w-full h-full object-cover" src={category.image} alt={category.name} />
                </div>
                <h3 className="font-medium">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
