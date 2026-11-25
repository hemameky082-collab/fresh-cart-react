import { Fragment } from 'react';
//SCOPE:scope-search
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';
import { getAllBrands, getAllProducts } from '../services/products.service';
import { getAllCatgories, getAllSubCatgories } from '../services/categories.service';
import type { Iproduct } from '../models/iproduct.interface';
import type { Icatgory } from '../models/icatgory.interface';
import type { Ibrand } from '../models/ibrand.interface';
import '../styles/search.css';

const readPrice = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function Search() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Iproduct[]>([]);
  const [categories, setCategories] = useState<Icatgory[]>([]);
  const [subcategories, setSubcategories] = useState<Icatgory[]>([]);
  const [brands, setBrands] = useState<Ibrand[]>([]);
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The URL is the source of truth for filters
  const selectedCategories = params.getAll('category');
  const selectedSubcategories = params.getAll('subcategory');
  const selectedBrands = params.getAll('brand');
  const minPrice = readPrice(params.get('minPrice'));
  const maxPrice = readPrice(params.get('maxPrice'));
  const sort = params.get('sort') ?? '';
  const resultCount = products.length;

  useEffect(() => {
    getAllCatgories().then((res) => setCategories(res.data ?? []));
    getAllSubCatgories().then((res) => setSubcategories(res.data ?? []));
    getAllBrands().then((res) => setBrands(res.data ?? []));
    return () => clearTimeout(searchTimer.current);
  }, []);

  const paramString = params.toString();
  useEffect(() => {
    setQuery(params.get('q') ?? '');
    const q = new URLSearchParams();
    for (const key of ['q', 'brand', 'category', 'subcategory', 'minPrice', 'maxPrice', 'sort']) {
      for (const value of params.getAll(key)) if (value) q.append(key, value);
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    getAllProducts(`?${q.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
        setError('Could not load products. Please try again.');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramString]);

  const updateUrl = (changes: Record<string, string | number | string[] | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      next.delete(key);
      if (Array.isArray(value)) value.forEach((v) => next.append(key, v));
      else if (value !== null && value !== undefined && value !== '') next.set(key, String(value));
    });
    setParams(next);
  };

  const toggleFilter = (key: 'category' | 'subcategory' | 'brand', id: string, checked: boolean) => {
    const current = key === 'category' ? selectedCategories : key === 'brand' ? selectedBrands : selectedSubcategories;
    const next = checked ? [...new Set([...current, id])] : current.filter((item) => item !== id);
    updateUrl({ [key]: next.length ? next : null });
  };

  const setPrice = (key: 'minPrice' | 'maxPrice', value: string) => {
    const parsed = value.trim() ? Number(value) : null;
    if (parsed !== null && !Number.isFinite(parsed)) return;
    updateUrl({ [key]: parsed });
  };

  const setPriceRange = (min: number | null, max: number | null) => updateUrl({ minPrice: min, maxPrice: max });
  const setSort = (value: string) => updateUrl({ sort: value || null });

  const updateSearch = (value: string = query) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => updateUrl({ q: value.trim() || null }), 500);
  };

  const clearFilters = () =>
    updateUrl({ category: null, subcategory: null, brand: null, minPrice: null, maxPrice: null, sort: null });

  return (
    <>
      <div className="scope-search">
      <main className="search-page">
        <header className="search-header">
          <p className="breadcrumbs">
            <span className="hover:text-primary-600! duration-300 transition-all cursor-pointer" onClick={() => navigate('/home')}>{t('UI.HOME')}</span>
            <span>/</span> {t('UI.SEARCH_PAGE.BREADCRUMB')}
          </p>
          <form className="search-box" onSubmit={(e) => { e.preventDefault(); updateSearch(); }}>
            <span aria-hidden="true">⌕</span>
            <input type="search" value={query} onChange={(e) => { setQuery((e.target as any).value); updateSearch(); }} placeholder={t('UI.SEARCH_PAGE.SEARCH_PLACEHOLDER')} aria-label={t('UI.SEARCH_PAGE.SEARCH_PLACEHOLDER')} />
          </form>
        </header>

        <div className="search-layout">
          <aside className="filters" aria-label="Product filters">
            <div className="filter-heading">
              <h2>{t('UI.SEARCH_PAGE.FILTERS')}</h2>
              <button className="clear-button" type="button" onClick={(e) => { clearFilters(); }}>
                {t('UI.SEARCH_PAGE.CLEAR_ALL')}
              </button>
            </div>

            <section className="filter-section scrollable-section">
              <h3>{t('UI.SEARCH_PAGE.CATEGORIES')}</h3>
              {categories.map((category, $index) => (<Fragment key={$index}>
                <label className="filter-option">
                  <input type="checkbox" checked={selectedCategories.includes(category._id)} onChange={(e) => { toggleFilter('category', category._id, (e.target as any).checked); }} />
                  <span>{category.name}</span>
                </label>
              </Fragment>))}
            </section>

            <section className="filter-section scrollable-section">
              <h3>{t('UI.SEARCH_PAGE.SUBCATEGORIES')}</h3>
              {subcategories.map((subcategory, $index) => (<Fragment key={$index}>
                <label className="filter-option">
                  <input type="checkbox" checked={selectedSubcategories.includes(subcategory._id)} onChange={(e) => { toggleFilter('subcategory', subcategory._id, (e.target as any).checked); }} />
                  <span>{subcategory.name}</span>
                </label>
              </Fragment>))}
            </section>

            <section className="filter-section price-section">
              <h3>{t('UI.SEARCH_PAGE.PRICE_RANGE')}</h3>
              <div className="price-inputs">
                <label>{t('UI.SEARCH_PAGE.MIN_PRICE')}<input type="number" min={0} value={minPrice ?? ''} onChange={(e) => { setPrice('minPrice', (e.target as any).value); }} placeholder={t('UI.SEARCH_PAGE.NO_LIMIT')} /></label>
                <label>{t('UI.SEARCH_PAGE.MAX_PRICE')}<input type="number" min={0} value={maxPrice ?? ''} onChange={(e) => { setPrice('maxPrice', (e.target as any).value); }} placeholder={t('UI.SEARCH_PAGE.NO_LIMIT')} /></label>
              </div>
              <div className="price-presets">
                <button type="button" onClick={(e) => { setPriceRange(null, 500); }}>
                  {t('UI.SEARCH_PAGE.UNDER_500')}
                </button>
                <button type="button" onClick={(e) => { setPriceRange(500, 1000); }}>
                  {t('UI.SEARCH_PAGE.RANGE_500_1000')}
                </button>
                <button type="button" onClick={(e) => { setPriceRange(1000, 2000); }}>
                  {t('UI.SEARCH_PAGE.RANGE_1000_2000')}
                </button>
              </div>
            </section>

            <section className="filter-section scrollable-section">
              <h3>{t('UI.SEARCH_PAGE.BRANDS')}</h3>
              {brands.map((brand, $index) => (<Fragment key={$index}>
                <label className="filter-option">
                  <input type="checkbox" checked={selectedBrands.includes(brand._id)} onChange={(e) => { toggleFilter('brand', brand._id, (e.target as any).checked); }} />
                  <span>{brand.name}</span>
                </label>
              </Fragment>))}
            </section>
          </aside>

          <section className="results" aria-live="polite">
            <div className="results-heading">
              <div>
                <h1>{t('UI.SEARCH_PAGE.BREADCRUMB')}</h1>
                <p>{resultCount} {t('UI.SEARCH_PAGE.PRODUCTS_FOUND')}</p>
              </div>
              <div className="results-tools">
                <label className="sort-control"><span>{t('UI.SEARCH_PAGE.SORT_BY')}</span>
                  <select value={sort} onChange={(e) => { setSort((e.target as any).value); }} aria-label="Sort products">
                    <option value="">{t('UI.SEARCH_PAGE.RELEVANCE')}</option>
                    <option value="price">{t('UI.SEARCH_PAGE.PRICE_LOW_HIGH')}</option>
                    <option value="-price">{t('UI.SEARCH_PAGE.PRICE_HIGH_LOW')}</option>
                    <option value="-ratingsAverage">{t('UI.SEARCH_PAGE.TOP_RATED')}</option>
                    <option value="title">{t('UI.SEARCH_PAGE.NAME_A_Z')}</option>
                    <option value="-title">{t('UI.SEARCH_PAGE.NAME_Z_A')}</option>
                  </select>
                </label>
                <div className="view-switch" role="group" aria-label="Product view">
                  <button className={` ${viewMode === 'grid' ? 'selected' : ''}`} type="button" aria-label={t('UI.SEARCH_PAGE.GRID_VIEW')} title={t('UI.SEARCH_PAGE.GRID_VIEW')} aria-pressed={viewMode === 'grid'} onClick={(e) => { setViewMode('grid'); }}>
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <rect x="1" y="1" width="5.5" height="5.5" rx="1" />
                      <rect x="9.5" y="1" width="5.5" height="5.5" rx="1" />
                      <rect x="1" y="9.5" width="5.5" height="5.5" rx="1" />
                      <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1" />
                    </svg>
                  </button>
                  <button className={` ${viewMode === 'list' ? 'selected' : ''}`} type="button" aria-label={t('UI.SEARCH_PAGE.LIST_VIEW')} title={t('UI.SEARCH_PAGE.LIST_VIEW')} aria-pressed={viewMode === 'list'} onClick={(e) => { setViewMode('list'); }}>
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M1 2h2v2H1zM5 2h10v2H5zM1 7h2v2H1zM5 7h10v2H5zM1 12h2v2H1zM5 12h10v2H5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {loading ? (<>
              <div className="state-message loading-state">
                <span className="spinner" aria-hidden="true"></span><span>{t('UI.SEARCH_PAGE.LOADING')}</span>
              </div>
            </>) : error ? (<>
              <div className="state-message error-message">{t('UI.SEARCH_PAGE.LOAD_ERROR')}</div>
            </>) : products.length ? (<>
              <div className={`product-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {products.map((product, $index) => (<Fragment key={$index}>
                  <ProductCard product={product}></ProductCard>
                </Fragment>))}
              </div>
            </>) : (<>
              <div className="state-message">{t('UI.SEARCH_PAGE.NO_MATCHES')}</div>
            </>)}
          </section>
        </div>
      </main>
      </div>
    </>
  );
}
