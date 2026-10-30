/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#F4F8FF',
        surface: '#FFFFFF',
        'surface-soft': '#EAF2FF',
        'text-main': '#14213D',
        'text-muted': '#64748B',
        primary: {
          DEFAULT: '#2563EB',
          dark: '#123B8A',
          hover: '#1D4ED8'
        },
        cyan: {
          DEFAULT: '#06B6D4',
          light: '#E0F2FE'
        },
        success: '#059669',
        warning: '#D97706',
        danger: '#DC2626',
        border: '#DCE6F5',
        sidebar: {
          DEFAULT: '#0B1730',
          active: '#155EEF',
          hover: '#132448',
          border: '#1B2C52'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '18px',
        'input': '11px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(20, 33, 61, 0.05)',
        'card': '0 2px 12px -1px rgba(20, 33, 61, 0.06), 0 1px 3px 0 rgba(20, 33, 61, 0.04)',
        'card-hover': '0 12px 28px -4px rgba(37, 99, 235, 0.12), 0 4px 10px -2px rgba(20, 33, 61, 0.05)',
      }
    },
  },
  plugins: [],
}
