# 📊 个人管理应用

一个基于 React + TypeScript 的全方位个人数据管理应用，帮助你记录和分析生活的各个方面。

## ✨ 功能特性

### 💰 记账管理
- **支出和收入记录**：支持详细的收支记录，包括日期、金额、分类和备注
- **分类管理**：自定义支出和收入分类，灵活管理各类账目
- **智能筛选**：按日期范围、金额区间、分类等多维度筛选记录
- **数据看板**：可视化展示收支趋势、分类占比、月度对比等分析图表
- **数据导入/导出**：支持 JSON 格式的数据备份和恢复

### 😴 睡眠记录
- **睡眠时间记录**：记录入睡时间、醒来时间和睡眠时长
- **睡眠质量评估**：1-5 分的睡眠质量评分系统
- **趋势分析**：睡眠时长趋势图、质量趋势图、入睡时间趋势图
- **月度统计**：平均睡眠时长、平均质量、睡眠区间统计

### 📚 学习记录
- **学习分类管理**：自定义学习分类，如编程、语言、技能等
- **视频学习记录**：记录视频标题、观看集数、总时长等信息
- **学习时长统计**：按分类统计学习时长，追踪学习进度
- **分类分析图表**：饼图展示各分类学习占比，趋势图展示学习变化

### 📅 日常记录
- **微信步数记录**：记录每日步数，追踪运动量
- **三餐打卡**：记录早餐、午餐、晚餐的用餐情况
- **内务完成情况**：记录日常内务任务的完成状态
- **习惯统计图表**：用餐规律性、习惯统计、步数趋势等多维度分析

### 📝 其他模块
- **日记速记**：日记、音乐、阅读三个模块的快速记录功能
- **今日任务抽卡**：随机抽取今日任务，增加趣味性
- **运势查询**：每日运势查询，包含事业、健康、感情等多个维度

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 构建生产版本
```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产版本
```bash
npm run preview
```

## ⌨️ 快捷键说明

### 表单操作
- **Ctrl + Enter**：在所有添加/编辑表单中快速保存记录
  - 适用于：记账、睡眠、学习、日常记录表单
  - 无需点击保存按钮，提高录入效率

### 速记操作
- **Ctrl + Enter**：在速记输入框中快速添加或保存编辑
- **ESC**：取消当前编辑，返回查看模式

## 📁 项目结构

```
src/
├── components/          # 组件目录
│   ├── accounting/     # 记账相关组件
│   │   ├── AccountingRecordForm/    # 记账表单
│   │   ├── AccountingRecordList/     # 记账列表
│   │   ├── AccountingCategoryManager/ # 分类管理
│   │   ├── AccountingCategoryFilter/ # 分类筛选
│   │   └── accountingChart/          # 图表组件
│   ├── sleep/          # 睡眠记录组件
│   ├── study/          # 学习记录组件
│   ├── daily/          # 日常记录组件
│   ├── diary/          # 日记模块组件
│   ├── music/          # 音乐模块组件
│   ├── reading/        # 阅读模块组件
│   ├── medical/        # 病记模块组件
│   └── common/         # 通用组件
│       ├── formComponents/    # 表单组件（FormSelect, FormInput等）
│       ├── listComponents/   # 列表组件（ActionButtons, Filter等）
│       ├── todayComponents/  # 今日组件（CardDraw, Fortune等）
│       ├── DatePicker/       # 日期选择器
│       ├── MonthSelector/    # 月份选择器
│       └── FloatingQuickNote/ # 悬浮速记球
├── pages/              # 页面组件
│   ├── Home/           # 主页面
│   └── Dashboard/      # 数据看板页面
├── hooks/              # 自定义 Hooks
│   ├── useMonthGroup/          # 月份分组 Hook
│   ├── useFormPersistence/    # 表单持久化 Hook
│   ├── useFirstLoad/           # 首次加载检测 Hook
│   ├── useKeyboardShortcut/   # 键盘快捷键 Hook
│   └── useDefaultDate/        # 默认日期 Hook
├── utils/              # 工具函数
│   ├── accounting/      # 记账相关工具
│   ├── sleep/          # 睡眠相关工具
│   ├── study/          # 学习相关工具
│   ├── daily/          # 日常记录工具
│   ├── diary/          # 日记工具
│   ├── music/          # 音乐工具
│   ├── reading/        # 阅读工具
│   └── common/         # 通用工具
│       ├── todayUtils/  # 今日工具（ageCalculator, cardDraw, fortune）
│       ├── helpers.ts   # 辅助函数
│       ├── types.ts     # 通用类型
│       └── sampleData.ts # 示例数据
└── router/             # 路由配置
```

### 📦 导出机制

项目采用统一的 `index.ts` 导出机制：
- **所有组件文件夹**都有 `index.ts` 文件，统一管理导出
- **导入路径统一**：通过 `@/components`、`@/utils`、`@/hooks` 等别名导入
- **类型安全**：所有导出都包含完整的 TypeScript 类型定义

## 🛠️ 技术栈

- **前端框架**: React 18
- **开发语言**: TypeScript
- **构建工具**: Vite
- **样式**: SCSS + Flexbox/Grid
- **数据存储**: LocalStorage
- **图表库**: Recharts
- **富文本编辑**: TipTap
- **通知提示**: React Hot Toast

## 🎨 设计规范

本项目使用统一的主题色系统，请参考 [THEME.md](./THEME.md) 文档了解主题色规范和使用建议。

### 主题色说明
- **支出记录**：橙色系（#e67e22 - #d35400）
- **收入记录**：绿色系（#28a745 - #20c997）
- **其他模块**：天蓝色系（#1ea5f9 - #0d8bd9）

## 📝 使用说明

### 数据管理
- **数据存储**：所有数据存储在浏览器 LocalStorage 中，无需服务器
- **数据备份**：定期使用导出功能备份数据，避免数据丢失
- **数据恢复**：通过导入功能恢复之前备份的数据

### 数据格式
- **日期格式**：YYYY-MM-DD（如：2025-11-21）
- **金额格式**：精确到分，两位小数（如：99.99）
- **时间格式**：HH:mm（24 小时制，如：23:30）
- **导入格式**：JSON 格式，需符合各模块的数据结构

### 筛选功能
- **日期筛选**：支持按月份筛选记录
- **金额筛选**：支持设置金额区间（最小值和最大值）
- **分类筛选**：支持多选分类进行筛选
- **关键词搜索**：支持在备注中搜索关键词

## 🔧 开发说明

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 开发规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 组件样式使用 SCSS 模块化
- 使用函数式组件和 Hooks
- 统一的导出机制：所有文件夹都有 `index.ts` 文件
- 通过 `@/components`、`@/utils`、`@/hooks` 等别名导入

### 数据存储
- 所有数据存储在浏览器 LocalStorage 中
- 存储键名格式：`bookkeeping_${module}_${type}`
- 支持数据导入/导出（JSON 格式）

### 路由管理
- 使用 Hash 路由（`#/path`）
- URL 参数支持 `mode` 和 `type` 参数
- 页面刷新后保持当前模式状态

### 代码组织
- **模块化设计**：按功能模块组织代码（accounting、sleep、study等）
- **组件分类**：通用组件按用途分类（formComponents、listComponents等）
- **统一导出**：所有模块通过 `index.ts` 统一导出，便于维护
- **类型定义**：每个模块都有独立的 `types.ts` 文件
- **工具函数分离**：业务逻辑和工具函数分离，便于复用

## 📄 许可证

MIT License