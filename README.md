# 💰 记账本

一个基于React + TypeScript的简单记账应用，帮助你追踪日常支出。

## ✨ 功能特性

- 📅 按日期组织支出记录
- 💳 支持多种支出分类
- 📝 可选的支出备注
- 💾 本地存储数据
- 📊 实时统计本月和总支出
- 📱 响应式设计，支持移动端

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📋 支出分类

应用提供以下支出分类：

- 🍽️ **餐饮** - 一日三餐
- 🍿 **零食** - 备用零食
- 🚗 **出行** - 日常交通
- ✈️ **旅游** - 旅游开支
- 💻 **软件订阅** - 软件会员开销
- 🏥 **医疗** - 医疗开销
- 🏠 **住房** - 住房开销
- 🎁 **人情往来** - 送礼人情
- 📦 **其他** - 其他支出

## 🛠️ 技术栈

- **前端框架**: React 18
- **开发语言**: TypeScript
- **构建工具**: Vite
- **样式**: SCSS + Flexbox/Grid
- **数据存储**: LocalStorage

## 📁 项目结构

```
src/
├── components/          # React组件
│   ├── index.ts         # 组件统一导出
│   ├── ExpenseForm/     # 添加支出表单组件
│   │   ├── ExpenseForm.tsx
│   │   └── ExpenseForm.scss
│   └── ExpenseList/     # 支出记录列表组件
│       ├── ExpenseList.tsx
│       └── ExpenseList.scss
├── pages/              # 页面组件
│   ├── index.ts        # 页面统一导出
│   └── Home/           # 主页
│       ├── Home.tsx
│       └── Home.scss
├── types/              # TypeScript类型定义
│   ├── index.ts        # 类型统一导出
│   └── types.ts        # 核心类型定义
├── utils/              # 工具函数
│   ├── index.ts        # 工具函数统一导出
│   ├── storage.ts      # 本地存储工具
│   └── helpers.ts      # 辅助函数
├── App.tsx            # 主应用组件
├── App.scss           # 应用样式
├── main.tsx           # 入口文件
└── index.scss         # 全局样式
```

## 🔧 导入路径优化

项目使用了index文件统一导出和`@`路径别名，使导入路径极其简洁：

```tsx
// ❌ 最初：冗长的相对路径
import ExpenseForm from '../../components/ExpenseForm/ExpenseForm';
import ExpenseList from '../../components/ExpenseList/ExpenseList';
import { loadExpenses, addExpense } from '../../utils/storage';
import { formatCurrency } from '../../utils/helpers';

// ✅ 优化后：使用index统一导出
import { ExpenseForm, ExpenseList } from '../../components';
import { loadExpenses, addExpense, formatCurrency } from '../../utils';

// 🚀 最终：使用@别名 + index导出
import { ExpenseForm, ExpenseList } from '@/components';
import { ExpenseRecord } from '@/types';
import { loadExpenses, addExpense, formatCurrency } from '@/utils';
```

### 路径别名配置

- `@` → `src/` 目录
- 支持所有子目录：`@/components`、`@/utils`、`@/types`、`@/pages`

## 🎯 使用说明

1. **添加支出**：填写金额、选择分类、输入备注（可选），点击"添加支出"
2. **查看记录**：支出记录按日期分组显示，最新的在上方
3. **删除记录**：点击记录右侧的"×"按钮删除该条记录
4. **数据统计**：页面顶部显示本月支出和总支出统计

## 📝 开发说明

- 项目从2025年10月开始记录支出
- 支出数据存储在浏览器LocalStorage中
- 支持日期格式：YYYY-MM-DD
- 金额精确到分（两位小数）

## 🔄 更新记录

### v0.1.1 (2025-10-12)
- 🔧 优化导入路径，添加index.ts统一导出
- 📁 重构types文件夹结构
- ✨ 提升开发体验和代码可读性

### v0.1.0 (2025-10-12)
- ✨ 初始版本发布
- 📝 支持添加支出记录
- 📋 支持9种支出分类
- 📅 按日期组织记录
- 💾 本地存储功能
- 📊 基础统计功能
- 🎨 使用SCSS模块化样式
- 📁 组件化文件夹结构组织

## 📄 许可证

MIT License