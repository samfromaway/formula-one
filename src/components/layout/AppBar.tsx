import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/system';
import { Box } from '@mui/material';
import { ToggleDrawer } from './types';

type AppBarProps = { toggleDrawer: ToggleDrawer; toggleThemeMode: () => void };

export default function AppBar({ toggleDrawer, toggleThemeMode }: AppBarProps) {
  const { palette } = useTheme();

  return (
    <MuiAppBar position="static" sx={{ backgroundColor: 'primary.main' }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6">Formula 1 Info</Typography>
        <Box flex={1} />
        <IconButton onClick={toggleThemeMode} color="inherit">
          {palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </MuiAppBar>
  );
}
