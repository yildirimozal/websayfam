/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    disableStaticImages: true,
    domains: ['localhost'],
  },
}

module.exports = nextConfig
