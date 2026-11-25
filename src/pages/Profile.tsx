import { Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <>
      <div className="min-h-screen bg-gray-50/50">
        <div className="bg-linear-to-br from-primary-600 via-primary-500 to-primary-400 text-white">
          <div className="container mx-auto px-4 py-10 sm:py-12">
            <nav className="flex items-center gap-2 text-sm text-white/70 mb-6">
              <Link to={'/'} className="hover:text-white transition-colors duration-200">{t('UI.HOME')}</Link><span className="text-white/40">/</span><span className="text-white font-medium">{t('UI.MY_ACCOUNT')}</span>
            </nav>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-1 ring-white/30">
                <svg className="svg-inline--fa fa-user text-3xl" data-prefix="fas" data-icon="user" role="img" viewBox="0 0 448 512" aria-hidden="true">
                  <path fill="currentColor" d="M224 248a120 120 0 1 0 0-240 120 120 0 1 0 0 240zm-29.7 56C95.8 304 16 383.8 16 482.3 16 498.7 29.3 512 45.7 512l356.6 0c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3l-59.4 0z"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('UI.MY_ACCOUNT')}</h1>
                <p className="text-white/80 mt-1">{t('UI.MANAGE_YOUR_ADDRESSES_AND_ACCOUNT_SETTINGS')}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <aside className="w-full lg:w-72 shrink-0">
              <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">{t('UI.MY_ACCOUNT')}</h2>
                </div>
                <ul className="p-2">
                  <li>
                    <NavLink to={'/profile/addresses'} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-gray-600 hover:bg-gray-50 hover:text-gray-900 ${isActive ? 'bg-primary-50 text-primary-700' : ''}`}><div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors bg-gray-100 text-gray-500 group-hover:bg-gray-200 ${(pathname.startsWith('/profile/addresses') ? 'bg-primary-500 text-white group-hover:bg-primary-400' : '')}`}>
                        <svg className="svg-inline--fa fa-location-dot text-sm" data-prefix="fas" data-icon="location-dot" role="img" viewBox="0 0 384 512" aria-hidden="true">
                          <path fill="currentColor" d="M0 188.6C0 84.4 86 0 192 0S384 84.4 384 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"></path>
                        </svg>
                      </div>
                      <span className="font-medium flex-1">{t('UI.MY_ADDRESSES')}</span><svg className={`svg-inline--fa fa-chevron-right text-xs transition-transform text-gray-500 ${(pathname.startsWith('/profile/addresses') ? 'text-primary-500' : '')}`} data-prefix="fas" data-icon="chevron-right" role="img" viewBox="0 0 320 512" aria-hidden="true">
                        <path fill="currentColor" d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"></path></svg></NavLink>
                  </li>
                  <li>
                    <NavLink to={'/profile/settings'} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-gray-600 hover:bg-gray-50 hover:text-gray-900 ${isActive ? 'bg-primary-50 text-primary-700' : ''}`}><div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors bg-gray-100 text-gray-500 group-hover:bg-gray-200 ${(pathname.startsWith('/profile/settings') ? 'bg-primary-500 text-white group-hover:bg-primary-400' : '')}`}>
                        <svg className="svg-inline--fa fa-gear text-sm" data-prefix="fas" data-icon="gear" role="img" viewBox="0 0 512 512" aria-hidden="true">
                          <path fill="currentColor" d="M195.1 9.5C198.1-5.3 211.2-16 226.4-16l59.8 0c15.2 0 28.3 10.7 31.3 25.5L332 79.5c14.1 6 27.3 13.7 39.3 22.8l67.8-22.5c14.4-4.8 30.2 1.2 37.8 14.4l29.9 51.8c7.6 13.2 4.9 29.8-6.5 39.9L447 233.3c.9 7.4 1.3 15 1.3 22.7s-.5 15.3-1.3 22.7l53.4 47.5c11.4 10.1 14 26.8 6.5 39.9l-29.9 51.8c-7.6 13.1-23.4 19.2-37.8 14.4l-67.8-22.5c-12.1 9.1-25.3 16.7-39.3 22.8l-14.4 69.9c-3.1 14.9-16.2 25.5-31.3 25.5l-59.8 0c-15.2 0-28.3-10.7-31.3-25.5l-14.4-69.9c-14.1-6-27.2-13.7-39.3-22.8L73.5 432.3c-14.4 4.8-30.2-1.2-37.8-14.4L5.8 366.1c-7.6-13.2-4.9-29.8 6.5-39.9l53.4-47.5c-.9-7.4-1.3-15-1.3-22.7s.5-15.3 1.3-22.7L12.3 185.8c-11.4-10.1-14-26.8-6.5-39.9L35.7 94.1c7.6-13.2 23.4-19.2 37.8-14.4l67.8 22.5c12.1-9.1 25.3-16.7 39.3-22.8L195.1 9.5zM256.3 336a80 80 0 1 0 -.6-160 80 80 0 1 0 .6 160z"></path>
                        </svg>
                      </div>
                      <span className="font-medium flex-1">{t('UI.SETTINGS')}</span><svg className={`svg-inline--fa fa-chevron-right text-xs transition-transform text-gray-500 ${(pathname.startsWith('/profile/settings') ? 'text-primary-500' : '')}`} data-prefix="fas" data-icon="chevron-right" role="img" viewBox="0 0 320 512" aria-hidden="true">
                        <path fill="currentColor" d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"></path></svg></NavLink>
                  </li>
                </ul>
              </nav>
            </aside>

            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
