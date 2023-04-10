import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy'
import svgr from 'vite-plugin-svgr'

export default () =>
  defineConfig({
    plugins: [
      preact(),
      viteStaticCopy({
        targets: [
          {
            src: 'controls',
            dest: '',
          },
          {
            src: 'entity-list/columns',
            dest: './',
          },
        ],
      }),
      svgr(),
    ],
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, './')
      }
    },
    server: {
    },
    build: {
      rollupOptions: {
        external: [
        ],
        output: {
          entryFileNames: '[name].bundle.js',
          assetFileNames: '[name].[ext]',
          chunkFileNames: '[name].[ext]'
        }
      },
      sourcemap: true,
      outDir: '../wwwroot'
    }
  });
