# AI友好的项目结构设计文档

## 概述

本文档定义了最适合AI大模型操作的React项目结构，旨在提高代码的可读性、可维护性和AI操作的准确性。

## 核心设计原则

### 1. 清晰的分层架构
- **页面层(Pages)**: 业务页面组件，负责整体布局和业务逻辑编排
- **组件层(Components)**: 可复用的UI组件，分为通用组件和业务组件
- **逻辑层(Hooks)**: 自定义Hook，封装业务逻辑和状态管理
- **工具层(Utils)**: 纯函数工具，提供通用功能
- **服务层(Services)**: API调用和数据处理

### 2. 统一的命名规范
- **文件命名**: 使用PascalCase命名组件文件，camelCase命名工具文件
- **目录结构**: 按功能模块组织，避免过深的嵌套
- **导出方式**: 统一使用index.js进行模块导出

### 3. 标准化的组件结构
```javascript
// 标准组件结构
import React from 'react';
import { 依赖组件 } from 'antd';
import { 自定义Hook } from '@/hooks';
import { 工具函数 } from '@/utils';
import './index.css';

const ComponentName = (props) => {
  // 1. Props解构
  const { prop1, prop2, ...restProps } = props;
  
  // 2. 状态管理
  const [state, setState] = useState();
  
  // 3. 自定义Hook
  const { data, loading } = useCustomHook();
  
  // 4. 事件处理函数
  const handleEvent = () => {};
  
  // 5. 渲染逻辑
  return (
    <div className="component-name">
      {/* JSX内容 */}
    </div>
  );
};

export default ComponentName;
```

## 目录结构设计

```
src/
├── components/           # 组件目录
│   ├── common/          # 通用组件
│   │   ├── DataTable/   # 数据表格组件
│   │   ├── FilterForm/  # 筛选表单组件
│   │   ├── ActionBar/   # 操作栏组件
│   │   └── index.js     # 统一导出
│   ├── business/        # 业务组件
│   │   ├── OrderTable/  # 订单表格
│   │   ├── MaterialForm/# 物料表单
│   │   └── index.js     # 统一导出
│   └── index.js         # 组件总导出
├── pages/               # 页面目录
│   ├── OrderManagement/ # 订单管理页面
│   │   ├── index.jsx    # 主页面组件
│   │   ├── components/  # 页面专用组件
│   │   ├── hooks/       # 页面专用Hook
│   │   └── index.css    # 页面样式
│   └── ...
├── hooks/               # 自定义Hook
│   ├── useTableData.js  # 表格数据管理
│   ├── useFilter.js     # 筛选功能
│   ├── useExport.js     # 导出功能
│   └── index.js         # Hook统一导出
├── services/            # 服务层
│   ├── api/            # API接口
│   ├── mock/           # 模拟数据
│   └── index.js        # 服务统一导出
├── utils/              # 工具函数
│   ├── tableUtils.js   # 表格相关工具
│   ├── dateUtils.js    # 日期处理工具
│   ├── exportUtils.js  # 导出工具
│   ├── constants.js    # 常量定义
│   └── index.js        # 工具统一导出
├── styles/             # 全局样式
│   ├── variables.css   # CSS变量
│   ├── mixins.css      # CSS混入
│   └── global.css      # 全局样式
└── types/              # TypeScript类型定义
    ├── api.ts          # API类型
    ├── common.ts       # 通用类型
    └── index.ts        # 类型统一导出
```

## 组件设计规范

### 1. 通用组件特征
- **高度可配置**: 通过props控制组件行为
- **职责单一**: 每个组件只负责一个特定功能
- **接口清晰**: 明确的props定义和默认值
- **样式隔离**: 使用CSS Modules或styled-components

### 2. 业务组件特征
- **领域相关**: 与特定业务场景紧密相关
- **逻辑封装**: 封装复杂的业务逻辑
- **数据驱动**: 通过数据配置控制显示

### 3. 页面组件特征
- **布局管理**: 负责页面整体布局
- **状态协调**: 协调子组件间的状态
- **路由处理**: 处理页面级的路由逻辑

## Hook设计规范

### 1. 数据管理Hook
```javascript
// useTableData - 表格数据管理
const useTableData = (options) => {
  return {
    dataSource,      // 数据源
    loading,         // 加载状态
    pagination,      // 分页配置
    filters,         // 筛选条件
    selectedRows,    // 选中行
    // 操作方法
    updateData,
    applyFilter,
    resetFilter,
    exportData
  };
};
```

### 2. 业务逻辑Hook
```javascript
// useOrderManagement - 订单管理逻辑
const useOrderManagement = () => {
  return {
    orders,          // 订单列表
    orderDetail,     // 订单详情
    // 操作方法
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderDetail
  };
};
```

## 工具函数规范

### 1. 纯函数设计
- 无副作用
- 相同输入产生相同输出
- 易于测试和复用

### 2. 功能分类
- **数据处理**: 数组、对象操作
- **格式化**: 日期、数字、文本格式化
- **验证**: 表单验证、数据校验
- **转换**: 数据类型转换、格式转换

## 样式组织规范

### 1. CSS变量系统
```css
:root {
  /* 颜色系统 */
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #f5222d;
  
  /* 间距系统 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* 字体系统 */
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
}
```

### 2. 组件样式规范
- 使用BEM命名规范
- 避免全局样式污染
- 响应式设计考虑

## 数据流设计

### 1. 单向数据流
- Props向下传递
- 事件向上冒泡
- 状态就近管理

### 2. 状态管理层级
- **组件级**: useState, useReducer
- **页面级**: 自定义Hook
- **应用级**: Context API或状态管理库

## AI操作友好特性

### 1. 清晰的文件组织
- 按功能模块分组
- 统一的命名规范
- 明确的依赖关系

### 2. 标准化的代码结构
- 一致的组件模板
- 规范的Hook模式
- 统一的工具函数接口

### 3. 完善的类型定义
- PropTypes或TypeScript类型
- 清晰的接口文档
- 示例代码和注释

### 4. 模块化设计
- 高内聚低耦合
- 可独立测试
- 易于重构和扩展

## 最佳实践

1. **保持简单**: 避免过度设计和复杂抽象
2. **一致性**: 遵循统一的编码规范和模式
3. **可读性**: 清晰的命名和适当的注释
4. **可测试性**: 易于编写和维护测试用例
5. **可扩展性**: 支持功能的增加和修改

## 总结

这个结构设计旨在创建一个对AI友好的代码库，通过清晰的分层、标准化的模式和一致的规范，使AI能够更准确地理解和操作代码，提高开发效率和代码质量。