import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, /api é repassado para a API Spring Boot,
    // evitando a necessidade de configurar CORS no backend.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
