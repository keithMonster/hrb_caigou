import React from 'react';
import { Space, Button, Dropdown, Tooltip } from 'antd';
import {
  SaveOutlined,
  DownloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  MoreOutlined,
  CheckOutlined,
  CloseOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  ImportOutlined
} from '@ant-design/icons';
import './index.css';

const ActionBar = ({
  children,
  align = 'right',
  size = 'middle',
  // 基础按钮
  showSave = false,
  showExport = false,
  showAdd = false,
  showEdit = false,
  showDelete = false,
  showRefresh = false,
  showSearch = false,
  showFilter = false,
  showSettings = false,
  showPrint = false,
  showImport = false,
  // 业务按钮
  showApprove = false,
  showReject = false,
  showSubmit = false,
  showCancel = false,
  // 事件处理
  onSave,
  onExport,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  onSearch,
  onFilter,
  onSettings,
  onPrint,
  onImport,
  onApprove,
  onReject,
  onSubmit,
  onCancel,
  // 按钮文本
  saveText = '保存',
  exportText = '导出',
  addText = '新增',
  editText = '编辑',
  deleteText = '删除',
  refreshText = '刷新',
  searchText = '搜索',
  filterText = '筛选',
  settingsText = '设置',
  printText = '打印',
  importText = '导入',
  approveText = '审批通过',
  rejectText = '审批拒绝',
  submitText = '提交',
  cancelText = '取消',
  // 按钮属性
  saveProps = {},
  exportProps = {},
  addProps = {},
  editProps = {},
  deleteProps = {},
  refreshProps = {},
  searchProps = {},
  filterProps = {},
  settingsProps = {},
  printProps = {},
  importProps = {},
  approveProps = {},
  rejectProps = {},
  submitProps = {},
  cancelProps = {},
  // 导出选项
  exportOptions = [],
  // 更多操作
  moreActions = [],
  // 其他属性
  className = '',
  loading = false,
  disabled = false,
  ...restProps
}) => {
  // 导出按钮处理
  const renderExportButton = () => {
    if (!showExport) return null;
    
    if (exportOptions.length > 0) {
      const exportMenuItems = exportOptions.map((option, index) => ({
        key: index,
        label: option.label,
        icon: option.icon,
        onClick: option.onClick
      }));
      
      return (
        <Dropdown
          menu={{ items: exportMenuItems }}
          placement="bottomRight"
          disabled={disabled || loading}
        >
          <Button
            icon={<DownloadOutlined />}
            size={size}
            loading={loading}
            disabled={disabled}
            {...exportProps}
          >
            {exportText}
          </Button>
        </Dropdown>
      );
    }
    
    return (
      <Button
        icon={<DownloadOutlined />}
        onClick={onExport}
        size={size}
        loading={loading}
        disabled={disabled}
        {...exportProps}
      >
        {exportText}
      </Button>
    );
  };
  
  // 更多操作按钮
  const renderMoreActions = () => {
    if (moreActions.length === 0) return null;
    
    const moreMenuItems = moreActions.map((action, index) => ({
      key: index,
      label: action.label,
      icon: action.icon,
      onClick: action.onClick,
      disabled: action.disabled
    }));
    
    return (
      <Dropdown
        menu={{ items: moreMenuItems }}
        placement="bottomRight"
        disabled={disabled || loading}
      >
        <Button
          icon={<MoreOutlined />}
          size={size}
          disabled={disabled}
        >
          更多
        </Button>
      </Dropdown>
    );
  };
  
  const defaultButtons = (
    <>
      {/* 主要操作按钮 */}
      {showAdd && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
          size={size}
          loading={loading}
          disabled={disabled}
          {...addProps}
        >
          {addText}
        </Button>
      )}
      
      {showEdit && (
        <Button
          icon={<EditOutlined />}
          onClick={onEdit}
          size={size}
          loading={loading}
          disabled={disabled}
          {...editProps}
        >
          {editText}
        </Button>
      )}
      
      {showSave && (
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={onSave}
          size={size}
          loading={loading}
          disabled={disabled}
          {...saveProps}
        >
          {saveText}
        </Button>
      )}
      
      {showSubmit && (
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={onSubmit}
          size={size}
          loading={loading}
          disabled={disabled}
          {...submitProps}
        >
          {submitText}
        </Button>
      )}
      
      {/* 业务操作按钮 */}
      {showApprove && (
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={onApprove}
          size={size}
          loading={loading}
          disabled={disabled}
          {...approveProps}
        >
          {approveText}
        </Button>
      )}
      
      {showReject && (
        <Button
          danger
          icon={<CloseOutlined />}
          onClick={onReject}
          size={size}
          loading={loading}
          disabled={disabled}
          {...rejectProps}
        >
          {rejectText}
        </Button>
      )}
      
      {/* 工具按钮 */}
      {showImport && (
        <Button
          icon={<ImportOutlined />}
          onClick={onImport}
          size={size}
          loading={loading}
          disabled={disabled}
          {...importProps}
        >
          {importText}
        </Button>
      )}
      
      {renderExportButton()}
      
      {showPrint && (
        <Button
          icon={<PrinterOutlined />}
          onClick={onPrint}
          size={size}
          loading={loading}
          disabled={disabled}
          {...printProps}
        >
          {printText}
        </Button>
      )}
      
      {showSearch && (
        <Button
          icon={<SearchOutlined />}
          onClick={onSearch}
          size={size}
          loading={loading}
          disabled={disabled}
          {...searchProps}
        >
          {searchText}
        </Button>
      )}
      
      {showFilter && (
        <Button
          icon={<FilterOutlined />}
          onClick={onFilter}
          size={size}
          loading={loading}
          disabled={disabled}
          {...filterProps}
        >
          {filterText}
        </Button>
      )}
      
      {showRefresh && (
        <Tooltip title={refreshText}>
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            size={size}
            loading={loading}
            disabled={disabled}
            {...refreshProps}
          />
        </Tooltip>
      )}
      
      {showDelete && (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={onDelete}
          size={size}
          loading={loading}
          disabled={disabled}
          {...deleteProps}
        >
          {deleteText}
        </Button>
      )}
      
      {showCancel && (
        <Button
          icon={<CloseOutlined />}
          onClick={onCancel}
          size={size}
          loading={loading}
          disabled={disabled}
          {...cancelProps}
        >
          {cancelText}
        </Button>
      )}
      
      {showSettings && (
        <Tooltip title={settingsText}>
          <Button
            icon={<SettingOutlined />}
            onClick={onSettings}
            size={size}
            loading={loading}
            disabled={disabled}
            {...settingsProps}
          />
        </Tooltip>
      )}
      
      {renderMoreActions()}
    </>
  );

  return (
    <div className={`action-bar action-bar-${align} ${className}`} {...restProps}>
      <Space size={size}>
        {children}
        {defaultButtons}
      </Space>
    </div>
  );
};

export default ActionBar;