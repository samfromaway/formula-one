import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import { Box, List } from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
import { ToggleDrawer } from './types';
import Link from 'next/link';
import GroupsIcon from '@mui/icons-material/Groups';
import EventIcon from '@mui/icons-material/Event';

type DrawerProps = { toggleDrawer: ToggleDrawer; isOpen: boolean };

const MENU = [
  { name: 'Races', link: '/', icon: <EventIcon /> },
  { name: 'Teams', link: '/teams', icon: <GroupsIcon /> },
];

export default function Drawer({ toggleDrawer, isOpen }: DrawerProps) {
  return (
    <MuiDrawer open={isOpen} onClose={toggleDrawer(false)}>
      <Box
        role="presentation"
        onClick={toggleDrawer(false)}
        onKeyDown={toggleDrawer(false)}
        minWidth="240px"
      >
        <List>
          {MENU.map((menu) => (
            <Link key={menu.name} href={menu.link}>
              <a style={{ color: 'inherit', textDecoration: 'none' }}>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>{menu.icon}</ListItemIcon>
                    <ListItemText primary={menu.name} />
                  </ListItemButton>
                </ListItem>
              </a>
            </Link>
          ))}
        </List>
      </Box>
    </MuiDrawer>
  );
}
