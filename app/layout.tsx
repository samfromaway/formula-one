'use client';

import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme, lightTheme } from '@/styles/theme';
import { useMemo } from 'react';
import { Layout as LayoutComponent } from '@/components/layout';
import '@fontsource/titillium-web/600.css';
import '@fontsource/titillium-web/700.css';
import useDarkMode from '@/utils/useDarkMode';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const currentTheme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <Head>
            <meta
              name="viewport"
              content="initial-scale=1, width=device-width"
            />
          </Head>
          <ThemeProvider theme={currentTheme}>
            <LayoutComponent toggleDarkMode={toggleDarkMode}>
              {children}
            </LayoutComponent>
          </ThemeProvider>
        </AppRouterCacheProvider>{' '}
      </body>
    </html>
  );
}
