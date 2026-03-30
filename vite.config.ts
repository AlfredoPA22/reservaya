import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'
  const landingUrl = env.VITE_LANDING_URL || 'http://localhost:3000'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        '/uploads': apiUrl,
        '/landing': {
          target: landingUrl,
          rewrite: (path) => path.replace(/^\/landing/, ''),
        },
      },
    },
  }
})
