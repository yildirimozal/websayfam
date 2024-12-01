'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  IconButton, 
  Typography, 
  useTheme, 
  Button, 
  Menu, 
  MenuItem, 
  useMediaQuery, 
  styled,
  Tooltip
} from '@mui/material';
import { 
  LinkedIn, 
  Email, 
  Article, 
  School, 
  Home, 
  MenuBook, 
  Dashboard, 
  Menu as MenuIcon, 
  AdminPanelSettings as AdminIcon 
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useSession } from 'next-auth/react';

interface MenuItem {
  icon: React.ReactElement;
  label: string;
  href: string;
  color: string;
}

const NavButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
  borderRadius: '8px',
  padding: '6px 16px',
  fontWeight: 600,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(25, 118, 210, 0.08)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.16)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease-in-out',
  },
}));

const socialLinks = [
  {
    icon: <LinkedIn />,
    tooltip: "LinkedIn Profili",
    href: "#",
    label: "linkedin",
    color: "#0A66C2"
  },
  {
    icon: <Email />,
    tooltip: "E-posta Gönder",
    href: "mailto:ozalyildirim@firat.edu.tr",
    label: "email",
    color: "#D93025"
  },
  {
    icon: <School />,
    tooltip: "Google Scholar Profili",
    href: "https://scholar.google.com/citations?user=_RKTpkMAAAAJ&hl=tr&oi=ao",
    label: "google-scholar",
    color: "#4285F4"
  },
  {
    icon: <Article />,
    tooltip: "Akademik Yayınlar",
    href: "/publications",
    label: "publications",
    color: "#1565C0"
  }
];

const menuItems: MenuItem[] = [
  { icon: <Home />, label: 'Anasayfa', href: '/', color: '#2E7D32' },
  { icon: <Article />, label: 'Yayınlar', href: '/publications', color: '#1565C0' },
  { icon: <School />, label: 'Dersler', href: '/courses', color: '#7B1FA2' },
  { icon: <MenuBook />, label: 'Blog', href: '/blog', color: '#C62828' },
  { icon: <Dashboard />, label: 'Board', href: '/board', color: '#0277BD' },
];

const Hero = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: session } = useSession();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        position: 'relative',
        overflow: 'hidden',
        height: { 
          xs: '170px',
          sm: '170px',
          md: '200px'
        }
      }}
    >
      {/* Mobil Menü Butonu */}
      {isMobile && (
        <IconButton
          size="small"
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleMenu}
          sx={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            padding: '8px',
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
      )}

      <Container maxWidth="lg">
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            px: { xs: 1, sm: 1, md: 1 }
          }}
        >
          {/* İsim ve Profil Resmi Container */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: { xs: 2, sm: 3 },
              width: '100%',
              maxWidth: { xs: '100%', md: '800px' },
              flexDirection: 'row'
            }}
          >
            {/* Profil Resmi ve Sosyal Linkler */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1
            }}>
              <Box
                sx={{
                  width: { xs: 100, sm: 100, md: 120 },
                  height: { xs: 100, sm: 100, md: 120 },
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: theme.shadows[2],
                  flexShrink: 0
                }}
              >
                <img
                  src="/profile.jpg"
                  alt="Doç.Dr. Özal YILDIRIM"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  loading="eager"
                />
              </Box>

              {/* Sosyal Bağlantılar */}
              <Box 
                sx={{ 
                  display: { xs: 'flex', sm: 'flex' },
                  gap: 0.5,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                  padding: { xs: '2px', sm: '4px' },
                  borderRadius: '8px',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {socialLinks.map((link) => (
                  <Tooltip 
                    key={link.label}
                    title={link.tooltip}
                    arrow
                    placement="bottom"
                  >
                    <NextLink 
                      href={link.href}
                      target={link.href.startsWith('http') ? "_blank" : "_self"}
                      rel={link.href.startsWith('http') ? "noopener noreferrer" : ""}
                      style={{ textDecoration: 'none' }}
                    >
                      <IconButton 
                        aria-label={link.label}
                        size="small"
                        sx={{
                          color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            color: link.color,
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                          }
                        }}
                      >
                        {React.cloneElement(link.icon, { 
                          sx: { 
                            transition: 'color 0.3s',
                            fontSize: '1.25rem'
                          } 
                        })}
                      </IconButton>
                    </NextLink>
                  </Tooltip>
                ))}
              </Box>
            </Box>

            {/* İsim ve Başlık */}
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'center', md: 'flex-start' }
            }}>
              <Typography
                component="h1"
                variant="h3"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  fontSize: { 
                    xs: '1.5rem',
                    sm: '2rem', 
                    md: '2rem' 
                  },
                  textAlign: { xs: 'center', md: 'left' },
                  mb: { xs: 0, md: 1 }
                }}
              >
                Doç.Dr. Özal YILDIRIM
              </Typography>

              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ 
                  display: { xs: 'block', sm: 'block' },
                  fontSize: { xs: '0.775rem',sm: '0.875rem', md: '1rem' },
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                Akademik çalışmalar, araştırmalar ve öğretim üzerine odaklanmış bir akademisyen.
              </Typography>

              {!isMobile && (
                <Box sx={{ display: 'flex', mt: 2 }}>
                  {menuItems.map((item) => (
                    <NextLink 
                      key={item.label} 
                      href={item.href}
                      style={{ textDecoration: 'none' }}
                    >
                      <NavButton
                        startIcon={React.cloneElement(item.icon, {
                          sx: { color: item.color }
                        })}
                      >
                        {item.label}
                      </NavButton>
                    </NextLink>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Mobil Menü */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 5,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
          }
        }}
      >
        {menuItems.map((item) => (
          <MenuItem 
            key={item.label} 
            onClick={handleClose}
            component={NextLink}
            href={item.href}
            sx={{
              gap: 1,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              color: item.color,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            {React.cloneElement(item.icon, {
              sx: { color: item.color }
            })}
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default Hero;
