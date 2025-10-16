module.exports = {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca'
        },
        purple: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#a855f7',
          600: '#9333ea'
        },
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          500: '#ec4899',
          600: '#db2777'
        }
      },
      boxShadow: {
        glow: '0 20px 45px -20px rgba(79, 70, 229, 0.45)'
      }
    }
  },
  plugins: []
};
