'use client';

import { useSidebar } from '../../providers/sidebar-provider';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <main
      className={`flex-1 p-6 overflow-auto transition-all duration-300 ${
        isOpen ? 'lg:ml-64' : 'lg:ml-20'
      }`}
    >
      {children}
    </main>
  );
}
