/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: { cream: '#FAF6F0', terracotta: '#C85A32', burnt: '#A94728', cocoa: '#4A2810', sand: '#8C7A6B', line: '#EFE6DC', whatsapp: '#25D366' },
      fontFamily: { sans: ['System'] },
    },
  },
  plugins: [],
};
