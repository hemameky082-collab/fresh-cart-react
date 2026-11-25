import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../styles/swiper.css';

const slides = [
  { title: 'UI.CAROUSEL_FRESH_DELIVERY', content: 'UI.CAROUSEL_OFFER', buttonTextOne: 'UI.SHOP_NOW', buttonTextTwo: 'UI.VIEW_DEALS', textTwo: 'text-primary-500', image: './images/home-slider-1.png' },
  { title: 'UI.CAROUSEL_PREMIUM', content: 'UI.FRESH_FARM_TABLE', buttonTextOne: 'UI.SHOP_NOW', buttonTextTwo: 'UI.LEARN_MORE', textTwo: 'text-blue-500', image: './images/home-slider-1.png' },
  { title: 'UI.FAST_FREE_DELIVERY', content: 'UI.SAME_DAY_DELIVERY', buttonTextOne: 'UI.ORDER_NOW', buttonTextTwo: 'UI.DELIVERY_INFO', textTwo: 'text-purple-500', image: './images/home-slider-1.png' },
];

export default function HeroSwiper() {
  const { t, i18n } = useTranslation();
  return (
    <div className="relative">
      <Swiper
        key={i18n.language}
        className="mySwiper"
        dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        spaceBetween={0}
        loop
        autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        navigation={{ prevEl: '.custom-prev', nextEl: '.custom-next' }}
        pagination={{ clickable: true }}
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div
              style={{ backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              className="h-[400px] flex items-center justify-center"
            >
              <div className="overlay py-20 text-white p-4 w-full h-full bg-linear-to-r from-primary-500/90 to-primary-400/50">
                <div className="container h-full content-center">
                  <h2 className="text-white text-3xl font-bold mb-4 max-w-96">{t(slide.title)}</h2>
                  <p>{t(slide.content)}</p>
                  <div className="mt-4">
                    <Link
                      className={`btn cursor-pointer bg-white border-2 border-white/50 ${slide.textTwo} inline-block px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform`}
                      to="/shop"
                    >
                      {t(slide.buttonTextOne)}
                    </Link>
                    <Link
                      className="btn cursor-pointer bg-transparent border-2 border-white/50 text-white ml-2 inline-block px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform"
                      to=""
                    >
                      {t(slide.buttonTextTwo)}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="custom-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white/90 hover:bg-white text-primary-500 hover:text-primary-600 rounded-full w-12 h-12 hidden md:flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110">
        <i className="fa-solid fa-chevron-left text-lg"></i>
      </div>
      <div className="custom-next absolute right-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white/90 hover:bg-white text-primary-500 hover:text-primary-600 rounded-full w-12 h-12 hidden md:flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110">
        <i className="fa-solid fa-chevron-right text-lg"></i>
      </div>
    </div>
  );
}
