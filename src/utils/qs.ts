// Build a react-router `to` object with query params
export function qs(pathname: string, params?: Record<string, unknown>) {
  const sp = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return { pathname, search: s ? `?${s}` : '' };
}

// Join path segments like Angular's routerLink array form: lk(['/products/', id]) -> '/products/123'
export function lk(parts: unknown[]): string {
  return parts.join('/').replace(/\/+/g, '/');
}
