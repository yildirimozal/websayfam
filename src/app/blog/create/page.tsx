'use client';

import React from 'react';
import { Box } from '@mui/material';
import BlogEditor from '@/components/BlogEditor';
import Hero from '@/components/Hero';

export default function CreateBlogPage() {
  return (
    <Box>
      <Hero />
      <BlogEditor />
    </Box>
  );
}
