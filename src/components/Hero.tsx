'use client';

// ... (önceki importlar ve tanımlamalar aynı)
import React, { useState } from 'react';
import { Box, Container, Grid, IconButton, Link, Tooltip, Typography, useTheme, Button, Menu, MenuItem, useMediaQuery, styled, Avatar } from '@mui/material';
import { LinkedIn, Email, Article, School, Home, MenuBook, Dashboard, Menu as MenuIcon, Login as LoginIcon, Logout as LogoutIcon, AdminPanelSettings as AdminIcon, AccountCircle } from '@mui/icons-material';
import NextLink from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

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

const menuItems = [
  { icon: <Home />, label: 'Anasayfa', href: '/', color: '#2E7D32' },
  { icon: <Article />, label: 'Yayınlar', href: '/publications', color: '#1565C0' },
  { icon: <School />, label: 'Dersler', href: '/courses', color: '#7B1FA2' },
  { icon: <MenuBook />, label: 'Blog', href: '/blog', color: '#C62828' },
  { icon: <Dashboard />, label: 'Board', href: '/board', color: '#0277BD' },
];

const Hero = () => {
  // ... (önceki hooks ve state tanımlamaları aynı)
// ... (önceki state ve hooks tanımları aynı)
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
          xs: '180px',  // Mobil için daha kompakt
          sm: '200px',  // Tablet için orta boy
          md: '220px'   // Desktop için normal boy
        },
        minHeight: {
          xs: '180px',
          sm: '200px',
          md: '220px'
        }
      }}
    >
      {/* Sosyal Bağlantılar ve Giriş */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: { xs: 4, sm: 8, md: 16 },  // Üst boşluk azaltıldı
          right: { xs: 4, sm: 8, md: 24 },
          display: 'flex',
          gap: 0.5,  // Gap azaltıldı
          zIndex: 1,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
          padding: { xs: '2px', sm: '4px' },  // Padding azaltıldı
          borderRadius: '8px',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* ... (sosyal bağlantılar ve giriş kısmı aynı) */}
        {socialLinks.map((link) => (
          <Tooltip 
            key={link.label}
            title={link.tooltip}
            arrow
            placement="bottom"
          >
            <Link 
              href={link.href}
              target={link.href.startsWith('http') ? "_blank" : "_self"}
              rel={link.href.startsWith('http') ? "noopener noreferrer" : ""}
              sx={{ textDecoration: 'none' }}
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
            </Link>
          </Tooltip>
        ))}
        {session ? (
          <>
            <Tooltip title={session.user?.email || ''} arrow placement="bottom">
              <Avatar 
                src={session.user?.image || ''}
                alt={session.user?.name || ''}
                sx={{ 
                  width: 24, 
                  height: 24,
                  border: `2px solid ${theme.palette.primary.main}`,
                }}
              />
            </Tooltip>
            <Tooltip title="Çıkış Yap" arrow placement="bottom">
              <IconButton
                onClick={() => signOut()}
                size="small"
                sx={{
                  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    color: theme.palette.error.main,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                  }
                }}
              >
                <LogoutIcon sx={{ fontSize: '1.25rem' }} />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Giriş Yap" arrow placement="bottom">
            <IconButton
              onClick={() => signIn('google')}
              size="small"
              sx={{
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  color: theme.palette.success.main,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                }
              }}
            >
              <AccountCircle sx={{ fontSize: '1.25rem' }} />
            </IconButton>
          </Tooltip>
        )}
             </Box>

      <Container 
        maxWidth="lg"
        sx={{ 
          py: { xs: 1, sm: 2, md: 3 },  // Padding değerleri azaltıldı
          px: { xs: 1, sm: 2, md: 3 },
          height: '100%',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Grid container spacing={1} alignItems="center">  {/* Grid spacing azaltıldı */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                position: 'relative',
                width: { xs: 80, sm: 100, md: 120 },  // Profil resmi boyutları küçültüldü
                height: { xs: 80, sm: 100, md: 120 },
                margin: 'auto',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `2px solid ${theme.palette.primary.main}`,  // Border kalınlığı azaltıldı
                boxShadow: theme.shadows[2],
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
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>  {/* Gap ve margin azaltıldı */}
              <Typography
                component="h1"
                variant="h3"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  fontSize: { 
                    xs: '1.25rem',  // Font boyutları küçültüldü
                    sm: '1.5rem', 
                    md: '2rem' 
                  }
                }}
              >
                Doç.Dr. Özal YILDIRIM
              </Typography>
              {/* ... (admin icon aynı) */}
              {session?.user?.isAdmin && (
                <Tooltip title="Admin Yetkisi">
                  <AdminIcon 
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontSize: '1.5rem'
                    }} 
                  />
                </Tooltip>
              )}
                         </Box>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                mb: { xs: 0.5, sm: 1, md: 1.5 },  // Margin azaltıldı
                fontSize: { 
                  xs: '0.75rem',  // Font boyutları küçültüldü
                  sm: '0.875rem', 
                  md: '1rem' 
                },
                display: { xs: 'none', sm: 'block' }  // Mobilde açıklama gizlendi
              }}
            >
              Akademik çalışmalar, araştırmalar ve öğretim üzerine odaklanmış bir akademisyen.
              Bilgi paylaşımı ve akademik işbirliği için bu platformda sizlerle buluşuyorum.
            </Typography>
            {/* ... (menü kısmı aynı) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
              {!isMobile ? (
                <Box sx={{ display: 'flex' }}>
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
              ) : (
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenu}
                  sx={{ 
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.16)',
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
                      </Grid>
        </Grid>
      </Container>

      {/* ... (mobil menü aynı) */}
 
      {/* Mobil Menü */}
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
        PaperProps={{
          sx: {
            mt: 1,
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
