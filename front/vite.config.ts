//vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import { backendURL } from "./src/config";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 8080, // Utilisation du port 8080
    open: false,
    cors: true,
    proxy: {
      '/api': 'http://localhost:3000'
      // '/api': `${process.env.VITE_BACKEND_URL}`
    }
    // proxy: {
    //   '/api': 'http://backend:3000'
    // }
  }
})