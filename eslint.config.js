import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'src/components/AROverlay.jsx',
    'src/components/ARViewer.jsx',
    'src/components/AdminDashboard.jsx',
    'src/components/FeedbackForm.jsx',
    'src/components/FeedbackList.jsx',
    'src/components/FilterSidebar.jsx',
    'src/components/GeoAlert.jsx',
    'src/components/ImpactCards.jsx',
    'src/components/LandingPage.jsx',
    'src/components/LoginPage.jsx',
    'src/components/MapModeSwitcher.jsx',
    'src/components/MapView.jsx',
    'src/components/Navbar.jsx',
    'src/components/NotificationSystem.jsx',
    'src/components/ProjectDetail.jsx',
    'src/components/ProjectDetailPanel.jsx',
    'src/components/ProjectExperience.jsx',
    'src/components/ProjectNode.jsx',
    'src/components/QRScanner.jsx',
    'src/components/ReportModal.jsx',
    'src/components/SignupPage.jsx',
    'src/data/**',
    'src/services/osmService.js',
    'src/utils/feedbackUtils.js',
    'src/utils/projectNormalization.js',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['server/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
