// / <reference types="node" />
// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  srcDir: 'src/',
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
  ],

  // 禁用 SSR 预渲染以避免 Tailwind colors 导入问题
  routeRules: {
    '/**': { cache: { maxAge: 60 * 10, staleMaxAge: 60 * 60 * 24 } },
  },

  devtools: { enabled: true },

  app: {
    head: {
      title: 'EmoAI - AI Emotional Companion',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AI Emotional Companion - Chat with AI friends' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  // 环境变量
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000',
      requestTimeout: process.env.NUXT_PUBLIC_REQUEST_TIMEOUT || '30000',
    },
  },

  experimental: {
    viewTransition: true,
  },

  compatibilityDate: '2024-10-18',

  // Vite 构建配置 - 防止EMFILE错误
  vite: {
    define: {
      __DEV__: process.env.NODE_ENV === 'development',
    },
    server: {
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.nuxt/**',
          '**/.bun/**',
          '**/dist/**',
          '**/chat/**',
          '**/.next/**',
        ],
      },
      fs: {
        strict: false,
      },
    },
    // 修复 Tailwind CSS ESM 导入问题 (Node v18+)
    ssr: {
      external: ['tailwindcss'],
    },
  },

  // Nitro 服务器配置
  nitro: {
    prerender: {
      ignore: ['/api'],
      crawlLinks: false,
    },
    // 修复 ESM 导入问题
    rollupConfig: {
      external: ['tailwindcss'],
      output: {
        format: 'es',
      },
    },
  },
});
