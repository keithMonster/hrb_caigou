/**
 * 通用业务工具函数 - HRB采购系统
 */

import {
  ORDER_STATUS_OPTIONS,
  PURCHASE_STATUS_OPTIONS,
  QUALITY_STATUS_OPTIONS,
  WAREHOUSE_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  MATERIAL_TYPES,
  PRODUCTION_SOURCE_OPTIONS,
  CONTRACT_STATUS_OPTIONS,
  SHIPPING_STATUS_OPTIONS
} from './constants';

// ==================== 状态相关工具函数 ====================

/**
 * 根据状态值获取状态配置
 * @param {string} status - 状态值
 * @param {Array} statusOptions - 状态选项数组
 * @returns {Object|null} 状态配置对象
 */
export const getStatusConfig = (status, statusOptions) => {
  return statusOptions.find(option => option.value === status) || null;
};

/**
 * 获取订单状态配置
 * @param {string} status - 订单状态
 * @returns {Object|null} 状态配置
 */
export const getOrderStatusConfig = (status) => {
  return getStatusConfig(status, ORDER_STATUS_OPTIONS);
};

/**
 * 获取采购状态配置
 * @param {string} status - 采购状态
 * @returns {Object|null} 状态配置
 */
export const getPurchaseStatusConfig = (status) => {
  return getStatusConfig(status, PURCHASE_STATUS_OPTIONS);
};

/**
 * 获取质检状态配置
 * @param {string} status - 质检状态
 * @returns {Object|null} 状态配置
 */
export const getQualityStatusConfig = (status) => {
  return getStatusConfig(status, QUALITY_STATUS_OPTIONS);
};

/**
 * 获取入库状态配置
 * @param {string} status - 入库状态
 * @returns {Object|null} 状态配置
 */
export const getWarehouseStatusConfig = (status) => {
  return getStatusConfig(status, WAREHOUSE_STATUS_OPTIONS);
};

/**
 * 获取合同状态配置
 * @param {string} status - 合同状态
 * @returns {Object|null} 状态配置
 */
export const getContractStatusConfig = (status) => {
  return getStatusConfig(status, CONTRACT_STATUS_OPTIONS);
};

/**
 * 获取运输状态配置
 * @param {string} status - 运输状态
 * @returns {Object|null} 状态配置
 */
export const getShippingStatusConfig = (status) => {
  return getStatusConfig(status, SHIPPING_STATUS_OPTIONS);
};

/**
 * 获取优先级配置
 * @param {string} priority - 优先级
 * @returns {Object|null} 优先级配置
 */
export const getPriorityConfig = (priority) => {
  return getStatusConfig(priority, PRIORITY_OPTIONS);
};

/**
 * 获取物料类型配置
 * @param {string} materialType - 物料类型
 * @returns {Object|null} 物料类型配置
 */
export const getMaterialTypeConfig = (materialType) => {
  return getStatusConfig(materialType, MATERIAL_TYPES);
};

/**
 * 获取生产来源配置
 * @param {string} source - 生产来源
 * @returns {Object|null} 生产来源配置
 */
export const getProductionSourceConfig = (source) => {
  return getStatusConfig(source, PRODUCTION_SOURCE_OPTIONS);
};

// ==================== 编号生成工具函数 ====================

/**
 * 生成合同编号
 * @param {number} sequence - 序号
 * @param {number} year - 年份，默认当前年份
 * @returns {string} 合同编号
 */
export const generateContractNo = (sequence, year = new Date().getFullYear()) => {
  const paddedSequence = String(sequence).padStart(3, '0');
  return `HT${year}${paddedSequence}`;
};

/**
 * 生成订单编号
 * @param {number} sequence - 序号
 * @param {number} year - 年份，默认当前年份
 * @returns {string} 订单编号
 */
export const generateOrderNo = (sequence, year = new Date().getFullYear()) => {
  const paddedSequence = String(sequence).padStart(3, '0');
  return `DD${year}${paddedSequence}`;
};

/**
 * 生成采购计划编号
 * @param {number} sequence - 序号
 * @param {number} year - 年份，默认当前年份
 * @returns {string} 采购计划编号
 */
export const generatePurchasePlanNo = (sequence, year = new Date().getFullYear()) => {
  const paddedSequence = String(sequence).padStart(3, '0');
  return `CG${year}${paddedSequence}`;
};

/**
 * 生成入库单编号
 * @param {number} sequence - 序号
 * @param {number} year - 年份，默认当前年份
 * @returns {string} 入库单编号
 */
export const generateWarehouseNo = (sequence, year = new Date().getFullYear()) => {
  const paddedSequence = String(sequence).padStart(3, '0');
  return `RK${year}${paddedSequence}`;
};

/**
 * 从编号中提取序号
 * @param {string} no - 编号
 * @param {string} prefix - 前缀
 * @returns {number|null} 序号
 */
export const extractSequenceFromNo = (no, prefix) => {
  if (!no || !no.startsWith(prefix)) return null;
  const sequence = no.slice(prefix.length + 4); // 去掉前缀和年份
  return parseInt(sequence, 10) || null;
};

// ==================== 数据计算工具函数 ====================

/**
 * 计算完成率
 * @param {number} completed - 已完成数量
 * @param {number} total - 总数量
 * @returns {number} 完成率百分比
 */
export const calculateCompletionRate = (completed, total) => {
  if (!total || total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * 计算剩余数量
 * @param {number} total - 总数量
 * @param {number} used - 已使用数量
 * @returns {number} 剩余数量
 */
export const calculateRemainingQuantity = (total, used) => {
  return Math.max(0, (total || 0) - (used || 0));
};

/**
 * 计算总金额
 * @param {number} quantity - 数量
 * @param {number} unitPrice - 单价
 * @returns {number} 总金额
 */
export const calculateTotalAmount = (quantity, unitPrice) => {
  return (quantity || 0) * (unitPrice || 0);
};

/**
 * 计算含税金额
 * @param {number} amount - 不含税金额
 * @param {number} taxRate - 税率（如0.13表示13%）
 * @returns {number} 含税金额
 */
export const calculateTaxInclusiveAmount = (amount, taxRate) => {
  return (amount || 0) * (1 + (taxRate || 0));
};

/**
 * 计算税额
 * @param {number} amount - 不含税金额
 * @param {number} taxRate - 税率
 * @returns {number} 税额
 */
export const calculateTaxAmount = (amount, taxRate) => {
  return (amount || 0) * (taxRate || 0);
};

/**
 * 计算平均值
 * @param {Array} values - 数值数组
 * @returns {number} 平均值
 */
export const calculateAverage = (values) => {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + (val || 0), 0);
  return sum / values.length;
};

/**
 * 计算总和
 * @param {Array} values - 数值数组
 * @returns {number} 总和
 */
export const calculateSum = (values) => {
  if (!Array.isArray(values)) return 0;
  return values.reduce((acc, val) => acc + (val || 0), 0);
};

// ==================== 数据转换工具函数 ====================

/**
 * 格式化金额显示
 * @param {number} amount - 金额
 * @param {Object} options - 格式化选项
 * @returns {string} 格式化后的金额
 */
export const formatAmount = (amount, options = {}) => {
  const {
    currency = '¥',
    precision = 2,
    thousandSeparator = ','
  } = options;
  
  if (amount === null || amount === undefined) return '-';
  
  const num = Number(amount);
  if (isNaN(num)) return '-';
  
  const formatted = num.toFixed(precision);
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  
  return `${currency}${parts.join('.')}`;
};

/**
 * 格式化数量显示
 * @param {number} quantity - 数量
 * @param {string} unit - 单位
 * @returns {string} 格式化后的数量
 */
export const formatQuantity = (quantity, unit = '') => {
  if (quantity === null || quantity === undefined) return '-';
  
  const num = Number(quantity);
  if (isNaN(num)) return '-';
  
  const formatted = num.toLocaleString();
  return unit ? `${formatted} ${unit}` : formatted;
};

/**
 * 格式化百分比显示
 * @param {number} value - 数值
 * @param {number} precision - 精度
 * @returns {string} 格式化后的百分比
 */
export const formatPercentage = (value, precision = 1) => {
  if (value === null || value === undefined) return '-';
  
  const num = Number(value);
  if (isNaN(num)) return '-';
  
  return `${num.toFixed(precision)}%`;
};

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// ==================== 数据筛选工具函数 ====================

/**
 * 根据关键词筛选数据
 * @param {Array} data - 数据数组
 * @param {string} keyword - 关键词
 * @param {Array} searchFields - 搜索字段
 * @returns {Array} 筛选后的数据
 */
export const filterByKeyword = (data, keyword, searchFields = []) => {
  if (!keyword || !Array.isArray(data)) return data;
  
  const lowerKeyword = keyword.toLowerCase();
  
  return data.filter(item => {
    if (searchFields.length === 0) {
      // 如果没有指定搜索字段，搜索所有字符串字段
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(lowerKeyword)
      );
    }
    
    // 在指定字段中搜索
    return searchFields.some(field => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(lowerKeyword);
    });
  });
};

/**
 * 根据状态筛选数据
 * @param {Array} data - 数据数组
 * @param {string|Array} status - 状态值或状态数组
 * @param {string} statusField - 状态字段名
 * @returns {Array} 筛选后的数据
 */
export const filterByStatus = (data, status, statusField = 'status') => {
  if (!status || !Array.isArray(data)) return data;
  
  const statusArray = Array.isArray(status) ? status : [status];
  
  return data.filter(item => statusArray.includes(item[statusField]));
};

/**
 * 根据日期范围筛选数据
 * @param {Array} data - 数据数组
 * @param {Array} dateRange - 日期范围 [startDate, endDate]
 * @param {string} dateField - 日期字段名
 * @returns {Array} 筛选后的数据
 */
export const filterByDateRange = (data, dateRange, dateField = 'date') => {
  if (!dateRange || !Array.isArray(dateRange) || !Array.isArray(data)) {
    return data;
  }
  
  const [startDate, endDate] = dateRange;
  if (!startDate || !endDate) return data;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // 包含结束日期的整天
  
  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= start && itemDate <= end;
  });
};

/**
 * 根据数值范围筛选数据
 * @param {Array} data - 数据数组
 * @param {Object} range - 数值范围 {min, max}
 * @param {string} field - 字段名
 * @returns {Array} 筛选后的数据
 */
export const filterByNumberRange = (data, range, field) => {
  if (!range || !Array.isArray(data)) return data;
  
  const { min, max } = range;
  
  return data.filter(item => {
    const value = Number(item[field]);
    if (isNaN(value)) return false;
    
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    
    return true;
  });
};

// ==================== 数据排序工具函数 ====================

/**
 * 多字段排序
 * @param {Array} data - 数据数组
 * @param {Array} sortConfig - 排序配置 [{field, order}]
 * @returns {Array} 排序后的数据
 */
export const multiFieldSort = (data, sortConfig) => {
  if (!Array.isArray(data) || !Array.isArray(sortConfig)) {
    return data;
  }
  
  return [...data].sort((a, b) => {
    for (const { field, order } of sortConfig) {
      const aValue = a[field];
      const bValue = b[field];
      
      let comparison = 0;
      
      if (aValue < bValue) comparison = -1;
      else if (aValue > bValue) comparison = 1;
      
      if (comparison !== 0) {
        return order === 'desc' ? -comparison : comparison;
      }
    }
    
    return 0;
  });
};

/**
 * 按日期排序
 * @param {Array} data - 数据数组
 * @param {string} dateField - 日期字段名
 * @param {string} order - 排序方向 'asc' | 'desc'
 * @returns {Array} 排序后的数据
 */
export const sortByDate = (data, dateField = 'date', order = 'desc') => {
  if (!Array.isArray(data)) return data;
  
  return [...data].sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);
    
    const comparison = dateA - dateB;
    return order === 'desc' ? -comparison : comparison;
  });
};

// ==================== 数据分组工具函数 ====================

/**
 * 按字段分组
 * @param {Array} data - 数据数组
 * @param {string} field - 分组字段
 * @returns {Object} 分组后的数据
 */
export const groupByField = (data, field) => {
  if (!Array.isArray(data)) return {};
  
  return data.reduce((groups, item) => {
    const key = item[field];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * 按日期分组（按天）
 * @param {Array} data - 数据数组
 * @param {string} dateField - 日期字段名
 * @returns {Object} 分组后的数据
 */
export const groupByDate = (data, dateField = 'date') => {
  if (!Array.isArray(data)) return {};
  
  return data.reduce((groups, item) => {
    const date = new Date(item[dateField]);
    const key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * 按月份分组
 * @param {Array} data - 数据数组
 * @param {string} dateField - 日期字段名
 * @returns {Object} 分组后的数据
 */
export const groupByMonth = (data, dateField = 'date') => {
  if (!Array.isArray(data)) return {};
  
  return data.reduce((groups, item) => {
    const date = new Date(item[dateField]);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

// ==================== 数据统计工具函数 ====================

/**
 * 统计字段值的分布
 * @param {Array} data - 数据数组
 * @param {string} field - 统计字段
 * @returns {Object} 统计结果
 */
export const getFieldDistribution = (data, field) => {
  if (!Array.isArray(data)) return {};
  
  return data.reduce((distribution, item) => {
    const value = item[field];
    distribution[value] = (distribution[value] || 0) + 1;
    return distribution;
  }, {});
};

/**
 * 获取数值字段的统计信息
 * @param {Array} data - 数据数组
 * @param {string} field - 数值字段
 * @returns {Object} 统计信息
 */
export const getNumberFieldStats = (data, field) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {
      count: 0,
      sum: 0,
      average: 0,
      min: 0,
      max: 0
    };
  }
  
  const values = data
    .map(item => Number(item[field]))
    .filter(value => !isNaN(value));
  
  if (values.length === 0) {
    return {
      count: 0,
      sum: 0,
      average: 0,
      min: 0,
      max: 0
    };
  }
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  
  return {
    count: values.length,
    sum,
    average: sum / values.length,
    min: Math.min(...values),
    max: Math.max(...values)
  };
};