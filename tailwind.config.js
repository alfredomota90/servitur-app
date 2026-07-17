/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '640px',
      bp: '770px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        background: 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        card: 'var(--card)',
        'card-hover': 'var(--card-hover)',
        border: 'var(--border)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-muted': 'var(--accent-muted)',
        'accent-text': 'var(--accent-text)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        'admin-bg': 'var(--admin-bg)',
        'admin-foreground': 'var(--admin-foreground)',
        'admin-accent': 'var(--admin-accent)',
      },
    },
  },
  plugins: [],
}
