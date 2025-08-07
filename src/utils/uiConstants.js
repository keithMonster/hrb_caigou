/**
 * UI相关常量定义 - HRB采购系统
 * 用于统一管理页面中的硬编码样式值
 */

// ==================== 颜色常量 ====================

/**
 * 主题色彩
 */
export const COLORS = {
  // 主色调
  PRIMARY: '#1890ff',
  PRIMARY_LIGHT: '#40a9ff',
  PRIMARY_DARK: '#096dd9',
  
  // 功能色彩
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#ff4d4f',
  INFO: '#1890ff',
  
  // 文本色彩
  TEXT_PRIMARY: '#262626',
  TEXT_SECONDARY: '#595959',
  TEXT_TERTIARY: '#8c8c8c',
  TEXT_DISABLED: '#d9d9d9',
  TEXT_PLACEHOLDER: '#999',
  TEXT_LIGHT: '#666',
  
  // 背景色彩
  BACKGROUND_LIGHT: '#fafafa',
  BACKGROUND_LIGHTER: '#f5f5f5',
  BACKGROUND_DARK: '#f0f0f0',
  
  // 边框色彩
  BORDER_LIGHT: '#d9d9d9',
  BORDER_DEFAULT: '#e8e8e8',
  
  // 特殊色彩
  LINK: '#188dfa',
  HIGHLIGHT: '#e6f7ff'
};

/**
 * 状态相关颜色映射
 */
export const STATUS_COLORS = {
  // 通用状态
  ACTIVE: COLORS.PRIMARY,
  INACTIVE: COLORS.TEXT_TERTIARY,
  POSITIVE: COLORS.SUCCESS,
  NEGATIVE: COLORS.ERROR,
  NEUTRAL: COLORS.TEXT_PLACEHOLDER,
  
  // 生产来源
  SELF_PRODUCTION: COLORS.SUCCESS,  // 自产
  OEM_PRODUCTION: COLORS.PRIMARY,   // OEM
  
  // 数值状态
  VALUE_POSITIVE: COLORS.PRIMARY,
  VALUE_ZERO: COLORS.TEXT_TERTIARY,
  VALUE_NEGATIVE: COLORS.ERROR,
  
  // 完成率状态
  RATE_COMPLETE: COLORS.SUCCESS,    // 100%
  RATE_PARTIAL: COLORS.PRIMARY,     // 部分完成
  RATE_NONE: COLORS.ERROR          // 0%
};

// ==================== 尺寸常量 ====================

/**
 * 字体大小
 */
export const FONT_SIZES = {
  XS: '11px',
  SM: '12px',
  BASE: '13px',
  MD: '14px',
  LG: '16px',
  XL: '18px'
};

/**
 * 间距大小
 */
export const SPACING = {
  XS: '2px',
  SM: '4px',
  MD: '8px',
  LG: '12px',
  XL: '16px',
  XXL: '24px',
  XXXL: '32px'
};

/**
 * 组件尺寸
 */
export const SIZES = {
  // 输入框宽度
  INPUT_SM: '60px',
  INPUT_MD: '80px',
  INPUT_LG: '100px',
  INPUT_XL: '120px',
  
  // 表格滚动区域
  TABLE_SCROLL_X: 1000,
  TABLE_SCROLL_Y: 'calc(100vh - 400px)',
  
  // 最小宽度
  MIN_WIDTH_SM: '70px',
  MIN_WIDTH_MD: '80px',
  MIN_WIDTH_LG: '90px'
};

/**
 * 边框圆角
 */
export const BORDER_RADIUS = {
  SM: '2px',
  MD: '4px',
  LG: '6px',
  XL: '8px'
};

// ==================== 样式对象常量 ====================

/**
 * 常用的内联样式对象
 */
export const INLINE_STYLES = {
  // 文本样式
  BOLD_TEXT: { fontWeight: 'bold' },
  MEDIUM_TEXT: { fontWeight: 500 },
  SMALL_TEXT: { fontSize: FONT_SIZES.SM },
  TINY_TEXT: { fontSize: FONT_SIZES.XS },
  
  // 布局样式
  FLEX_CENTER: { display: 'flex', alignItems: 'center' },
  FLEX_BETWEEN: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  TEXT_CENTER: { textAlign: 'center' },
  TEXT_RIGHT: { textAlign: 'right' },
  
  // 间距样式
  NO_PADDING: { padding: 0 },
  SMALL_PADDING: { padding: SPACING.SM },
  MEDIUM_PADDING: { padding: SPACING.LG },
  LARGE_PADDING: { padding: SPACING.XL },
  
  // 边距样式
  NO_MARGIN: { margin: 0 },
  SMALL_MARGIN: { marginBottom: SPACING.SM },
  MEDIUM_MARGIN: { marginBottom: SPACING.LG },
  LARGE_MARGIN: { marginBottom: SPACING.XL },
  
  // 背景样式
  LIGHT_BACKGROUND: { backgroundColor: COLORS.BACKGROUND_LIGHT },
  LIGHTER_BACKGROUND: { backgroundColor: COLORS.BACKGROUND_LIGHTER },
  HIGHLIGHT_BACKGROUND: { backgroundColor: COLORS.HIGHLIGHT },
  
  // 边框样式
  DEFAULT_BORDER: { border: `1px solid ${COLORS.BORDER_LIGHT}` },
  ROUNDED_BORDER: { 
    border: `1px solid ${COLORS.BORDER_LIGHT}`, 
    borderRadius: BORDER_RADIUS.MD 
  }
};

/**
 * 状态相关的样式生成器
 */
export const createStatusStyle = (status, options = {}) => {
  const { bold = false, size = 'base' } = options;
  
  return {
    color: STATUS_COLORS[status] || COLORS.TEXT_PRIMARY,
    fontWeight: bold ? 'bold' : 'normal',
    fontSize: FONT_SIZES[size.toUpperCase()] || FONT_SIZES.BASE
  };
};

/**
 * 数值显示样式生成器
 */
export const createValueStyle = (value, options = {}) => {
  const { bold = true, size = 'base' } = options;
  
  let color = COLORS.TEXT_PRIMARY;
  if (value > 0) {
    color = STATUS_COLORS.VALUE_POSITIVE;
  } else if (value === 0) {
    color = STATUS_COLORS.VALUE_ZERO;
  } else {
    color = STATUS_COLORS.VALUE_NEGATIVE;
  }
  
  return {
    color,
    fontWeight: bold ? 500 : 'normal',
    fontSize: FONT_SIZES[size.toUpperCase()] || FONT_SIZES.BASE
  };
};

/**
 * 完成率样式生成器
 */
export const createRateStyle = (rate) => {
  let color = STATUS_COLORS.RATE_PARTIAL;
  
  if (rate === '100.0' || rate === 100) {
    color = STATUS_COLORS.RATE_COMPLETE;
  } else if (rate === '0.0' || rate === 0) {
    color = STATUS_COLORS.RATE_NONE;
  }
  
  return {
    color,
    fontWeight: 500
  };
};

/**
 * 生产来源样式生成器
 */
export const createProductionSourceStyle = (source) => {
  return {
    color: source === '自产' ? STATUS_COLORS.SELF_PRODUCTION : STATUS_COLORS.OEM_PRODUCTION
  };
};

// ==================== URL常量 ====================

/**
 * 示例文档URL（用于演示）
 */
export const DEMO_URLS = {
  HIGH_TEMP_REQUIREMENTS: 'https://example.com/documents/high-temp-requirements.pdf',
  CORROSION_TEST_STANDARD: 'https://example.com/documents/corrosion-test-standard.pdf'
};

// ==================== 导出默认配置 ====================

export default {
  COLORS,
  STATUS_COLORS,
  FONT_SIZES,
  SPACING,
  SIZES,
  BORDER_RADIUS,
  INLINE_STYLES,
  createStatusStyle,
  createValueStyle,
  createRateStyle,
  createProductionSourceStyle,
  DEMO_URLS
};