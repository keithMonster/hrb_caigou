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
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { COLORS, FONT_SIZES, SPACING, createValueStyle } from '../utils/uiConstants';

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
        orders: [
          {
            key: 'order_1_1',
            orderNo: 'DD2025001',
            customerName: '北京汽车制造厂',
            allocatedQuantity: 150,
            deliveryDate: '2025-02-01',
          },
          {
            key: 'order_1_2',
            orderNo: 'DD2025002',
            customerName: '上海机械公司',
            allocatedQuantity: 130,
            deliveryDate: '2025-02-05',
          },
        ],
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
        orders: [
          {
            key: 'order_2_1',
            orderNo: 'DD2025003',
            customerName: '天津重工集团',
            allocatedQuantity: 300,
            deliveryDate: '2025-01-30',
          },
          {
            key: 'order_2_2',
            orderNo: 'DD2025004',
            customerName: '广州电机厂',
            allocatedQuantity: 300,
            deliveryDate: '2025-02-10',
          },
        ],
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
        orders: [],
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
        orders: [
          {
            key: 'order_4_1',
            orderNo: 'DD2025005',
            customerName: '深圳精密机械',
            allocatedQuantity: 450,
            deliveryDate: '2025-01-28',
          },
        ],
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
        orders: [
          {
            key: 'order_5_1',
            orderNo: 'DD2025006',
            customerName: '杭州轴承公司',
            allocatedQuantity: 150,
            deliveryDate: '2025-02-15',
          },
        ],
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

  // 添加订单
  const handleAddOrder = (recordKey) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === recordKey) {
          const newOrderKey = `order_${recordKey}_${item.orders.length + 1}`;
          const newOrder = {
            key: newOrderKey,
            orderNo: `DD2025${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
            customerName: '',
            allocatedQuantity: 0,
            deliveryDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
          };
          return {
            ...item,
            orders: [...item.orders, newOrder],
          };
        }
        return item;
      })
    );
  };

  // 删除订单
  const handleDeleteOrder = (recordKey, orderKey) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === recordKey) {
          const deletedOrder = item.orders.find(order => order.key === orderKey);
          const newOrders = item.orders.filter((order) => order.key !== orderKey);
          const newAllocatedQuantity = item.allocatedQuantity - (deletedOrder?.allocatedQuantity || 0);
          const newRemainingQuantity = item.warehouseQuantity - newAllocatedQuantity;
          return {
            ...item,
            orders: newOrders,
            allocatedQuantity: newAllocatedQuantity,
            remainingQuantity: newRemainingQuantity,
          };
        }
        return item;
      })
    );
  };

  // 处理订单分配数量变化
  const handleOrderAllocatedQuantityChange = (recordKey, orderKey, value) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === recordKey) {
          const newOrders = item.orders.map((order) => {
            if (order.key === orderKey) {
              return {
                ...order,
                allocatedQuantity: value || 0,
              };
            }
            return order;
          });
          const newAllocatedQuantity = newOrders.reduce((sum, order) => sum + (order.allocatedQuantity || 0), 0);
          const newRemainingQuantity = item.warehouseQuantity - newAllocatedQuantity;
          return {
            ...item,
            orders: newOrders,
            allocatedQuantity: newAllocatedQuantity,
            remainingQuantity: newRemainingQuantity,
          };
        }
        return item;
      })
    );
  };

  // 处理订单其他字段变化
  const handleOrderFieldChange = (recordKey, orderKey, field, value) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === recordKey) {
          const newOrders = item.orders.map((order) => {
            if (order.key === orderKey) {
              return {
                ...order,
                [field]: value,
              };
            }
            return order;
          });
          return {
            ...item,
            orders: newOrders,
          };
        }
        return item;
      })
    );
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
        if (item.remainingQuantity > 0 && (!item.orders || item.orders.length === 0)) {
          // 为没有订单的记录自动创建一个订单
          const autoAllocated = Math.min(item.remainingQuantity, Math.floor(Math.random() * 100) + 50);
          const newOrder = {
             key: `order_${item.key}_auto`,
             orderNo: `DD2025${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
             customerName: '自动匹配客户',
             allocatedQuantity: autoAllocated,
             deliveryDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
           };
          
          return {
            ...item,
            orders: [newOrder],
            allocatedQuantity: autoAllocated,
            remainingQuantity: item.warehouseQuantity - autoAllocated,
          };
        }
        return item;
      });
      setDataSource(newData);
      setLoading(false);
      message.success('自动匹配完成');
    }, 1500);
  };

  // 渲染展开行（订单详情）
  const renderExpandedRow = (record) => {
    return (
      <div style={{ padding: SPACING.XL, backgroundColor: COLORS.BACKGROUND_LIGHT }}>
        <div style={{ marginBottom: SPACING.LG, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: FONT_SIZES.MD }}>订单分配详情</span>
          <Button
            type="primary"
            size="small"
            onClick={() => handleAddOrder(record.key)}
            icon={<PlusOutlined />}
          >
            新增订单
          </Button>
        </div>
        
        {record.orders && record.orders.length > 0 ? (
          <Table
            dataSource={record.orders}
            pagination={false}
            size="small"
            rowKey="key"
            columns={[
              {
                title: '订单编号',
                dataIndex: 'orderNo',
                key: 'orderNo',
                width: 120,
                render: (text, orderRecord) => (
                  <Input
                    value={text}
                    onChange={(e) => handleOrderFieldChange(record.key, orderRecord.key, 'orderNo', e.target.value)}
                    size="small"
                    placeholder="请输入订单编号"
                  />
                ),
              },
              {
                title: '客户名称',
                dataIndex: 'customerName',
                key: 'customerName',
                width: 150,
                render: (text, orderRecord) => (
                  <Input
                    value={text}
                    onChange={(e) => handleOrderFieldChange(record.key, orderRecord.key, 'customerName', e.target.value)}
                    size="small"
                    placeholder="请输入客户名称"
                  />
                ),
              },
              {
                title: '分配数量',
                dataIndex: 'allocatedQuantity',
                key: 'allocatedQuantity',
                width: 100,
                render: (text, orderRecord) => (
                  <InputNumber
                    value={text}
                    onChange={(value) => handleOrderAllocatedQuantityChange(record.key, orderRecord.key, value)}
                    min={0}
                    max={record.warehouseQuantity}
                    size="small"
                    style={{ width: '100%' }}
                  />
                ),
              },
              {
                 title: '计划入库日期',
                 dataIndex: 'deliveryDate',
                 key: 'deliveryDate',
                 width: 120,
                 render: (text, orderRecord) => (
                   <DatePicker
                     value={text ? dayjs(text) : null}
                     onChange={(date) => handleOrderFieldChange(record.key, orderRecord.key, 'deliveryDate', date ? date.format('YYYY-MM-DD') : '')}
                     format="YYYY-MM-DD"
                     size="small"
                   />
                 ),
               },
              {
                title: '操作',
                key: 'action',
                width: 80,
                render: (_, orderRecord) => (
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => handleDeleteOrder(record.key, orderRecord.key)}
                    icon={<DeleteOutlined />}
                  >
                    删除
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <div style={{ textAlign: 'center', color: COLORS.TEXT_PLACEHOLDER, padding: SPACING.XXL }}>
            暂无订单，点击"新增订单"按钮添加订单
          </div>
        )}
      </div>
    );
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
        <span style={{ fontWeight: 500, ...createValueStyle(value) }}>{value}</span>
      ),
    },
    {
      title: '已分配数量',
      dataIndex: 'allocatedQuantity',
      key: 'allocatedQuantity',
      width: 120,
      align: 'right',
      render: (value) => (
        <span style={{ fontWeight: 500, color: value > 0 ? COLORS.SUCCESS : COLORS.TEXT_PLACEHOLDER }}>
          {value || 0}
        </span>
      ),
    },
    {
      title: '待匹配数量',
      dataIndex: 'remainingQuantity',
      key: 'remainingQuantity',
      width: 100,
      align: 'right',
      render: (value) => {
        const color = value === 0 ? COLORS.SUCCESS : value > 0 ? COLORS.WARNING : COLORS.ERROR;
        return (
          <span style={{ fontWeight: 500, color }}>{value}</span>
        );
      },
    },
    {
      title: '订单数量',
      key: 'orderCount',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <span style={{ color: COLORS.PRIMARY }}>
          {record.orders ? record.orders.length : 0}
        </span>
      ),
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
          expandable={{
          expandedRowRender: renderExpandedRow,
          rowExpandable: (record) => true,
          expandIcon: ({ expanded, onExpand, record }) => (
            <Button
              type="text"
              size="small"
              onClick={e => onExpand(record, e)}
              style={{ padding: `0 ${SPACING.SM}`, color: COLORS.LINK }}
            >
              {expanded ? '收起' : '展开'}
            </Button>
          ),
        }}
        />
      </Card>
    </div>
  );
};

export default OrderWarehousingMatch;