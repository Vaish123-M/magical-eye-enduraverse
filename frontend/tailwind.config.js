/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ok:    { DEFAULT: '#22c55e', light: '#dcfce7' },
        notok: { DEFAULT: '#ef4444', light: '#fee2e2' },
      },
    },
  },
  plugins: [],
}
