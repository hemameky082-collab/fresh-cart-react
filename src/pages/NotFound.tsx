import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/notfound.css';

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  return (
    <>
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center px-4 py-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Apple */}
          <div className="absolute top-[10%] left-[5%] text-primary-200 text-4xl animate-float-6">
            <i className="fa-solid fa-apple-whole"></i>
          </div>

          {/* Floating Carrot */}
          <div className="absolute top-[20%] right-[10%] text-primary-200 text-3xl animate-float-8">
            <i className="fa-solid fa-carrot"></i>
          </div>

          {/* Floating Lemon */}
          <div className="absolute bottom-[25%] left-[8%] text-primary-200 text-3xl animate-float-7">
            <i className="fa-solid fa-lemon"></i>
          </div>

          {/* Floating Seedling */}
          <div className="absolute bottom-[15%] right-[15%] text-primary-200 text-4xl animate-float-9">
            <i className="fa-solid fa-seedling"></i>
          </div>

          {/* Floating Apple */}
          <div className="absolute top-[50%] left-[15%] text-primary-100 text-2xl animate-float-5">
            <i className="fa-solid fa-apple-whole"></i>
          </div>

          {/* Floating Carrot */}
          <div className="absolute top-[40%] right-[5%] text-primary-100 text-2xl animate-float-6">
            <i className="fa-solid fa-carrot"></i>
          </div>

          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-125 h-125 bg-linear-to-bl from-primary-100/40 to-transparent rounded-full blur-3xl"></div>

          <div className="absolute bottom-0 left-0 w-100 h-100 bg-linear-to-tr from-primary-100/30 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-xl w-full">
          <div className="flex justify-center mb-10">
            <div className="relative">
              <div className="absolute inset-0 w-64 h-52 sm:w-72 sm:h-60 bg-primary-100/50 rounded-[32px] blur-2xl"></div>
              <div className="relative w-64 h-52 sm:w-72 sm:h-60">
                <div className="absolute inset-x-0 top-4 mx-auto w-52 h-40 sm:w-60 sm:h-44 bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-primary-50/80 via-transparent to-primary-100/40"></div>
                  <svg className="svg-inline--fa fa-cart-shopping relative text-6xl sm:text-7xl text-primary-400/80" data-prefix="fas" data-icon="cart-shopping" role="img" viewBox="0 0 640 512" aria-hidden="true">
                    <path fill="currentColor" d="M24-16C10.7-16 0-5.3 0 8S10.7 32 24 32l45.3 0c3.9 0 7.2 2.8 7.9 6.6l52.1 286.3c6.2 34.2 36 59.1 70.8 59.1L456 384c13.3 0 24-10.7 24-24s-10.7-24-24-24l-255.9 0c-11.6 0-21.5-8.3-23.6-19.7l-5.1-28.3 303.6 0c30.8 0 57.2-21.9 62.9-52.2L568.9 69.9C572.6 50.2 557.5 32 537.4 32l-412.7 0-.4-2c-4.8-26.6-28-46-55.1-46L24-16zM208 512a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm224 0a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"></path>
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 sm:top-0 sm:right-0">
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-full bg-white shadow-lg"></div>
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/40">
                      <span className="text-xl sm:text-2xl font-black text-white tracking-tight">404</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4"><div className="w-2.5 h-2.5 rounded-full bg-primary-400"></div><div className="w-8 h-4 border-b-[3px] border-primary-400 rounded-b-full"></div><div className="w-2.5 h-2.5 rounded-full bg-primary-400"></div></div>

              </div>
            </div>
          </div>
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">
              {t('UI.OOPS_NOTHING_HERE')}
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto">
              Looks like this page went out of stock! Don't worry, there's plenty more fresh content to
              explore.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to={'/'} className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-1">
              <svg className="svg-inline--fa fa-house group-hover:scale-110 transition-transform duration-300" data-prefix="fas" data-icon="house" role="img" viewBox="0 0 512 512" aria-hidden="true">
                <path fill="currentColor" d="M277.8 8.6c-12.3-11.4-31.3-11.4-43.5 0l-224 208c-9.6 9-12.8 22.9-8 35.1S18.8 272 32 272l16 0 0 176c0 35.3 28.7 64 64 64l288 0c35.3 0 64-28.7 64-64l0-176 16 0c13.2 0 25-8.1 29.8-20.3s1.6-26.2-8-35.1l-224-208zM240 320l32 0c26.5 0 48 21.5 48 48l0 96-128 0 0-96c0-26.5 21.5-48 48-48z"></path>
              </svg>
              {t('UI.GO_TO_HOMEPAGE')}
            </Link>
            <button className="group cursor-pointer w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 hover:-translate-y-1" onClick={(e) => { goBack(); }}>
              <svg className="svg-inline--fa fa-arrow-left group-hover:-translate-x-1 transition-transform duration-300" data-prefix="fas" data-icon="arrow-left" role="img" viewBox="0 0 512 512" aria-hidden="true">
                <path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path></svg>{t('UI.GO_BACK')}
            </button>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
              {t('UI.POPULAR_DESTINATIONS')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to={'/products'} className="px-5 py-2.5 rounded-xl bg-primary-50 text-primary-700 font-semibold text-sm hover:bg-primary-100 transition-colors">{t('UI.ALL_PRODUCTS')}</Link><Link to={'/categories'} className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">{t('UI.CATEGORIES')}</Link><Link to={'/deals'} className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">Today's Deals</Link><Link to={'/contact'} className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors">{t('UI.CONTACT_US')}</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
