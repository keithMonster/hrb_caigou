import React from 'react';
import { Space, Button } from 'antd';
import { SaveOutlined, DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import './index.css';

const ActionBar = ({
  children,
  align = 'right',
  showSave = false,
  showExport = false,
  showAdd = false,
  onSave,
  onExport,
  onAdd,
  saveText = '保存',
  exportText = '导出',
  addText = '新增',
  saveProps = {},
  exportProps = {},
  addProps = {},
  className = '',
  ...restProps
}) => {
  const defaultButtons = (
    <>
      {showAdd && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
          {...addProps}
        >
          {addText}
        </Button>
      )}
      {showSave && (
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={onSave}
          {...saveProps}
        >
          {saveText}
        </Button>
      )}
      {showExport && (
        <Button
          icon={<DownloadOutlined />}
          onClick={onExport}
          {...exportProps}
        >
          {exportText}
        </Button>
      )}
    </>
  );

  return (
    <div className={`action-bar action-bar-${align} ${className}`} {...restProps}>
      <Space>
        {children}
        {defaultButtons}
      </Space>
    </div>
  );
};

export default ActionBar;