# FreshCart (React)

React + TypeScript version of the FreshCart Angular e-commerce app. Same pages, same API (`https://ecommerce.routemisr.com/api/v1`), same Tailwind styling and English/Arabic (RTL) support.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the build locally
```

## Stack

- Vite, React 19, TypeScript
- react-router-dom (lazy routes, protected routes for cart, wishlist, orders, profile, checkout)
- axios (token header + error toasts in `src/services/api.ts`)
- react-i18next (`src/i18n`, en and ar)
- react-toastify, swiper/react, jwt-decode
- Tailwind CSS 4 + Flowbite, Font Awesome, PrimeIcons

## Structure

```
src/
  pages/        one file per Angular page component
  components/   Navbar, Footer, ProductCard, Pagination, PMenu, ...
  services/     API calls (products, categories, auth, user)
  context/      AppContext (auth status, cart/wishlist counts)
  hooks/        useFormGroup (small reactive-form helper)
  models/       TypeScript interfaces
  i18n/         en.json, ar.json
  styles/       per-page CSS
```

## Differences from the Angular version

- Client-side SPA only (no SSR).
- PrimeNG menu replaced by a small custom `PMenu` component.
- Angular reactive forms replaced by the `useFormGroup` hook.
- Prices use an `EGP` formatter instead of Angular's currency pipe.
- Route guard waits for token verification before redirecting.
- `vercel.json` rewrites all routes to `index.html` for deployment on Vercel.
