import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        hull: {
          950: '#0B1210',
          900: '#0F1917',
          850: '#132420',
          800: '#182F29',
          700: '#254238',
          600: '#3A5F51',
          500: '#5C8A76',
          400: '#8AB69E',
          300: '#B7D9C6',
        },
        buoy: {
          DEFAULT: '#FF7A45',
          dim: '#B8552C',
        },
        signal: {
          green: '#4ADE80',
          amber: '#FBBF24',
          red: '#F87171',
          blue: '#60A5FA',
        },
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
