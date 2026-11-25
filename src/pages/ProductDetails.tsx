import { Fragment } from 'react';
import { lk } from '../utils/qs';
//SCOPE:scope-product-details
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { useApp } from '../context/AppContext';
import { getToken } from '../services/api';
import { getAllProducts, getSpecificProduct } from '../services/products.service';
import {
  addToCart as addToCartApi,
  addToWithList as addToWishApi,
  removefromWithList,
  createReviewForProduct,
  updateReviewForProduct,
  deleteReviewForProduct,
  getReviewsForProduct,
} from '../services/user.service';
import type { Iproduct, Review, ReviewsStatus } from '../models/iproduct.interface';
import { fc, fd } from '../utils/format';
import { qs } from '../utils/qs';
import ProductCard from '../components/ProductCard';
import { timeAgoFormat } from '../utils/timeAgo';
import '../styles/image-gallery.css';

const summarize = (reviews: Review[]): ReviewsStatus => {
  const counts = [1, 2, 3, 4, 5].map((r) => reviews.filter((i) => i.rating === r).length);
  const d = reviews.length || 1;
  const p = (n: number) => Math.round((n / d) * 100);
  return { oneStar: p(counts[0]), twoStar: p(counts[1]), threeStar: p(counts[2]), fourStar: p(counts[3]), fiveStar: p(counts[4]) } as ReviewsStatus;
};

export default function ProductDetails() {
  const { t } = useTranslation();
  const app = useApp();
  const navigate = useNavigate();
  const { id: productID = '' } = useParams();
  const [product, setProduct] = useState<Iproduct>({} as Iproduct);
  const stars = Array(5).fill(0);
  const [quantity, setQuantity] = useState(1);
  const [totalePrice, setTotalePrice] = useState(1);
  const [isMax, setIsMax] = useState(false);
  const [isMin, setIsMin] = useState(false);
  const imageGallerySlides = useRef<HTMLDivElement>(null);
  const thumbnailNavigationBar = useRef<HTMLDivElement>(null);
  const productsSlider = useRef<HTMLDivElement>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [navAndTabsFlag, setNavAndTabsFlag] = useState(1);
  const [reviewsStatus, setReviewsStatus] = useState<ReviewsStatus>({} as ReviewsStatus);
  const [visibleCount, setVisibleCount] = useState(1);
  const [products, setProducts] = useState<Iproduct[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const [done, setDone] = useState(false);
  const [doneLoading, setDoneLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [savingReview, setSavingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTouched, setReviewTouched] = useState(false);
  const reviewInvalid = !reviewText.trim() || reviewText.length > 1000;
  const isProductInWishList = app.wishlistIds.has(product._id);

  const updateReviewSummary = (reviews: Review[]) => {
    setReviewsStatus(summarize(reviews));
    setProduct((p) => ({
      ...p,
      ratingsQuantity: reviews.length,
      ratingsAverage: reviews.length ? Number((reviews.reduce((s, i) => s + i.rating, 0) / reviews.length).toFixed(1)) : 0,
    }));
  };
  const updateProductReviews = (reviews: Review[]) => {
    setProduct((p) => ({ ...p, reviews }));
    updateReviewSummary(reviews);
  };

  useEffect(() => {
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    if (token && app.isValidUser) {
      setIsLoggedIn(true);
      let tokenUserId: string | undefined;
      try {
        const d = jwtDecode<{ id?: string; _id?: string }>(token);
        tokenUserId = d.id ?? d._id;
      } catch {
        tokenUserId = undefined;
      }
      try {
        const raw = localStorage.getItem('user') ?? sessionStorage.getItem('user');
        const user = raw ? (JSON.parse(raw) as { id?: string; _id?: string }) : {};
        setCurrentUserId(user.id ?? user._id ?? tokenUserId ?? null);
      } catch {
        setCurrentUserId(tokenUserId ?? null);
      }
    }
  }, [app.isValidUser]);

  useEffect(() => {
    let cancelled = false;
    setDoneLoading(false);
    setSelectedImageIndex(0);
    setNavAndTabsFlag(1);
    setQuantity(1);
    window.scrollTo(0, 0);
    getSpecificProduct(productID).then((res: any) => {
      if (cancelled) return;
      const p: Iproduct = res.data;
      setProduct(p);
      updateReviewSummary(p.reviews ?? []);
      setTotalePrice(p.price);
      setIsMax(p.quantity <= 1);
      setIsMin(true);
      getAllProducts('?category=' + p.category._id).then((r) => !cancelled && setProducts(r.data));
      setTimeout(() => !cancelled && setDoneLoading(true), 500);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productID]);

  const setQty = (value: number) => {
    let q = value;
    if (q >= product.quantity) {
      q = product.quantity;
      setIsMax(true);
      setIsMin(false);
    } else {
      setIsMax(false);
      setIsMin(false);
      if (q <= 1) {
        q = 1;
        setIsMin(true);
      }
    }
    setQuantity(q);
    setTotalePrice(product.price * q);
  };
  const changeQuantity = (num: number) => setQty((quantity || 1) + num);
  const checkQuantity = () => setQty(quantity);

  const moveSlider = (index: number) => {
    setSelectedImageIndex(index);
    const bar = thumbnailNavigationBar.current;
    if (bar) {
      const selectedThumbnail = bar.children[index] as HTMLElement;
      const containerWidth = bar.parentElement!.clientWidth;
      const center = selectedThumbnail.offsetLeft + selectedThumbnail.offsetWidth / 2;
      const target = Math.max(0, Math.min(center - containerWidth / 2, bar.scrollWidth - containerWidth));
      bar.style.translate = `-${target}px 0`;
    }
  };

  const moveProductSlider = (direction: 'next' | 'prev') => {
    const slider = productsSlider.current;
    if (!slider) return;
    const slides = Array.from(slider.children) as HTMLElement[];
    if (!slides.length) return;
    const maxIndex = slides.length - 5;
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex > maxIndex) return;
    setCurrentIndex(nextIndex);
    slider.style.translate = `-${slides[nextIndex].offsetLeft}px 0`;
  };

  const loadProductReviews = async () => {
    if (!product._id) return;
    setReviewsLoading(true);
    try {
      const res: any = await getReviewsForProduct(product._id);
      const reviews = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.reviews) ? res.data.reviews : [];
      updateProductReviews(reviews);
    } catch {
      toast.error(t('UI.REVIEW_LOAD_FAILED'));
    }
    setReviewsLoading(false);
  };

  const changeNavAndTabsFlag = (num: number) => {
    if (num === navAndTabsFlag) return;
    setNavAndTabsFlag(num);
    if (num === 2) loadProductReviews();
  };

  const showMoreReviews = () => setVisibleCount((c) => c + 2);
  const ownsReview = (review: Review) => !!currentUserId && review.user?._id === currentUserId;
  const getOwnReview = () => product.reviews?.find((r) => ownsReview(r));

  const openReviewForm = (review?: Review) => {
    if (!isLoggedIn) return;
    setEditingReviewId(review && ownsReview(review) ? review._id : null);
    setReviewText(review?.review ?? '');
    setReviewRating(review?.rating ?? 5);
    setReviewTouched(false);
    setReviewFormOpen(true);
  };

  const closeReviewForm = () => {
    if (savingReview) return;
    setReviewFormOpen(false);
    setEditingReviewId(null);
    setReviewText('');
    setReviewRating(5);
    setReviewTouched(false);
  };

  const getCurrentUserName = () => {
    try {
      const raw = localStorage.getItem('user') ?? sessionStorage.getItem('user');
      return raw ? ((JSON.parse(raw) as { name?: string }).name ?? '') : '';
    } catch {
      return '';
    }
  };

  const extractReview = (res: any): Review | undefined => {
    const data = res?.data;
    const c = data?.review ?? data?.reviews?.find?.((i: Review) => ownsReview(i)) ?? data;
    return c && typeof c.review === 'string' && c._id ? (c as Review) : undefined;
  };

  const submitReview = async () => {
    setReviewTouched(true);
    if (!isLoggedIn || reviewInvalid || savingReview) return;
    const payload = { review: reviewText.trim(), rating: Number(reviewRating) };
    const reviewId = editingReviewId;
    const currentReview = reviewId ? product.reviews?.find((r) => r._id === reviewId && ownsReview(r)) : undefined;
    if (reviewId && !currentReview) return;
    setSavingReview(true);
    try {
      const res: any = reviewId
        ? await updateReviewForProduct(reviewId, payload)
        : await createReviewForProduct(product._id, payload);
      const returned = extractReview(res);
      const reviews = product.reviews ?? [];
      if (reviewId && currentReview) {
        const updated = { ...currentReview, ...returned, ...payload, user: currentReview.user } as Review;
        updateProductReviews(reviews.map((i) => (i._id === reviewId ? updated : i)));
      } else {
        const created = (returned
          ? { ...returned, user: returned.user ?? { _id: currentUserId ?? '', name: getCurrentUserName() } }
          : {
              _id: res?.data?._id ?? res?._id ?? `local-${Date.now()}`,
              product: product._id,
              user: { _id: currentUserId ?? '', name: getCurrentUserName() },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }) as Review;
        updateProductReviews([...reviews.filter((i) => !ownsReview(i)), { ...created, ...payload }]);
      }
      loadProductReviews();
      setReviewFormOpen(false);
      setEditingReviewId(null);
      setReviewText('');
      setReviewRating(5);
      toast.success(t(reviewId ? 'UI.REVIEW_UPDATED' : 'UI.REVIEW_ADDED'));
    } catch {
      toast.error(t('UI.REVIEW_SAVE_FAILED'));
    }
    setSavingReview(false);
  };

  const deleteReview = async (review: Review) => {
    if (!ownsReview(review) || deletingReviewId) return;
    setDeletingReviewId(review._id);
    try {
      await deleteReviewForProduct(review._id);
      updateProductReviews((product.reviews ?? []).filter((i) => i._id !== review._id));
      loadProductReviews();
      toast.success(t('UI.REVIEW_DELETED'));
    } catch {
      toast.error(t('UI.REVIEW_DELETE_FAILED'));
    }
    setDeletingReviewId(null);
  };

  const addToWithList = async (productId: string) => {
    if (getToken() && app.isValidUser) {
      const exists = app.wishlistIds.has(productId);
      try {
        const res: any = exists ? await removefromWithList(productId) : await addToWishApi({ productId });
        app.refreshWishListCount(res.data.length);
        app.setWishlistMembership(productId, !exists);
        toast.success(res.message, { toastId: 'wl' });
      } catch {
        /* error toast handled by the api interceptor */
      }
    } else {
      toast.warning('plz login frist!');
    }
  };

  const addToCart = async (id: string) => {
    if (getToken() && app.isValidUser) {
      setAdding(true);
      setDone(false);
      try {
        const res: any = await addToCartApi({ productId: id });
        app.refreshCartCount(res.numOfCartItems);
        toast.success(res.message);
      } catch {
        /* error toast handled by the api interceptor */
      }
      setAdding(false);
      setDone(true);
      setTimeout(() => setDone(false), 1000);
    } else {
      toast.warning('plz login frist!');
    }
  };

  const goToCheckOut = () => {
    if (getToken()) navigate('/checkout');
    else toast.warning('plz login frist!');
  };

  return (
    <>
      <div>
      {doneLoading ? (<>
        <nav aria-label="Breadcrumb" className="py-4">
          <div className="container mx-auto px-4">
            <ol className="flex items-center flex-wrap gap-1 text-sm">
              <li className="flex items-center">
                <Link className="text-gray-500 hover:text-primary-600 transition flex items-center gap-1.5" to="/"><i className="fa-solid fa-house text-xs" />Home</Link>
                <i className="fa-solid fa-chevron-right text-gray-400 text-xs mx-2" />
              </li>
              <li className="flex items-center">
                <Link className="text-gray-500 hover:text-primary-600 transition flex items-center gap-1.5" to={'/shop?category=' + product.category._id}>{product.category.name}</Link>
                <i className="fa-solid fa-chevron-right text-gray-400 text-xs mx-2" />
              </li>
              <li className="flex items-center">
                <Link className="text-gray-500 hover:text-primary-600 transition flex items-center gap-1.5" to={lk(['/subcategories', product.subcategory?.[0]?._id])}>{product.subcategory?.[0]?.name}</Link>
                <i className="fa-solid fa-chevron-right text-gray-400 text-xs mx-2" />
              </li>
              <li className="text-gray-900 font-medium truncate max-w-xs">{product.title}</li>
            </ol>
          </div>
        </nav>
        <section id="product-detail" className="py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              <div id="product-images" className="lg:w-1/4">
                <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4">
                  <div className="image-gallery product-gallery" aria-live="polite">
                    <div className="image-gallery-content  image-gallery-thumbnails-bottom">
                      <div className="image-gallery-slide-wrapper  image-gallery-thumbnails-bottom">
                        <div className="image-gallery-swipe">
                          <div className="image-gallery-slides">
                            {product.images.map((img, i) => {
                              const n = product.images.length;
                              const rel = (i - selectedImageIndex + n) % n;
                              const cls = rel === 0 ? 'image-gallery-center' : rel === 1 ? 'image-gallery-right' : rel === n - 1 ? 'image-gallery-left' : '';
                              const off = i === selectedImageIndex ? 0 : rel <= n / 2 ? (i - selectedImageIndex) * 100 : (i - selectedImageIndex) * 100;
                              return (
                                <div key={i} aria-label={'Go to Slide ' + (i + 1)} tabIndex={-1} className={'image-gallery-slide  ' + cls + ' '} role="button" style={{ display: 'inherit', transform: 'translate3d(' + off + '%, 0px, 0px)' }}>
                                  <img className="image-gallery-image" src={img} />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="image-gallery-thumbnails-wrapper  image-gallery-thumbnails-bottom thumbnails-swipe-horizontal">
                        <div className="image-gallery-thumbnails">
                          <nav className="image-gallery-thumbnails-container" aria-label="Thumbnail Navigation">
                            {product.images.map((img, i) => (
                              <button key={i} type="button" tabIndex={0} aria-pressed={i === selectedImageIndex} aria-label={'Go to Slide ' + (i + 1)} className={'image-gallery-thumbnail' + (i === selectedImageIndex ? ' active' : '')} onClick={() => setSelectedImageIndex(i)}>
                                <span className="image-gallery-thumbnail-inner"><img className="image-gallery-thumbnail-image" src={img} /></span>
                              </button>
                            ))}
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="product-info" className="lg:w-3/4">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Link className="bg-primary-50 text-primary-700 text-xs px-3 py-1.5 rounded-full hover:bg-primary-100 transition" to={'/shop?category=' + product.category._id}>{product.category.name}</Link>
                    <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full">{product.brand?.name}</span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-yellow-400">
                      {stars.map((_, i) => (<Fragment key={i}>
                        {i < Math.floor(product.ratingsAverage) ? <i className="fa-solid fa-star " /> : i === Math.floor(product.ratingsAverage) && product.ratingsAverage % 1 >= 0.5 ? <i className="fa-regular fa-star-half-stroke " /> : <i className="fa-regular fa-star " />}
                      </Fragment>))}
                    </div>
                    <span className="text-sm text-gray-600">{product.ratingsAverage} ({product.ratingsQuantity} reviews)</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-3 mb-6">
                    {product.priceAfterDiscount ? (<>
                      <span className="text-3xl font-bold text-primary-600">{product.priceAfterDiscount} EGP</span>
                      <span className="text-xl text-gray-400 line-through">{product.price} EGP</span>
                    </>) : (
                      <span className="text-3xl font-bold text-gray-900">{product.price} EGP</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    {product.quantity ? (
                      <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-green-50 text-green-700"><span className="w-2 h-2 rounded-full bg-green-500"></span>In Stock</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-red-50 text-red-700"><span className="w-2 h-2 rounded-full bg-red-500"></span>Out of Stock</span>
                    )}
                  </div>
                  <div className="border-t border-gray-100 pt-5 mb-6">
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                        <button id="decrease-qty" className="px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition disabled:opacity-50" disabled={isMin || quantity <= 1} onClick={() => changeQuantity(-1)}><i className="fa-solid fa-minus " /></button>
                        <input min={1} max={product.quantity} className="w-16 text-center border-0 focus:ring-0 focus:outline-none text-lg font-medium" id="quantity" type="number" value={quantity} onChange={(e) => setQty(Number(e.target.value) || 1)} onBlur={checkQuantity} />
                        <button id="increase-qty" className="px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition disabled:opacity-50" disabled={isMax} onClick={() => changeQuantity(1)}><i className="fa-solid fa-plus " /></button>
                      </div>
                      <span className="text-sm text-gray-500">{product.quantity} available</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Price:</span>
                      <span className="text-2xl font-bold text-primary-600">{((product.priceAfterDiscount || product.price) * quantity).toFixed(2)} EGP</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <button id="add-to-cart" className="flex-1 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/25 bg-primary-600" onClick={() => addToCart(product._id)}>{adding ? <i className="fa-solid fa-spinner fa-spin-pulse" /> : <i className="fa-solid fa-cart-shopping " />}Add to Cart</button>
                    <button id="buy-now" className="flex-1 bg-gray-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2" onClick={goToCheckOut}><i className="fa-solid fa-bolt " />Buy Now</button>
                  </div>
                  <div className="flex gap-3 mb-6">
                    <button id="wishlist-button" className={'flex-1 border-2 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 ' + (isProductInWishList ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600')} onClick={() => addToWithList(product._id)}><i className={(isProductInWishList ? 'fa-solid' : 'fa-regular') + ' fa-heart '} />{isProductInWishList ? 'Remove from Wishlist' : 'Add to Wishlist'}</button>
                    <button className="border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:border-primary-300 hover:text-primary-600 transition"><i className="fa-solid fa-share-nodes " /></button>
                  </div>
                  <div className="border-t border-gray-100 pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0"><i className="fa-solid fa-truck-fast " /></div>
                        <div><h4 className="font-medium text-gray-900 text-sm">Free Delivery</h4><p className="text-xs text-gray-500">Orders over $50</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0"><i className="fa-solid fa-arrow-rotate-left " /></div>
                        <div><h4 className="font-medium text-gray-900 text-sm">30 Days Return</h4><p className="text-xs text-gray-500">Money back</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0"><i className="fa-solid fa-shield-halved " /></div>
                        <div><h4 className="font-medium text-gray-900 text-sm">Secure Payment</h4><p className="text-xs text-gray-500">100% Protected</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="product-details-tabs" className="py-8">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto scrollbar-hide">
                  {[[1, 'fa-box', 'Product Details'], [2, 'fa-star', 'Reviews (' + product.ratingsQuantity + ')'], [3, 'fa-truck', 'Shipping & Returns']].map(([n, ic, label]) => (
                    <button key={n as number} className={'flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-all duration-200 ' + (navAndTabsFlag === n ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50')} onClick={() => changeNavAndTabsFlag(n as number)}><i className={'fa-solid ' + ic + ' text-sm'} />{label}</button>
                  ))}
                </div>
              </div>
              <div className="p-6">
                {navAndTabsFlag === 1 ? (
                  <div className="space-y-6">
                    <div><h3 className="text-lg font-semibold text-gray-900 mb-3">About this Product</h3><p className="text-gray-600 leading-relaxed">{product.description}</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Product Information</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between text-sm"><span className="text-gray-500">Category</span><span className="text-gray-900 font-medium">{product.category.name}</span></li>
                          <li className="flex justify-between text-sm"><span className="text-gray-500">Subcategory</span><span className="text-gray-900 font-medium">{product.subcategory?.[0]?.name}</span></li>
                          <li className="flex justify-between text-sm"><span className="text-gray-500">Brand</span><span className="text-gray-900 font-medium">{product.brand?.name}</span></li>
                          <li className="flex justify-between text-sm"><span className="text-gray-500">Items Sold</span><span className="text-gray-900 font-medium">{product.sold}+ sold</span></li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Key Features</h4>
                        <ul className="space-y-2">
                          {['Premium Quality Product', '100% Authentic Guarantee', 'Fast & Secure Packaging', 'Quality Tested'].map((f) => (
                            <li key={f} className="flex items-center text-sm text-gray-600"><i className="fa-solid fa-check text-primary-600 mr-2 w-4" />{f}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : navAndTabsFlag === 2 ? (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gray-900 mb-2">{product.ratingsAverage}</div>
                        <div className="text-yellow-400">
                          {stars.map((_, i) => (<Fragment key={i}>
                            {i < Math.floor(product.ratingsAverage) ? <i className="fa-solid fa-star " /> : i === Math.floor(product.ratingsAverage) && product.ratingsAverage % 1 >= 0.5 ? <i className="fa-regular fa-star-half-stroke " /> : <i className="fa-regular fa-star " />}
                          </Fragment>))}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Based on {product.ratingsQuantity} reviews</p>
                      </div>
                      <div className="flex-1 w-full">
                        {([['5 star', 'fiveStar'], ['4 star', 'fourStar'], ['3 star', 'threeStar'], ['2 star', 'twoStar'], ['1 star', 'oneStar']] as const).map(([label, key]) => (
                          <div key={key} className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-600 w-8">{label}</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full transition-all duration-300" style={{ width: (reviewsStatus as any)[key] + '%' }}></div></div>
                            <span className="text-sm text-gray-500 w-10">{(reviewsStatus as any)[key]}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-6">
                      <div className="text-center py-8">
                        <i className="fa-regular fa-comments text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500">Customer reviews will be displayed here.</p>
                        <button className="mt-4 text-primary-600 hover:text-primary-700 font-medium">Write a Review</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-linear-to-br from-primary-50 to-primary-100 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4"><div className="h-12 w-12 bg-primary-600 text-white rounded-full flex items-center justify-center"><i className="fa-solid fa-truck-fast " /></div><h4 className="font-semibold text-gray-900">Shipping Information</h4></div>
                        <ul className="space-y-3">
                          {['Free shipping on orders over $50', 'Standard delivery: 3-5 business days', 'Express delivery available (1-2 business days)', 'Track your order in real-time'].map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm text-gray-700"><i className="fa-solid fa-check text-primary-600 mt-0.5" /><span>{f}</span></li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4"><div className="h-12 w-12 bg-green-600 text-white rounded-full flex items-center justify-center"><i className="fa-solid fa-arrow-rotate-left " /></div><h4 className="font-semibold text-gray-900">Returns & Refunds</h4></div>
                        <ul className="space-y-3">
                          {['30-day hassle-free returns', 'Full refund or exchange available', 'Free return shipping on defective items', 'Easy online return process'].map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm text-gray-700"><i className="fa-solid fa-check text-green-600 mt-0.5" /><span>{f}</span></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 flex items-center gap-4">
                      <div className="h-14 w-14 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center shrink-0"><i className="fa-solid fa-shield-halved " /></div>
                      <div><h4 className="font-semibold text-gray-900 mb-1">Buyer Protection Guarantee</h4><p className="text-sm text-gray-600">Get a full refund if your order doesn't arrive or isn't as described. We ensure your shopping experience is safe and secure.</p></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        {products.length ? (<>
          <section id="similar-products" className="py-10">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-linear-to-b from-emerald-500 to-emerald-700 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800">You May Also <span className="text-emerald-600">Like</span></h2>
                </div>
                <div className="flex space-x-2">
                  <button className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-100 hover:text-primary-600 transition" onClick={() => moveProductSlider('prev')}><i className="fa-solid fa-chevron-left " /><span className="sr-only">Previous</span></button>
                  <button className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-100 hover:text-primary-600 transition" onClick={() => moveProductSlider('next')}><i className="fa-solid fa-chevron-right " /><span className="sr-only">Next</span></button>
                </div>
              </div>
              <div className="swiper overflow-hidden">
                <div ref={productsSlider} className="flex gap-4 transition-all duration-500">
                  {products.map((pr, $index) => (
                    <div key={$index} className="shrink-0 w-full sm:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] xl:w-[calc((100%-64px)/5)]">
                      <ProductCard product={pr}></ProductCard>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>) : null}
      </>) : (<>
        <div className="animate-pulse">
          {/* Breadcrumb */}
          <nav className="py-4">
            <div className="container mx-auto px-4">
              <div className="flex items-center flex-wrap gap-3">
                <div className="h-4 w-12 rounded bg-gray-200"></div>
                <div className="h-3 w-3 rounded bg-gray-200"></div>
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-3 w-3 rounded bg-gray-200"></div>
                <div className="h-4 w-28 rounded bg-gray-200"></div>
                <div className="h-3 w-3 rounded bg-gray-200"></div>
                <div className="h-4 w-36 rounded bg-gray-200"></div>
              </div>
            </div>
          </nav>

          {/* Product Overview */}
          <section className="py-6">
            <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Product Images */}
                <div className="lg:w-1/4">
                  <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="aspect-square w-full rounded-lg bg-gray-200"></div>

                    {/* Thumbnails */}
                    <div className="flex gap-2 mt-3">
                      {[1, 2, 3, 4].map((item, $index) => (<Fragment key={$index}>
                        <div className="aspect-square flex-1 rounded-md bg-gray-200"></div>
                      </Fragment>))}
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="lg:w-3/4">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    {/* Category & Brand */}
                    <div className="flex gap-2 mb-4">
                      <div className="h-7 w-24 rounded-full bg-gray-200"></div>
                      <div className="h-7 w-20 rounded-full bg-gray-200"></div>
                    </div>

                    {/* Title */}
                    <div className="h-8 w-3/4 max-w-lg rounded bg-gray-200 mb-4"></div>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-4 w-28 rounded bg-gray-200"></div>
                      <div className="h-4 w-32 rounded bg-gray-200"></div>
                    </div>

                    {/* Price */}
                    <div className="h-9 w-36 rounded bg-gray-200 mb-5"></div>

                    {/* Stock */}
                    <div className="h-7 w-28 rounded-full bg-gray-200 mb-6"></div>

                    {/* Description */}
                    <div className="border-t border-gray-100 pt-5 mb-6 space-y-3">
                      <div className="h-4 w-full rounded bg-gray-200"></div>
                      <div className="h-4 w-full rounded bg-gray-200"></div>
                      <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                    </div>

                    {/* Quantity */}
                    <div className="mb-6">
                      <div className="h-4 w-20 rounded bg-gray-200 mb-3"></div>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-36 rounded-lg bg-gray-200"></div>
                        <div className="h-4 w-24 rounded bg-gray-200"></div>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 flex justify-between items-center">
                      <div className="h-5 w-24 rounded bg-gray-200"></div>
                      <div className="h-7 w-32 rounded bg-gray-200"></div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                      <div className="h-14 flex-1 rounded-xl bg-gray-200"></div>
                      <div className="h-14 flex-1 rounded-xl bg-gray-200"></div>
                    </div>

                    {/* Wishlist & Share */}
                    <div className="flex gap-3 mb-6">
                      <div className="h-12 flex-1 rounded-xl bg-gray-200"></div>
                      <div className="h-12 w-14 rounded-xl bg-gray-200"></div>
                    </div>

                    {/* Services */}
                    <div className="border-t border-gray-100 pt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[1, 2, 3].map((item, $index) => (<Fragment key={$index}>
                          <div className="flex items-center gap-3">
                            <div className="size-10 shrink-0 rounded-full bg-gray-200"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-24 rounded bg-gray-200"></div>
                              <div className="h-3 w-20 rounded bg-gray-200"></div>
                            </div>
                          </div>
                        </Fragment>))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Product Tabs */}
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Tabs Header */}
                <div className="border-b border-gray-200">
                  <div className="flex gap-8 px-6 py-4 overflow-hidden">
                    {[1, 2, 3].map((item, $index) => (<Fragment key={$index}>
                      <div className="h-6 w-32 shrink-0 rounded bg-gray-200"></div>
                    </Fragment>))}
                  </div>
                </div>

                {/* Product Details Content */}
                <div className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="h-6 w-44 rounded bg-gray-200"></div>
                    <div className="h-4 w-full rounded bg-gray-200"></div>
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Information */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-5">
                      <div className="h-5 w-40 rounded bg-gray-200"></div>

                      {[1, 2, 3, 4].map((item, $index) => (<Fragment key={$index}>
                        <div className="flex justify-between gap-4">
                          <div className="h-4 w-20 rounded bg-gray-200"></div>
                          <div className="h-4 w-28 rounded bg-gray-200"></div>
                        </div>
                      </Fragment>))}
                    </div>

                    {/* Key Features */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-5">
                      <div className="h-5 w-32 rounded bg-gray-200"></div>

                      {[1, 2, 3, 4].map((item, $index) => (<Fragment key={$index}>
                        <div className="flex items-center gap-3">
                          <div className="size-4 rounded bg-gray-200"></div>
                          <div className="h-4 w-44 rounded bg-gray-200"></div>
                        </div>
                      </Fragment>))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* You May Also Like */}
          <section className="py-10">
            <div className="container mx-auto px-4">
              {/* Section Heading */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1.5 rounded-full bg-gray-200"></div>
                  <div className="h-7 w-48 rounded bg-gray-200"></div>
                </div>

                <div className="flex gap-2">
                  <div className="size-10 rounded-full bg-gray-200"></div>
                  <div className="size-10 rounded-full bg-gray-200"></div>
                </div>
              </div>

              {/* Related Products */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((item, $index) => (<Fragment key={$index}>
                  <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                    <div className="aspect-square bg-gray-200"></div>

                    <div className="p-3 space-y-3">
                      <div className="h-4 w-full rounded bg-gray-200"></div>
                      <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                      <div className="h-5 w-1/2 rounded bg-gray-200"></div>
                    </div>
                  </div>
                </Fragment>))}
              </div>
            </div>
          </section>
        </div>

        {/* Reviews Tab Skeleton */}
        <div className="p-6 space-y-8 animate-pulse">
          {/* Rating Summary */}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="space-y-3 text-center">
              <div className="h-12 w-24 rounded bg-gray-200 mx-auto"></div>
              <div className="h-5 w-28 rounded bg-gray-200 mx-auto"></div>
              <div className="h-4 w-32 rounded bg-gray-200 mx-auto"></div>
            </div>

            <div className="flex-1 w-full space-y-4">
              {[1, 2, 3, 4, 5].map((item, $index) => (<Fragment key={$index}>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-12 rounded bg-gray-200"></div>
                  <div className="h-2 flex-1 rounded-full bg-gray-200"></div>
                  <div className="h-4 w-10 rounded bg-gray-200"></div>
                </div>
              </Fragment>))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-5">
            <div className="h-7 w-48 rounded bg-gray-200 mx-auto"></div>
            <div className="h-4 w-64 rounded bg-gray-200 mx-auto"></div>

            {[1, 2, 3].map((item, $index) => (<Fragment key={$index}>
              <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200"></div>
                    <div className="h-3 w-24 rounded bg-gray-200"></div>
                  </div>
                </div>

                <div className="h-4 w-28 rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              </div>
            </Fragment>))}
          </div>
        </div>

        {/* Shipping & Returns Tab Skeleton */}
        <div className="p-6 space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((item, $index) => (<Fragment key={$index}>
              <div className="bg-gray-50 rounded-lg p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-gray-200"></div>
                  <div className="h-5 w-40 rounded bg-gray-200"></div>
                </div>

                {[1, 2, 3, 4].map((line, $index) => (<Fragment key={$index}>
                  <div className="flex items-center gap-3">
                    <div className="size-4 rounded bg-gray-200"></div>
                    <div className="h-4 flex-1 rounded bg-gray-200"></div>
                  </div>
                </Fragment>))}
              </div>
            </Fragment>))}
          </div>

          <div className="bg-gray-50 rounded-lg p-6 flex items-center gap-4">
            <div className="size-14 shrink-0 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-3">
              <div className="h-5 w-48 rounded bg-gray-200"></div>
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </>)}
      </div>
    </>
  );
}
