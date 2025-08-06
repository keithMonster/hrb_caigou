import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { filterTableData } from '../utils';

/**
 * 表格数据管理Hook
 * @param {Object} options - 配置选项
 * @returns {Object} 表格数据管理相关的状态和方法
 */
export const useTableData = (options = {}) => {
  const {
    initialData = [],
    filterKeys = [],
    autoFilter = true,
    onDataChange,
  } = options;

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState(initialData);
  const [filteredDataSource, setFilteredDataSource] = useState(initialData);
  const [filters, setFilters] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  // 更新数据源
  const updateDataSource = useCallback((newData) => {
    setDataSource(newData);
    onDataChange?.(newData);
  }, [onDataChange]);

  // 应用过滤器
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    if (autoFilter) {
      const filtered = filterTableData(dataSource, newFilters, filterKeys);
      setFilteredDataSource(filtered);
    }
  }, [dataSource, filterKeys, autoFilter]);

  // 重置过滤器
  const resetFilters = useCallback(() => {
    setFilters({});
    setFilteredDataSource(dataSource);
  }, [dataSource]);

  // 添加数据项
  const addItem = useCallback((item) => {
    const newData = [...dataSource, { ...item, key: item.key || Date.now() }];
    updateDataSource(newData);
  }, [dataSource, updateDataSource]);

  // 更新数据项
  const updateItem = useCallback((key, updates) => {
    const newData = dataSource.map(item => 
      item.key === key ? { ...item, ...updates } : item
    );
    updateDataSource(newData);
  }, [dataSource, updateDataSource]);

  // 删除数据项
  const deleteItem = useCallback((key) => {
    const newData = dataSource.filter(item => item.key !== key);
    updateDataSource(newData);
  }, [dataSource, updateDataSource]);

  // 批量删除
  const deleteItems = useCallback((keys) => {
    const newData = dataSource.filter(item => !keys.includes(item.key));
    updateDataSource(newData);
    setSelectedRowKeys([]);
    setSelectedRows([]);
  }, [dataSource, updateDataSource]);

  // 获取选中的数据
  const getSelectedData = useCallback(() => {
    return selectedRows;
  }, [selectedRows]);

  // 清空选择
  const clearSelection = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  }, []);

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      if (selected) {
        const allKeys = filteredDataSource.map(item => item.key);
        setSelectedRowKeys(allKeys);
        setSelectedRows(filteredDataSource);
      } else {
        clearSelection();
      }
    },
  };

  // 当数据源变化时，重新应用过滤器
  useEffect(() => {
    if (autoFilter && Object.keys(filters).length > 0) {
      const filtered = filterTableData(dataSource, filters, filterKeys);
      setFilteredDataSource(filtered);
    } else {
      setFilteredDataSource(dataSource);
    }
  }, [dataSource, filters, filterKeys, autoFilter]);

  return {
    // 状态
    loading,
    dataSource,
    filteredDataSource,
    filters,
    selectedRowKeys,
    selectedRows,
    
    // 方法
    setLoading,
    updateDataSource,
    applyFilters,
    resetFilters,
    addItem,
    updateItem,
    deleteItem,
    deleteItems,
    getSelectedData,
    clearSelection,
    
    // 配置
    rowSelection,
  };
};

export default useTableData;