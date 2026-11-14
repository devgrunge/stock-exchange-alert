import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        positive: '#22c55e',
        negative: '#ef4444',
      },
    },
  },
  plugins: [],
} satisfies Config;
