import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const GITHUB_PAGES_BASE = '/civic-surge/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? GITHUB_PAGES_BASE : '/',
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
}))
