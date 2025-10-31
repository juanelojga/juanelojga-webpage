/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      keyframes: {
        'fade-in-left': {
          'from': { opacity: '0', transform: 'translateX(-30px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-in-right': {
          'from': { opacity: '0', transform: 'translateX(30px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in-left': 'fade-in-left 1s ease-out both',
        'fade-in-right': 'fade-in-right 1s ease-out both',
      },
    },
  },
  plugins: [],
};
