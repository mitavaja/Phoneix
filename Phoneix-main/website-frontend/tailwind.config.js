/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#0A1F44',
        'brand-orange': '#FF6A00',
        'brand-gray': '#687280',
        'brand-platinum': '#E5E7EB',
        'brand-white': '#FFFFFF',
        'light-navy': '#0A1F44',
        'light-navy-hover': '#0C2754',
        // Official theme mappings
        'midnight-blue': '#0A1F44',
        'electric-orange': '#FF6A00',
        'steel-gray': '#687280',
        'ice-silver': '#E5E7EB',
        'pure-white': '#FFFFFF',
      }
    },
  },
  plugins: [],
}