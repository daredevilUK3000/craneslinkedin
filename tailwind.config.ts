import type { Config } from 'tailwindcss';

// Design direction: a rigging inspection tag / load-chart aesthetic —
// the world of the audience (crane operators, riggers, lift planners),
// not a generic SaaS look. See app/globals.css for the signature
// corner-bracket "spec plate" treatment used on the scenario card.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#101820', // primary text / dark panels
        steel: '#2E3A46', // secondary panels
        'safety-yellow': '#F5B700', // primary accent — hazard/attention
        'warning-orange': '#D8481E', // secondary accent — active/highlight states
        'cable-grey': '#8B95A1', // secondary text
        paper: '#ECEEE8', // light background — galvanized spec-sheet paper, not cream
      },
      fontFamily: {
        display: ['var(--font-oswald)', 'sans-serif'],
        body: ['var(--font-plex-sans)', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
