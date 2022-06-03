import CssBaseline from '@mui/material/CssBaseline';
import React, { useState } from 'react';
import Container from '@mui/material/Container';
import AppBar from './AppBar';
import Drawer from './Drawer';
import Spacer from './Spacer';

type LayoutProps = {
  children: React.ReactNode;
  toggleDarkMode: () => void;
};

export default function Layout({ children, toggleDarkMode }: LayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }
      setIsDrawerOpen(open);
    };
  return (
    <>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <AppBar toggleDrawer={toggleDrawer} toggleDarkMode={toggleDarkMode} />
      <Drawer toggleDrawer={toggleDrawer} isOpen={isDrawerOpen} />
      <Spacer space={2} />
      <Container maxWidth="lg">{children}</Container>
      <Spacer space={2} />
    </>
  );
}
