import { Fragment } from 'react';
import { lk } from '../utils/qs';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllCatgories, getAllSubCatgories, getSpecificCatgories, getSpecificSubCatgories } from '../services/categories.service';
import type { Icatgory } from '../models/icatgory.interface';
import { qs } from '../utils/qs';

export default function Categories() {
  const { t } = useTranslation();
  const { id: CategoryID = null } = useParams();
  const location = useLocation();
  const navigateTo = useNavigate();
  const [categories, setCategories] = useState<Icatgory[]>([]);
  const [done, setDone] = useState(false);
  const [allSubCategories, setAllSubCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any | null>(null);

  const goBack = () => navigateTo(-1);

  useEffect(() => {
    setDone(false);
    setAllSubCategories([]);
    if (CategoryID) {
      const req: Promise<any> = location.pathname.includes('subcategories')
        ? getSpecificSubCatgories(CategoryID)
        : getSpecificCatgories(CategoryID);
      req.then((res) => setSubCategories(res.data));
    } else {
      setSubCategories(null);
      getAllCatgories().then((res) => setCategories(res.data));
    }
    const timer = setTimeout(() => setDone(true), 500);
    return () => clearTimeout(timer);
  }, [CategoryID, location.pathname]);

  const getAllSubCategorys = () => {
    setDone(false);
    setSubCategories(null);
    getAllSubCatgories().then((res) => {
      setAllSubCategories(res.data as any);
      setTimeout(() => setDone(true), 500);
    });
  };

  const navigate = (id: string) => {
    if (location.pathname.includes('subcategor')) navigateTo(`/shop?subcategory=${id}`);
    else navigateTo(`/shop?category=${id}`);
  };

  return (
    <>
      {done ? (<>
        <div className="min-h-screen bg-gray-50/50">
          <div className="bg-linear-to-br from-primary-600 via-primary-500 to-primary-400 text-white">
            <div className="container mx-auto px-4 py-12 sm:py-16">
              <div className="flex items-center gap-2 text-sm text-white/70 mb-6">
                <Link to={'/home'} className="hover:text-white transition-colors">{t('UI.HOME')}</Link><span className="text-white/40">/</span><span className="text-white font-medium">{t('UI.CATEGORIES')}</span>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-1 ring-white/30">
                  <svg className="svg-inline--fa fa-layer-group text-3xl" data-prefix="fas" data-icon="layer-group" role="img" viewBox="0 0 512 512" aria-hidden="true">
                    <path fill="currentColor" d="M232.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 149.8C5.4 145.8 0 137.3 0 128s5.4-17.9 13.9-21.8L232.5 5.2zM48.1 218.4l164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 277.8C5.4 273.8 0 265.3 0 256s5.4-17.9 13.9-21.8l34.1-15.8zM13.9 362.2l34.1-15.8 164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 405.8C5.4 401.8 0 393.3 0 384s5.4-17.9 13.9-21.8z"></path>
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                    {t('UI.ALL_CATEGORIES')}
                  </h1>
                  <p className="text-white/80 mt-1">
                    {t('UI.BROWSE_OUR_WIDE_RANGE_OF_PRODUCT_CATEGORIES')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {categories.length ? (<>
            <div className="container mx-auto px-4 py-10">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {categories.map((catgory, $index) => (<Fragment key={$index}>
                  <Link to={lk(['/categories/', catgory._id])} className="group bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4">
                      <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={catgory.name} src={catgory.image} />
                    </div>

                    <h3 className="font-bold text-gray-900 text-center group-hover:text-primary-600 transition-colors">
                      {catgory.name}
                    </h3>

                    <div className="flex justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-primary-600 flex items-center gap-1">
                        {t('UI.VIEW_SUBCATEGORIES')}
                        <svg className="text-[10px]" role="img" width="1em" height="1em" viewBox="0 0 512 512" aria-hidden="true">
                          <path fill="currentColor" d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"></path>
                        </svg>
                      </span>
                    </div>
                  </Link>
                </Fragment>))}
              </div>
            </div>
          </>) : (<>
            {CategoryID ? (<>
              <div className="container mx-auto px-4 py-10">
                {/* Navigation */}
                <div className="mb-6 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {allSubCategories.length ? (<>
                      <a className="inline-flex cursor-pointer items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors" onClick={(e) => { goBack(); }}>
                        <svg width="1rem" height="1rem" role="img" viewBox="0 0 512 512" aria-hidden="true">
                          <path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path>
                        </svg>
                        <span>{t('UI.GO_BACK')}</span>
                      </a>
                    </>) : subCategories ? (<>
                      <a className="inline-flex cursor-pointer items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors" onClick={(e) => { getAllSubCategorys(); }}>
                        <svg width="1rem" height="1rem" role="img" viewBox="0 0 512 512" aria-hidden="true">
                          <path fill="currentColor" d="M9.4 233.4c-12.5-12.5-12.5-32.8 0-45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8 0-45.3 0l-160 160z"></path>
                        </svg>
                        <span>{t('UI.VIEW_ALL_SUBCATEGORIES')}</span>
                      </a>
                    </>) : null}

                    <h2 className="text-lg font-bold text-gray-900">
                      {allSubCategories.length
                          ? allSubCategories.length + ' Subcategories'
                          : (t('UI.SUBCATEGORIES'))}
                    </h2>
                  </div>
                </div>

                {/* Subcategories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 relative">
                  {allSubCategories.length ? (<>
                    {allSubCategories.map((sub, $index) => (<Fragment key={$index}>
                      <a className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300 hover:-translate-y-1" onClick={(e) => { navigate(sub._id); }}>
                        <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                          <svg className="text-2xl text-primary-600" role="img" width="3rem" height="3rem" viewBox="0 0 576 512" aria-hidden="true">
                            <path fill="currentColor" d="M56 225.6L32.4 296.2 32.4 96c0-35.3 28.7-64 64-64l138.7 0c13.8 0 27.3 4.5 38.4 12.8l38.4 28.8c5.5 4.2 12.3 6.4 19.2 6.4l117.3 0c35.3 0 64 28.7 64 64l0 16-365.4 0c-41.3 0-78 26.4-91.1 65.6zM477.8 448L99 448c-32.8 0-55.9-32.1-45.5-63.2l48-144C108 221.2 126.4 208 147 208l378.8 0c32.8 0 55.9 32.1 45.5 63.2l-48 144c-6.5 19.6-24.9 32.8-45.5 32.8z"></path>
                          </svg>
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors mb-2">
                          {sub.name}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>{t('UI.BROWSE_PRODUCTS')}</span>
                          <svg className="text-xs" role="img" width="1rem" height="1rem" viewBox="0 0 512 512" aria-hidden="true">
                            <path fill="currentColor" d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.8-45.3 0s-12.8 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"></path>
                          </svg>
                        </div>
                      </a>
                    </Fragment>))}
                  </>) : subCategories ? (<>
                    <a className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300 hover:-translate-y-1" onClick={(e) => { navigate(subCategories?._id ?? ''); }}>
                      <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                        <svg className="text-2xl text-primary-600" role="img" width="3rem" height="3rem" viewBox="0 0 576 512" aria-hidden="true">
                          <path fill="currentColor" d="M56 225.6L32.4 296.2 32.4 96c0-35.3 28.7-64 64-64l138.7 0c13.8 0 27.3 4.5 38.4 12.8l38.4 28.8c5.5 4.2 12.3 6.4 19.2 6.4l117.3 0c35.3 0 64 28.7 64 64l0 16-365.4 0c-41.3 0-78 26.4-91.1 65.6zM477.8 448L99 448c-32.8 0-55.9-32.1-45.5-63.2l48-144C108 221.2 126.4 208 147 208l378.8 0c32.8 0 55.9 32.1 45.5 63.2l-48 144c-6.5 19.6-24.9 32.8-45.5 32.8z"></path>
                        </svg>
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors mb-2">
                        {subCategories?.name}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>{t('UI.BROWSE_PRODUCTS')}</span>
                        <svg className="text-xs" role="img" width="1rem" height="1rem" viewBox="0 0 512 512" aria-hidden="true">
                          <path fill="currentColor" d="M502.6 278.6c12.5-12.5 12.5-32.8-32.8-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"></path>
                        </svg>
                      </div>
                    </a>
                  </>) : (<>
                    <div className="text-center py-20 sticky left-1/2 -translate-x-1/2">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
                        <svg className="svg-inline--fa fa-folder-open text-3xl text-gray-400" data-prefix="fas" data-icon="folder-open" role="img" viewBox="0 0 576 512" aria-hidden="true">
                          <path fill="currentColor" d="M56 225.6L32.4 296.2 32.4 96c0-35.3 28.7-64 64-64l138.7 0c13.8 0 27.3 4.5 38.4 12.8l38.4 28.8c5.5 4.2 12.3 6.4 19.2 6.4l117.3 0c35.3 0 64 28.7 64 64l0 16-365.4 0c-41.3 0-78 26.4-91.1 65.6zM477.8 448L99 448c-32.8 0-55.9-32.1-45.5-63.2l48-144C108 221.2 126.4 208 147 208l378.8 0c32.8 0 55.9 32.1 45.5 63.2l-48 144c-6.5 19.6-24.9 32.8-45.5 32.8z"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {t('UI.NO_SUBCATEGORIES_FOUND')}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {t('UI.THIS_CATEGORY_DOESN_T_HAVE_ANY_SUBCATEGORIES_YET')}
                      </p>
                      <Link to={'/shop'} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">{t('UI.VIEW_ALL_PRODUCTS')}</Link>
                    </div>
                  </>)}
                </div>
              </div>
            </>) : null}
          </>)}
        </div>
      </>) : (<>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item, $index) => (<Fragment key={$index}>
            <div className="h-40 rounded-lg bg-gray-200 animate-pulse"></div>
          </Fragment>))}
        </div>
      </>)}
    </>
  );
}
