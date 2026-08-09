import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mapAssets from './plugins/mapAssets'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mapAssets()],
})
