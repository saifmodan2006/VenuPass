/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#F5F4F0',
          surface: '#FFFFFF',
          secondary: '#F0EFEA',
          subtle: '#EAE8E1',
        },
        border: {
          main: '#DDDCD6',
          subtle: '#E8E7E2',
          strong: '#C2C0B6',
        },
        txt: {
          primary: '#161616',
          secondary: '#6F6F6A',
          tertiary: '#9E9D97',
        },
        accent: {
          main: '#E86A00',
          dark: '#B94D00',
          light: '#FFF4EB',
        },
        status: {
          success: '#16794C',
          'success-bg': '#EBF7F0',
          warning: '#A96500',
          'warning-bg': '#FDF6E9',
          danger: '#C43D3D',
          'danger-bg': '#FDF0F0',
          info: '#2864A8',
          'info-bg': '#EEF4FC',
        },
        scanner: {
          bg: '#0E0F10',
          surface: '#17191B',
          border: '#2A2D30',
          text: '#F5F5F2',
          muted: '#8A8F95',
          accent: '#FF7A00',
        }
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        btn: '8px',
        input: '8px',
        card: '12px',
        dialog: '14px',
        pass: '18px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        card: '0 4px 12px rgba(0, 0, 0, 0.03)',
        elevated: '0 10px 30px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'scan': 'scanLine 2.2s ease-in-out infinite',
      },
      keyframes: {
        scanLine: {
          '0%, 100%': { top: '6%', opacity: '0.8' },
          '50%': { top: '92%', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
