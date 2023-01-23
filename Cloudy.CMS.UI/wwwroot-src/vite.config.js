import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    preact(),
    viteStaticCopy({
      targets: [
        {
          src: 'form/entity-context.js',
          dest: 'form/',
        },
        {
          src: 'form/field-component-context.js',
          dest: 'form/',
        },
        {
          src: 'form/form-field.js',
          dest: 'form/',
        },
        {
          src: 'data/state-manager.js',
          dest: 'data/',
        },
        {
          src: 'data/content-getter.js',
          dest: 'data/',
        },
        {
          src: 'data/content-not-found.js',
          dest: 'data/',
        },
        {
          src: 'data/change-handlers/simple-change-handler.js',
          dest: 'data/change-handlers/',
        },
        {
          src: 'data/change-handlers/block-type-change-handler.js',
          dest: 'data/change-handlers/',
        },
        {
          src: 'form/controls',
          dest: 'form/',
        },
        {
          src: 'util/*',
          dest: 'util/',
        },
        {
          src: 'components/*',
          dest: 'components/',
        },
        {
          src: 'notification/notification-manager.js',
          dest: 'notification/',
        },
        {
          src: 'node_modules/htm/preact/standalone.module.js',
          dest: 'preact-htm/',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@constants' : path.resolve(__dirname, './constants/constants.js'),
    }
  },
  server: {
    hmr: false
  },
  build: {
    rollupOptions: {
      external: [
        'data/change-handlers/simple-change-handler.js',
        'data/change-handlers/block-type-change-handler.js',
        'data/state-manager.js',
        'data/content-getter.js',
        'data/content-not-found.js',
        'form/field-component-context.js',
        'form/entity-context.js',
        'form/form-field.js',
        'media-picker/media-picker-menu.js',
        'notification/notification-manager.js',
        'components/*',
        'util/array-equals.js',
        'util/array-starts-with.js',
        'util/get-reference-value.js',
        'util/url-fetcher.js',
        'util/debounce.js',
        'preact-htm/standalone.module.js',
      ],
      output: {
        entryFileNames: '[name].bundle.js',
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].js'
      }
    },
    sourcemap: true,
    outDir: '../wwwroot',
    target: 'esnext'
  }
});
