import { useState, useEffect, useCallback, useRef } from 'react';
import { Form, message } from 'antd';
import {
  createRequiredRule,
  createNumberRule,
  createEmailRule,
  createPhoneRule,
  createUrlRule,
  createDateRule,
  createCustomRule,
  validateForm
} from '@/utils/validationUtils';

/**
 * 增强版表单管理Hook
 * 提供完整的表单状态管理、验证、提交等功能
 */
export const useEnhancedForm = (options = {}) => {
  const {
    // 基础配置
    initialValues = {},
    validationRules = {},
    
    // 表单配置
    layout = 'vertical',
    size = 'middle',
    disabled = false,
    
    // 提交配置
    onSubmit,
    onSubmitSuccess,
    onSubmitError,
    submitText = '提交',
    resetAfterSubmit = false,
    
    // 验证配置
    validateOnChange = true,
    validateOnBlur = true,
    validateTrigger = ['onChange', 'onBlur'],
    
    // 自动保存配置
    enableAutoSave = false,
    autoSaveInterval = 30000,
    autoSaveKey,
    
    // 字段依赖配置
    fieldDependencies = {},
    
    // 动态字段配置
    enableDynamicFields = false,
    dynamicFieldsConfig = {},
    
    // 其他配置
    enableUndo = false,
    maxUndoSteps = 10,
    onValuesChange,
    onFieldsChange,
    onFinish,
    onFinishFailed
  } = options;
  
  // 创建表单实例
  const [form] = Form.useForm();
  
  // 基础状态
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  
  // 动态字段状态
  const [dynamicFields, setDynamicFields] = useState([]);
  const [fieldVisibility, setFieldVisibility] = useState({});
  const [fieldDisabled, setFieldDisabled] = useState({});
  
  // 历史记录状态
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // 引用
  const autoSaveTimerRef = useRef(null);
  const initialValuesRef = useRef(initialValues);
  
  // 保存历史记录
  const saveToHistory = useCallback((formValues) => {
    if (!enableUndo) return;
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(formValues)));
    
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
    
    const prevValues = history[historyIndex - 1];
    form.setFieldsValue(prevValues);
    setValues(prevValues);
    setHistoryIndex(prev => prev - 1);
    return true;
  }, [enableUndo, history, historyIndex, form]);
  
  // 重做操作
  const redo = useCallback(() => {
    if (!enableUndo || historyIndex >= history.length - 1) return false;
    
    const nextValues = history[historyIndex + 1];
    form.setFieldsValue(nextValues);
    setValues(nextValues);
    setHistoryIndex(prev => prev + 1);
    return true;
  }, [enableUndo, history, historyIndex, form]);
  
  // 自动保存
  const autoSave = useCallback(() => {
    if (!enableAutoSave || !autoSaveKey) return;
    
    const currentValues = form.getFieldsValue();
    localStorage.setItem(autoSaveKey, JSON.stringify({
      values: currentValues,
      timestamp: Date.now()
    }));
  }, [enableAutoSave, autoSaveKey, form]);
  
  // 恢复自动保存的数据
  const restoreAutoSavedData = useCallback(() => {
    if (!enableAutoSave || !autoSaveKey) return false;
    
    try {
      const saved = localStorage.getItem(autoSaveKey);
      if (saved) {
        const { values: savedValues, timestamp } = JSON.parse(saved);
        
        // 检查数据是否过期（24小时）
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          form.setFieldsValue(savedValues);
          setValues(savedValues);
          message.info('已恢复自动保存的数据');
          return true;
        }
      }
    } catch (error) {
      console.warn('恢复自动保存数据失败:', error);
    }
    
    return false;
  }, [enableAutoSave, autoSaveKey, form]);
  
  // 清除自动保存的数据
  const clearAutoSavedData = useCallback(() => {
    if (autoSaveKey) {
      localStorage.removeItem(autoSaveKey);
    }
  }, [autoSaveKey]);
  
  // 字段值变化处理
  const handleValuesChange = useCallback((changedValues, allValues) => {
    setValues(allValues);
    setIsDirty(true);
    
    // 检查字段依赖
    Object.entries(fieldDependencies).forEach(([field, dependency]) => {
      if (changedValues.hasOwnProperty(field)) {
        const fieldValue = changedValues[field];
        
        if (dependency.affects) {
          dependency.affects.forEach(affectedField => {
            if (dependency.visibility) {
              const isVisible = dependency.visibility(fieldValue, allValues);
              setFieldVisibility(prev => ({
                ...prev,
                [affectedField]: isVisible
              }));
            }
            
            if (dependency.disabled) {
              const isDisabled = dependency.disabled(fieldValue, allValues);
              setFieldDisabled(prev => ({
                ...prev,
                [affectedField]: isDisabled
              }));
            }
            
            if (dependency.setValue) {
              const newValue = dependency.setValue(fieldValue, allValues);
              if (newValue !== undefined) {
                form.setFieldValue(affectedField, newValue);
              }
            }
          });
        }
      }
    });
    
    // 处理动态字段
    if (enableDynamicFields) {
      Object.entries(dynamicFieldsConfig).forEach(([triggerField, config]) => {
        if (changedValues.hasOwnProperty(triggerField)) {
          const fieldValue = changedValues[triggerField];
          const newFields = config.generateFields ? config.generateFields(fieldValue, allValues) : [];
          setDynamicFields(prev => ({
            ...prev,
            [triggerField]: newFields
          }));
        }
      });
    }
    
    // 保存历史记录
    if (enableUndo) {
      saveToHistory(allValues);
    }
    
    onValuesChange?.(changedValues, allValues);
  }, [fieldDependencies, enableDynamicFields, dynamicFieldsConfig, enableUndo, saveToHistory, onValuesChange, form]);
  
  // 字段状态变化处理
  const handleFieldsChange = useCallback((changedFields, allFields) => {
    // 更新touched状态
    const newTouched = { ...touched };
    changedFields.forEach(field => {
      if (field.touched) {
        newTouched[field.name[0]] = true;
      }
    });
    setTouched(newTouched);
    
    // 更新错误状态
    const newErrors = {};
    allFields.forEach(field => {
      if (field.errors && field.errors.length > 0) {
        newErrors[field.name[0]] = field.errors;
      }
    });
    setErrors(newErrors);
    
    onFieldsChange?.(changedFields, allFields);
  }, [touched, onFieldsChange]);
  
  // 表单提交
  const handleSubmit = useCallback(async (formValues) => {
    if (!onSubmit) {
      onFinish?.(formValues);
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await onSubmit(formValues);
      
      onSubmitSuccess?.(result, formValues);
      onFinish?.(formValues);
      
      if (resetAfterSubmit) {
        form.resetFields();
        setValues(initialValues);
        setIsDirty(false);
      }
      
      // 清除自动保存的数据
      clearAutoSavedData();
      
      message.success('提交成功');
    } catch (error) {
      onSubmitError?.(error, formValues);
      onFinishFailed?.({ values: formValues, errorFields: [], outOfDate: false });
      message.error(error.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  }, [onSubmit, onSubmitSuccess, onSubmitError, onFinish, onFinishFailed, resetAfterSubmit, form, initialValues, clearAutoSavedData]);
  
  // 表单提交失败处理
  const handleSubmitFailed = useCallback((errorInfo) => {
    const { errorFields } = errorInfo;
    
    // 聚焦到第一个错误字段
    if (errorFields && errorFields.length > 0) {
      const firstErrorField = errorFields[0].name[0];
      form.scrollToField(firstErrorField);
    }
    
    onFinishFailed?.(errorInfo);
    message.error('表单验证失败，请检查输入');
  }, [form, onFinishFailed]);
  
  // 重置表单
  const resetForm = useCallback(() => {
    form.resetFields();
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setDynamicFields([]);
    setFieldVisibility({});
    setFieldDisabled({});
  }, [form, initialValues]);
  
  // 设置字段值
  const setFieldValue = useCallback((field, value) => {
    form.setFieldValue(field, value);
    const currentValues = form.getFieldsValue();
    setValues(currentValues);
  }, [form]);
  
  // 设置多个字段值
  const setFieldsValue = useCallback((fieldsValue) => {
    form.setFieldsValue(fieldsValue);
    const currentValues = form.getFieldsValue();
    setValues(currentValues);
  }, [form]);
  
  // 获取字段值
  const getFieldValue = useCallback((field) => {
    return form.getFieldValue(field);
  }, [form]);
  
  // 获取所有字段值
  const getFieldsValue = useCallback((fields) => {
    return form.getFieldsValue(fields);
  }, [form]);
  
  // 验证字段
  const validateField = useCallback(async (field) => {
    try {
      await form.validateFields([field]);
      return true;
    } catch (error) {
      return false;
    }
  }, [form]);
  
  // 验证所有字段
  const validateFields = useCallback(async (fields) => {
    try {
      const values = await form.validateFields(fields);
      return { success: true, values };
    } catch (error) {
      return { success: false, error };
    }
  }, [form]);
  
  // 获取字段错误
  const getFieldError = useCallback((field) => {
    return form.getFieldError(field);
  }, [form]);
  
  // 获取所有字段错误
  const getFieldsError = useCallback((fields) => {
    return form.getFieldsError(fields);
  }, [form]);
  
  // 检查字段是否有错误
  const isFieldTouched = useCallback((field) => {
    return form.isFieldTouched(field);
  }, [form]);
  
  // 检查是否有任何字段被触摸
  const isFieldsTouched = useCallback((fields, allTouched) => {
    return form.isFieldsTouched(fields, allTouched);
  }, [form]);
  
  // 滚动到字段
  const scrollToField = useCallback((field, options) => {
    form.scrollToField(field, options);
  }, [form]);
  
  // 动态添加字段
  const addDynamicField = useCallback((fieldConfig) => {
    setDynamicFields(prev => [...prev, fieldConfig]);
  }, []);
  
  // 动态移除字段
  const removeDynamicField = useCallback((fieldName) => {
    setDynamicFields(prev => prev.filter(field => field.name !== fieldName));
    form.setFieldValue(fieldName, undefined);
  }, [form]);
  
  // 设置字段可见性
  const updateFieldVisibility = useCallback((field, visible) => {
    setFieldVisibility(prev => ({
      ...prev,
      [field]: visible
    }));
  }, []);
  
  // 设置字段禁用状态
  const updateFieldDisabled = useCallback((field, disabled) => {
    setFieldDisabled(prev => ({
      ...prev,
      [field]: disabled
    }));
  }, []);
  
  // 自动保存定时器
  useEffect(() => {
    if (enableAutoSave && autoSaveInterval > 0) {
      autoSaveTimerRef.current = setInterval(autoSave, autoSaveInterval);
      
      return () => {
        if (autoSaveTimerRef.current) {
          clearInterval(autoSaveTimerRef.current);
        }
      };
    }
  }, [enableAutoSave, autoSaveInterval, autoSave]);
  
  // 初始化表单
  useEffect(() => {
    // 设置初始值
    form.setFieldsValue(initialValues);
    setValues(initialValues);
    
    // 尝试恢复自动保存的数据
    if (enableAutoSave) {
      restoreAutoSavedData();
    }
    
    // 保存初始历史记录
    if (enableUndo) {
      saveToHistory(initialValues);
    }
  }, []);
  
  // 初始值变化时更新表单
  useEffect(() => {
    if (JSON.stringify(initialValues) !== JSON.stringify(initialValuesRef.current)) {
      form.setFieldsValue(initialValues);
      setValues(initialValues);
      initialValuesRef.current = initialValues;
    }
  }, [initialValues, form]);
  
  // 表单配置
  const formProps = {
    form,
    layout,
    size,
    disabled: disabled || submitting,
    initialValues,
    onValuesChange: handleValuesChange,
    onFieldsChange: handleFieldsChange,
    onFinish: handleSubmit,
    onFinishFailed: handleSubmitFailed,
    validateTrigger,
    ...(!validateOnChange && { validateTrigger: validateOnBlur ? ['onBlur'] : [] })
  };
  
  return {
    // 表单实例和配置
    form,
    formProps,
    
    // 基础状态
    loading,
    submitting,
    values,
    errors,
    touched,
    isDirty,
    
    // 动态字段状态
    dynamicFields,
    fieldVisibility,
    fieldDisabled,
    
    // 历史记录状态
    canUndo: enableUndo && historyIndex > 0,
    canRedo: enableUndo && historyIndex < history.length - 1,
    
    // 表单操作方法
    resetForm,
    submitForm: () => form.submit(),
    
    // 字段操作方法
    setFieldValue,
    setFieldsValue,
    getFieldValue,
    getFieldsValue,
    
    // 验证方法
    validateField,
    validateFields,
    getFieldError,
    getFieldsError,
    isFieldTouched,
    isFieldsTouched,
    
    // 工具方法
    scrollToField,
    
    // 动态字段方法
    addDynamicField,
    removeDynamicField,
    updateFieldVisibility,
    updateFieldDisabled,
    
    // 历史记录方法
    undo,
    redo,
    
    // 自动保存方法
    autoSave,
    restoreAutoSavedData,
    clearAutoSavedData,
    
    // 工具函数
    createValidationRules: {
      required: createRequiredRule,
      number: createNumberRule,
      email: createEmailRule,
      phone: createPhoneRule,
      url: createUrlRule,
      date: createDateRule,
      custom: createCustomRule
    },
    
    // 状态检查
    hasErrors: Object.keys(errors).length > 0,
    isValid: Object.keys(errors).length === 0,
    isSubmittable: Object.keys(errors).length === 0 && isDirty
  };
};

export default useEnhancedForm;