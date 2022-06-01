import { createTheme } from '@mui/material/styles';
import { Theme, ThemeOptions } from '@mui/system';

const sharedTheme = {
  typography: {
    fontFamily: 'Titillium Web, sans-serif',
  },
};

export const lightTheme = createTheme({
  ...sharedTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#d42100',
    },
  },
});

export const darkTheme = createTheme({
  typography: {
    fontFamily: 'Titillium Web, sans-serif',
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#d62200',
    },
  },
});
