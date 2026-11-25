import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { revealRef } from '../utils/reveal';
import '../styles/features.css';

export default function Features() {
  const { t } = useTranslation();

  return (
    <>
      <section className="py-10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="scroll-reveal relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 p-8 text-white" ref={revealRef}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm mb-4">
                  <span>🔥</span><span>{t('UI.DEAL_OF_THE_DAY')}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">{t('UI.FRESH_ORGANIC_FRUITS')}</h3>
                <p className="text-white/80 mb-4">{t('UI.GET_UP_TO_40_OFF_ON_SELECTED_ORGANIC_FRUITS')}</p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl font-bold">40% OFF</div>
                  <div className="text-sm text-white/70">
                    {t('UI.USE_CODE')} <span className="font-bold text-white">ORGANIC40</span>
                  </div>
                </div>
                <Link to={'/shop'} className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">{t('UI.SHOP_NOW')}<i className="fa-solid fa-arrow-right" /></Link>
              </div>
            </div>
            <div className="scroll-reveal relative overflow-hidden rounded-2xl bg-linear-to-br from-orange-400 to-rose-500 p-8 text-white" ref={revealRef}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm mb-4">
                  <span>✨</span><span>{t('UI.NEW_ARRIVALS')}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">{t('UI.EXOTIC_VEGETABLES')}</h3>
                <p className="text-white/80 mb-4">{t('UI.DISCOVER_OUR_LATEST_COLLECTION_OF_PREMIUM_VEGETABLES')}</p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl font-bold">25% OFF</div>
                  <div className="text-sm text-white/70">
                    {t('UI.USE_CODE')} <span className="font-bold text-white">FRESH25</span>
                  </div>
                </div>
                <Link to={'/shop?sort=newest'} className="inline-flex items-center gap-2 bg-white text-orange-500 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">{t('UI.EXPLORE_NOW')}<i className="fa-solid fa-arrow-right" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
