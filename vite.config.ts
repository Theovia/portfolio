import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  base: '/portfolio/',
  plugins: [glsl()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/gsap')) return 'gsap'
          if (id.includes('node_modules/postprocessing')) return 'postprocessing'
        },
      },
    },
  },
  server: {
    port: 5173,
  },
})
