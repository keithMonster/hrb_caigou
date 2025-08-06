import { formatDate, getShortDateFormat } from './dateUtils';

/**
 * 创建基础的表格列配置
 * @param {string} dataIndex - 数据索引
 * @param {string} title - 列标题
 * @param {Object} options - 其他配置选项
 * @returns {Object} 列配置对象
 */
export const createColumn = (dataIndex, title, options = {}) => {
  return {
    dataIndex,
    title,
    key: dataIndex,
    ...options
  };
};

/**
 * 创建日期列配置
 * @param {string} dataIndex - 数据索引
 * @param {string} title - 列标题
 * @param {Object} options - 其他配置选项
 * @returns {Object} 日期列配置对象
 */
export const createDateColumn = (dataIndex, title, options = {}) => {
  const { format = 'YYYY-MM-DD', ...restOptions } = options;
  
  return createColumn(dataIndex, title, {
    render: (value) => value ? formatDate(value, format) : '-',
    sorter: (a, b) => {
      const dateA = a[dataIndex] ? new Date(a[dataIndex]) : new Date(0);
      const dateB = b[dataIndex] ? new Date(b[dataIndex]) : new Date(0);
      return dateA - dateB;
    },
    ...restOptions
  });
};

/**
 * 创建数字列配置
 * @param {string} dataIndex - 数据索引
 * @param {string} title - 列标题
 * @param {Object} options - 其他配置选项
 * @returns {Object} 数字列配置对象
 */
export const createNumberColumn = (dataIndex, title, options = {}) => {
  const { precision = 0, showZero = true, ...restOptions } = options;
  
  return createColumn(dataIndex, title, {
    align: 'right',
    render: (value) => {
      if (value === null || value === undefined) return '-';
      if (value === 0 && !showZero) return '-';
      return typeof value === 'number' ? value.toFixed(precision) : value;
    },
    sorter: (a, b) => (a[dataIndex] || 0) - (b[dataIndex] || 0),
    ...restOptions
  });
};

/**
 * 创建操作列配置
 * @param {Array} actions - 操作按钮配置数组
 * @param {Object} options - 其他配置选项
 * @returns {Object} 操作列配置对象
 */
export const createActionColumn = (actions = [], options = {}) => {
  const { title = '操作', width = 120, ...restOptions } = options;
  
  return createColumn('actions', title, {
    width,
    fixed: 'right',
    render: (_, record) => {
      return actions.map((action, index) => {
        if (typeof action === 'function') {
          return action(record, index);
        }
        return action;
      });
    },
    ...restOptions
  });
};

/**
 * 创建动态日期列配置
 * @param {Array} dates - 日期数组
 * @param {string} dataKey - 数据键名
 * @param {Object} options - 配置选项
 * @returns {Array} 动态列配置数组
 */
export const createDynamicDateColumns = (dates, dataKey, options = {}) => {
  const { 
    width = 80, 
    align = 'center',
    showWeekday = false,
    editable = false,
    inputType = 'number',
    ...restOptions 
  } = options;

  return dates.map((date, index) => {
    const dateStr = getShortDateFormat(date);
    const weekday = showWeekday ? ` (${getWeekday(date)})` : '';
    const title = `${dateStr}${weekday}`;
    
    return createColumn(`${dataKey}_${index}`, title, {
      width,
      align,
      render: editable ? undefined : (value, record) => {
        const values = record[dataKey] || [];
        return values[index] || 0;
      },
      ...restOptions
    });
  });
};

/**
 * 创建合计行数据
 * @param {Array} dataSource - 数据源
 * @param {Array} columns - 列配置
 * @param {Array} sumColumns - 需要求和的列
 * @returns {Object} 合计行数据
 */
export const createSummaryRow = (dataSource, columns, sumColumns = []) => {
  const summaryData = { key: 'summary' };
  
  columns.forEach(col => {
    if (col.dataIndex === 'model' || col.dataIndex === 'name') {
      summaryData[col.dataIndex] = '合计';
    } else if (sumColumns.includes(col.dataIndex)) {
      summaryData[col.dataIndex] = dataSource.reduce((sum, item) => {
        const value = item[col.dataIndex];
        return sum + (typeof value === 'number' ? value : 0);
      }, 0);
    } else {
      summaryData[col.dataIndex] = '';
    }
  });
  
  return summaryData;
};

/**
 * 创建表格的分页配置
 * @param {number} total - 总数据量
 * @param {Object} options - 分页配置选项
 * @returns {Object} 分页配置对象
 */
export const createPaginationConfig = (total, options = {}) => {
  const {
    current = 1,
    pageSize = 10,
    showSizeChanger = true,
    showQuickJumper = true,
    showTotal = true,
    ...restOptions
  } = options;

  return {
    current,
    pageSize,
    total,
    showSizeChanger,
    showQuickJumper,
    showTotal: showTotal ? (total, range) => 
      `第 ${range[0]}-${range[1]} 条，共 ${total} 条` : false,
    pageSizeOptions: ['10', '20', '50', '100'],
    ...restOptions
  };
};

/**
 * 过滤表格数据
 * @param {Array} dataSource - 原始数据
 * @param {Object} filters - 过滤条件
 * @param {Array} filterKeys - 要过滤的字段
 * @returns {Array} 过滤后的数据
 */
export const filterTableData = (dataSource, filters, filterKeys = []) => {
  if (!filters || Object.keys(filters).length === 0) {
    return dataSource;
  }

  return dataSource.filter(item => {
    return filterKeys.every(key => {
      const filterValue = filters[key];
      if (!filterValue || filterValue === '全部') {
        return true;
      }
      
      const itemValue = item[key];
      
      // 处理特殊的过滤逻辑
      if (key.includes('Requirement') && (filterValue === '有' || filterValue === '无')) {
        return filterValue === '有' ? !!itemValue : !itemValue;
      }
      
      return itemValue === filterValue;
    });
  });
};

/**
 * 获取表格滚动配置
 * @param {Object} options - 滚动配置选项
 * @returns {Object} 滚动配置对象
 */
export const getTableScrollConfig = (options = {}) => {
  const {
    x = 'max-content',
    y = 'calc(100vh - 400px)',
    ...restOptions
  } = options;

  return {
    x,
    y,
    ...restOptions
  };
};