/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#10b981',
        'dot': '#ffffff',
        'dot-pressed': '#000000',
        'text-main': '#ffffff',
        'rank-s': '#fde047',
        'rank-a': '#c0c0c0',
        'rank-b': '#cd7f32',
        'rank-c': '#a3a3a3',
      },
      backgroundColor: {
        'panel': 'rgba(0, 0, 0, 0.1)',
      },
      opacity: {
        'dot-inactive': '0.3',
      }
    },
  },
  plugins: [],
}
