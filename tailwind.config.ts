import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090B0E',
        secondary: '#11141A',
        card: '#161B22',
        primary: '#E5C368',
        'primary-dark': '#CCA445',
        textPrimary: '#FFFFFF',
        textSecondary: '#9AA3B0',
        border: '#242A36',
      },
    },
  },
  plugins: [],
}

export default config
