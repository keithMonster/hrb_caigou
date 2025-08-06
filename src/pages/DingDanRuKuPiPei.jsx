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
  SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Option } = Select;

const OrderWarehousingMatch = () => {
  const [filterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [filteredDataSource, setFilteredDataSource] = useState([]);

  // 生产来源选项
  const productionSourceOptions = [
    { value: 'OEM', label: 'OEM' },
    { value: '自产', label: '自产' },
  ];

  // 初始化模拟数据
  const initMockData = () => {
    const mockData = [
      {
        key: '1',
        warehouseDate: '2025-01-22',
        productionSource: 'OEM',
        model: '6205-2RS',
        warehouseQuantity: 500,
        allocatedQuantity: 280,
        remainingQuantity: 220,
        editable: true,
      },
      {
        key: '2',
        warehouseDate: '2025-01-23',
        productionSource: '自产',
        model: '6206-ZZ',
        warehouseQuantity: 800,
        allocatedQuantity: 600,
        remainingQuantity: 200,
        editable: true,
      },
      {
        key: '3',
        warehouseDate: '2025-01-24',
        productionSource: 'OEM',
        model: '6310',
        warehouseQuantity: 300,
        allocatedQuantity: 0,
        remainingQuantity: 300,
        editable: true,
      },
      {
        key: '4',
        warehouseDate: '2025-01-25',
        productionSource: '自产',
        model: '6208-RS',
        warehouseQuantity: 450,
        allocatedQuantity: 450,
        remainingQuantity: 0,
        editable: true,
      },
      {
        key: '5',
        warehouseDate: '2025-01-26',
        productionSource: 'OEM',
        model: '6004-2RS',
        warehouseQuantity: 600,
        allocatedQuantity: 150,
        remainingQuantity: 450,
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

    if (values.model) {
      filtered = filtered.filter(item => 
        item.model.toLowerCase().includes(values.model.toLowerCase())
      );
    }

    if (values.productionSource) {
      filtered = filtered.filter(item => item.productionSource === values.productionSource);
    }

    if (values.warehouseDateRange && values.warehouseDateRange.length === 2) {
      const [startDate, endDate] = values.warehouseDateRange;
      filtered = filtered.filter(item => {
        const itemDate = dayjs(item.warehouseDate);
        return itemDate.isSameOrAfter(startDate, 'day') && itemDate.isSameOrBefore(endDate, 'day');
      });
    }

    if (values.status) {
      filtered = filtered.filter(item => {
        const status = item.remainingQuantity === 0 ? 'completed' : 
                      item.allocatedQuantity === 0 ? 'unallocated' : 'partial';
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

  // 处理已分配数量变更
  const handleAllocatedQuantityChange = (record, value) => {
    const newData = [...dataSource];
    const targetRecord = newData.find(item => item.key === record.key);
    if (targetRecord) {
      const allocatedQuantity = value || 0;
      if (allocatedQuantity <= targetRecord.warehouseQuantity) {
        targetRecord.allocatedQuantity = allocatedQuantity;
        targetRecord.remainingQuantity = targetRecord.warehouseQuantity - allocatedQuantity;
        setDataSource(newData);
      } else {
        message.error('已分配数量不能超过入库数量');
      }
    }
  };

  // 保存数据
  const handleSave = () => {
    setLoading(true);
    // 模拟保存操作
    setTimeout(() => {
      setLoading(false);
      message.success('保存成功');
    }, 1000);
  };

  // 导出Excel
  const handleExport = () => {
    const exportData = filteredDataSource.map(item => ({
      '入库日期': item.warehouseDate,
      '生产来源': item.productionSource,
      '型号': item.model,
      '入库数量': item.warehouseQuantity,
      '已分配数量': item.allocatedQuantity,
      '待匹配数量': item.remainingQuantity,
      '分配率': `${((item.allocatedQuantity / item.warehouseQuantity) * 100).toFixed(1)}%`,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '订单入库匹配');
    XLSX.writeFile(wb, `订单入库匹配_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    message.success('导出成功');
  };

  // 自动匹配
  const handleAutoMatch = () => {
    setLoading(true);
    // 模拟自动匹配操作
    setTimeout(() => {
      const newData = dataSource.map(item => {
        if (item.remainingQuantity > 0) {
          // 简单的自动匹配逻辑：分配50%的剩余数量
          const autoAllocate = Math.floor(item.remainingQuantity * 0.5);
          return {
            ...item,
            allocatedQuantity: item.allocatedQuantity + autoAllocate,
            remainingQuantity: item.remainingQuantity - autoAllocate,
          };
        }
        return item;
      });
      setDataSource(newData);
      setLoading(false);
      message.success('自动匹配完成');
    }, 1500);
  };

  const columns = [
    {
      title: '入库日期',
      dataIndex: 'warehouseDate',
      key: 'warehouseDate',
      width: 120,
      fixed: 'left',
      sorter: (a, b) => dayjs(a.warehouseDate).unix() - dayjs(b.warehouseDate).unix(),
    },
    {
      title: '生产来源',
      dataIndex: 'productionSource',
      key: 'productionSource',
      width: 100,
      render: (value) => (
        <Tag color={value === 'OEM' ? 'blue' : 'green'}>{value}</Tag>
      ),
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 120,
    },
    {
      title: '入库数量',
      dataIndex: 'warehouseQuantity',
      key: 'warehouseQuantity',
      width: 100,
      align: 'right',
      render: (value) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>{value}</span>
      ),
    },
    {
      title: '已分配数量',
      dataIndex: 'allocatedQuantity',
      key: 'allocatedQuantity',
      width: 120,
      align: 'right',
      render: (value, record) => (
        <InputNumber
          size="small"
          min={0}
          max={record.warehouseQuantity}
          value={value}
          onChange={(val) => handleAllocatedQuantityChange(record, val)}
          style={{ width: '100%' }}
          placeholder="请输入已分配数量"
          disabled={!record.editable}
        />
      ),
    },
    {
      title: '待匹配数量',
      dataIndex: 'remainingQuantity',
      key: 'remainingQuantity',
      width: 100,
      align: 'right',
      render: (value) => {
        const color = value === 0 ? '#52c41a' : value > 0 ? '#fa8c16' : '#ff4d4f';
        return (
          <span style={{ fontWeight: 500, color }}>{value}</span>
        );
      },
    },
    {
      title: '分配状态',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => {
        if (record.allocatedQuantity === 0) {
          return <Tag color="red">未分配</Tag>;
        }
        if (record.remainingQuantity === 0) {
          return <Tag color="green">已完成</Tag>;
        }
        return <Tag color="orange">部分分配</Tag>;
      },
    },
    {
      title: '分配率',
      key: 'allocationRate',
      width: 100,
      align: 'center',
      render: (_, record) => {
        if (record.warehouseQuantity === 0) return '0%';
        const rate = ((record.allocatedQuantity / record.warehouseQuantity) * 100).toFixed(1);
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
        <h1>订单入库匹配</h1>
      </div>

      {/* 筛选区域 */}
      <Card className="filter-card" style={{ marginBottom: 16 }}>
        <Form form={filterForm} layout="inline">
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item label="型号" name="model">
                <Input placeholder="请输入型号" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="生产来源" name="productionSource">
                <Select placeholder="请选择生产来源" allowClear>
                  {productionSourceOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="入库日期" name="warehouseDateRange">
                <DatePicker.RangePicker
                  placeholder={['开始日期', '结束日期']}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="分配状态" name="status">
                <Select placeholder="请选择分配状态" allowClear>
                  <Option value="completed">已完成</Option>
                  <Option value="partial">部分分配</Option>
                  <Option value="unallocated">未分配</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
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
        title="订单入库匹配记录"
        extra={
          <Space>
            <Button
              type="default"
              onClick={handleAutoMatch}
              icon={<SyncOutlined />}
              loading={loading}
            >
              自动匹配
            </Button>
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
              loading={loading}
            >
              保存匹配数据
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={filteredDataSource}
          columns={columns}
          loading={loading}
          scroll={{ x: 1000 }}
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
            const totalWarehouse = pageData.reduce((sum, record) => sum + record.warehouseQuantity, 0);
            const totalAllocated = pageData.reduce((sum, record) => sum + record.allocatedQuantity, 0);
            const totalRemaining = pageData.reduce((sum, record) => sum + record.remainingQuantity, 0);
            const overallRate = totalWarehouse > 0 ? ((totalAllocated / totalWarehouse) * 100).toFixed(1) : '0.0';
            
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <strong>合计</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong style={{ color: '#1890ff' }}>{totalWarehouse}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <strong style={{ color: '#52c41a' }}>{totalAllocated}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <strong style={{ color: '#fa8c16' }}>{totalRemaining}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="center">
                  <Tag color={overallRate === '100.0' ? 'green' : 'orange'}>
                    总体分配率: {overallRate}%
                  </Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}></Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default OrderWarehousingMatch;