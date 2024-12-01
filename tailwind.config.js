/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'xs': '320px',     // Extra small devices (küçük telefonlar)
      'sm': '375px',     // Small devices (büyük telefonlar)
      'md': '768px',     // Medium devices (tabletler)
      'lg': '1024px',    // Large devices (laptoplar)
      'xl': '1280px',    // Extra large devices (masaüstü)
      '2xl': '1536px',   // 2X large devices (geniş ekranlar)
    },
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
