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

  // 忽略不必要的目录，减少文件监听压力
  ignore: [
    '**/node_modules/**',
    '**/.git/**',

    '**/__pycache__/**',
  ],

  // 构建配置
  build: {
    transpile: ['@nuxt/ui', 'tailwindcss'],
  },

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
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
      requestTimeout: process.env.NUXT_PUBLIC_REQUEST_TIMEOUT || '30000',
      nvidiaApiKey: process.env.NVIDIA_API_KEY || '',
    },
  },

  // Nitro 服务器配置
  nitro: {
    baseURL: '/',
    // 明确指定 server API 扫描目录

    routeRules: {
      '/api/**': { cors: true },
    },
  },

  experimental: {
    viewTransition: true,
  },
  devtools: { enabled: false },
  compatibilityDate: '2024-10-18',

  // Vite 构建配置 - 最小化配置以避免 EMFILE 错误
  vite: {
    define: {
      __DEV__: process.env.NODE_ENV === 'development',
    },
  },
});
