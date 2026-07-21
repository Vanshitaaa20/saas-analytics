/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          blue: '#60a5fa',
          purple: '#7c3aed',
        },
      },
      boxShadow: {
        'glass-lg': '0 10px 30px rgba(16,24,40,0.08)',
      },
    },
  },
  plugins: [],
};
