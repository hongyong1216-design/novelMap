import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mapAssets from './plugins/mapAssets'
import storylineData from './plugins/storylineData'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mapAssets(), storylineData()],
})
