import nextVitals from 'eslint-config-next/core-web-vitals';
export default [
 ...nextVitals,
 {ignores:['out/**','coverage/**','tmp-video/**']},
 {rules:{
  '@next/next/no-img-element':'warn','react/no-unescaped-entities':'off',
  'react-hooks/exhaustive-deps':'warn','prefer-const':'error',
  // Existing components predate React Compiler. Keep diagnostics visible.
  'react-hooks/set-state-in-effect':'warn','react-hooks/refs':'warn','react-hooks/purity':'warn',
  'no-unused-vars':['warn',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}], 'no-console':'warn',
 }},
];
