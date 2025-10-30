import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('tone')) {
              return 'tone'; // Create a separate chunk for Tone.js
            }
            if (id.includes('react-dom') || id.includes('react')) {
              return 'react-vendor'; // Create a separate chunk for React libraries
            }
            // All other node_modules will be bundled in the default vendor chunk
            return 'vendor';
          }
        },
      },
    },
  },
})
