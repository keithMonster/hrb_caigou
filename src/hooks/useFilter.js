import { useState, useCallback } from 'react';
import { Form } from 'antd';

/**
 * 过滤功能管理Hook
 * @param {Object} options - 配置选项
 * @returns {Object} 过滤相关的状态和方法
 */
export const useFilter = (options = {}) => {
  const {
    initialValues = {},
    onFilter,
    onReset,
  } = options;

  const [form] = Form.useForm();
  const [filters, setFilters] = useState(initialValues);
  const [isFiltering, setIsFiltering] = useState(false);

  // 应用过滤
  const handleFilter = useCallback(async (values) => {
    setIsFiltering(true);
    try {
      const filterValues = { ...filters, ...values };
      setFilters(filterValues);
      await onFilter?.(filterValues);
    } catch (error) {
      console.error('过滤失败:', error);
    } finally {
      setIsFiltering(false);
    }
  }, [filters, onFilter]);

  // 重置过滤
  const handleReset = useCallback(async () => {
    setIsFiltering(true);
    try {
      form.resetFields();
      setFilters(initialValues);
      await onReset?.(initialValues);
    } catch (error) {
      console.error('重置失败:', error);
    } finally {
      setIsFiltering(false);
    }
  }, [form, initialValues, onReset]);

  // 更新单个过滤条件
  const updateFilter = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    form.setFieldsValue({ [key]: value });
    onFilter?.(newFilters);
  }, [filters, form, onFilter]);

  // 获取过滤值
  const getFilterValue = useCallback((key) => {
    return filters[key];
  }, [filters]);

  // 检查是否有活跃的过滤条件
  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== null && value !== '' && value !== '全部'
    );
  }, [filters]);

  return {
    // 表单实例
    form,
    
    // 状态
    filters,
    isFiltering,
    
    // 方法
    handleFilter,
    handleReset,
    updateFilter,
    getFilterValue,
    hasActiveFilters,
    setFilters,
  };
};

export default useFilter;