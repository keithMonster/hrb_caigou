/**
 * 业务常量定义 - HRB采购系统
 */

// ==================== 物料相关常量 ====================

/**
 * 物料类型列表
 */
export const MATERIAL_TYPES = [
  { value: '外圈', label: '外圈', color: '#1890ff' },
  { value: '内圈', label: '内圈', color: '#52c41a' },
  { value: '滚动体', label: '滚动体', color: '#faad14' },
  { value: '保持架', label: '保持架', color: '#722ed1' },
  { value: '密封件', label: '密封件', color: '#f5222d' }
];

/**
 * 物料规格示例
 */
export const MATERIAL_SPECS = {
  '外圈': '234424BM',
  '内圈': '7006C',
  '滚动体': '6.35',
  '保持架': '6004',
  '密封件': '6004-RZ'
};

/**
 * 物料单位
 */
export const MATERIAL_UNITS = [
  { value: '个', label: '个' },
  { value: '套', label: '套' },
  { value: '件', label: '件' },
  { value: 'kg', label: '千克' },
  { value: 'g', label: '克' }
];

// ==================== 状态相关常量 ====================

/**
 * 订单状态
 */
export const ORDER_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const ORDER_STATUS_OPTIONS = [
  { value: ORDER_STATUS.DRAFT, label: '草稿', color: '#8c8c8c' },
  { value: ORDER_STATUS.PENDING, label: '待处理', color: '#faad14' },
  { value: ORDER_STATUS.PROCESSING, label: '处理中', color: '#1890ff' },
  { value: ORDER_STATUS.COMPLETED, label: '已完成', color: '#52c41a' },
  { value: ORDER_STATUS.CANCELLED, label: '已取消', color: '#f5222d' }
];

/**
 * 采购状态
 */
export const PURCHASE_STATUS = {
  PLANNING: 'planning',
  APPROVED: 'approved',
  ORDERED: 'ordered',
  DELIVERED: 'delivered',
  RECEIVED: 'received'
};

export const PURCHASE_STATUS_OPTIONS = [
  { value: PURCHASE_STATUS.PLANNING, label: '计划中', color: '#8c8c8c' },
  { value: PURCHASE_STATUS.APPROVED, label: '已审批', color: '#faad14' },
  { value: PURCHASE_STATUS.ORDERED, label: '已下单', color: '#1890ff' },
  { value: PURCHASE_STATUS.DELIVERED, label: '已发货', color: '#722ed1' },
  { value: PURCHASE_STATUS.RECEIVED, label: '已收货', color: '#52c41a' }
];

/**
 * 质检状态
 */
export const QUALITY_STATUS = {
  PENDING: 'pending',
  INSPECTING: 'inspecting',
  PASSED: 'passed',
  FAILED: 'failed',
  REWORK: 'rework'
};

export const QUALITY_STATUS_OPTIONS = [
  { value: QUALITY_STATUS.PENDING, label: '待检验', color: '#8c8c8c' },
  { value: QUALITY_STATUS.INSPECTING, label: '检验中', color: '#1890ff' },
  { value: QUALITY_STATUS.PASSED, label: '检验通过', color: '#52c41a' },
  { value: QUALITY_STATUS.FAILED, label: '检验不合格', color: '#f5222d' },
  { value: QUALITY_STATUS.REWORK, label: '返工', color: '#faad14' }
];

/**
 * 入库状态
 */
export const WAREHOUSE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
};

export const WAREHOUSE_STATUS_OPTIONS = [
  { value: WAREHOUSE_STATUS.PENDING, label: '待入库', color: '#8c8c8c' },
  { value: WAREHOUSE_STATUS.IN_PROGRESS, label: '入库中', color: '#1890ff' },
  { value: WAREHOUSE_STATUS.COMPLETED, label: '已入库', color: '#52c41a' },
  { value: WAREHOUSE_STATUS.REJECTED, label: '入库拒绝', color: '#f5222d' }
];

// ==================== 优先级常量 ====================

/**
 * 优先级
 */
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const PRIORITY_OPTIONS = [
  { value: PRIORITY.LOW, label: '低', color: '#52c41a' },
  { value: PRIORITY.MEDIUM, label: '中', color: '#faad14' },
  { value: PRIORITY.HIGH, label: '高', color: '#f5222d' },
  { value: PRIORITY.URGENT, label: '紧急', color: '#ff4d4f' }
];

// ==================== 生产来源常量 ====================

/**
 * 生产来源
 */
export const PRODUCTION_SOURCE = {
  OEM: 'OEM',
  SELF: '自产'
};

export const PRODUCTION_SOURCE_OPTIONS = [
  { value: PRODUCTION_SOURCE.OEM, label: 'OEM' },
  { value: PRODUCTION_SOURCE.SELF, label: '自产' }
];

// ==================== 仓库相关常量 ====================

/**
 * 仓库列表
 */
export const WAREHOUSES = [
  { value: '仓库A', label: '仓库A - 主仓库', type: 'main' },
  { value: '仓库B', label: '仓库B - 副仓库', type: 'secondary' },
  { value: '仓库C', label: '仓库C - 临时仓库', type: 'temporary' }
];

/**
 * 仓库区域
 */
export const WAREHOUSE_AREAS = [
  { value: 'A01', label: 'A区01号位' },
  { value: 'A02', label: 'A区02号位' },
  { value: 'B01', label: 'B区01号位' },
  { value: 'B02', label: 'B区02号位' },
  { value: 'C01', label: 'C区01号位' }
];

// ==================== 供应商相关常量 ====================

/**
 * 供应商类型
 */
export const SUPPLIER_TYPES = [
  { value: 'manufacturer', label: '制造商' },
  { value: 'distributor', label: '经销商' },
  { value: 'agent', label: '代理商' },
  { value: 'trader', label: '贸易商' }
];

/**
 * 供应商等级
 */
export const SUPPLIER_LEVELS = [
  { value: 'A', label: 'A级供应商', color: '#52c41a' },
  { value: 'B', label: 'B级供应商', color: '#faad14' },
  { value: 'C', label: 'C级供应商', color: '#f5222d' }
];

// ==================== 合同相关常量 ====================

/**
 * 合同类型
 */
export const CONTRACT_TYPES = [
  { value: 'purchase', label: '采购合同' },
  { value: 'framework', label: '框架合同' },
  { value: 'service', label: '服务合同' },
  { value: 'lease', label: '租赁合同' }
];

/**
 * 合同状态
 */
export const CONTRACT_STATUS = {
  DRAFT: 'draft',
  REVIEWING: 'reviewing',
  APPROVED: 'approved',
  SIGNED: 'signed',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  TERMINATED: 'terminated'
};

export const CONTRACT_STATUS_OPTIONS = [
  { value: CONTRACT_STATUS.DRAFT, label: '草稿', color: '#8c8c8c' },
  { value: CONTRACT_STATUS.REVIEWING, label: '审核中', color: '#faad14' },
  { value: CONTRACT_STATUS.APPROVED, label: '已审批', color: '#1890ff' },
  { value: CONTRACT_STATUS.SIGNED, label: '已签署', color: '#722ed1' },
  { value: CONTRACT_STATUS.EXECUTING, label: '执行中', color: '#52c41a' },
  { value: CONTRACT_STATUS.COMPLETED, label: '已完成', color: '#52c41a' },
  { value: CONTRACT_STATUS.TERMINATED, label: '已终止', color: '#f5222d' }
];

// ==================== 付款相关常量 ====================

/**
 * 付款方式
 */
export const PAYMENT_METHODS = [
  { value: 'cash', label: '现金' },
  { value: 'transfer', label: '银行转账' },
  { value: 'check', label: '支票' },
  { value: 'credit', label: '信用证' },
  { value: 'installment', label: '分期付款' }
];

/**
 * 付款条件
 */
export const PAYMENT_TERMS = [
  { value: 'prepaid', label: '预付款' },
  { value: 'cod', label: '货到付款' },
  { value: 'net30', label: '30天付款' },
  { value: 'net60', label: '60天付款' },
  { value: 'net90', label: '90天付款' }
];

// ==================== 运输相关常量 ====================

/**
 * 运输方式
 */
export const SHIPPING_METHODS = [
  { value: 'truck', label: '公路运输' },
  { value: 'rail', label: '铁路运输' },
  { value: 'air', label: '航空运输' },
  { value: 'sea', label: '海运' },
  { value: 'express', label: '快递' }
];

/**
 * 运输状态
 */
export const SHIPPING_STATUS = {
  PENDING: 'pending',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  EXCEPTION: 'exception'
};

export const SHIPPING_STATUS_OPTIONS = [
  { value: SHIPPING_STATUS.PENDING, label: '待发货', color: '#8c8c8c' },
  { value: SHIPPING_STATUS.SHIPPED, label: '已发货', color: '#1890ff' },
  { value: SHIPPING_STATUS.IN_TRANSIT, label: '运输中', color: '#722ed1' },
  { value: SHIPPING_STATUS.DELIVERED, label: '已送达', color: '#52c41a' },
  { value: SHIPPING_STATUS.EXCEPTION, label: '异常', color: '#f5222d' }
];

// ==================== 表格相关常量 ====================

/**
 * 表格分页配置
 */
export const TABLE_PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];
export const DEFAULT_PAGE_SIZE = 20;

/**
 * 表格尺寸
 */
export const TABLE_SIZES = [
  { value: 'small', label: '紧凑' },
  { value: 'middle', label: '默认' },
  { value: 'large', label: '宽松' }
];

// ==================== 日期相关常量 ====================

/**
 * 日期格式
 */
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
  MONTH: 'YYYY-MM',
  YEAR: 'YYYY'
};

/**
 * 快捷日期选项
 */
export const DATE_SHORTCUTS = [
  {
    text: '今天',
    value: () => [new Date(), new Date()]
  },
  {
    text: '昨天',
    value: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return [yesterday, yesterday];
    }
  },
  {
    text: '最近7天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return [start, end];
    }
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 29);
      return [start, end];
    }
  },
  {
    text: '本月',
    value: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return [start, end];
    }
  },
  {
    text: '上月',
    value: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return [start, end];
    }
  }
];

// ==================== 文件相关常量 ====================

/**
 * 支持的文件类型
 */
export const SUPPORTED_FILE_TYPES = {
  EXCEL: ['.xlsx', '.xls'],
  PDF: ['.pdf'],
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif'],
  DOCUMENT: ['.doc', '.docx', '.txt']
};

/**
 * 文件大小限制 (MB)
 */
export const FILE_SIZE_LIMITS = {
  EXCEL: 10,
  PDF: 20,
  IMAGE: 5,
  DOCUMENT: 10
};

// ==================== API相关常量 ====================

/**
 * API响应状态码
 */
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

/**
 * 请求超时时间 (毫秒)
 */
export const REQUEST_TIMEOUT = 30000;

// ==================== 权限相关常量 ====================

/**
 * 用户角色
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
};

export const USER_ROLE_OPTIONS = [
  { value: USER_ROLES.ADMIN, label: '系统管理员' },
  { value: USER_ROLES.MANAGER, label: '部门经理' },
  { value: USER_ROLES.OPERATOR, label: '操作员' },
  { value: USER_ROLES.VIEWER, label: '查看者' }
];

/**
 * 权限操作
 */
export const PERMISSIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
  IMPORT: 'import',
  APPROVE: 'approve'
};

// ==================== 系统配置常量 ====================

/**
 * 系统主题
 */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

/**
 * 语言选项
 */
export const LANGUAGES = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' }
];

/**
 * 系统设置键名
 */
export const SETTINGS_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  PAGE_SIZE: 'pageSize',
  TABLE_SIZE: 'tableSize'
};