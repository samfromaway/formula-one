import { useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';

const LOCALE_STORAGE_ID = 'mode';

export default function useDarkMode() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [isDarkMode, setIsDarkMode] = useState(prefersDarkMode);

  useEffect(() => {
    const mode = localStorage.getItem(LOCALE_STORAGE_ID);
    if (mode !== null) {
      setIsDarkMode(mode === 'true');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      localStorage.setItem(
        LOCALE_STORAGE_ID,
        !prev === true ? 'true' : 'false'
      );
      return !prev;
    });
  };

  return { toggleDarkMode, isDarkMode };
}
