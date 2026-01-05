/**
 * API 密钥管理工具
 * 用于在前端存储和检索 NVIDIA API 密钥
 * 优先级：localStorage > 环境变量
 */

const NVIDIA_API_KEY_STORAGE = 'nvidia_api_key';

interface NuxtWindowConfig {
  __NUXT_CONFIG__?: {
    public?: {
      nvidiaApiKey?: string;
    };
  };
}

/**
 * 从环境变量或 localStorage 获取 API 密钥
 */
export function getNvidiaApiKey(): string | null {
  // 优先从 localStorage 获取（用户设置或浏览器存储）
  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem(NVIDIA_API_KEY_STORAGE);
    if (storedKey) {
      return storedKey;
    }

    // 其次尝试从 __NUXT_CONFIG__ 获取环境变量（Nuxt 生产构建）
    const nuxtConfig = (window as unknown as NuxtWindowConfig).__NUXT_CONFIG__?.public?.nvidiaApiKey;
    if (nuxtConfig) {
      return nuxtConfig;
    }
  }

  return null;
}

/**
 * 设置 NVIDIA API 密钥（存储到 localStorage）
 */
export function setNvidiaApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(NVIDIA_API_KEY_STORAGE, key);
  }
}

/**
 * 清除 NVIDIA API 密钥
 */
export function clearNvidiaApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(NVIDIA_API_KEY_STORAGE);
  }
}

/**
 * 检查 API 密钥是否已配置
 */
export function hasNvidiaApiKey(): boolean {
  return getNvidiaApiKey() !== null;
}

