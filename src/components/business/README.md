# 业务组件库

这是一个基于 Ant Design 的业务组件库，提供了一套完整的企业级应用组件，专门为采购管理系统设计。

## 组件概览

### 核心业务组件

- **BusinessTable** - 业务表格组件
- **BusinessForm** - 业务表单组件
- **BusinessFilter** - 业务筛选组件
- **BusinessModal** - 业务模态框组件
- **BusinessCard** - 业务卡片组件

### 通用组件

- **StatusTag** - 状态标签组件
- **ActionButton** - 操作按钮组件
- **DataDisplay** - 数据展示组件

## 快速开始

### 安装依赖

```bash
npm install antd dayjs
```

### 基本使用

```jsx
import React from 'react';
import {
  BusinessTable,
  BusinessForm,
  BusinessFilter,
  BusinessModal,
  BusinessCard,
} from '../components/business';

// 使用业务表格
const MyTable = () => {
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <StatusTag
          status={status}
          businessType="procurement"
          showIcon
        />
      ),
    },
  ];

  return (
    <BusinessTable
      columns={columns}
      dataSource={data}
      rowKey="id"
    />
  );
};
```

## 组件详细说明

### BusinessTable 业务表格

基于 Ant Design Table 组件封装的业务表格，提供了丰富的功能和预设配置。

#### 主要特性

- 支持多种列类型（文本、数字、日期、状态等）
- 内置操作列配置
- 支持行选择和批量操作
- 提供分页、排序、筛选功能
- 支持数据导出

#### 基本用法

```jsx
<BusinessTable
  columns={columns}
  dataSource={data}
  rowKey="id"
  pagination={{
    pageSize: 10,
    showSizeChanger: true,
  }}
  actions={[
    {
      key: 'add',
      label: '新增',
      type: 'primary',
      onClick: handleAdd,
    },
  ]}
/>
```

#### 预设列类型

```jsx
// 使用预设列配置
const columns = businessConfigs.table.sets.standard;

// 或者使用工具函数创建列
const columns = businessUtils.createTableColumns([
  { name: 'id', type: 'id' },
  { name: 'name', type: 'text' },
  { name: 'status', type: 'status' },
  { name: 'amount', type: 'currency' },
]);
```

### BusinessForm 业务表单

基于 Ant Design Form 组件封装的业务表单，支持多种表单控件和验证规则。

#### 主要特性

- 支持多种表单控件类型
- 内置验证规则
- 支持动态表单
- 提供表单布局配置
- 支持表单联动

#### 基本用法

```jsx
<BusinessForm
  fields={[
    {
      name: 'name',
      label: '名称',
      type: 'input',
      required: true,
    },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      options: statusOptions,
    },
  ]}
  onSubmit={handleSubmit}
  actions={[
    { key: 'submit', label: '提交', type: 'primary' },
    { key: 'cancel', label: '取消' },
  ]}
/>
```

### BusinessFilter 业务筛选

提供强大的筛选功能，支持多种筛选条件和快捷筛选。

#### 主要特性

- 支持多种筛选类型
- 提供快捷筛选功能
- 支持筛选条件保存
- 可折叠的高级筛选
- 支持筛选历史

#### 基本用法

```jsx
<BusinessFilter
  title="采购申请筛选"
  filters={[
    {
      name: 'name',
      label: '申请名称',
      type: 'input',
    },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      options: statusOptions,
    },
  ]}
  quickFilters={[
    { label: '今日创建', value: { dateRange: 'today' } },
    { label: '待审批', value: { status: 'submitted' } },
  ]}
  onFilter={handleFilter}
/>
```

### BusinessModal 业务模态框

集成了表单功能的模态框组件，支持多种模式。

#### 主要特性

- 支持查看、编辑、创建模式
- 集成表单验证
- 支持数据加载
- 提供自定义页脚
- 支持全屏模式

#### 基本用法

```jsx
<BusinessModal
  title="编辑采购申请"
  visible={visible}
  mode="edit"
  initialValues={record}
  formConfig={{
    fields: [
      {
        name: 'name',
        label: '名称',
        type: 'input',
        required: true,
      },
    ],
  }}
  onSubmit={handleSubmit}
  onCancel={() => setVisible(false)}
/>
```

### BusinessCard 业务卡片

用于展示业务信息的卡片组件。

#### 主要特性

- 支持多种布局模式
- 提供丰富的展示字段
- 支持操作按钮
- 支持状态标识
- 支持自定义样式

#### 基本用法

```jsx
<BusinessCard
  title="采购申请001"
  description="办公用品采购申请"
  data={record}
  fields={[
    { name: 'supplier', label: '供应商' },
    { name: 'amount', label: '金额', type: 'currency' },
    { name: 'status', label: '状态', type: 'status' },
  ]}
  actions={[
    { action: 'view', onClick: handleView },
    { action: 'edit', onClick: handleEdit },
  ]}
/>
```

## 通用组件

### StatusTag 状态标签

用于显示各种状态信息的标签组件。

```jsx
<StatusTag
  status="approved"
  businessType="procurement"
  showIcon
  showTooltip
/>
```

### ActionButton 操作按钮

统一的操作按钮组件，支持多种预设操作。

```jsx
<ActionButton
  action="edit"
  onClick={handleEdit}
/>

<ActionButtonGroup
  actions={[
    { action: 'view', onClick: handleView },
    { action: 'edit', onClick: handleEdit },
    { action: 'delete', onClick: handleDelete },
  ]}
  maxVisible={2}
/>
```

### DataDisplay 数据展示

用于格式化显示各种类型数据的组件。

```jsx
<DataDisplay value={50000} type="currency" />
<DataDisplay value={0.85} type="percent" />
<DataDisplay value="2024-01-15" type="date" />
<DataDisplay value="13800138000" type="phone" showIcon />
```

## 配置和工具

### 业务配置

组件库提供了丰富的预设配置：

```jsx
import { businessConfigs } from '../components/business';

// 表格配置
const tableConfig = businessConfigs.table.sets.standard;

// 表单配置
const formConfig = businessConfigs.form.sets.edit;

// 筛选配置
const filterConfig = businessConfigs.filter.sets.basic;
```

### 工具函数

```jsx
import { businessUtils } from '../components/business';

// 创建表格列
const columns = businessUtils.createTableColumns(fields);

// 创建表单字段
const formFields = businessUtils.createFormFields(fields);

// 创建筛选条件
const filters = businessUtils.createFilters(fields);
```

### 状态管理

```jsx
import { statusUtils } from '../utils';

// 获取状态文本
const statusText = statusUtils.getStatusText('approved', 'procurement');

// 获取状态颜色
const statusColor = statusUtils.getStatusColor('approved', 'procurement');

// 获取状态选项
const statusOptions = statusUtils.getStatusOptions('procurement');
```

### 数据格式化

```jsx
import { formatUtils } from '../utils';

// 格式化货币
const currency = formatUtils.formatCurrency(50000, 'CNY');

// 格式化日期
const date = formatUtils.formatDate('2024-01-15', 'YYYY年MM月DD日');

// 格式化百分比
const percent = formatUtils.formatPercent(0.85);
```

## 主题定制

组件库支持主题定制，可以通过 CSS 变量或 Ant Design 主题配置来自定义样式。

```css
/* 自定义主题变量 */
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #f5222d;
}
```

## 最佳实践

### 1. 组件组合使用

```jsx
const ProcurementPage = () => {
  return (
    <div>
      {/* 筛选区域 */}
      <BusinessFilter {...filterConfig} onFilter={handleFilter} />
      
      {/* 表格区域 */}
      <BusinessTable {...tableConfig} dataSource={data} />
      
      {/* 模态框 */}
      <BusinessModal {...modalConfig} visible={visible} />
    </div>
  );
};
```

### 2. 配置复用

```jsx
// 定义通用配置
const procurementConfig = {
  fields: [
    { name: 'name', label: '申请名称', type: 'input' },
    { name: 'status', label: '状态', type: 'status' },
    { name: 'amount', label: '金额', type: 'currency' },
  ],
};

// 在多个组件中复用
const tableColumns = businessUtils.createTableColumns(procurementConfig.fields);
const formFields = businessUtils.createFormFields(procurementConfig.fields);
const filters = businessUtils.createFilters(procurementConfig.fields);
```

### 3. 状态管理

```jsx
// 统一的状态管理
const useBusinessState = (businessType) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getData(businessType, filters);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [businessType, filters]);
  
  return { data, loading, filters, setFilters, loadData };
};
```

## 扩展开发

### 添加新的业务类型

```jsx
// 1. 添加状态配置
statusUtils.addStatusConfigs('newBusiness', {
  pending: { text: '待处理', color: 'orange' },
  completed: { text: '已完成', color: 'green' },
});

// 2. 添加字段配置
const newBusinessFields = {
  // 字段定义
};

// 3. 添加预设配置
businessConfigs.newBusiness = {
  table: newBusinessTableConfig,
  form: newBusinessFormConfig,
  filter: newBusinessFilterConfig,
};
```

### 自定义组件

```jsx
// 继承业务组件
const CustomBusinessTable = (props) => {
  return (
    <BusinessTable
      {...props}
      // 自定义配置
      customConfig={customConfig}
    />
  );
};
```

## 性能优化

1. **按需加载**: 只导入需要的组件
2. **数据缓存**: 使用 React.memo 和 useMemo 优化渲染
3. **虚拟滚动**: 大数据量表格使用虚拟滚动
4. **懒加载**: 模态框内容懒加载

## 兼容性

- React >= 16.8
- Ant Design >= 4.0
- 现代浏览器 (Chrome, Firefox, Safari, Edge)

## 更新日志

### v1.0.0
- 初始版本发布
- 提供核心业务组件
- 支持采购管理业务场景

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进组件库。

## 许可证

MIT License