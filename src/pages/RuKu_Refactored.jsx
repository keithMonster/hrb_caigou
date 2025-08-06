import React, { useEffect } from 'react';
import { Col, InputNumber, DatePicker, Select, Form, Input, message } from 'antd';
import { SaveOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// 导入公共组件和工具
import { PageLayout, DataTable, FilterForm, ActionBar } from '../components/common';
import { useTableData, useFilter } from '../hooks';
import { createColumn, createDateColumn, createNumberColumn, exportTableToExcel } from '../utils';

const { Option } = Select;

const WarehousingSample = () => {
  // 仓库选项
  const warehouseOptions = [
    { value: '仓库A', label: '仓库A - 主仓库' },
    { value: '仓库B', label: '仓库B - 副仓库' },
    { value: '仓库C', label: '仓库C - 临时仓库' },
  ];

  // 初始化模拟数据
  const initMockData = () => {
    return [
      {
        key: '1',
        contractNo: 'HT2025001',
        supplier: '北京精密轴承有限公司',
        model: '6205-2RS',
        qualifiedQuantity: 280,
        warehouseDate: '2025-01-22',
        warehouseQuantity: 280,
        warehouse: '仓库A',
        editable: true,
      },
      {
        key: '2',
        contractNo: 'HT2025001',
        supplier: '北京精密轴承有限公司',
        model: '6205-2RS',
        qualifiedQuantity: 470,
        warehouseDate: '2025-01-27',
        warehouseQuantity: 470,
        warehouse: '仓库B',
        editable: true,
      },
      {
        key: '3',
        contractNo: 'HT2025002',
        supplier: '上海轴承制造厂',
        model: '6206-ZZ',
        qualifiedQuantity: 380,
        warehouseDate: '2025-01-24',
        warehouseQuantity: 380,
        warehouse: '仓库A',
        editable: true,
      },
      {
        key: '4',
        contractNo: 'HT2025003',
        supplier: 'SKF轴承代理商',
        model: '6310',
        qualifiedQuantity: 185,
        warehouseDate: null,
        warehouseQuantity: 0,
        warehouse: '',
        editable: true,
      },
      {
        key: '5',
        contractNo: 'HT2025004',
        supplier: '天津轴承集团',
        model: '6208-RS',
        qualifiedQuantity: 150,
        warehouseDate: null,
        warehouseQuantity: 0,
        warehouse: '',
        editable: true,
      },
    ];
  };

  // 使用自定义Hooks
  const {
    loading,
    dataSource,
    filteredDataSource,
    setLoading,
    updateDataSource,
    updateItem,
  } = useTableData({
    initialData: [],
    filterKeys: ['contractNo', 'supplier', 'model', 'warehouse'],
  });

  const {
    form: filterForm,
    handleFilter,
    handleReset,
  } = useFilter({
    onFilter: (values) => {
      console.log('应用过滤条件:', values);
      // 这里可以实现具体的过滤逻辑
    },
    onReset: () => {
      console.log('重置过滤条件');
    },
  });

  // 初始化数据
  useEffect(() => {
    updateDataSource(initMockData());
  }, [updateDataSource]);

  // 表格列配置
  const columns = [
    createColumn('contractNo', '合同编号', { width: 120 }),
    createColumn('supplier', '供应商', { width: 180 }),
    createColumn('model', '型号', { width: 120 }),
    createNumberColumn('qualifiedQuantity', '合格数量', { width: 100 }),
    createDateColumn('warehouseDate', '入库日期', { 
      width: 120,
      render: (value, record) => {
        if (!record.editable) {
          return value ? dayjs(value).format('YYYY-MM-DD') : '-';
        }
        return (
          <DatePicker
            value={value ? dayjs(value) : null}
            onChange={(date) => handleDateChange(record.key, 'warehouseDate', date)}
            format="YYYY-MM-DD"
            size="small"
            style={{ width: '100%' }}
          />
        );
      }
    }),
    createNumberColumn('warehouseQuantity', '入库数量', {
      width: 100,
      render: (value, record) => {
        if (!record.editable) {
          return value || 0;
        }
        return (
          <InputNumber
            value={value}
            onChange={(val) => handleNumberChange(record.key, 'warehouseQuantity', val)}
            min={0}
            max={record.qualifiedQuantity}
            size="small"
            style={{ width: '100%' }}
          />
        );
      }
    }),
    createColumn('warehouse', '仓库', {
      width: 150,
      render: (value, record) => {
        if (!record.editable) {
          return value || '-';
        }
        return (
          <Select
            value={value}
            onChange={(val) => handleSelectChange(record.key, 'warehouse', val)}
            size="small"
            style={{ width: '100%' }}
            placeholder="选择仓库"
          >
            {warehouseOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );
      }
    }),
  ];

  // 处理日期变化
  const handleDateChange = (key, field, date) => {
    const dateStr = date ? date.format('YYYY-MM-DD') : null;
    updateItem(key, { [field]: dateStr });
  };

  // 处理数字变化
  const handleNumberChange = (key, field, value) => {
    updateItem(key, { [field]: value || 0 });
  };

  // 处理选择变化
  const handleSelectChange = (key, field, value) => {
    updateItem(key, { [field]: value });
  };

  // 保存数据
  const handleSave = async () => {
    setLoading(true);
    try {
      // 验证数据
      const invalidItems = filteredDataSource.filter(item => 
        item.warehouseQuantity > 0 && (!item.warehouseDate || !item.warehouse)
      );
      
      if (invalidItems.length > 0) {
        message.error('请完善入库日期和仓库信息');
        return;
      }
      
      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 导出数据
  const handleExport = () => {
    const success = exportTableToExcel(
      filteredDataSource,
      columns,
      '入库管理',
      {
        sheetName: '入库数据',
        includeIndex: true,
      }
    );
    
    if (success) {
      message.success('导出成功');
    } else {
      message.error('导出失败');
    }
  };

  return (
    <PageLayout
      title="入库管理"
      description="管理货物入库操作，记录入库数量、日期和仓库信息"
    >
      {/* 筛选表单 */}
      <FilterForm
        form={filterForm}
        onFinish={handleFilter}
        onReset={handleReset}
      >
        <Col span={6}>
          <Form.Item name="contractNo" label="合同编号">
            <Input placeholder="请输入合同编号" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="supplier" label="供应商">
            <Input placeholder="请输入供应商" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="model" label="型号">
            <Input placeholder="请输入型号" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="warehouse" label="仓库">
            <Select placeholder="请选择仓库" allowClear>
              <Option value="">全部</Option>
              {warehouseOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </FilterForm>

      {/* 操作按钮栏 */}
      <ActionBar
        showSave
        showExport
        onSave={handleSave}
        onExport={handleExport}
        saveProps={{ loading }}
      />

      {/* 数据表格 */}
      <DataTable
        title="入库记录"
        description={`共 ${filteredDataSource.length} 条记录`}
        columns={columns}
        dataSource={filteredDataSource}
        loading={loading}
        scroll={{ x: 1000, y: 'calc(100vh - 400px)' }}
      />
    </PageLayout>
  );
};

export default WarehousingSample;