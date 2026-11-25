import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getCart, getWishList, verifyToken } from '../services/user.service';
import { getToken } from '../services/api';
import type { Iuser } from '../models/iuser.interface';

type AuthStatus = 'checking' | 'valid' | 'invalid';

interface AppState {
  user: Iuser | null;
  authStatus: AuthStatus;
  isValidUser: boolean;
  wishListCount: number;
  cartCount: number;
  wishlistIds: Set<string>;
  refreshAuth: () => Promise<void>;
  signOut: () => void;
  refreshCartCount: (n: number) => void;
  refreshWishListCount: (n: number) => void;
  setWishlistMembership: (productId: string, exists: boolean) => void;
  loadWishlist: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Iuser | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(getToken() ? 'checking' : 'invalid');
  const [wishListCount, setWishListCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const wishlistLoaded = useRef(false);

  const loadCounts = useCallback(async () => {
    try {
      const res: any = await getWishList();
      const ids = new Set<string>((res.data ?? []).map((item: any) => item.id ?? item._id));
      setWishlistIds(ids);
      setWishListCount(res.count ?? ids.size);
      wishlistLoaded.current = true;
    } catch (err) {
      console.error('Wishlist error:', err);
    }
    try {
      const res: any = await getCart();
      setCartCount(res.numOfCartItems ?? 0);
    } catch {
      /* handled by interceptor */
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setAuthStatus('invalid');
      setWishListCount(0);
      setCartCount(0);
      return;
    }
    setAuthStatus('checking');
    try {
      const res = await verifyToken();
      let stored: any = {};
      try { stored = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'); } catch { /* ignore */ }
      setUser({ ...stored, ...res.decoded });
      setAuthStatus('valid');
      loadCounts();
    } catch {
      setUser(null);
      setAuthStatus('invalid');
      setWishListCount(0);
      setCartCount(0);
    }
  }, [loadCounts]);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const signOut = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setAuthStatus('invalid');
    setCartCount(0);
    setWishListCount(0);
    setWishlistIds(new Set());
    wishlistLoaded.current = false;
  }, []);

  const setWishlistMembership = useCallback((productId: string, exists: boolean) => {
    setWishlistIds((prev) => {
      const ids = new Set(prev);
      if (exists) ids.add(productId);
      else ids.delete(productId);
      setWishListCount(ids.size);
      return ids;
    });
    wishlistLoaded.current = true;
  }, []);

  const loadWishlist = useCallback(() => {
    if (wishlistLoaded.current || !getToken()) return;
    loadCounts();
  }, [loadCounts]);

  const value = useMemo<AppState>(
    () => ({
      user,
      authStatus,
      isValidUser: authStatus === 'valid',
      wishListCount,
      cartCount,
      wishlistIds,
      refreshAuth,
      signOut,
      refreshCartCount: setCartCount,
      refreshWishListCount: setWishListCount,
      setWishlistMembership,
      loadWishlist,
    }),
    [user, authStatus, wishListCount, cartCount, wishlistIds, refreshAuth, signOut, setWishlistMembership, loadWishlist],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
