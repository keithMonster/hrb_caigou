import React, { useEffect, useCallback, useMemo } from 'react';
import {
  Form,
  Card,
  Row,
  Col,
  Space,
  Button,
  Divider,
  Alert,
  Tooltip,
  message
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  UndoOutlined,
  RedoOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useEnhancedForm } from '../../../hooks';
import { ActionBar } from '../index';
import './index.css';

const EnhancedForm = ({
  // 基础配置
  form: externalForm,
  initialValues = {},
  layout = 'vertical',
  size = 'middle',
  
  // 表单项配置
  fields = [],
  columns = 1,
  gutter = [16, 16],
  
  // 验证配置
  validateTrigger = 'onChange',
  validateFirst = false,
  preserve = true,
  
  // 提交配置
  submitText = '保存',
  resetText = '重置',
  showSubmit = true,
  showReset = true,
  submitLoading = false,
  
  // 自动保存配置
  autoSave = false,
  autoSaveInterval = 30000,
  
  // 历史记录配置
  enableHistory = true,
  maxHistorySize = 50,
  
  // 字段依赖配置
  fieldDependencies = {},
  
  // 动态字段配置
  enableDynamicFields = false,
  dynamicFieldsConfig = {},
  
  // 操作栏配置
  actionBar = true,
  actionBarProps = {},
  
  // 工具栏配置
  toolbar = true,
  showPreview = false,
  showHistory = false,
  
  // 样式配置
  title,
  description,
  bordered = true,
  
  // 事件回调
  onSubmit,
  onReset,
  onValuesChange,
  onFieldsChange,
  onAutoSave,
  onValidationError,
  
  // 自定义渲染
  renderToolbarExtra,
  renderFooterExtra,
  
  // 其他配置
  className,
  style,
  ...restProps
}) => {
  // 使用增强版表单Hook
  const {
    form,
    formData,
    isDirty,
    isValid,
    errors,
    loading,
    autoSaveStatus,
    history,
    fieldVisibility,
    fieldDisabled,
    dynamicFields,
    // 操作方法
    handleSubmit,
    handleReset,
    handleValuesChange,
    handleAutoSave,
    undo,
    redo,
    canUndo,
    canRedo,
    addDynamicField,
    removeDynamicField,
    updateFieldVisibility,
    updateFieldDisabled,
    // 验证方法
    validateFields,
    validateField,
    clearValidation,
    // 工具方法
    getFieldValue,
    setFieldValue,
    setFieldsValue,
    resetFields,
    getFieldsValue,
    isFieldTouched,
    getFieldError,
    getFieldsError
  } = useEnhancedForm({
    form: externalForm,
    initialValues,
    autoSave,
    autoSaveInterval,
    enableHistory,
    maxHistorySize,
    fieldDependencies,
    onSubmit,
    onReset,
    onValuesChange,
    onAutoSave,
    onValidationError
  });
  
  // 处理表单提交
  const handleFormSubmit = useCallback(async (values) => {
    try {
      await handleSubmit(values);
      message.success('保存成功');
    } catch (error) {
      message.error(`保存失败: ${error.message}`);
    }
  }, [handleSubmit]);
  
  // 处理表单重置
  const handleFormReset = useCallback(() => {
    handleReset();
    message.info('表单已重置');
  }, [handleReset]);
  
  // 计算列配置
  const colSpan = useMemo(() => {
    return 24 / columns;
  }, [columns]);
  
  // 渲染表单项
  const renderFormItem = useCallback((field, index) => {
    const {
      name,
      label,
      type = 'input',
      component,
      rules = [],
      span = colSpan,
      hidden = false,
      disabled = false,
      tooltip,
      extra,
      dependencies = [],
      ...fieldProps
    } = field;
    
    // 检查字段可见性
    if (hidden || fieldVisibility[name] === false) {
      return null;
    }
    
    // 检查字段禁用状态
    const isDisabled = disabled || fieldDisabled[name] || loading;
    
    // 渲染标签
    const renderLabel = () => {
      if (!label) return null;
      
      return (
        <Space>
          {label}
          {tooltip && (
            <Tooltip title={tooltip}>
              <EyeOutlined style={{ color: '#999' }} />
            </Tooltip>
          )}
        </Space>
      );
    };
    
    return (
      <Col span={span} key={name}>
        <Form.Item
          name={name}
          label={renderLabel()}
          rules={rules}
          dependencies={dependencies}
          extra={extra}
          {...fieldProps}
        >
          {component || renderDefaultComponent(type, { disabled: isDisabled, ...fieldProps })}
        </Form.Item>
      </Col>
    );
  }, [colSpan, fieldVisibility, fieldDisabled, loading]);
  
  // 渲染默认组件
  const renderDefaultComponent = (type, props) => {
    // 这里可以根据type渲染不同的组件
    // 为了简化，这里只返回一个占位符
    return <div>Component for {type}</div>;
  };
  
  // 渲染动态字段
  const renderDynamicFields = () => {
    if (!enableDynamicFields || !dynamicFields.length) return null;
    
    return (
      <>
        <Divider>动态字段</Divider>
        <Row gutter={gutter}>
          {dynamicFields.map((field, index) => (
            <Col span={colSpan} key={`dynamic_${index}`}>
              <Form.Item
                name={field.name}
                label={field.label}
                rules={field.rules}
              >
                {field.component}
              </Form.Item>
              <Button
                type="text"
                danger
                size="small"
                onClick={() => removeDynamicField(index)}
              >
                删除
              </Button>
            </Col>
          ))}
        </Row>
        
        <Button
          type="dashed"
          onClick={() => addDynamicField(dynamicFieldsConfig)}
          style={{ width: '100%', marginTop: 16 }}
        >
          添加字段
        </Button>
      </>
    );
  };
  
  // 渲染工具栏
  const renderToolbar = () => {
    if (!toolbar) return null;
    
    return (
      <div className="enhanced-form-toolbar">
        <div className="toolbar-left">
          {autoSave && (
            <div className="auto-save-status">
              <Space>
                <span>自动保存:</span>
                <span className={`status ${autoSaveStatus}`}>
                  {autoSaveStatus === 'saving' && '保存中...'}
                  {autoSaveStatus === 'saved' && '已保存'}
                  {autoSaveStatus === 'error' && '保存失败'}
                  {autoSaveStatus === 'idle' && '待保存'}
                </span>
              </Space>
            </div>
          )}
        </div>
        
        <div className="toolbar-right">
          <Space>
            {enableHistory && (
              <>
                <Tooltip title="撤销">
                  <Button
                    icon={<UndoOutlined />}
                    disabled={!canUndo}
                    onClick={undo}
                    size="small"
                  />
                </Tooltip>
                
                <Tooltip title="重做">
                  <Button
                    icon={<RedoOutlined />}
                    disabled={!canRedo}
                    onClick={redo}
                    size="small"
                  />
                </Tooltip>
              </>
            )}
            
            {showHistory && (
              <Tooltip title="历史记录">
                <Button
                  icon={<HistoryOutlined />}
                  size="small"
                />
              </Tooltip>
            )}
            
            {showPreview && (
              <Tooltip title="预览">
                <Button
                  icon={<EyeOutlined />}
                  size="small"
                />
              </Tooltip>
            )}
            
            {renderToolbarExtra?.({
              formData,
              isDirty,
              isValid,
              errors
            })}
          </Space>
        </div>
      </div>
    );
  };
  
  // 渲染表单底部
  const renderFooter = () => {
    return (
      <div className="enhanced-form-footer">
        <Row justify="space-between" align="middle">
          <Col>
            {renderFooterExtra?.({
              formData,
              isDirty,
              isValid,
              errors
            })}
          </Col>
          
          <Col>
            <Space>
              {showReset && (
                <Button
                  onClick={handleFormReset}
                  disabled={loading || !isDirty}
                >
                  {resetText}
                </Button>
              )}
              
              {showSubmit && (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitLoading || loading}
                  disabled={!isValid}
                  icon={<SaveOutlined />}
                >
                  {submitText}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>
    );
  };
  
  // 表单容器类名
  const containerClassName = [
    'enhanced-form-container',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={containerClassName} style={style}>
      {title && (
        <div className="form-header">
          <h3>{title}</h3>
          {description && (
            <p className="form-description">{description}</p>
          )}
        </div>
      )}
      
      {actionBar && (
        <ActionBar
          showSave={showSubmit}
          saveText={submitText}
          saveLoading={submitLoading || loading}
          saveDisabled={!isValid}
          onSave={() => form.submit()}
          {...actionBarProps}
        />
      )}
      
      {renderToolbar()}
      
      {errors.length > 0 && (
        <Alert
          type="error"
          message="表单验证失败"
          description={
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          }
          style={{ marginBottom: 16 }}
          closable
        />
      )}
      
      <Card bordered={bordered} className="form-card">
        <Form
          form={form}
          layout={layout}
          size={size}
          initialValues={initialValues}
          validateTrigger={validateTrigger}
          validateFirst={validateFirst}
          preserve={preserve}
          onFinish={handleFormSubmit}
          onValuesChange={handleValuesChange}
          onFieldsChange={onFieldsChange}
          {...restProps}
        >
          <Row gutter={gutter}>
            {fields.map(renderFormItem)}
          </Row>
          
          {renderDynamicFields()}
          
          {(showSubmit || showReset) && (
            <>
              <Divider />
              {renderFooter()}
            </>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default EnhancedForm;