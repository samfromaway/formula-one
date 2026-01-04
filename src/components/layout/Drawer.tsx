'use client';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Box, List, Divider } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import { ToggleDrawer } from './types';
import Link from 'next/link';
import EventIcon from '@mui/icons-material/Event';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import usePushNotifications from '@/utils/usePushNotifications';

type DrawerProps = { toggleDrawer: ToggleDrawer; isOpen: boolean };

export default function Drawer({ toggleDrawer, isOpen }: DrawerProps) {
  const { subscription, subscribeToPush, unsubscribeFromPush, isSupported } =
    usePushNotifications();

  const handleNotificationAction = async (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    event.stopPropagation();
    if (subscription) {
      await unsubscribeFromPush();
    } else {
      await subscribeToPush();
    }
    toggleDrawer(false)(event);
  };

  return (
    <MuiDrawer open={isOpen} onClose={toggleDrawer(false)}>
      <Box
        role="presentation"
        onClick={toggleDrawer(false)}
        onKeyDown={toggleDrawer(false)}
        minWidth="240px"
      >
        {isSupported && (
          <>
            <Divider />
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={handleNotificationAction}>
                  <ListItemIcon>
                    {subscription ? (
                      <NotificationsOffIcon />
                    ) : (
                      <NotificationsIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={subscription ? 'Unsubscribe' : 'Subscribe'}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </>
        )}
      </Box>
    </MuiDrawer>
  );
}
