import { Fragment } from 'react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { getAllBrands, getAllProducts } from '../services/products.service';
import { getSpecificCatgories, getSpecificSubCatgories } from '../services/categories.service';
import type { Iproduct } from '../models/iproduct.interface';
import type { Icatgory } from '../models/icatgory.interface';
import type { Ibrand } from '../models/ibrand.interface';

export default function Shop() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const categoryID = searchParams.get('category') ?? '';
  const brandID = searchParams.get('brand') ?? '';
  const subcategoryID = searchParams.get('subcategory') ?? '';
  const [done, setDone] = useState(false);
  const [products, setProducts] = useState<Iproduct[]>([]);
  const [catgory, setCatgory] = useState<Icatgory | null>(null);
  const [brand, setBrand] = useState<Ibrand | null>(null);
  const [subcategory, setSubcategory] = useState<Icatgory | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limitedItem, setLimitedItem] = useState(0);
  const [totaleItems, setTotaleItems] = useState(0);

  const loadProducts = (page: number = 1, filters = { categoryID, brandID, subcategoryID }) => {
    const params: string[] = [];
    if (filters.categoryID) params.push('category=' + filters.categoryID);
    if (filters.brandID) params.push('brand=' + filters.brandID);
    if (filters.subcategoryID) params.push('subcategory=' + filters.subcategoryID);
    if (page) params.push('page=' + page);
    getAllProducts('?' + params.join('&')).then((res) => {
      setCurrentPage(res.metadata.currentPage);
      setLimitedItem(res.metadata.limit);
      setTotaleItems(res.metadata.numberOfPages * res.metadata.limit);
      setProducts(res.data);
      setTimeout(() => setDone(true), 500);
    });
  };

  useEffect(() => {
    loadProducts(1);
    setCatgory(null);
    setBrand(null);
    setSubcategory(null);
    if (categoryID) getSpecificCatgories(categoryID).then((res) => setCatgory(res.data));
    else if (brandID) getAllBrands(brandID).then((res) => setBrand(res.data as any));
    else if (subcategoryID) getSpecificSubCatgories(subcategoryID).then((res: any) => setSubcategory(res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryID, brandID, subcategoryID]);

  const clearFilter = () => {
    setCatgory(null);
    setBrand(null);
  };

  const pageChanged = (event: number) => loadProducts(event);

  return (
    <>
      {done ? (<>
        <div className="min-h-screen bg-gray-50/50">
          <div className="bg-linear-to-br from-primary-600 via-primary-500 to-primary-400 text-white">
            <div className="container mx-auto px-4 py-10 sm:py-14">
              <nav className="flex items-center gap-2 text-sm text-white/70 mb-6 flex-wrap">
                <Link to={'/home'} className="hover:text-white transition-colors cursor-pointer">{t('UI.HOME')}</Link><span className="text-white/40">/</span>
                {categoryID ? (<>
                  {/* Categories */}
                  <Link to={'/categories'} className="hover:text-white transition-colors cursor-pointer">{t('UI.CATEGORIES')}</Link>
                  <span className="text-white/40">/</span>
                  <span className="text-white font-medium">{catgory?.name}</span>
                </>) : brandID ? (<>
                  {/* Brand */}
                  <Link to={'/brands'} className="hover:text-white transition-colors cursor-pointer">{t('UI.BRANDS')}</Link>
                  <span className="text-white/40">/</span>
                  <span className="text-white font-medium">{brand?.name}</span>
                </>) : (<>
                  <span className="text-white font-medium">{t('UI.ALL_PRODUCTS')}</span>
                </>)}
              </nav>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-1 ring-white/30">
                  {categoryID ? (<>
                    <img className="w-10 h-10 object-contain rounded-lg" src={catgory?.image} alt={catgory?.name} />
                  </>) : brandID ? (<>
                    <img className="w-10 h-10 object-contain rounded-lg" src={brand?.image} alt={brand?.name} />
                  </>) : (<>
                    <svg className="svg-inline--fa fa-box-open text-3xl" data-prefix="fas" data-icon="box-open" role="img" viewBox="0 0 640 512" aria-hidden="true">
                      <path fill="currentColor" d="M560.3 237.2c10.4 11.8 28.3 14.4 41.8 5.5 14.7-9.8 18.7-29.7 8.9-44.4l-48-72c-2.8-4.2-6.6-7.7-11.1-10.2L351.4 4.7c-19.3-10.7-42.8-10.7-62.2 0L88.8 116c-5.4 3-9.7 7.4-12.6 12.8L27.7 218.7c-12.6 23.4-3.8 52.5 19.6 65.1l33 17.7 0 53.3c0 23 12.4 44.3 32.4 55.7l176 99.7c19.6 11.1 43.5 11.1 63.1 0l176-99.7c20.1-11.4 32.4-32.6 32.4-55.7l0-117.5zm-240-9.8L170.2 144 320.3 60.6 470.4 144 320.3 227.4zm-41.5 50.2l-21.3 46.2-165.8-88.8 25.4-47.2 161.7 89.8z"></path>
                    </svg>
                  </>)}
                </div>
                <div>
                  {categoryID ? (<>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{catgory?.name}</h2>
                  </>) : brandID ? (<>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{brand?.name}</h2>
                  </>) : (<>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                      {t('UI.ALL_PRODUCTS')}
                    </h2>
                  </>)}
                  <p className="text-white/80 mt-1">
                    {t('UI.EXPLORE_OUR_COMPLETE_PRODUCT_COLLECTION')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            {categoryID ? (<>
              <div className="mb-6 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-2 text-sm text-gray-600"><svg className="svg-inline--fa fa-filter" data-prefix="fas" data-icon="filter" role="img" viewBox="0 0 512 512" aria-hidden="true">
                    <path fill="currentColor" d="M32 64C19.1 64 7.4 71.8 2.4 83.8S.2 109.5 9.4 118.6L192 301.3 192 416c0 8.5 3.4 16.6 9.4 22.6l64 64c9.2 9.2 22.9 11.9 34.9 6.9S320 492.9 320 480l0-178.7 182.6-182.6c9.2-9.2 11.9-22.9 6.9-34.9S492.9 64 480 64L32 64z"></path></svg>{t('UI.ACTIVE_FILTERS')}</span>
                <Link to={'/shop'} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium hover:bg-primary-200 transition-colors" onClick={(e) => { clearFilter(); }}><svg className="svg-inline--fa fa-layer-group text-xs" data-prefix="fas" data-icon="layer-group" role="img" viewBox="0 0 512 512" aria-hidden="true">
                    <path fill="currentColor" d="M232.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 149.8C5.4 145.8 0 137.3 0 128s5.4-17.9 13.9-21.8L232.5 5.2zM48.1 218.4l164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 277.8C5.4 273.8 0 265.3 0 256s5.4-17.9 13.9-21.8l34.1-15.8zM13.9 362.2l34.1-15.8 164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 405.8C5.4 401.8 0 393.3 0 384s5.4-17.9 13.9-21.8z"></path></svg>{catgory?.name}<svg className="svg-inline--fa fa-xmark text-xs" data-prefix="fas" data-icon="xmark" role="img" viewBox="0 0 384 512" aria-hidden="true">
                    <path fill="currentColor" d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"></path>
                  </svg>
                </Link>
              </div>
            </>) : null}

            <div className="mb-6 text-sm text-gray-500">{t('UI.SHOWING_COUNT')} {products.length} {t('UI.PRODUCTS_COUNT_SUFFIX')}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {!products.length ? (<>
                <div className="text-center sticky left-1/2 -translate-x-1/2 py-10">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
                    <svg className="svg-inline--fa fa-box-open text-3xl text-gray-400" data-prefix="fas" data-icon="box-open" role="img" width="60%" viewBox="0 0 640 512" aria-hidden="true">
                      <path fill="currentColor" d="M560.3 237.2c10.4 11.8 28.3 14.4 41.8 5.5 14.7-9.8 18.7-29.7 8.9-44.4l-48-72c-2.8-4.2-6.6-7.7-11.1-10.2L351.4 4.7c-19.3-10.7-42.8-10.7-62.2 0L88.8 116c-5.4 3-9.7 7.4-12.6 12.8L27.7 218.7c-12.6 23.4-3.8 52.5 19.6 65.1l33 17.7 0 53.3c0 23 12.4 44.3 32.4 55.7l176 99.7c19.6 11.1 43.5 11.1 63.1 0l176-99.7c20.1-11.4 32.4-32.6 32.4-55.7l0-117.5zm-240-9.8L170.2 144 320.3 60.6 470.4 144 320.3 227.4zm-41.5 50.2l-21.3 46.2-165.8-88.8 25.4-47.2 161.7 89.8z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {t('UI.NO_PRODUCTS_FOUND')}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {t('UI.NO_PRODUCTS_MATCH_YOUR_CURRENT_FILTERS')}
                  </p>
                  <Link to={'/shop'} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors" onClick={(e) => { clearFilter(); }}>{t('UI.VIEW_ALL_PRODUCTS')}</Link>
                </div>
              </>) : (<>
                {products.map((product, $index) => (<Fragment key={$index}>
                  <ProductCard product={product}></ProductCard>
                </Fragment>))}
              </>)}
            </div>
          </div>
        </div>
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
