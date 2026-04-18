import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import path from 'path'
import type { Plugin } from 'vite'

// Plugin to serve saved-fixtures from project root during dev
function serveSavedFixtures(): Plugin {
  return {
    name: 'serve-saved-fixtures',
    configureServer(server) {
      server.middlewares.use('/saved-fixtures', (req, res, next) => {
        const filePath = path.join(process.cwd(), 'saved-fixtures', req.url || '')
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader('Content-Type', 'application/json')
          fs.createReadStream(filePath).pipe(res)
        } else {
          next()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveSavedFixtures()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
