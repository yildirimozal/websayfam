'use client';

import { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  VideoLibrary as VideoIcon,
  Article as BlogIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import Link from 'next/link';

const adminMenuItems = [
  {
    title: 'Kontrol Paneli',
    icon: <DashboardIcon />,
    path: '/admin',
  },
  {
    title: 'Video Yönetimi',
    icon: <VideoIcon />,
    path: '/admin/videos',
  },
  {
    title: 'Blog Yönetimi',
    icon: <BlogIcon />,
    path: '/blog/create',
  },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={toggleDrawer}
        edge="start"
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1201,
          display: { xs: 'block', md: 'none' },
        }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: 'border-box',
            display: { xs: 'none', md: 'block' },
          },
        }}
      >
        <Box sx={{ overflow: 'auto', pt: 8 }}>
          <List>
            {adminMenuItems.map((item) => (
              <ListItem
                key={item.path}
                component={Link}
                href={item.path}
                sx={{ color: 'inherit', textDecoration: 'none' }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 240 },
        }}
      >
        <Box sx={{ overflow: 'auto', pt: 8 }}>
          <List>
            {adminMenuItems.map((item) => (
              <ListItem
                key={item.path}
                component={Link}
                href={item.path}
                onClick={toggleDrawer}
                sx={{ color: 'inherit', textDecoration: 'none' }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
