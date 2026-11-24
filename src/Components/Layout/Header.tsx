// @flow
import { Avatar, Box, Button, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import AppBar from '@mui/material/AppBar/AppBar';
import Container from '@mui/material/Container/Container';
import Toolbar from '@mui/material/Toolbar/Toolbar';
import Typography from '@mui/material/Typography/Typography';
import * as React from 'react';
import AdbIcon from '@mui/icons-material/Adb';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useWordStore } from '../../Store/useWordStore';

type Links = {
  Key: string;
  Title: string;
  Url: string;
  Role: 'anonym' | 'logged' | 'all';
  Action?: () => void;
};

export const Header = () => {
  const isAuthenticated = useWordStore((state) => state.isAuthenticated);
  const logout = useWordStore((state) => state.logout);
  const user = useWordStore((state) => state.user);

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLogout = () => {
    logout(); // Updates Zustand state and clears persistent storage automatically
    navigate('/');
  };

  const items: Links[] = [
    { Key: 'khome', Title: 'Home', Url: '/', Role: 'all' },
    { Key: 'kdashboard', Title: 'Dashboard', Url: '/dashboard', Role: 'logged' },
    { Key: 'klogin', Title: 'Login', Url: '/login', Role: 'anonym' },
    { Key: 'kabout', Title: 'About', Url: '/about', Role: 'all' },
    {
      Key: 'klogout',
      Title: 'Logout',
      Url: '/',
      Role: 'logged',
      Action: handleLogout,
    },
  ];

  const showItems = isAuthenticated
    ? items.filter((i) => i.Role === 'all' || i.Role === 'logged')
    : items.filter((i) => i.Role === 'all' || i.Role === 'anonym');

  const settings = ['Profile', 'Account', 'Dashboard', 'Logout'] as const;
  type SettingsType = (typeof settings)[number];

  const handleCloseUserMenu = (setting?: SettingsType) => {
    if (setting) {
      switch (setting) {
        case 'Profile':
          navigate('/profile');
          break;
        case 'Account':
          navigate('/account');
          break;
        case 'Dashboard':
          navigate('/dashboard');
          break;
        case 'Logout':
          handleLogout();
          break;
      }
    }
    setAnchorElUser(null);
  };

  const handleNavClick = (page: Links) => {
    handleCloseNavMenu();
    if (page.Action) {
      page.Action();
    } else {
      navigate(page.Url);
    }
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Desktop Logo */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            onClick={() => navigate('/')}
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            LOGO
          </Typography>

          {/* Mobile Navigation Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {showItems.map((page) => (
                <MenuItem key={page.Key} onClick={() => handleNavClick(page)}>
                  <Typography textAlign="center">{page.Title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="div"
            onClick={() => navigate('/')}
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            LOGO
          </Typography>

          {/* Desktop Navigation Links */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {showItems.map((page) => (
              <Button
                key={`nav-${page.Key}`}
                onClick={() => handleNavClick(page)}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.Title}
              </Button>
            ))}
          </Box>

          {/* User Settings Avatar Menu (Shown when authenticated) */}
          {isAuthenticated && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user?.name || 'User Avatar'} src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="user-menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={() => handleCloseUserMenu()}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={() => handleCloseUserMenu(setting)}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};