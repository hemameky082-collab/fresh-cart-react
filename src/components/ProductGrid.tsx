import { Fragment } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';
import { getAllProducts } from '../services/products.service';
import type { Iproduct } from '../models/iproduct.interface';

export default function ProductGrid() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Iproduct[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    getAllProducts()
      .then((res) => setProducts(res.data))
      .catch(() => {})
      .finally(() => setDone(true));
  }, []);

  return (
    <>
      {done ? (<>
        <section className="py-10">
         <div className="container mx-auto">
          <div className="flex items-center gap-3 my-8">
            <div className="h-8 w-1.5 bg-linear-to-b from-emerald-500 to-emerald-700 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-800">
              {t('UI.FEATURED')} <span className="text-emerald-600">{t('UI.PRODUCTS')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product, $index) => (<Fragment key={$index}>
              <ProductCard product={product}></ProductCard>
            </Fragment>))}
          </div>
         </div>
        </section>
      </>) : (<>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item, $index) => (<Fragment key={$index}>
            <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
              {/* Product Image */}
              <div className="aspect-square bg-gray-200 animate-pulse"></div>

              {/* Product Information */}
              <div className="space-y-3 p-3">
                {/* Product Title */}
                <div className="h-4 w-full rounded bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse"></div>

                {/* Rating / Category */}
                <div className="h-3 w-1/3 rounded bg-gray-200 animate-pulse"></div>

                {/* Price */}
                <div className="h-5 w-1/2 rounded bg-gray-200 animate-pulse"></div>
              </div>
            </div>
          </Fragment>))}
        </div>
      </>)}
    </>
  );
}
