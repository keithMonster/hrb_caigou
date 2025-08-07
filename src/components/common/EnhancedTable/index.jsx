import React, { useState, useCallback, useMemo } from 'react';
import { Table, Card, Space, Button, Tooltip, Dropdown, message } from 'antd';
import {
  ReloadOutlined,
  SettingOutlined,
  DownloadOutlined,
  UploadOutlined,
  FilterOutlined,
  ColumnHeightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import { ActionBar, SearchInput, StatusTag } from '../index';
import { useEnhancedTableData } from '../../../hooks';
import { exportToExcel, exportToPDF } from '../../../utils';
import './index.css';

const EnhancedTable = ({
  // 基础配置
  columns = [],
  dataSource = [],
  loading = false,
  title,
  
  // 表格配置
  rowKey = 'id',
  size = 'middle',
  bordered = false,
  showHeader = true,
  scroll,
  
  // 分页配置
  pagination = true,
  pageSize = 10,
  showSizeChanger = true,
  showQuickJumper = true,
  showTotal = true,
  
  // 选择配置
  rowSelection = true,
  selectionType = 'checkbox',
  
  // 搜索配置
  searchable = true,
  searchFields = [],
  searchPlaceholder = '请输入搜索关键词',
  
  // 筛选配置
  filterable = true,
  filterFields = [],
  
  // 排序配置
  sortable = true,
  defaultSorter,
  
  // 导出配置
  exportable = true,
  exportFormats = ['excel', 'pdf'],
  exportFileName,
  
  // 操作栏配置
  actionBar = true,
  actionBarProps = {},
  
  // 工具栏配置
  toolbar = true,
  toolbarExtra,
  
  // 列配置
  columnSettings = true,
  resizable = true,
  
  // 全屏配置
  fullscreenable = true,
  
  // 刷新配置
  refreshable = true,
  
  // 事件回调
  onRefresh,
  onExport,
  onSearch,
  onFilter,
  onSelectionChange,
  onRowClick,
  onRowDoubleClick,
  
  // 自定义渲染
  renderToolbarExtra,
  renderRowActions,
  
  // 其他配置
  className,
  style,
  ...restProps
}) => {
  // 状态管理
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [tableSize, setTableSize] = useState(size);
  
  // 使用增强版表格数据Hook
  const {
    data,
    filteredData,
    selectedRows,
    selectedRowKeys,
    loading: dataLoading,
    pagination: paginationState,
    sorter,
    filters,
    searchKeyword,
    // 操作方法
    handleSearch,
    handleFilter,
    handleSort,
    handlePageChange,
    handleSelectionChange: handleSelection,
    handleRefresh,
    clearSelection,
    // 统计信息
    statistics
  } = useEnhancedTableData({
    initialData: dataSource,
    pageSize,
    searchFields,
    filterFields,
    defaultSorter,
    onRefresh,
    onSearch,
    onFilter,
    onSelectionChange
  });
  
  // 处理列配置
  const enhancedColumns = useMemo(() => {
    return columns.map(col => {
      const column = { ...col };
      
      // 添加排序功能
      if (sortable && col.sortable !== false) {
        column.sorter = col.sorter || true;
      }
      
      // 添加筛选功能
      if (filterable && col.filterable !== false && col.filters) {
        column.filterDropdown = col.filterDropdown;
        column.onFilter = col.onFilter;
      }
      
      // 添加状态标签渲染
      if (col.statusType) {
        const originalRender = column.render;
        column.render = (value, record, index) => {
          const statusValue = originalRender ? originalRender(value, record, index) : value;
          return (
            <StatusTag
              type={col.statusType}
              status={statusValue}
              showIcon={col.showStatusIcon}
              size={col.statusSize}
            />
          );
        };
      }
      
      // 处理列可见性
      if (columnVisibility[col.key] === false) {
        return null;
      }
      
      return column;
    }).filter(Boolean);
  }, [columns, sortable, filterable, columnVisibility]);
  
  // 行选择配置
  const rowSelectionConfig = useMemo(() => {
    if (!rowSelection) return null;
    
    return {
      type: selectionType,
      selectedRowKeys,
      onChange: handleSelection,
      onSelectAll: (selected, selectedRows, changeRows) => {
        handleSelection(selected ? data.map(item => item[rowKey]) : [], selectedRows);
      },
      getCheckboxProps: (record) => ({
        disabled: record.disabled,
        name: record.name,
      }),
    };
  }, [rowSelection, selectionType, selectedRowKeys, handleSelection, data, rowKey]);
  
  // 分页配置
  const paginationConfig = useMemo(() => {
    if (!pagination) return false;
    
    return {
      ...paginationState,
      showSizeChanger,
      showQuickJumper,
      showTotal: showTotal ? (total, range) => 
        `第 ${range[0]}-${range[1]} 条/共 ${total} 条` : false,
      onChange: handlePageChange,
      onShowSizeChange: handlePageChange,
    };
  }, [pagination, paginationState, showSizeChanger, showQuickJumper, showTotal, handlePageChange]);
  
  // 导出功能
  const handleExport = useCallback(async (format) => {
    try {
      const fileName = exportFileName || `表格数据_${new Date().toLocaleDateString()}`;
      const exportData = selectedRowKeys.length > 0 ? selectedRows : filteredData;
      
      if (format === 'excel') {
        await exportToExcel(exportData, enhancedColumns, fileName);
      } else if (format === 'pdf') {
        await exportToPDF(exportData, enhancedColumns, fileName);
      }
      
      message.success(`导出${format.toUpperCase()}成功`);
      onExport?.(format, exportData);
    } catch (error) {
      message.error(`导出失败: ${error.message}`);
    }
  }, [selectedRowKeys, selectedRows, filteredData, enhancedColumns, exportFileName, onExport]);
  
  // 列设置菜单
  const columnSettingsMenu = {
    items: enhancedColumns.map(col => ({
      key: col.key,
      label: (
        <Space>
          {columnVisibility[col.key] !== false ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          {col.title}
        </Space>
      ),
      onClick: () => {
        setColumnVisibility(prev => ({
          ...prev,
          [col.key]: prev[col.key] !== false ? false : true
        }));
      }
    }))
  };
  
  // 表格尺寸菜单
  const sizeMenu = {
    items: [
      { key: 'small', label: '紧凑' },
      { key: 'middle', label: '默认' },
      { key: 'large', label: '宽松' }
    ],
    onClick: ({ key }) => setTableSize(key)
  };
  
  // 导出菜单
  const exportMenu = {
    items: exportFormats.map(format => ({
      key: format,
      label: format.toUpperCase(),
      onClick: () => handleExport(format)
    }))
  };
  
  // 工具栏
  const renderToolbar = () => {
    if (!toolbar) return null;
    
    return (
      <div className="enhanced-table-toolbar">
        <div className="toolbar-left">
          {searchable && (
            <SearchInput
              placeholder={searchPlaceholder}
              value={searchKeyword}
              onChange={handleSearch}
              onFilter={handleFilter}
              filterFields={filterFields}
              style={{ width: 300 }}
            />
          )}
        </div>
        
        <div className="toolbar-right">
          <Space>
            {refreshable && (
              <Tooltip title="刷新">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={dataLoading}
                />
              </Tooltip>
            )}
            
            {exportable && exportFormats.length > 0 && (
              <Dropdown menu={exportMenu} placement="bottomRight">
                <Button icon={<DownloadOutlined />}>
                  导出
                </Button>
              </Dropdown>
            )}
            
            {columnSettings && (
              <Dropdown menu={columnSettingsMenu} placement="bottomRight">
                <Button icon={<SettingOutlined />} />
              </Dropdown>
            )}
            
            <Dropdown menu={sizeMenu} placement="bottomRight">
              <Button icon={<ColumnHeightOutlined />} />
            </Dropdown>
            
            {fullscreenable && (
              <Tooltip title={isFullscreen ? '退出全屏' : '全屏'}>
                <Button
                  icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                />
              </Tooltip>
            )}
            
            {renderToolbarExtra?.({
              selectedRows,
              selectedRowKeys,
              statistics,
              clearSelection
            })}
            
            {toolbarExtra}
          </Space>
        </div>
      </div>
    );
  };
  
  // 表格容器类名
  const containerClassName = [
    'enhanced-table-container',
    isFullscreen && 'fullscreen',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={containerClassName} style={style}>
      {title && (
        <div className="table-header">
          <h3>{title}</h3>
          {statistics && (
            <div className="table-statistics">
              <Space>
                <span>总计: {statistics.total}</span>
                {selectedRowKeys.length > 0 && (
                  <span>已选: {selectedRowKeys.length}</span>
                )}
              </Space>
            </div>
          )}
        </div>
      )}
      
      {actionBar && (
        <ActionBar
          selectedCount={selectedRowKeys.length}
          onClearSelection={clearSelection}
          {...actionBarProps}
        />
      )}
      
      {renderToolbar()}
      
      <Card className="table-card" bodyStyle={{ padding: 0 }}>
        <Table
          columns={enhancedColumns}
          dataSource={filteredData}
          loading={loading || dataLoading}
          rowKey={rowKey}
          size={tableSize}
          bordered={bordered}
          showHeader={showHeader}
          scroll={scroll}
          pagination={paginationConfig}
          rowSelection={rowSelectionConfig}
          onRow={(record, index) => ({
            onClick: () => onRowClick?.(record, index),
            onDoubleClick: () => onRowDoubleClick?.(record, index),
          })}
          {...restProps}
        />
      </Card>
    </div>
  );
};

export default EnhancedTable;