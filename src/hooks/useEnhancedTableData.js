import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import {
  filterByKeyword,
  filterByStatus,
  filterByDateRange,
  filterByNumberRange,
  multiFieldSort,
  sortByDate,
  groupByField,
  getNumberFieldStats,
  calculateSum
} from '@/utils/businessUtils';
import { filterTableData } from '@/utils/tableUtils';

/**
 * 增强版表格数据管理Hook
 * 提供完整的数据管理、筛选、排序、分组、统计等功能
 */
export const useEnhancedTableData = (options = {}) => {
  const {
    // 基础配置
    initialData = [],
    filterKeys = [],
    autoFilter = true,
    enableSelection = true,
    enablePagination = true,
    pageSize = 10,
    
    // 数据源配置
    dataSource: externalDataSource,
    fetchData,
    autoRefresh = false,
    refreshInterval = 30000,
    
    // 筛选配置
    enableSearch = true,
    searchFields = [],
    enableAdvancedFilter = true,
    
    // 排序配置
    enableSort = true,
    defaultSortField,
    defaultSortOrder = 'desc',
    
    // 分组配置
    enableGrouping = false,
    groupField,
    
    // 统计配置
    enableStats = false,
    statsFields = [],
    
    // 事件回调
    onDataChange,
    onSelectionChange,
    onFilterChange,
    onSortChange,
    onError,
    
    // 其他配置
    cacheKey,
    enableCache = false,
    enableUndo = false,
    maxUndoSteps = 10
  } = options;
  
  // 基础状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(initialData);
  const [originalDataSource, setOriginalDataSource] = useState(initialData);
  
  // 筛选和搜索状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filters, setFilters] = useState({});
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [filteredDataSource, setFilteredDataSource] = useState(initialData);
  
  // 排序状态
  const [sortConfig, setSortConfig] = useState(
    defaultSortField ? [{ field: defaultSortField, order: defaultSortOrder }] : []
  );
  const [sortedDataSource, setSortedDataSource] = useState(initialData);
  
  // 分组状态
  const [groupedData, setGroupedData] = useState({});
  const [isGrouped, setIsGrouped] = useState(false);
  
  // 选择状态
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  
  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
  });
  
  // 统计状态
  const [statistics, setStatistics] = useState({});
  
  // 撤销/重做状态
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // 引用
  const refreshTimerRef = useRef(null);
  const cacheRef = useRef(new Map());
  
  // 保存历史记录
  const saveToHistory = useCallback((data) => {
    if (!enableUndo) return;
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(data)));
    
    if (newHistory.length > maxUndoSteps) {
      newHistory.shift();
    } else {
      setHistoryIndex(prev => prev + 1);
    }
    
    setHistory(newHistory);
  }, [history, historyIndex, enableUndo, maxUndoSteps]);
  
  // 撤销操作
  const undo = useCallback(() => {
    if (!enableUndo || historyIndex <= 0) return false;
    
    const prevData = history[historyIndex - 1];
    setDataSource(prevData);
    setOriginalDataSource(prevData);
    setHistoryIndex(prev => prev - 1);
    return true;
  }, [enableUndo, history, historyIndex]);
  
  // 重做操作
  const redo = useCallback(() => {
    if (!enableUndo || historyIndex >= history.length - 1) return false;
    
    const nextData = history[historyIndex + 1];
    setDataSource(nextData);
    setOriginalDataSource(nextData);
    setHistoryIndex(prev => prev + 1);
    return true;
  }, [enableUndo, history, historyIndex]);
  
  // 缓存管理
  const getCachedData = useCallback((key) => {
    if (!enableCache || !key) return null;
    return cacheRef.current.get(key);
  }, [enableCache]);
  
  const setCachedData = useCallback((key, data) => {
    if (!enableCache || !key) return;
    cacheRef.current.set(key, {
      data: JSON.parse(JSON.stringify(data)),
      timestamp: Date.now()
    });
  }, [enableCache]);
  
  // 数据获取
  const loadData = useCallback(async (params = {}) => {
    if (!fetchData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 检查缓存
      const cacheKey = JSON.stringify(params);
      const cached = getCachedData(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < 300000) { // 5分钟缓存
        setDataSource(cached.data);
        setOriginalDataSource(cached.data);
        setLoading(false);
        return;
      }
      
      const result = await fetchData(params);
      const newData = Array.isArray(result) ? result : result.data || [];
      
      setDataSource(newData);
      setOriginalDataSource(newData);
      setCachedData(cacheKey, newData);
      
      if (enableUndo) {
        saveToHistory(newData);
      }
      
      onDataChange?.(newData);
    } catch (err) {
      setError(err.message || '数据加载失败');
      onError?.(err);
      message.error(err.message || '数据加载失败');
    } finally {
      setLoading(false);
    }
  }, [fetchData, getCachedData, setCachedData, enableUndo, saveToHistory, onDataChange, onError]);
  
  // 刷新数据
  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);
  
  // 搜索功能
  const handleSearch = useCallback((keyword) => {
    setSearchKeyword(keyword);
  }, []);
  
  // 应用筛选器
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [onFilterChange]);
  
  // 应用高级筛选器
  const applyAdvancedFilters = useCallback((newAdvancedFilters) => {
    setAdvancedFilters(newAdvancedFilters);
  }, []);
  
  // 重置筛选器
  const resetFilters = useCallback(() => {
    setFilters({});
    setAdvancedFilters({});
    setSearchKeyword('');
  }, []);
  
  // 排序功能
  const handleSort = useCallback((field, order) => {
    const newSortConfig = [{ field, order }];
    setSortConfig(newSortConfig);
    onSortChange?.(field, order);
  }, [onSortChange]);
  
  // 多字段排序
  const handleMultiSort = useCallback((sortConfigs) => {
    setSortConfig(sortConfigs);
  }, []);
  
  // 分组功能
  const toggleGrouping = useCallback((field) => {
    if (isGrouped && groupField === field) {
      setIsGrouped(false);
      setGroupedData({});
    } else {
      setIsGrouped(true);
      setGroupField(field);
    }
  }, [isGrouped, groupField]);
  
  // 数据操作
  const updateDataSource = useCallback((newData) => {
    setDataSource(newData);
    setOriginalDataSource(newData);
    
    if (enableUndo) {
      saveToHistory(newData);
    }
    
    onDataChange?.(newData);
  }, [enableUndo, saveToHistory, onDataChange]);
  
  const addItem = useCallback((item) => {
    const newItem = {
      ...item,
      key: item.key || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    const newData = [...dataSource, newItem];
    updateDataSource(newData);
    message.success('添加成功');
    return newItem;
  }, [dataSource, updateDataSource]);
  
  const updateItem = useCallback((key, updates) => {
    const newData = dataSource.map(item => 
      item.key === key ? { ...item, ...updates } : item
    );
    updateDataSource(newData);
    message.success('更新成功');
  }, [dataSource, updateDataSource]);
  
  const deleteItem = useCallback((key) => {
    const newData = dataSource.filter(item => item.key !== key);
    updateDataSource(newData);
    message.success('删除成功');
  }, [dataSource, updateDataSource]);
  
  const deleteItems = useCallback((keys) => {
    const newData = dataSource.filter(item => !keys.includes(item.key));
    updateDataSource(newData);
    setSelectedRowKeys([]);
    setSelectedRows([]);
    message.success(`删除了 ${keys.length} 条记录`);
  }, [dataSource, updateDataSource]);
  
  // 批量操作
  const batchUpdate = useCallback((updates) => {
    const newData = dataSource.map(item => 
      selectedRowKeys.includes(item.key) ? { ...item, ...updates } : item
    );
    updateDataSource(newData);
    message.success(`批量更新了 ${selectedRowKeys.length} 条记录`);
  }, [dataSource, selectedRowKeys, updateDataSource]);
  
  // 选择管理
  const clearSelection = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  }, []);
  
  const selectAll = useCallback(() => {
    const allKeys = filteredDataSource.map(item => item.key);
    setSelectedRowKeys(allKeys);
    setSelectedRows(filteredDataSource);
  }, [filteredDataSource]);
  
  const selectNone = useCallback(() => {
    clearSelection();
  }, [clearSelection]);
  
  const invertSelection = useCallback(() => {
    const allKeys = filteredDataSource.map(item => item.key);
    const newSelectedKeys = allKeys.filter(key => !selectedRowKeys.includes(key));
    const newSelectedRows = filteredDataSource.filter(item => newSelectedKeys.includes(item.key));
    setSelectedRowKeys(newSelectedKeys);
    setSelectedRows(newSelectedRows);
  }, [filteredDataSource, selectedRowKeys]);
  
  // 分页处理
  const handlePaginationChange = useCallback((page, size) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: size
    }));
  }, []);
  
  // 数据处理流水线
  useEffect(() => {
    let processedData = [...dataSource];
    
    // 1. 搜索筛选
    if (enableSearch && searchKeyword && searchFields.length > 0) {
      processedData = filterByKeyword(processedData, searchKeyword, searchFields);
    }
    
    // 2. 基础筛选
    if (autoFilter && Object.keys(filters).length > 0) {
      processedData = filterTableData(processedData, filters, filterKeys);
    }
    
    // 3. 高级筛选
    if (enableAdvancedFilter && Object.keys(advancedFilters).length > 0) {
      Object.entries(advancedFilters).forEach(([key, value]) => {
        if (!value) return;
        
        if (key.endsWith('_status')) {
          processedData = filterByStatus(processedData, value, key.replace('_status', ''));
        } else if (key.endsWith('_date_range')) {
          processedData = filterByDateRange(processedData, value, key.replace('_date_range', ''));
        } else if (key.endsWith('_number_range')) {
          processedData = filterByNumberRange(processedData, value, key.replace('_number_range', ''));
        }
      });
    }
    
    setFilteredDataSource(processedData);
  }, [dataSource, searchKeyword, searchFields, filters, advancedFilters, filterKeys, autoFilter, enableSearch, enableAdvancedFilter]);
  
  // 排序处理
  useEffect(() => {
    let sortedData = [...filteredDataSource];
    
    if (enableSort && sortConfig.length > 0) {
      if (sortConfig.length === 1 && sortConfig[0].field.includes('date')) {
        sortedData = sortByDate(sortedData, sortConfig[0].field, sortConfig[0].order);
      } else {
        sortedData = multiFieldSort(sortedData, sortConfig);
      }
    }
    
    setSortedDataSource(sortedData);
  }, [filteredDataSource, sortConfig, enableSort]);
  
  // 分组处理
  useEffect(() => {
    if (enableGrouping && isGrouped && groupField) {
      const grouped = groupByField(sortedDataSource, groupField);
      setGroupedData(grouped);
    } else {
      setGroupedData({});
    }
  }, [sortedDataSource, isGrouped, groupField, enableGrouping]);
  
  // 统计计算
  useEffect(() => {
    if (enableStats && statsFields.length > 0) {
      const stats = {};
      
      statsFields.forEach(field => {
        if (typeof field === 'string') {
          stats[field] = getNumberFieldStats(sortedDataSource, field);
        } else if (field.type === 'sum') {
          stats[field.key] = calculateSum(sortedDataSource.map(item => item[field.field]));
        }
      });
      
      setStatistics(stats);
    }
  }, [sortedDataSource, enableStats, statsFields]);
  
  // 分页更新
  useEffect(() => {
    if (enablePagination) {
      setPagination(prev => ({
        ...prev,
        total: sortedDataSource.length
      }));
    }
  }, [sortedDataSource, enablePagination]);
  
  // 选择变化回调
  useEffect(() => {
    onSelectionChange?.(selectedRowKeys, selectedRows);
  }, [selectedRowKeys, selectedRows, onSelectionChange]);
  
  // 自动刷新
  useEffect(() => {
    if (autoRefresh && fetchData) {
      refreshTimerRef.current = setInterval(() => {
        loadData();
      }, refreshInterval);
      
      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [autoRefresh, fetchData, loadData, refreshInterval]);
  
  // 外部数据源变化
  useEffect(() => {
    if (externalDataSource) {
      setDataSource(externalDataSource);
      setOriginalDataSource(externalDataSource);
    }
  }, [externalDataSource]);
  
  // 初始化数据加载
  useEffect(() => {
    if (fetchData) {
      loadData();
    }
  }, []);
  
  // 行选择配置
  const rowSelection = enableSelection ? {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      if (selected) {
        selectAll();
      } else {
        selectNone();
      }
    },
    getCheckboxProps: (record) => ({
      disabled: record.disabled,
      name: record.name,
    }),
  } : undefined;
  
  // 获取当前显示的数据
  const getCurrentPageData = useCallback(() => {
    if (!enablePagination) return sortedDataSource;
    
    const { current, pageSize } = pagination;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    
    return sortedDataSource.slice(start, end);
  }, [sortedDataSource, pagination, enablePagination]);
  
  return {
    // 基础状态
    loading,
    error,
    dataSource: sortedDataSource,
    originalDataSource,
    filteredDataSource,
    
    // 搜索和筛选
    searchKeyword,
    filters,
    advancedFilters,
    
    // 排序
    sortConfig,
    
    // 分组
    groupedData,
    isGrouped,
    
    // 选择
    selectedRowKeys,
    selectedRows,
    
    // 分页
    pagination,
    
    // 统计
    statistics,
    
    // 历史记录
    canUndo: enableUndo && historyIndex > 0,
    canRedo: enableUndo && historyIndex < history.length - 1,
    
    // 数据操作方法
    loadData,
    refreshData,
    updateDataSource,
    addItem,
    updateItem,
    deleteItem,
    deleteItems,
    batchUpdate,
    
    // 搜索和筛选方法
    handleSearch,
    applyFilters,
    applyAdvancedFilters,
    resetFilters,
    
    // 排序方法
    handleSort,
    handleMultiSort,
    
    // 分组方法
    toggleGrouping,
    
    // 选择方法
    clearSelection,
    selectAll,
    selectNone,
    invertSelection,
    
    // 分页方法
    handlePaginationChange,
    getCurrentPageData,
    
    // 历史记录方法
    undo,
    redo,
    
    // 配置
    rowSelection,
    
    // 工具方法
    getSelectedData: () => selectedRows,
    getFilteredData: () => filteredDataSource,
    getSortedData: () => sortedDataSource,
    getGroupedData: () => groupedData,
    getStatistics: () => statistics,
  };
};

export default useEnhancedTableData;