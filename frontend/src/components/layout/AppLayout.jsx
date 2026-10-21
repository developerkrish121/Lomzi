import { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Loader } from '@/components/ui/Loader';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { RouteMetadata } from '@/components/layout/RouteMetadata';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <RouteMetadata />
      <Navbar />
      <main id="main-content" className="flex-1">
        <Suspense
          fallback={
            <div className="grid min-h-[60vh] place-items-center">
              <Loader label="Loading page…" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <ScrollRestoration />
    </div>
  );
}
