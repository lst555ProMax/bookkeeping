# 📐 项目主题色规范文档

> 本文档定义了记账应用（Bookkeeping）的主题色系统，确保整个项目的视觉风格统一。

## 🎨 主色调（Primary Color）

### 主渐变色
```scss
// 主要品牌渐变色（紫色系）
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// 单独使用时
--primary-color-start: #667eea;  // 紫罗兰蓝
--primary-color-end: #764ba2;    // 深紫色
--primary-color-rgb: 102, 126, 234;  // RGB值（用于透明度）
```

**使用场景：**
- 页面头部背景
- 主要操作按钮（提交、确认等）
- 标题渐变文字
- 输入框焦点边框
- 图表主色调

### 主色调应用示例
```scss
// 按钮
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  
  &:hover {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
}

// 输入框焦点
input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

// 标题文字渐变
.title-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## 🌈 辅助色（Secondary Colors）

### 收入/成功色（绿色系）
```scss
// 收入记录、成功状态
--success-color-start: #43bc8e;  // 翠绿色
--success-color-end: #2d8a64;    // 深绿色
--success-color-rgb: 67, 188, 142;

// 浅绿色（状态标签）
background: #d4edda;
color: #155724;
border-color: #c3e6cb;
```

### 警告色（黄色系）
```scss
// 警告、不规律状态
--warning-color-start: #ffc107;  // 金黄色
--warning-color-end: #ff9800;    // 橙黄色

// 浅黄色（状态标签）
background: #fff3cd;
color: #856404;
border-color: #ffeaa7;
```

### 危险/删除色（红色系）
```scss
// 删除、危险操作
--danger-color-start: #dc3545;  // 红色
--danger-color-end: #c82333;    // 深红色

// 浅红色（状态标签）
background: #f8d7da;
color: #721c24;
border-color: #f5c6cb;
```

### 信息色（浅蓝色系）
```scss
// 信息提示、次要操作
background: #d1ecf1;
color: #0c5460;
border-color: #bee5eb;
```

## 🖤 中性色（Neutral Colors）

### 文字颜色
```scss
--text-primary: #333;      // 主要文字
--text-secondary: #555;    // 次要文字
--text-tertiary: #666;     // 三级文字
--text-muted: #999;        // 弱化文字
--text-placeholder: #aaa;  // 占位符文字
```

### 背景颜色
```scss
--bg-primary: #ffffff;     // 主背景（白色）
--bg-secondary: #f5f7fa;   // 页面背景（浅灰）
--bg-tertiary: #f4f5f7;    // 输入框背景
--bg-muted: #f8f9fa;       // 区块背景
--bg-hover: #f0f0f0;       // 悬停背景
```

### 边框颜色
```scss
--border-light: #f0f0f0;   // 浅边框
--border-normal: #e0e0e0;  // 普通边框
--border-medium: #e1e5e9;  // 中等边框
--border-dark: #dee2e6;    // 深边框
```

### 取消/次要按钮
```scss
// 取消按钮
background: #6c757d;       // 灰色
&:hover {
  background: #545b62;
}

// 浅色取消按钮
background: #f5f5f5;
color: #666;
&:hover {
  background: #e0e0e0;
}
```

## 📊 图表颜色

### 支出/收入类别色
```scss
// 使用主渐变色作为支出类别主色
支出: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// 使用绿色系作为收入类别主色
收入: linear-gradient(135deg, #43bc8e 0%, #2d8a64 100%);
```

### 睡眠质量等级色
```scss
// 优秀（90-100）
excellent: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  // 主紫色

// 良好（75-89）
good: linear-gradient(135deg, #28a745 0%, #20c997 100%);       // 绿色

// 一般（60-74）
fair: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);       // 黄色

// 较差（<60）
poor: linear-gradient(135deg, #dc3545 0%, #c82333 100%);       // 红色
```

## 🎭 模块特定颜色

### 日常记录模块
```scss
// 日常记录卡片头部（建议统一为主色调）
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// ❌ 避免使用非主题色
// background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); // 粉红色（不推荐）
```

### 软件使用记录模块
```scss
// 统计值强调色（建议使用主色调）
color: #667eea;

// 类别标签
background: #e6f7ff;
color: #667eea;  // 统一使用主色调

// 排名强调
color: #667eea;  // 统一使用主色调
```

## ✅ 使用建议

### 1. 优先使用主题色
- 所有主要交互元素（按钮、链接、焦点状态）使用主紫色系
- 保持品牌一致性

### 2. 合理使用辅助色
- 绿色：表示正向、成功、收入
- 黄色：表示警告、注意、不规律
- 红色：表示危险、错误、删除
- 蓝色：表示信息、提示

### 3. 保持对比度
- 文字与背景的对比度至少为 4.5:1
- 重要操作按钮使用高对比度

### 4. 统一渐变方向
- 所有渐变统一使用 `135deg`（左上到右下）
- 保持视觉连贯性

### 5. 阴影与透明度
```scss
// 卡片阴影
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
&:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

// 按钮阴影
box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
&:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

// 焦点框阴影
box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
```

## 🚫 避免使用的颜色

以下颜色不属于主题色系，应避免使用：

```scss
❌ #1890ff  // 蚂蚁蓝（Ant Design 默认色）
❌ #40a9ff  // 浅蚂蚁蓝
❌ #f093fb  // 粉紫色
❌ #f5576c  // 粉红色
❌ #52c41a  // 浅绿色（使用 #43bc8e 代替）
```

## 📝 代码示例

### 创建符合主题的组件
```scss
.my-component {
  // 使用 CSS 变量（推荐）
  --primary-start: #667eea;
  --primary-end: #764ba2;
  --primary-rgb: 102, 126, 234;
  
  &__header {
    background: linear-gradient(135deg, var(--primary-start) 0%, var(--primary-end) 100%);
    color: white;
  }
  
  &__button {
    background: linear-gradient(135deg, var(--primary-start) 0%, var(--primary-end) 100%);
    box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3);
    
    &:hover {
      box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.4);
    }
  }
  
  input:focus {
    border-color: var(--primary-start);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
  }
}
```

## 🔄 更新日志

- **2025-10-28**: 初始版本，定义项目主题色规范
- 后续更新请在此处记录

---

**注意事项：**
- 新增功能模块时，请严格遵循本文档的颜色规范
- 如需添加新的颜色，请先在团队中讨论并更新本文档
- 保持整个项目的视觉一致性是提升用户体验的关键
