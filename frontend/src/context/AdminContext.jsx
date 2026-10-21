import { useMemo, useState } from 'react';
import { AdminContext } from '@/context/adminContextValue';

export function AdminProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const value = useMemo(
    () => ({
      sidebarOpen,
      sidebarCollapsed,
      closeSidebar: () => setSidebarOpen(false),
      toggleSidebar: () => setSidebarOpen((open) => !open),
      toggleCollapsed: () => setSidebarCollapsed((collapsed) => !collapsed),
    }),
    [sidebarCollapsed, sidebarOpen],
  );
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
