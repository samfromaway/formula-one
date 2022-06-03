import { createTheme } from '@mui/material/styles';

const sharedTheme = {
  typography: {
    fontFamily: 'Titillium Web, sans-serif',
  },
  //  spacing: ['8px','16px','24px' ...],
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
