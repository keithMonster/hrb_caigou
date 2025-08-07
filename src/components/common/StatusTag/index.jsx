import React from 'react';
import { Tag, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  MinusCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import {
  getOrderStatusConfig,
  getPurchaseStatusConfig,
  getQualityStatusConfig,
  getWarehouseStatusConfig,
  getContractStatusConfig,
  getShippingStatusConfig,
  getPriorityConfig,
  getMaterialTypeConfig,
  getProductionSourceConfig
} from '@/utils/businessUtils';
import './index.css';

/**
 * 状态标签组件
 * 支持多种业务状态的显示，自动匹配颜色和图标
 */
const StatusTag = ({
  status,
  type = 'default', // 状态类型：order, purchase, quality, warehouse, contract, shipping, priority, material, production
  showIcon = true,
  showTooltip = false,
  tooltipContent,
  size = 'default',
  bordered = true,
  className = '',
  style = {},
  onClick,
  ...restProps
}) => {
  // 根据类型获取状态配置
  const getStatusConfigByType = (status, type) => {
    switch (type) {
      case 'order':
        return getOrderStatusConfig(status);
      case 'purchase':
        return getPurchaseStatusConfig(status);
      case 'quality':
        return getQualityStatusConfig(status);
      case 'warehouse':
        return getWarehouseStatusConfig(status);
      case 'contract':
        return getContractStatusConfig(status);
      case 'shipping':
        return getShippingStatusConfig(status);
      case 'priority':
        return getPriorityConfig(status);
      case 'material':
        return getMaterialTypeConfig(status);
      case 'production':
        return getProductionSourceConfig(status);
      default:
        return null;
    }
  };

  // 默认状态图标映射
  const defaultIconMap = {
    success: <CheckCircleOutlined />,
    processing: <SyncOutlined spin />,
    warning: <ExclamationCircleOutlined />,
    error: <CloseCircleOutlined />,
    default: <MinusCircleOutlined />,
    pending: <ClockCircleOutlined />,
    unknown: <QuestionCircleOutlined />
  };

  // 获取状态配置
  const statusConfig = getStatusConfigByType(status, type);
  
  // 如果有配置，使用配置的颜色和文本
  let tagColor = 'default';
  let tagText = status;
  let tagIcon = null;
  
  if (statusConfig) {
    tagColor = statusConfig.color || 'default';
    tagText = statusConfig.label || status;
    tagIcon = statusConfig.icon;
  }
  
  // 如果没有自定义图标，使用默认图标
  if (showIcon && !tagIcon) {
    tagIcon = defaultIconMap[tagColor] || defaultIconMap.default;
  }

  // 构建标签内容
  const tagContent = (
    <>
      {showIcon && tagIcon && <span className="status-tag-icon">{tagIcon}</span>}
      <span className="status-tag-text">{tagText}</span>
    </>
  );

  // 标签属性
  const tagProps = {
    color: tagColor,
    className: `status-tag status-tag-${type} status-tag-${size} ${className}`,
    style,
    bordered,
    onClick,
    ...restProps
  };

  // 如果需要显示提示信息
  if (showTooltip) {
    const tooltip = tooltipContent || statusConfig?.description || tagText;
    return (
      <Tooltip title={tooltip}>
        <Tag {...tagProps}>
          {tagContent}
        </Tag>
      </Tooltip>
    );
  }

  return (
    <Tag {...tagProps}>
      {tagContent}
    </Tag>
  );
};

// 预设的状态标签组件
export const OrderStatusTag = ({ status, ...props }) => (
  <StatusTag status={status} type="order" {...props} />
);

export const PurchaseStatusTag = ({ status, ...props }) => (
  <StatusTag status={status} type="purchase" {...props} />
);

export const QualityStatusTag = ({ status, ...props }) => (
  <StatusTag status={status} type="quality" {...props} />
);

export const WarehouseStatusTag = ({ status, ...props }) => (
  <StatusTag status={status} type="warehouse" {...props} />
);

export const ContractStatusTag = ({ status, ...props }) => (
  <StatusTag status={status} type="contract" {...props} />
);

export const ShippingStatusTag = ({ status, ...props }) => (
  <StatusTag status={status} type="shipping" {...props} />
);

export const PriorityTag = ({ priority, ...props }) => (
  <StatusTag status={priority} type="priority" {...props} />
);

export const MaterialTypeTag = ({ materialType, ...props }) => (
  <StatusTag status={materialType} type="material" {...props} />
);

export const ProductionSourceTag = ({ source, ...props }) => (
  <StatusTag status={source} type="production" {...props} />
);

export default StatusTag;