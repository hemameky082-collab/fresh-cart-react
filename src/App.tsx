import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useApp } from './context/AppContext';

const Home = lazy(() => import('./pages/Home'));
const Categories = lazy(() => import('./pages/Categories'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Search = lazy(() => import('./pages/Search'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Brands = lazy(() => import('./pages/Brands'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Signin = lazy(() => import('./pages/Signin'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Cart = lazy(() => import('./pages/Cart'));
const Profile = lazy(() => import('./pages/Profile'));
const Addresses = lazy(() => import('./pages/Addresses'));
const Settings = lazy(() => import('./pages/Settings'));
const Orders = lazy(() => import('./pages/Orders'));
const Checkout = lazy(() => import('./pages/Checkout'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Same job as the Angular authGuard: only valid logged-in users get through
function ProtectedRoute() {
  const { authStatus } = useApp();
  if (authStatus === 'checking') return null;
  if (authStatus !== 'valid') return <Navigate to="/home" replace />;
  return <Outlet />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/search" element={<Search />} />
            <Route path="/subcategories/:id" element={<Categories />} />
            <Route path="/categories/:id" element={<Categories />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forget-password" element={<ForgotPassword />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />}>
                <Route index element={<Navigate to="addresses" replace />} />
                <Route path="addresses" element={<Addresses />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="/orders" element={<Orders />} />
              <Route path="/checkout" element={<Checkout />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
}
