<template>
  <div class="page-wrapper">
    <div class="main-container">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  background-color: var(--color-background);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1.5625rem 0.5rem; /* 25px top/bottom, 8px left/right */
}

.main-container {
  width: 100%;
  height: calc(100vh - 3.125rem); /* 100vh - (2 * 1.5625rem padding) */
  max-width: 1200px;
  background-color: var(--color-surface); /* 容器内部的背景色 */
  border: 1px solid var(--color-border); /* 使用CSS变量 */
  border-radius: 1.25rem; /* 20px */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); /* 添加阴影 */
  overflow: hidden; /* 确保内容不会溢出圆角 */
}
</style>
