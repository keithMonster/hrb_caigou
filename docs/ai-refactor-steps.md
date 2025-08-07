# AI友好项目重构步骤文档

## 项目现状分析

### 当前结构优势
1. **基础架构合理**: 已有清晰的分层结构(pages、components、hooks、utils)
2. **组件化基础良好**: 已抽象出DataTable、FilterForm等通用组件
3. **Hook使用规范**: useTableData、useFilter等自定义Hook设计合理
4. **工具函数完善**: 日期、导出、表格工具函数功能齐全
5. **部分重构成果**: RuKu_Refactored.jsx展示了良好的重构模式

### 主要问题
1. **页面组件过于庞大**: 如CaiGouHeTong.jsx有792行代码
2. **业务逻辑耦合严重**: 页面组件包含大量数据处理和业务逻辑
3. **代码重复度高**: 多个页面存在相似的表格、表单、筛选逻辑
4. **缺少业务组件**: 没有针对特定业务场景的可复用组件
5. **服务层缺失**: 缺少统一的API和数据管理层
6. **样式不统一**: 缺少标准化的样式系统

## 重构目标

### 核心目标
1. **提升AI操作友好性**: 使代码结构更清晰、更易理解
2. **减少代码复杂度**: 单个文件控制在200行以内
3. **提高代码复用性**: 抽象业务组件，减少重复代码
4. **统一开发模式**: 建立标准的页面、组件、Hook模式
5. **完善工程化**: 建立完整的样式系统和服务层

### 成功标准
- 所有页面组件代码行数 < 200行
- 业务逻辑通过Hook封装
- 建立完整的业务组件库
- 实现统一的样式和数据管理
- 页面功能完全正常，无布局问题

## 重构步骤

### 第一步：建立标准化基础设施

#### 1.1 完善样式系统
- [ ] 扩展CSS变量系统，增加更多设计token
- [ ] 建立组件样式规范和BEM命名规范
- [ ] 创建响应式设计混入
- [ ] 统一间距、颜色、字体系统

#### 1.2 建立服务层架构
- [ ] 创建API服务基础结构 (`src/services/api/`)
- [ ] 建立模拟数据管理系统 (`src/services/mock/`)
- [ ] 创建数据转换和格式化层 (`src/services/transform/`)
- [ ] 建立统一的错误处理机制

#### 1.3 扩展工具函数库
- [ ] 创建业务常量定义 (`src/utils/constants.js`)
- [ ] 增强表单验证工具 (`src/utils/validationUtils.js`)
- [ ] 创建业务工具函数 (`src/utils/businessUtils.js`)
- [ ] 优化现有工具函数，添加完整的JSDoc注释

### 第二步：抽象业务组件库

#### 2.1 创建采购业务组件
- [ ] **PurchaseContractTable**: 采购合同表格组件
- [ ] **PurchaseContractForm**: 采购合同表单组件
- [ ] **SupplierSelector**: 供应商选择器组件
- [ ] **ContractStatusTag**: 合同状态标签组件

#### 2.2 创建物料管理组件
- [ ] **MaterialTable**: 物料信息表格组件
- [ ] **MaterialForm**: 物料信息表单组件
- [ ] **MaterialTypeSelector**: 物料类型选择器
- [ ] **MaterialSpecInput**: 物料规格输入组件

#### 2.3 创建库存管理组件
- [ ] **WarehouseTable**: 入库管理表格组件
- [ ] **WarehouseForm**: 入库信息表单组件
- [ ] **QuantityInput**: 数量输入组件(支持验证)
- [ ] **WarehouseSelector**: 仓库选择器组件

#### 2.4 创建订单管理组件
- [ ] **OrderMatchTable**: 订单匹配表格组件
- [ ] **OrderStatusPanel**: 订单状态面板组件
- [ ] **DeliveryPlanTable**: 交货计划表格组件
- [ ] **QualityInspectionForm**: 质量验收表单组件

### 第三步：建立业务Hook库

#### 3.1 采购管理Hook
- [ ] **usePurchaseContract**: 采购合同管理Hook
- [ ] **useSupplierManagement**: 供应商管理Hook
- [ ] **usePurchasePlan**: 采购计划管理Hook

#### 3.2 物料管理Hook
- [ ] **useMaterialManagement**: 物料信息管理Hook
- [ ] **useMaterialRequirement**: 物料需求管理Hook
- [ ] **useMaterialPreparation**: 物料准备管理Hook

#### 3.3 库存管理Hook
- [ ] **useWarehouseManagement**: 入库管理Hook
- [ ] **useInventoryTracking**: 库存跟踪Hook
- [ ] **useDeliveryManagement**: 到货管理Hook

#### 3.4 订单管理Hook
- [ ] **useOrderMatching**: 订单匹配Hook
- [ ] **useProductionPlan**: 生产计划Hook
- [ ] **useQualityInspection**: 质量验收Hook

### 第四步：重构页面组件

#### 4.1 按优先级重构页面
**高优先级页面(复杂度高，使用频率高)**:
- [ ] **DingDanRuKuPiPei** (订单入库匹配) - 676行 → 拆分为多个子组件
- [ ] **CaiGouHeTong** (采购合同) - 792行 → 使用PurchaseContract组件
- [ ] **RuKu** (入库管理) → 参考RuKu_Refactored模式

**中优先级页面**:
- [ ] **WuLiaoDaoHuoXuQiu** (物料到货需求)
- [ ] **WuLiaoZhunBeiJiHua** (物料准备计划)
- [ ] **JinQiDaoHuoJiHua** (近期到货计划)

**低优先级页面**:
- [ ] **CaiGouJiHua** (采购计划)
- [ ] **ShengChanJiHua** (生产计划)
- [ ] **ZhiLiangYanShou** (质量验收)
- [ ] **DaoHuo** (到货管理)
- [ ] **WuLiaoZhunBeiXuQiu** (物料准备需求)
- [ ] **YuanLiaoCaiGouHeTong** (原料采购合同)

#### 4.2 页面重构标准模式
每个页面重构后应遵循以下结构:
```javascript
// 标准页面结构
import React from 'react';
import { PageLayout } from '@/components/common';
import { BusinessComponent } from '@/components/business';
import { useBusinessLogic } from '@/hooks';

const PageName = () => {
  // 1. 业务Hook
  const { data, loading, actions } = useBusinessLogic();
  
  // 2. 页面配置
  const pageConfig = {
    title: '页面标题',
    actions: [...],
  };
  
  // 3. 渲染
  return (
    <PageLayout {...pageConfig}>
      <BusinessComponent 
        data={data}
        loading={loading}
        {...actions}
      />
    </PageLayout>
  );
};

export default PageName;
```

### 第五步：优化和测试

#### 5.1 性能优化
- [ ] 使用React.memo优化组件渲染
- [ ] 实现虚拟滚动(大数据表格)
- [ ] 优化Bundle大小
- [ ] 添加Loading状态管理

#### 5.2 功能测试
- [ ] 测试所有页面功能完整性
- [ ] 验证数据流正确性
- [ ] 检查用户交互体验
- [ ] 确保响应式布局正常

#### 5.3 代码质量检查
- [ ] 统一代码风格和命名规范
- [ ] 确保组件接口清晰
- [ ] 验证AI操作友好性
- [ ] 清理未使用的代码和文件

## 重构原则

### 1. 渐进式重构
- 每次重构一个页面或组件
- 保持功能连续性
- 及时测试验证

### 2. 标准化优先
- 建立统一的组件模式
- 遵循一致的命名规范
- 使用标准的代码结构

### 3. AI友好设计
- 清晰的文件组织
- 标准化的代码模式
- 完善的类型定义和注释
- 模块化的设计

### 4. 质量保证
- 重构过程中不引入新bug
- 保持代码质量标准
- 及时进行功能验证

## 实施计划

### 时间安排
- **第一步**: 1-2天 (基础设施)
- **第二步**: 2-3天 (业务组件)
- **第三步**: 2-3天 (业务Hook)
- **第四步**: 3-4天 (页面重构)
- **第五步**: 1-2天 (优化测试)

### 里程碑检查
每完成一个步骤后，进行以下检查:
1. 功能完整性验证
2. 代码质量审查
3. AI操作友好性测试
4. 性能影响评估

## 预期成果

### 代码质量提升
- 单文件代码行数减少60%以上
- 代码重复率降低到10%以下
- 组件复用率提升到70%以上

### 开发效率提升
- AI理解和操作代码更准确
- 新功能开发速度提升50%
- 代码维护成本降低40%

### 用户体验保持
- 所有功能完全正常
- 页面性能无降级
- 用户界面保持一致

## 风险控制

### 技术风险
- **风险**: 重构引入新bug
- **控制**: 每步完成后充分测试

### 进度风险
- **风险**: 重构时间超预期
- **控制**: 分步骤实施，可随时停止

### 兼容性风险
- **风险**: 新旧代码不兼容
- **控制**: 保持API稳定，渐进迁移

---

**注意**: 本文档将作为重构过程的指导文档，每完成一个步骤后需要更新进度状态，确保重构过程可控可追踪。