// @ts-expect-error - Nuxt auto-import
export const useHeaderTitle = () => useState<string | null>('header-title', () => null);
