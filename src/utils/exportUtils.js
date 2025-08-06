import * as XLSX from 'xlsx';
import { formatDate } from './dateUtils';

/**
 * 导出数据到Excel文件
 * @param {Array} data - 要导出的数据数组
 * @param {string} filename - 文件名（不包含扩展名）
 * @param {string} sheetName - 工作表名称
 */
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    const timestamp = formatDate(new Date(), 'YYYYMMDD_HHmmss');
    const fullFilename = `${filename}_${timestamp}.xlsx`;
    
    XLSX.writeFile(wb, fullFilename);
    return true;
  } catch (error) {
    console.error('导出Excel失败:', error);
    return false;
  }
};

/**
 * 导出表格数据到Excel
 * @param {Array} dataSource - 表格数据源
 * @param {Array} columns - 表格列配置
 * @param {string} filename - 文件名
 * @param {Object} options - 导出选项
 */
export const exportTableToExcel = (dataSource, columns, filename = 'table_export', options = {}) => {
  const {
    sheetName = 'Sheet1',
    includeIndex = false,
    dateFormat = 'YYYY-MM-DD',
    excludeColumns = [], // 要排除的列的dataIndex
  } = options;

  try {
    // 过滤要导出的列
    const exportColumns = columns.filter(col => 
      col.dataIndex && !excludeColumns.includes(col.dataIndex)
    );

    // 构建表头
    const headers = {};
    if (includeIndex) {
      headers['序号'] = '序号';
    }
    exportColumns.forEach(col => {
      headers[col.dataIndex] = col.title;
    });

    // 构建数据行
    const exportData = dataSource.map((row, index) => {
      const exportRow = {};
      
      if (includeIndex) {
        exportRow['序号'] = index + 1;
      }
      
      exportColumns.forEach(col => {
        let value = row[col.dataIndex];
        
        // 处理日期格式
        if (col.dataIndex.includes('Date') || col.dataIndex.includes('date')) {
          value = value ? formatDate(value, dateFormat) : '';
        }
        
        // 处理数组类型的值
        if (Array.isArray(value)) {
          value = value.join(', ');
        }
        
        // 处理对象类型的值
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        
        exportRow[col.dataIndex] = value || '';
      });
      
      return exportRow;
    });

    // 添加表头到数据开头
    const finalData = [headers, ...exportData];
    
    return exportToExcel(finalData, filename, sheetName);
  } catch (error) {
    console.error('导出表格数据失败:', error);
    return false;
  }
};

/**
 * 导出带有动态列的表格数据（如日期列）
 * @param {Array} dataSource - 表格数据源
 * @param {Array} staticColumns - 静态列配置
 * @param {Array} dynamicColumns - 动态列配置
 * @param {string} filename - 文件名
 * @param {Object} options - 导出选项
 */
export const exportDynamicTableToExcel = (
  dataSource, 
  staticColumns, 
  dynamicColumns, 
  filename = 'dynamic_table_export',
  options = {}
) => {
  const {
    sheetName = 'Sheet1',
    includeIndex = false,
    dateFormat = 'YYYY-MM-DD',
  } = options;

  try {
    // 构建完整的列配置
    const allColumns = [...staticColumns, ...dynamicColumns];
    
    // 构建表头
    const headers = {};
    if (includeIndex) {
      headers['序号'] = '序号';
    }
    
    allColumns.forEach(col => {
      if (col.dataIndex) {
        headers[col.dataIndex] = col.title;
      }
    });

    // 构建数据行
    const exportData = dataSource.map((row, index) => {
      const exportRow = {};
      
      if (includeIndex) {
        exportRow['序号'] = index + 1;
      }
      
      allColumns.forEach(col => {
        if (col.dataIndex) {
          let value = row[col.dataIndex];
          
          // 处理日期格式
          if (col.dataIndex.includes('Date') || col.dataIndex.includes('date')) {
            value = value ? formatDate(value, dateFormat) : '';
          }
          
          // 处理数组类型的值（如动态日期列的数据）
          if (Array.isArray(value)) {
            value = value.join(', ');
          }
          
          exportRow[col.dataIndex] = value || '';
        }
      });
      
      return exportRow;
    });

    // 添加表头到数据开头
    const finalData = [headers, ...exportData];
    
    return exportToExcel(finalData, filename, sheetName);
  } catch (error) {
    console.error('导出动态表格数据失败:', error);
    return false;
  }
};

/**
 * 通用的数据导出函数
 * @param {Array} data - 要导出的数据
 * @param {string} filename - 文件名
 * @param {Object} options - 导出选项
 */
export const exportData = (data, filename = 'data_export', options = {}) => {
  const {
    format = 'excel', // 支持 'excel', 'csv'
    sheetName = 'Sheet1',
  } = options;

  switch (format.toLowerCase()) {
    case 'excel':
      return exportToExcel(data, filename, sheetName);
    case 'csv':
      // 可以扩展CSV导出功能
      console.warn('CSV导出功能待实现');
      return false;
    default:
      console.error('不支持的导出格式:', format);
      return false;
  }
};