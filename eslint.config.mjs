import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextCoreWebVitals,
  {
    // Pre-existing code trips these new React 19 compiler rules; kept as warnings so lint can gate new work.
    rules: { 'react-hooks/set-state-in-effect': 'warn', 'react-hooks/immutability': 'warn' },
  },
  { ignores: ['.next/**', 'node_modules/**', 'website/**', '.claude/**', 'public/**', 'watson_pandal_sevai_realistic_preloader_landing_page.html'] },
];
export default config;
