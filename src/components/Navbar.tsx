import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PMenu, { type MenuItem } from './PMenu';
import { useApp } from '../context/AppContext';
import { getAllCatgories } from '../services/categories.service';
import { changeLanguage, getCurrentLanguage } from '../i18n';
import type { Icatgory } from '../models/icatgory.interface';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const app = useApp();
  const [categories, setCategories] = useState<Icatgory[]>([]);
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [profOpen, setProfOpen] = useState(false);
  const navMenuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState('');
  const wishListCount = app.wishListCount;
  const cartCount = app.cartCount;
  const isLogedInUser = app.isValidUser;
  const user = app.user;

  useEffect(() => {
    getAllCatgories()
      .then((res) => setCategories(res.data ?? []))
      .catch(() => {});
  }, []);

  // Close / open the mobile menu on document clicks (same behaviour as before)
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!target) return;
      if (menuBtnRef.current?.contains(target)) setIsMenuOpen(true);
      else if (!navMenuRef.current?.contains(target)) setIsMenuOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = () => setIsMenuOpen((s) => !s);
  const categoryID = (name: string) => categories.find((e) => e.name === name)?._id ?? '';

  const goShop = (name: string) => {
    closeMenu();
    navigate(`/shop?category=${categoryID(name)}`);
  };

  const categriesItems = useMemo<MenuItem[]>(
    () => [
      {
        items: [
          { label: t('UI.ALL_CATEGORIES'), command: closeMenu, routerLink: '/categories' },
          { label: t('UI.ELECTRONICS'), command: () => goShop('Electronics') },
          { label: t('UI.WOMENS_FASHION'), command: () => goShop("Women's Fashion") },
          { label: t('UI.MENS_FASHION'), command: () => goShop("Men's Fashion") },
          { label: t('UI.BEAUTY_HEALTH'), command: () => goShop('Beauty & Health') },
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language, categories],
  );

  const profileItems = useMemo<MenuItem[]>(() => {
    const go = (path: string) => () => {
      closeMenu();
      navigate(path);
    };
    if (isLogedInUser) {
      return [
        {
          label: `${user?.name ?? ''}${user?.email ? ' - ' + user.email : ''}`,
          items: [
            { separator: true },
            { label: t('UI.PROFILE'), command: go('/profile/addresses') },
            { label: t('UI.MY_ORDERS'), command: go('/orders') },
            { label: t('UI.MY_WISHLIST'), command: go('/wishlist') },
            { label: t('UI.ADDRESSES'), command: go('/profile/addresses') },
            { label: t('UI.SETTINGS'), command: go('/profile/settings') },
          ],
        },
        { separator: true },
        {
          items: [
            {
              label: t('UI.SIGN_OUT'),
              styleClass: 'sign-out-item',
              command: () => {
                app.signOut();
                navigate('/login');
              },
            },
          ],
        },
      ];
    }
    return [
      {
        items: [
          { label: t('UI.SIGN_IN'), routerLink: '/login', command: closeMenu },
          { label: t('UI.SIGN_UP'), routerLink: '/signup', command: closeMenu },
        ],
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n.language, isLogedInUser, user]);

  const toggleLanguage = () => changeLanguage(getCurrentLanguage() === 'en' ? 'ar' : 'en');

  const search = () => {
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const lang = getCurrentLanguage();
  const navLink = 'text-gray-700 hover:text-primary-600 font-medium transition-colors';
  const drawerLink = 'flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors';
  const catLinks: { label: string; name?: string }[] = [
    { label: t('UI.ELECTRONICS'), name: 'Electronics' },
    { label: t('UI.WOMENS_FASHION'), name: "Women's Fashion" },
    { label: t('UI.MENS_FASHION'), name: "Men's Fashion" },
    { label: t('UI.BEAUTY_HEALTH'), name: 'Beauty & Health' },
  ];
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    closeMenu();
    search();
  };

  return (
    <>
      <div className="hidden lg:block text-sm border-b border-gray-100" aria-label={t('UI.ACCOUNT_AND_CONTACT')}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-10">
            <div className="flex items-center gap-6 text-gray-500">
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-truck text-primary-600 text-xs" />
                <span>{t('COMMON.FREE_SHIPPING')}</span>
              </span>
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-gift text-primary-600 text-xs" />
                <span>{t('COMMON.NEW_ARRIVALS')}</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-gray-500">
                <a href="tel:+18001234567" className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
                  <i className="fa-solid fa-phone text-xs" />
                  <span>+1 (800) 123-4567</span>
                </a>
                <a href="mailto:support@freshcart.com" className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
                  <i className="fa-regular fa-envelope text-xs" />
                  <span>support@freshcart.com</span>
                </a>
              </div>
              <span className="w-px h-4 bg-gray-200"></span>
              <div className="flex items-center gap-4">
                {isLogedInUser ? (
                  <>
                    <Link className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 transition-colors" to="/profile">
                      <i className="fa-regular fa-user text-xs" />
                      <span>{user?.name}</span>
                    </Link>
                    <button type="button" className="flex items-center gap-1.5 text-gray-600 hover:text-red-500 transition-colors" onClick={() => { app.signOut(); navigate('/login'); }}>
                      <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
                      <span>{t('UI.SIGN_OUT')}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 transition-colors" to="/login">
                      <i className="fa-regular fa-user text-xs" />
                      <span>{t('UI.SIGN_IN')}</span>
                    </Link>
                    <Link className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 transition-colors" to="/signup">
                      <i className="fa-solid fa-user-plus text-xs" />
                      <span>{t('UI.SIGN_UP')}</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 lg:h-[72px] gap-4 lg:gap-8">
              <Link className="shrink-0" to="/">
                <img src="./freshcart-logo.svg" alt="FreshCart" width={160} height={31} className="h-6 lg:h-8 w-auto" />
              </Link>
              <form className="hidden lg:flex flex-1 max-w-2xl" onSubmit={submitSearch} role="search">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder={t('NAV.SEARCH')}
                    className="w-full px-5 py-3 pr-12 rounded-full border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                    value={q} onChange={(e) => setQ(e.target.value)}
                  />
                  <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors">
                    <i className="fa-solid fa-magnifying-glass text-sm" />
                  </button>
                </div>
              </form>
              <nav className="hidden xl:flex items-center gap-6">
                <NavLink className={navLink} to="/home">{t('NAV.HOME')}</NavLink>
                <NavLink className={navLink} to="/shop">{t('NAV.SHOP')}</NavLink>
                <div className="relative group">
                  <button className="flex items-center gap-1.5 text-gray-700 hover:text-primary-600 font-medium transition-colors py-2">
                    {t('NAV.CATEGORIES')}
                    <i className="fa-solid fa-chevron-down text-[10px] transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="bg-white border border-gray-100 rounded-xl shadow-xl py-2 min-w-[200px]">
                      <Link className="block px-4 py-2.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors" to="/categories">{t('UI.ALL_CATEGORIES')}</Link>
                      {catLinks.map((c) => (
                        <Link key={c.name} className="block px-4 py-2.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors" to={`/shop?category=${categoryID(c.name!)}`}>{c.label}</Link>
                      ))}
                    </div>
                  </div>
                </div>
                <NavLink className={navLink} to="/brands">{t('NAV.BRANDS')}</NavLink>
              </nav>
              <div className="flex items-center gap-1 lg:gap-2">
                <Link className="hidden lg:flex items-center gap-2 pr-3 mr-2 border-r border-gray-200 hover:opacity-80 transition-opacity" to="/contact">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                    <i className="fa-solid fa-headset text-primary-600" />
                  </div>
                  <div className="text-xs">
                    <div className="text-gray-400">{t('NAV.SUPPORT')}</div>
                    <div className="font-semibold text-gray-700">{t('COMMON.HELP_247')}</div>
                  </div>
                </Link>
                <Link className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors group" title="Wishlist" to="/wishlist">
                  <i className="fa-regular fa-heart text-xl text-gray-500 group-hover:text-primary-600 transition-colors" />
                  {wishListCount ? <span className="absolute top-0.5 right-0.5 size-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">{wishListCount}</span> : null}
                </Link>
                <Link className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors group" title="Cart" to="/cart">
                  <i className="fa-solid fa-cart-shopping text-xl text-gray-500 group-hover:text-primary-600 transition-colors" />
                  {cartCount ? <span className="absolute top-0.5 right-0.5 size-[18px] rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">{cartCount}</span> : null}
                </Link>
                {isLogedInUser ? (
                  <div className="hidden lg:block relative" onMouseEnter={() => setProfOpen(true)} onMouseLeave={() => setProfOpen(false)}>
                    <button className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors group" title="Account" type="button" onClick={() => setProfOpen((o) => !o)}>
                      <i className="fa-regular fa-circle-user text-xl text-gray-500 group-hover:text-primary-600 transition-colors" />
                    </button>
                    <div className={`absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl transition-all duration-200 origin-top-right ${profOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center"><i className="fa-regular fa-circle-user text-xl text-primary-600" /></div>
                          <div className="min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p><p className="text-xs text-gray-400 truncate">{user?.email}</p></div>
                        </div>
                      </div>
                      <div className="py-2">
                        {[['/profile','fa-regular fa-user','My Profile'],['/orders','fa-solid fa-box-open','My Orders'],['/wishlist','fa-regular fa-heart','My Wishlist'],['/profile/addresses','fa-regular fa-address-book','Addresses'],['/profile/settings','fa-solid fa-gear','Settings']].map(([to,ic,l]) => (
                          <Link key={to} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors" to={to} onClick={() => setProfOpen(false)}><i className={ic + ' w-4 text-gray-400'} />{l}</Link>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 py-2">
                        <button type="button" className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left" onClick={() => { app.signOut(); navigate('/login'); }}><i className="fa-solid fa-right-from-bracket w-4" />Sign Out</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link className="hidden lg:flex items-center gap-2 ml-2 px-5 py-2.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-primary-600/20" to="/login">
                    <i className="fa-regular fa-user text-xs" />
                    {t('UI.SIGN_IN')}
                  </Link>
                )}
                <div ref={menuBtnRef} className="lg:hidden ml-1">
                  <button type="button" className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center transition-colors" aria-label="Menu">
                    <i className="fa-solid fa-bars " />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className={`fixed inset-0 bg-black/50 z-50 lg:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div ref={navMenuRef} className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 overflow-y-auto ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
            <img src="./freshcart-logo.svg" alt="FreshCart" width={160} height={31} className="h-8 w-auto" />
            <button type="button" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors" onClick={closeMenu}>
              <i className="fa-solid fa-xmark text-gray-600" />
            </button>
          </div>
          <form className="p-4 border-b border-gray-100" onSubmit={submitSearch} role="search">
            <div className="relative">
              <input type="text" placeholder={t('UI.SEARCH_PRODUCTS')} className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm" value={q} onChange={(e) => setQ(e.target.value)} />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                <i className="fa-solid fa-magnifying-glass text-sm" />
              </button>
            </div>
          </form>
          <nav className="p-4">
            <div className="space-y-1">
              <NavLink className={drawerLink} to="/home" onClick={closeMenu}>{t('NAV.HOME')}</NavLink>
              <NavLink className={drawerLink} to="/shop" onClick={closeMenu}>{t('NAV.SHOP')}</NavLink>
              <NavLink className={drawerLink} to="/categories" onClick={closeMenu}>{t('NAV.CATEGORIES')}</NavLink>
              <NavLink className={drawerLink} to="/brands" onClick={closeMenu}>{t('NAV.BRANDS')}</NavLink>
            </div>
          </nav>
          <div className="mx-4 border-t border-gray-100"></div>
          <div className="p-4 space-y-1">
            <Link className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary-50 transition-colors" to="/wishlist" onClick={closeMenu}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center"><i className="fa-regular fa-heart text-red-500" /></div>
                <span className="font-medium text-gray-700">{t('UI.WISHLIST')}</span>
              </div>
              {wishListCount ? <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{wishListCount}</span> : null}
            </Link>
            <Link className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary-50 transition-colors" to="/cart" onClick={closeMenu}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center"><i className="fa-solid fa-cart-shopping text-primary-600" /></div>
                <span className="font-medium text-gray-700">{t('UI.CART')}</span>
              </div>
              {cartCount ? <span className="bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">{cartCount}</span> : null}
            </Link>
          </div>
          <div className="mx-4 border-t border-gray-100"></div>
          <div className="p-4 space-y-1">
            {isLogedInUser ? (
              <>
                <Link className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary-50 transition-colors" to="/profile" onClick={closeMenu}>
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"><i className="fa-regular fa-user text-gray-500" /></div>
                  <span className="font-medium text-gray-700">{user?.name}</span>
                </Link>
                <button type="button" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors w-full text-left" onClick={() => { closeMenu(); app.signOut(); navigate('/login'); }}>
                  <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center"><i className="fa-solid fa-right-from-bracket text-red-500" /></div>
                  <span className="font-medium text-red-600">Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors" to="/login" onClick={closeMenu}>{t('UI.SIGN_IN')}</Link>
                <Link className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-primary-600 text-primary-600 font-semibold hover:bg-primary-50 transition-colors" to="/signup" onClick={closeMenu}>{t('UI.SIGN_UP')}</Link>
              </div>
            )}
          </div>
          <Link className="mx-4 mt-2 p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3 hover:bg-primary-50 transition-colors" to="/contact" onClick={closeMenu}>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center"><i className="fa-solid fa-headset text-primary-600" /></div>
            <div>
              <div className="text-sm font-semibold text-gray-700">{t('UI.NEED_HELP')}</div>
              <div className="text-sm text-primary-600">{t('UI.CONTACT_SUPPORT')}</div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
