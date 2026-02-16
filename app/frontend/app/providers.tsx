'use client';

import { Provider } from 'react-redux';
import { store } from '../src/store/store';
import { SidebarProvider } from '../src/providers/sidebar-provider';
import { ThemeProvider } from '../src/providers/theme-provider';
import { AuthInitializer } from '../src/providers/auth-initializer';
import { SocketProvider } from '../src/infra/realtime/socket-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <SocketProvider>
          <ThemeProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </ThemeProvider>
        </SocketProvider>
      </AuthInitializer>
    </Provider>
  );
}
