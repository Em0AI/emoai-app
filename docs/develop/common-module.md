# 公共模块开发文档

**模块名**：Common (公共)  
**文件数**：7 个  
**职责**：共享组件、布局、全局样式

---

## 文件清单

```
components/common/
├── Navbar.vue                      ← 导航栏
├── Footer.vue                      ← 页脚
├── Button.vue                      ← 按钮组件
├── Card.vue                        ← 卡片容器
├── Loading.vue                     ← 加载动画
└── EmptyState.vue                  ← 空状态组件

layouts/
└── default.vue                     ← 默认布局
```

---

## 核心流程

```
所有页面共用的布局和组件
  ├─ layouts/default.vue
  │  ├─ Navbar（顶部导航）
  │  ├─ 页面内容（<slot />）
  │  └─ Footer（页脚）
  │
  └─ 页面内的组件
     ├─ Card（内容容器）
     ├─ Button（交互按钮）
     ├─ Loading（加载状态）
     └─ EmptyState（空数据提示）
```

---

## 组件详解

### Navbar.vue
```typescript
// Props
interface Props {
  title?: string
  showBack?: boolean
}

// Events
emit('back'): void

// 功能
- 顶部导航栏
- 显示当前页面标题
- 条件显示返回按钮
- 固定/粘性定位
- 响应式高度
```

### Footer.vue
```typescript
// Props
interface Props {
  showNavigation?: boolean  // default: true
}

// 功能
- 页脚组件
- 可选的底部导航菜单
- 版权信息
- 粘性定位（底部）
```

### Button.vue
```typescript
// Props
interface Props {
  type?: 'primary' | 'secondary' | 'danger'  // default: 'primary'
  size?: 'sm' | 'md' | 'lg'                   // default: 'md'
  disabled?: boolean
  loading?: boolean
  icon?: string
  fullWidth?: boolean
}

// Events
emit('click'): void

// 功能
- 可复用按钮组件
- 多种样式（主/次/危险）
- 多种大小（小/中/大）
- 支持图标
- 加载状态显示
- 禁用状态
```

### Card.vue
```typescript
// Props
interface Props {
  shadow?: 'none' | 'sm' | 'md' | 'lg'  // default: 'md'
  hover?: boolean                        // default: true
  clickable?: boolean
  padding?: 'sm' | 'md' | 'lg'          // default: 'md'
}

// Events
emit('click'): void

// Slots
<slot />     ← 卡片内容

// 功能
- 卡片容器组件
- 可配置阴影
- 悬停效果
- 可点击卡片
- 内边距选项
```

### Loading.vue
```typescript
// Props
interface Props {
  type?: 'spinner' | 'dots' | 'pulse'  // default: 'spinner'
  size?: 'sm' | 'md' | 'lg'             // default: 'md'
  text?: string
}

// 功能
- 加载动画组件
- 多种动画类型
- 多种大小
- 可选文本提示
- 居中显示
```

### EmptyState.vue
```typescript
// Props
interface Props {
  title: string
  description?: string
  icon?: string
  action?: {
    label: string
    onClick: () => void
  }
}

// 功能
- 空数据状态组件
- 显示图标/标题/描述
- 可选操作按钮
- 垂直居中
```

### layouts/default.vue
```typescript
// Slots
<slot />  ← 页面内容

// 功能
- 所有页面默认布局
- 顶部 Navbar
- 底部 Footer
- 主内容区 (min-height 填充)
- Nuxt <NuxtPage /> 集成
```

---

## 样式系统

### 颜色定义
```typescript
// colors.css
--color-primary: #3b82f6      // 蓝色
--color-secondary: #6b7280    // 灰色
--color-danger: #ef4444       // 红色
--color-success: #10b981      // 绿色
--color-warning: #f59e0b      // 橙色
--color-background: #ffffff   // 白色
--color-border: #e5e7eb       // 浅灰
```

### 尺寸定义
```typescript
// sizes.css
--size-sm: 0.5rem
--size-md: 1rem
--size-lg: 1.5rem
--size-xl: 2rem

--radius-sm: 0.25rem
--radius-md: 0.5rem
--radius-lg: 1rem

--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
```

---

## 与其他模块的关系

```
公共模块
├─ 首页模块（使用 Navbar, Button, Card）
├─ 聊天模块（使用 Navbar, Loading, EmptyState）
└─ 日记模块（使用 Navbar, Card, Loading）
```

---

## 开发步骤

1. 定义全局样式变量 (CSS 自定义属性)
2. 创建 components/common/Button.vue
3. 创建 components/common/Card.vue
4. 创建 components/common/Loading.vue
5. 创建 components/common/EmptyState.vue
6. 创建 components/common/Navbar.vue
7. 创建 components/common/Footer.vue
8. 创建 layouts/default.vue
9. 在 app.vue 中设置全局布局

---

## 注意事项

- ✅ 组件使用 @nuxt/ui 的样式基础
- ✅ TailwindCSS 进行响应式设计
- ✅ 颜色和大小统一定义
- ✅ 所有页面使用 layouts/default.vue
- ✅ 组件支持 Props 高度定制

