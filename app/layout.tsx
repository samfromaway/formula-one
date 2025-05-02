'use client';

import Head from 'next/head';
import { AppProps } from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { darkTheme, lightTheme } from '@/styles/theme';
import createEmotionCache from '@/styles/createEmotionCache';
import { useMemo } from 'react';
import { Layout as LayoutComponent } from '@/components/layout';
import '@fontsource/titillium-web/600.css';
import '@fontsource/titillium-web/700.css';
import useDarkMode from '@/utils/useDarkMode';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function Layout(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const currentTheme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={currentTheme}>
        <LayoutComponent toggleDarkMode={toggleDarkMode}>
          <Component {...pageProps} />
        </LayoutComponent>
      </ThemeProvider>
    </CacheProvider>
  );
}
