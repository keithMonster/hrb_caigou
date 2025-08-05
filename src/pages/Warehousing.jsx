import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  DatePicker,
  InputNumber,
  message,
  Table,
  Tag,
  Select,
  Form,
  Input,
  Row,
  Col,
} from 'antd';
import {
  SaveOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Option } = Select;

const Warehousing = () => {
  const [filterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [filteredDataSource, setFilteredDataSource] = useState([]);

  // 仓库选项
  const warehouseOptions = [
    { value: '仓库A', label: '仓库A - 主仓库' },
    { value: '仓库B', label: '仓库B - 副仓库' },
    { value: '仓库C', label: '仓库C - 临时仓库' },
  ];

  // 初始化模拟数据（来自质量验收记录）
  const initMockData = () => {
    const mockData = [
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
        model: 'SKF-6207',
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
    setDataSource(mockData);
  };

  React.useEffect(() => {
    initMockData();
  }, []);

  React.useEffect(() => {
    setFilteredDataSource(dataSource);
  }, [dataSource]);

  // 筛选功能
  const handleFilter = () => {
    const values = filterForm.getFieldsValue();
    let filtered = dataSource;

    if (values.contractNo) {
      filtered = filtered.filter(item => 
        item.contractNo.toLowerCase().includes(values.contractNo.toLowerCase())
      );
    }

    if (values.status) {
      filtered = filtered.filter(item => {
        const isCompleted = item.warehouseQuantity > 0 && item.warehouseDate;
        const status = isCompleted ? 'completed' : 'pending';
        return status === values.status;
      });
    }

    setFilteredDataSource(filtered);
  };

  // 重置筛选
  const handleReset = () => {
    filterForm.resetFields();
    setFilteredDataSource(dataSource);
  };

  // 处理入库日期变更
  const handleWarehouseDateChange = (record, date) => {
    const newData = [...dataSource];
    const targetRecord = newData.find(item => item.key === record.key);
    if (targetRecord) {
      targetRecord.warehouseDate = date ? date.format('YYYY-MM-DD') : null;
      setDataSource(newData);
    }
  };

  // 处理入库数量变更
  const handleWarehouseQuantityChange = (record, value) => {
    const newData = [...dataSource];
    const targetRecord = newData.find(item => item.key === record.key);
    if (targetRecord) {
      targetRecord.warehouseQuantity = value || 0;
      setDataSource(newData);
    }
  };

  // 处理仓库选择变更
  const handleWarehouseChange = (record, value) => {
    const newData = [...dataSource];
    const targetRecord = newData.find(item => item.key === record.key);
    if (targetRecord) {
      targetRecord.warehouse = value;
      setDataSource(newData);
    }
  };

  // 保存入库数据
  const handleSave = () => {
    // 验证必填字段
    const invalidRecords = dataSource.filter(record => 
      record.warehouseQuantity > 0 && (!record.warehouseDate || !record.warehouse)
    );
    
    if (invalidRecords.length > 0) {
      message.error('请填写入库日期和选择仓库');
      return;
    }
    
    message.success('入库数据保存成功');
  };

  // 导出功能
  const handleExport = () => {
    const exportData = dataSource.map(row => ({
      合同编号: row.contractNo,
      供应商: row.supplier,
      型号: row.model,
      合格数量: row.qualifiedQuantity,
      入库日期: row.warehouseDate || '',
      入库数量: row.warehouseQuantity,
      仓库: row.warehouse,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '入库记录');
    XLSX.writeFile(wb, `入库记录_${dayjs().format('YYYY-MM-DD')}.xlsx`);

    message.success('导出成功');
  };

  const columns = [
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
      width: 120,
      fixed: 'left',
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 180,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 120,
    },
    {
      title: '合格数量',
      dataIndex: 'qualifiedQuantity',
      key: 'qualifiedQuantity',
      width: 100,
      align: 'right',
      render: (value) => (
        <span style={{ fontWeight: 500, color: '#52c41a' }}>{value}</span>
      ),
    },
    {
      title: '入库日期',
      dataIndex: 'warehouseDate',
      key: 'warehouseDate',
      width: 150,
      render: (value, record) => (
        <DatePicker
          size="small"
          value={value ? dayjs(value) : null}
          onChange={(date) => handleWarehouseDateChange(record, date)}
          placeholder="请选择入库日期"
          style={{ width: '100%' }}
          disabled={!record.editable}
        />
      ),
    },
    {
      title: '入库数量',
      dataIndex: 'warehouseQuantity',
      key: 'warehouseQuantity',
      width: 120,
      align: 'right',
      render: (value, record) => (
        <InputNumber
          size="small"
          min={0}
          max={record.qualifiedQuantity}
          value={value}
          onChange={(val) => handleWarehouseQuantityChange(record, val)}
          style={{ width: '100%' }}
          placeholder="请输入入库数量"
          disabled={!record.editable}
        />
      ),
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 150,
      render: (value, record) => (
        <Select
          size="small"
          value={value}
          onChange={(val) => handleWarehouseChange(record, val)}
          placeholder="请选择仓库"
          style={{ width: '100%' }}
          disabled={!record.editable}
          allowClear
        >
          {warehouseOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => {
        if (!record.warehouseDate || !record.warehouse) {
          return <Tag color="orange">待入库</Tag>;
        }
        if (record.warehouseQuantity === 0) {
          return <Tag color="red">未入库</Tag>;
        }
        if (record.warehouseQuantity === record.qualifiedQuantity) {
          return <Tag color="green">全部入库</Tag>;
        }
        return <Tag color="blue">部分入库</Tag>;
      },
    },
    {
      title: '入库率',
      key: 'warehouseRate',
      width: 100,
      align: 'center',
      render: (_, record) => {
        if (record.qualifiedQuantity === 0) return '0%';
        const rate = ((record.warehouseQuantity / record.qualifiedQuantity) * 100).toFixed(1);
        const color = rate === '100.0' ? '#52c41a' : rate === '0.0' ? '#ff4d4f' : '#1890ff';
        return (
          <span style={{ color, fontWeight: 500 }}>
            {rate}%
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>入库</h1>
      </div>

      {/* 筛选区域 */}
      <Card className="filter-card" style={{ marginBottom: 16 }}>
        <Form form={filterForm} layout="inline">
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={8}>
              <Form.Item label="合同编号" name="contractNo">
                <Input placeholder="请输入合同编号" allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="状态" name="status">
                <Select placeholder="请选择状态" allowClear>
                  <Option value="completed">已完成</Option>
                  <Option value="pending">未完成</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item>
                <Space>
                  <Button type="primary" onClick={handleFilter}>
                    查询
                  </Button>
                  <Button onClick={handleReset}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card 
        className="table-card"
        title="入库记录"
        extra={
          <Space>
            <Button
              type="default"
              onClick={handleExport}
              icon={<DownloadOutlined />}
            >
              导出Excel
            </Button>
            <Button 
              type="primary" 
              onClick={handleSave}
              icon={<SaveOutlined />}
            >
              保存入库数据
            </Button>
          </Space>
        }
      >

        <Table
          dataSource={filteredDataSource}
          columns={columns}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          bordered
          size="small"
          summary={(pageData) => {
            const totalQualified = pageData.reduce(
              (sum, record) => sum + (record.qualifiedQuantity || 0),
              0
            );
            const totalWarehouse = pageData.reduce(
              (sum, record) => sum + (record.warehouseQuantity || 0),
              0
            );
            const overallRate = totalQualified > 0 ? ((totalWarehouse / totalQualified) * 100).toFixed(1) : '0.0';

            return (
              <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                <Table.Summary.Cell index={0} style={{ fontWeight: 'bold', color: '#1890ff' }}>
                  合计
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>-</Table.Summary.Cell>
                <Table.Summary.Cell index={2}>-</Table.Summary.Cell>
                <Table.Summary.Cell index={3} style={{ textAlign: 'right', fontWeight: 'bold', color: '#52c41a' }}>
                  {totalQualified}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>-</Table.Summary.Cell>
                <Table.Summary.Cell index={5} style={{ textAlign: 'right', fontWeight: 'bold', color: '#1890ff' }}>
                  {totalWarehouse}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>-</Table.Summary.Cell>
                <Table.Summary.Cell index={7}>-</Table.Summary.Cell>
                <Table.Summary.Cell index={8} style={{ textAlign: 'center', fontWeight: 'bold', color: '#1890ff' }}>
                  {overallRate}%
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default Warehousing;