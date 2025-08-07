/**
 * 表单验证工具函数 - HRB采购系统
 */

import { MATERIAL_TYPES } from './constants';

// ==================== 基础验证函数 ====================

/**
 * 验证是否为空
 * @param {any} value - 要验证的值
 * @returns {boolean} 是否为空
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * 验证是否为有效数字
 * @param {any} value - 要验证的值
 * @returns {boolean} 是否为有效数字
 */
export const isValidNumber = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * 验证是否为正数
 * @param {any} value - 要验证的值
 * @returns {boolean} 是否为正数
 */
export const isPositiveNumber = (value) => {
  return isValidNumber(value) && parseFloat(value) > 0;
};

/**
 * 验证是否为非负数
 * @param {any} value - 要验证的值
 * @returns {boolean} 是否为非负数
 */
export const isNonNegativeNumber = (value) => {
  return isValidNumber(value) && parseFloat(value) >= 0;
};

/**
 * 验证是否为整数
 * @param {any} value - 要验证的值
 * @returns {boolean} 是否为整数
 */
export const isInteger = (value) => {
  return isValidNumber(value) && Number.isInteger(parseFloat(value));
};

/**
 * 验证是否为有效邮箱
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否为有效邮箱
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证是否为有效手机号
 * @param {string} phone - 手机号
 * @returns {boolean} 是否为有效手机号
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证是否为有效身份证号
 * @param {string} idCard - 身份证号
 * @returns {boolean} 是否为有效身份证号
 */
export const isValidIdCard = (idCard) => {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return idCardRegex.test(idCard);
};

/**
 * 验证是否为有效日期
 * @param {any} date - 日期值
 * @returns {boolean} 是否为有效日期
 */
export const isValidDate = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

/**
 * 验证日期是否在指定范围内
 * @param {any} date - 要验证的日期
 * @param {any} minDate - 最小日期
 * @param {any} maxDate - 最大日期
 * @returns {boolean} 是否在范围内
 */
export const isDateInRange = (date, minDate, maxDate) => {
  if (!isValidDate(date)) return false;
  const dateObj = new Date(date);
  const minDateObj = minDate ? new Date(minDate) : null;
  const maxDateObj = maxDate ? new Date(maxDate) : null;
  
  if (minDateObj && dateObj < minDateObj) return false;
  if (maxDateObj && dateObj > maxDateObj) return false;
  return true;
};

// ==================== 业务验证函数 ====================

/**
 * 验证物料类型
 * @param {string} materialType - 物料类型
 * @returns {boolean} 是否为有效物料类型
 */
export const isValidMaterialType = (materialType) => {
  return MATERIAL_TYPES.some(type => type.value === materialType);
};

/**
 * 验证合同编号格式
 * @param {string} contractNo - 合同编号
 * @returns {boolean} 是否为有效格式
 */
export const isValidContractNo = (contractNo) => {
  // 合同编号格式: HT + 年份 + 3位数字，如 HT2025001
  const contractRegex = /^HT\d{4}\d{3}$/;
  return contractRegex.test(contractNo);
};

/**
 * 验证订单编号格式
 * @param {string} orderNo - 订单编号
 * @returns {boolean} 是否为有效格式
 */
export const isValidOrderNo = (orderNo) => {
  // 订单编号格式: DD + 年份 + 3位数字，如 DD2025001
  const orderRegex = /^DD\d{4}\d{3}$/;
  return orderRegex.test(orderNo);
};

/**
 * 验证物料规格格式
 * @param {string} spec - 物料规格
 * @returns {boolean} 是否为有效格式
 */
export const isValidMaterialSpec = (spec) => {
  if (isEmpty(spec)) return false;
  // 物料规格应该是字母数字组合，可包含连字符
  const specRegex = /^[A-Za-z0-9-]+$/;
  return specRegex.test(spec);
};

/**
 * 验证价格格式
 * @param {any} price - 价格
 * @returns {boolean} 是否为有效价格
 */
export const isValidPrice = (price) => {
  if (!isValidNumber(price)) return false;
  const priceNum = parseFloat(price);
  // 价格应该是正数，最多保留2位小数
  return priceNum > 0 && (priceNum * 100) % 1 === 0;
};

/**
 * 验证数量格式
 * @param {any} quantity - 数量
 * @returns {boolean} 是否为有效数量
 */
export const isValidQuantity = (quantity) => {
  return isPositiveNumber(quantity) && isInteger(quantity);
};

// ==================== Ant Design 验证规则 ====================

/**
 * 创建必填验证规则
 * @param {string} message - 错误消息
 * @returns {Object} 验证规则
 */
export const createRequiredRule = (message = '此字段为必填项') => ({
  required: true,
  message
});

/**
 * 创建数字验证规则
 * @param {Object} options - 配置选项
 * @returns {Object} 验证规则
 */
export const createNumberRule = (options = {}) => {
  const { min, max, message = '请输入有效数字' } = options;
  
  return {
    validator: (_, value) => {
      if (value === null || value === undefined || value === '') {
        return Promise.resolve();
      }
      
      if (!isValidNumber(value)) {
        return Promise.reject(new Error(message));
      }
      
      const num = parseFloat(value);
      if (min !== undefined && num < min) {
        return Promise.reject(new Error(`数值不能小于 ${min}`));
      }
      
      if (max !== undefined && num > max) {
        return Promise.reject(new Error(`数值不能大于 ${max}`));
      }
      
      return Promise.resolve();
    }
  };
};

/**
 * 创建正数验证规则
 * @param {string} message - 错误消息
 * @returns {Object} 验证规则
 */
export const createPositiveNumberRule = (message = '请输入正数') => ({
  validator: (_, value) => {
    if (value === null || value === undefined || value === '') {
      return Promise.resolve();
    }
    
    if (!isPositiveNumber(value)) {
      return Promise.reject(new Error(message));
    }
    
    return Promise.resolve();
  }
});

/**
 * 创建整数验证规则
 * @param {string} message - 错误消息
 * @returns {Object} 验证规则
 */
export const createIntegerRule = (message = '请输入整数') => ({
  validator: (_, value) => {
    if (value === null || value === undefined || value === '') {
      return Promise.resolve();
    }
    
    if (!isInteger(value)) {
      return Promise.reject(new Error(message));
    }
    
    return Promise.resolve();
  }
});

/**
 * 创建邮箱验证规则
 * @param {string} message - 错误消息
 * @returns {Object} 验证规则
 */
export const createEmailRule = (message = '请输入有效的邮箱地址') => ({
  validator: (_, value) => {
    if (value === null || value === undefined || value === '') {
      return Promise.resolve();
    }
    
    if (!isValidEmail(value)) {
      return Promise.reject(new Error(message));
    }
    
    return Promise.resolve();
  }
});

/**
 * 创建手机号验证规则
 * @param {string} message - 错误消息
 * @returns {Object} 验证规则
 */
export const createPhoneRule = (message = '请输入有效的手机号') => ({
  validator: (_, value) => {
    if (value === null || value === undefined || value === '') {
      return Promise.resolve();
    }
    
    if (!isValidPhone(value)) {
      return Promise.reject(new Error(message));
    }
    
    return Promise.resolve();
  }
});

/**
 * 创建长度验证规则
 * @param {Object} options - 配置选项
 * @returns {Object} 验证规则
 */
export const createLengthRule = (options = {}) => {
  const { min, max, message } = options;
  
  return {
    validator: (_, value) => {
      if (value === null || value === undefined || value === '') {
        return Promise.resolve();
      }
      
      const length = String(value).length;
      
      if (min !== undefined && length < min) {
        return Promise.reject(new Error(message || `长度不能少于 ${min} 个字符`));
      }
      
      if (max !== undefined && length > max) {
        return Promise.reject(new Error(message || `长度不能超过 ${max} 个字符`));
      }
      
      return Promise.resolve();
    }
  };
};

/**
 * 创建日期范围验证规则
 * @param {Object} options - 配置选项
 * @returns {Object} 验证规则
 */
export const createDateRangeRule = (options = {}) => {
  const { minDate, maxDate, message = '请选择有效的日期' } = options;
  
  return {
    validator: (_, value) => {
      if (!value) {
        return Promise.resolve();
      }
      
      if (!isDateInRange(value, minDate, maxDate)) {
        return Promise.reject(new Error(message));
      }
      
      return Promise.resolve();
    }
  };
};

/**
 * 创建合同编号验证规则
 * @param {string} message - 错误消息
 * @returns {Object} 验证规则
 */
export const createContractNoRule = (message = '合同编号格式不正确，应为HT+年份+3位数字') => ({
  validator: (_, value) => {
    if (value === null || value === undefined || value === '') {
      return Promise.resolve();
    }
    
    if (!isValidContractNo(value)) {
      return Promise.reject(new Error(message));
    }
    
    return Promise.resolve();
  }
});

/**
 * 创建订单编号验证规则
 * @param {string} message - 错误消息
 * @returns {Object} 验证规则
 */
export const createOrderNoRule = (message = '订单编号格式不正确，应为DD+年份+3位数字') => ({
  validator: (_, value) => {
    if (value === null || value === undefined || value === '') {
      return Promise.resolve();
    }
    
    if (!isValidOrderNo(value)) {
      return Promise.reject(new Error(message));
    }
    
    return Promise.resolve();
  }
});

/**
 * 创建物料规格验证规则
 * @param {string} message - 错误消息
 * @returns {Object} 验证规则
 */
export const createMaterialSpecRule = (message = '物料规格格式不正确') => ({
  validator: (_, value) => {
    if (value === null || value === undefined || value === '') {
      return Promise.resolve();
    }
    
    if (!isValidMaterialSpec(value)) {
      return Promise.reject(new Error(message));
    }
    
    return Promise.resolve();
  }
});

/**
 * 创建价格验证规则
 * @param {string} message - 错误消息
 * @returns {Object} 验证规则
 */
export const createPriceRule = (message = '请输入有效的价格') => ({
  validator: (_, value) => {
    if (value === null || value === undefined || value === '') {
      return Promise.resolve();
    }
    
    if (!isValidPrice(value)) {
      return Promise.reject(new Error(message));
    }
    
    return Promise.resolve();
  }
});

/**
 * 创建数量验证规则
 * @param {string} message - 错误消息
 * @returns {Object} 验证规则
 */
export const createQuantityRule = (message = '请输入有效的数量') => ({
  validator: (_, value) => {
    if (value === null || value === undefined || value === '') {
      return Promise.resolve();
    }
    
    if (!isValidQuantity(value)) {
      return Promise.reject(new Error(message));
    }
    
    return Promise.resolve();
  }
});

// ==================== 常用验证规则组合 ====================

/**
 * 必填文本字段验证规则
 */
export const REQUIRED_TEXT_RULES = [
  createRequiredRule(),
  { whitespace: true, message: '不能只输入空格' }
];

/**
 * 必填数字字段验证规则
 */
export const REQUIRED_NUMBER_RULES = [
  createRequiredRule(),
  createNumberRule()
];

/**
 * 必填正数字段验证规则
 */
export const REQUIRED_POSITIVE_NUMBER_RULES = [
  createRequiredRule(),
  createPositiveNumberRule()
];

/**
 * 必填整数字段验证规则
 */
export const REQUIRED_INTEGER_RULES = [
  createRequiredRule(),
  createIntegerRule()
];

/**
 * 必填数量字段验证规则
 */
export const REQUIRED_QUANTITY_RULES = [
  createRequiredRule(),
  createQuantityRule()
];

/**
 * 必填价格字段验证规则
 */
export const REQUIRED_PRICE_RULES = [
  createRequiredRule(),
  createPriceRule()
];

/**
 * 必填邮箱字段验证规则
 */
export const REQUIRED_EMAIL_RULES = [
  createRequiredRule(),
  createEmailRule()
];

/**
 * 必填手机号字段验证规则
 */
export const REQUIRED_PHONE_RULES = [
  createRequiredRule(),
  createPhoneRule()
];

/**
 * 必填合同编号字段验证规则
 */
export const REQUIRED_CONTRACT_NO_RULES = [
  createRequiredRule(),
  createContractNoRule()
];

/**
 * 必填订单编号字段验证规则
 */
export const REQUIRED_ORDER_NO_RULES = [
  createRequiredRule(),
  createOrderNoRule()
];

/**
 * 必填物料规格字段验证规则
 */
export const REQUIRED_MATERIAL_SPEC_RULES = [
  createRequiredRule(),
  createMaterialSpecRule()
];