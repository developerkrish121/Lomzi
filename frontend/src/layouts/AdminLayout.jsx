import { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router-dom';
import { AdminProvider } from '@/context/AdminContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { Loader } from '@/components/ui/Loader';
import { RouteMetadata } from '@/components/layout/RouteMetadata';

export function AdminLayout() {
  return (
    <AdminProvider>
      <div className="flex min-h-screen overflow-x-hidden bg-[#f6f8f6] text-slate-800">
        <a href="#admin-content" className="skip-link">
          Skip to admin content
        </a>
        <RouteMetadata />
        <AdminSidebar />
        <div className="min-w-0 flex-1">
          <AdminTopbar />
          <main id="admin-content" className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <Suspense
              fallback={
                <div className="grid min-h-[60vh] place-items-center">
                  <Loader label="Loading admin page…" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </main>
        </div>
        <ScrollRestoration />
      </div>
    </AdminProvider>
  );
}
