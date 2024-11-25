'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  styled,
  useMediaQuery,
  Avatar,
  Tooltip,
  Popover,
} from '@mui/material';
import {
  Article as ArticleIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Menu as MenuIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  List as ListIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.background.paper 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease-in-out',
}));

const NavButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  color: theme.palette.text.primary,
  borderRadius: '8px',
  padding: '6px 16px',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease-in-out',
  },
}));

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [blogAnchorEl, setBlogAnchorEl] = useState<null | HTMLElement>(null);
  const { data: session } = useSession();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleBlogMenu = (event: React.MouseEvent<HTMLElement>) => {
    setBlogAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleBlogClose = () => {
    setBlogAnchorEl(null);
  };

  const menuItems = [
    { icon: <ArticleIcon />, label: 'Yayınlar', href: '/publications' },
    { icon: <SchoolIcon />, label: 'Dersler', href: '/courses' },
    { 
      icon: <MenuBookIcon />, 
      label: 'Blog', 
      onClick: handleBlogMenu,
      subMenu: true 
    },
    { icon: <DashboardIcon />, label: 'Board', href: '/board' },
  ];

  const blogMenuItems = [
    { icon: <ListIcon />, label: 'Tüm Bloglar', href: '/blog' },
    ...(session?.user?.isAdmin ? [
      { icon: <AddIcon />, label: 'Blog Ekle', href: '/blog/create' },
      { icon: <SettingsIcon />, label: 'Blog Yönetimi', href: '/blog?manage=true' }
    ] : [])
  ];

  return (
    <StyledAppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar 
          disableGutters 
          sx={{ 
            minHeight: { xs: '64px', sm: '70px' },
            py: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 2 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  fontSize: { xs: '2.1rem', sm: '2.25rem' },
                  cursor: 'pointer',
                }}
              >
                Doç.Dr. Özal YILDIRIM
              </Typography>
            </Link>
            {session?.user?.isAdmin && (
              <Tooltip title="Admin Yetkisi">
                <AdminIcon 
                  sx={{ 
                    ml: 1, 
                    color: theme.palette.primary.main,
                    fontSize: '1.5rem'
                  }} 
                />
              </Tooltip>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isMobile && (
              <Box sx={{ display: 'flex' }}>
                {menuItems.map((item) => (
                  item.subMenu ? (
                    <div key={item.label}>
                      <NavButton
                        startIcon={item.icon}
                        onClick={item.onClick}
                      >
                        {item.label}
                      </NavButton>
                      <Popover
                        open={Boolean(blogAnchorEl)}
                        anchorEl={blogAnchorEl}
                        onClose={handleBlogClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'left',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left',
                        }}
                      >
                        <Box sx={{ py: 1 }}>
                          {blogMenuItems.map((blogItem) => (
                            <MenuItem
                              key={blogItem.label}
                              component={Link}
                              href={blogItem.href}
                              onClick={handleBlogClose}
                              sx={{
                                gap: 1,
                                minWidth: 200,
                                py: 1,
                                px: 2,
                              }}
                            >
                              {blogItem.icon}
                              {blogItem.label}
                            </MenuItem>
                          ))}
                        </Box>
                      </Popover>
                    </div>
                  ) : (
                    <Link 
                      key={item.label} 
                      href={item.href || '#'}
                      style={{ textDecoration: 'none' }}
                    >
                      <NavButton
                        startIcon={item.icon}
                      >
                        {item.label}
                      </NavButton>
                    </Link>
                  )
                ))}
              </Box>
            )}

            {session ? (
              <>
                <Tooltip title={session.user?.email || ''}>
                  <Avatar 
                    src={session.user?.image || ''}
                    alt={session.user?.name || ''}
                    sx={{ width: 40, height: 40 }}
                  />
                </Tooltip>
                <IconButton
                  onClick={() => signOut()}
                  color="inherit"
                  sx={{ color: theme.palette.text.primary }}
                >
                  <LogoutIcon />
                </IconButton>
              </>
            ) : (
              <Button
                startIcon={<LoginIcon />}
                onClick={() => signIn('google')}
                sx={{ color: theme.palette.text.primary }}
              >
                Giriş Yap
              </Button>
            )}

            {isMobile && (
              <>
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenu}
                  sx={{ color: theme.palette.text.primary }}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {menuItems.map((item) => (
                    item.subMenu ? (
                      <Box key={item.label}>
                        {blogMenuItems.map((blogItem) => (
                          <MenuItem 
                            key={blogItem.label}
                            component={Link}
                            href={blogItem.href}
                            onClick={handleClose}
                            sx={{
                              gap: 1,
                              borderRadius: 1,
                              mx: 1,
                              my: 0.5,
                            }}
                          >
                            {blogItem.icon}
                            {blogItem.label}
                          </MenuItem>
                        ))}
                      </Box>
                    ) : (
                      <MenuItem 
                        key={item.label} 
                        onClick={handleClose}
                        component={Link}
                        href={item.href || '#'}
                        sx={{
                          gap: 1,
                          borderRadius: 1,
                          mx: 1,
                          my: 0.5,
                        }}
                      >
                        {item.icon}
                        {item.label}
                      </MenuItem>
                    )
                  ))}
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Header;
