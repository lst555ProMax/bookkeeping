# 记账本项目 - GitHub Copilot 指导说明

这是一个基于React + TypeScript的记账应用项目。

## 项目特点

- **技术栈**: React 18 + TypeScript + Vite
- **数据存储**: LocalStorage本地存储
- **样式**: 原生CSS + 响应式设计
- **功能**: 支出记录管理，按日期组织，多分类支持

## 开发规范

- 使用TypeScript进行类型安全开发
- 采用函数式组件和React Hooks
- CSS模块化，每个组件有独立样式文件
- 遵循React最佳实践和代码规范

## 项目结构说明

- `src/components/` - React组件目录
- `src/utils/` - 工具函数目录
- `src/types.ts` - TypeScript类型定义
- 数据通过LocalStorage持久化存储

## 部署与运行

- 开发环境: `npm run dev`
- 生产构建: `npm run build`
- 本地预览: `npm run preview`