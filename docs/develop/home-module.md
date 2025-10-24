# 首页模块开发文档

**模块名**：Home (首页)  
**文件数**：4 个  
**职责**：角色选择和首屏展示

---

## 文件清单

```
pages/
└── index.vue                        ← 首页页面 (/)

components/home/
├── CharacterCard.vue                ← 单个角色卡片
├── CharacterGrid.vue                ← 角色网格
└── CharacterSection.vue             ← 角色选择区域

constants/
└── characters.ts                    ← 角色常量（共享）
```

---

## 核心流程

```
用户访问首页
  ↓
pages/index.vue 渲染
  ↓
CharacterSection 加载
  ├─ CharacterGrid
  │  ├─ CharacterCard ×3
  │  └── 展示三个角色
  └─ 用户点击选择
      ↓
    保存到 chatStore
    跳转 /chat/:characterId
```

---

## 组件详解

### CharacterCard.vue
```typescript
// Props
interface Props {
  character: Character
  isHovered?: boolean
}

// 功能
- 显示角色头像、名称、描述
- 鼠标悬停放大效果
- 点击选择角色
```

### CharacterGrid.vue
```typescript
// 功能
- 布局 3 个卡片
- 管理悬停状态
- 处理选择事件
```

### CharacterSection.vue
```typescript
// 功能
- 标题和描述
- 嵌套 CharacterGrid
- 向上转发选择事件
```

### pages/index.vue
```typescript
// 功能
- 首页主页面
- 导入并展示 CharacterSection
- 实现跳转逻辑
- 调用 useChatStore 保存选择
```

---

## 数据源

### constants/characters.ts
```typescript
import type { Character } from '@/types'

export const CHARACTERS: Record<string, Character> = {
  'rational-analyst': {
    id: 'rational-analyst',
    name: 'Rational Analyst',
    avatar: '/images/rational-analyst.png',
    description: 'Helps you think through challenges...'
  },
  'compassionate-mentor': {
    id: 'compassionate-mentor',
    name: 'Compassionate Mentor',
    avatar: '/images/compassionate-mentor.png',
    description: 'Provides warm guidance...'
  },
  'encouraging-companion': {
    id: 'encouraging-companion',
    name: 'Encouraging Companion',
    avatar: '/images/encouraging-companion.png',
    description: 'Brings positive energy...'
  }
}

export function getCharacterById(id: string): Character | undefined {
  return CHARACTERS[id]
}

export function getAllCharacters(): Character[] {
  return Object.values(CHARACTERS)
}
```

---

## 交互设计

### 视觉效果
- 卡片悬停：放大 + 阴影增强
- 点击反馈：颜色变化 + 过渡动画
- 响应式：移动端 1 列，桌面端 3 列

### 用户流
1. 用户进入首页
2. 看到 3 个角色卡片
3. 鼠标悬停显示完整信息
4. 点击选择某个角色
5. 跳转到聊天页面

---

## 与其他模块的关系

```
首页 ← 常量模块（角色数据）
  ├→ 聊天模块（跳转 /chat/:id）
  └→ 公共模块（导航栏）
```

---

## 开发步骤

1. 定义 Character 类型（在 types/character.ts）
2. 创建 constants/characters.ts
3. 创建 CharacterCard 组件
4. 创建 CharacterGrid 组件
5. 创建 CharacterSection 组件
6. 创建 pages/index.vue
7. 集成导航和跳转逻辑

---

## 注意事项

- ✅ 角色数据直接从前端常量加载，无需 API 调用
- ✅ 使用 @nuxt/ui 组件进行样式
- ✅ 完整的 TypeScript 类型
- ✅ 响应式设计

