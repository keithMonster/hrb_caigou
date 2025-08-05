import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Form,
  Input,
  DatePicker,
  InputNumber,
  message,
  Table,
  Modal,
  Drawer,
  Tag,
  Select,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const PurchaseContract = () => {
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerData, setDrawerData] = useState([]);

  // 初始化模拟数据
  const initMockData = () => {
    const mockData = [
      {
        key: '1',
        contractNo: 'HT2025001',
        contractDate: '2025-01-15',
        supplier: '北京精密轴承有限公司',
        model: '6205-2RS',
        purchaseQuantity: 1000,
        arrivalQuantity: 800,
        inspectionQuantity: 750,
        qualifiedQuantity: 720,
        warehouseQuantity: 720,
      },
      {
        key: '2',
        contractNo: 'HT2025002',
        contractDate: '2025-01-20',
        supplier: '上海轴承制造厂',
        model: '6206-ZZ',
        purchaseQuantity: 800,
        arrivalQuantity: 600,
        inspectionQuantity: 580,
        qualifiedQuantity: 560,
        warehouseQuantity: 560,
      },
      {
        key: '3',
        contractNo: 'HT2025003',
        contractDate: '2025-01-25',
        supplier: 'SKF轴承代理商',
        model: 'SKF-6207',
        purchaseQuantity: 500,
        arrivalQuantity: 300,
        inspectionQuantity: 280,
        qualifiedQuantity: 270,
        warehouseQuantity: 270,
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

    if (values.supplier) {
      filtered = filtered.filter(item => 
        item.supplier.toLowerCase().includes(values.supplier.toLowerCase())
      );
    }

    if (values.executionStatus) {
      filtered = filtered.filter(item => {
        const isCompleted = item.warehouseQuantity === item.purchaseQuantity;
        const status = isCompleted ? 'completed' : 'pending';
        return status === values.executionStatus;
      });
    }

    setFilteredDataSource(filtered);
  };

  // 重置筛选
  const handleReset = () => {
    filterForm.resetFields();
    setFilteredDataSource(dataSource);
  };

  // 显示新增/编辑模态框
  const showModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        contractDate: record.contractDate ? dayjs(record.contractDate) : null,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        contractDate: values.contractDate ? values.contractDate.format('YYYY-MM-DD') : null,
      };

      if (editingRecord) {
        // 编辑
        const newData = dataSource.map(item => 
          item.key === editingRecord.key 
            ? { ...item, ...formattedValues }
            : item
        );
        setDataSource(newData);
        message.success('合同信息更新成功');
      } else {
        // 新增
        const newRecord = {
          key: Date.now().toString(),
          ...formattedValues,
          arrivalQuantity: 0,
          inspectionQuantity: 0,
          qualifiedQuantity: 0,
          warehouseQuantity: 0,
        };
        setDataSource([...dataSource, newRecord]);
        message.success('合同添加成功');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 删除记录
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除合同 ${record.contractNo} 吗？`,
      onOk: () => {
        const newData = dataSource.filter(item => item.key !== record.key);
        setDataSource(newData);
        message.success('删除成功');
      },
    });
  };

  // 显示详情抽屉
  const showDrawer = (type, record) => {
    let title = '';
    let data = [];
    
    switch (type) {
      case 'arrival':
        title = `${record.contractNo} - 到货记录`;
        data = [
          { key: '1', date: '2025-01-20', quantity: 300, supplier: record.supplier },
          { key: '2', date: '2025-01-25', quantity: 500, supplier: record.supplier },
        ];
        break;
      case 'inspection':
        title = `${record.contractNo} - 验收记录`;
        data = [
          { key: '1', date: '2025-01-21', quantity: 280, inspector: '张三' },
          { key: '2', date: '2025-01-26', quantity: 470, inspector: '李四' },
        ];
        break;
      case 'qualified':
        title = `${record.contractNo} - 合格记录`;
        data = [
          { key: '1', date: '2025-01-21', quantity: 270, qualityLevel: '优' },
          { key: '2', date: '2025-01-26', quantity: 450, qualityLevel: '良' },
        ];
        break;
      case 'warehouse':
        title = `${record.contractNo} - 入库记录`;
        data = [
          { key: '1', date: '2025-01-22', quantity: 270, warehouse: '仓库A' },
          { key: '2', date: '2025-01-27', quantity: 450, warehouse: '仓库B' },
        ];
        break;
      default:
        break;
    }
    
    setDrawerTitle(title);
    setDrawerData(data);
    setDrawerVisible(true);
  };

  const columns = [
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
      width: 120,
    },
    {
      title: '合同日期',
      dataIndex: 'contractDate',
      key: 'contractDate',
      width: 120,
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
      title: '采购数量',
      dataIndex: 'purchaseQuantity',
      key: 'purchaseQuantity',
      width: 100,
      align: 'right',
    },
    {
      title: '到货数量',
      dataIndex: 'arrivalQuantity',
      key: 'arrivalQuantity',
      width: 100,
      align: 'right',
      render: (value, record) => (
        <Button 
          type="link" 
          onClick={() => showDrawer('arrival', record)}
          style={{ padding: 0, color: value > 0 ? '#1890ff' : '#8c8c8c' }}
        >
          {value}
        </Button>
      ),
    },
    {
      title: '验收数量',
      dataIndex: 'inspectionQuantity',
      key: 'inspectionQuantity',
      width: 100,
      align: 'right',
      render: (value, record) => (
        <Button 
          type="link" 
          onClick={() => showDrawer('inspection', record)}
          style={{ padding: 0, color: value > 0 ? '#1890ff' : '#8c8c8c' }}
        >
          {value}
        </Button>
      ),
    },
    {
      title: '合格数量',
      dataIndex: 'qualifiedQuantity',
      key: 'qualifiedQuantity',
      width: 100,
      align: 'right',
      render: (value, record) => (
        <Button 
          type="link" 
          onClick={() => showDrawer('qualified', record)}
          style={{ padding: 0, color: value > 0 ? '#1890ff' : '#8c8c8c' }}
        >
          {value}
        </Button>
      ),
    },
    {
      title: '入库数量',
      dataIndex: 'warehouseQuantity',
      key: 'warehouseQuantity',
      width: 100,
      align: 'right',
      render: (value, record) => (
        <Button 
          type="link" 
          onClick={() => showDrawer('warehouse', record)}
          style={{ padding: 0, color: value > 0 ? '#1890ff' : '#8c8c8c' }}
        >
          {value}
        </Button>
      ),
    },
    {
      title: '验收状态',
      key: 'inspectionStatus',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const isCompleted = record.inspectionQuantity === record.arrivalQuantity;
        return (
          <Tag color={isCompleted ? 'green' : 'orange'}>
            {isCompleted ? '已完成' : '未完成'}
          </Tag>
        );
      },
    },
    {
      title: '执行状态',
      key: 'executionStatus',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const isCompleted = record.warehouseQuantity === record.purchaseQuantity;
        return (
          <Tag color={isCompleted ? 'green' : 'orange'}>
            {isCompleted ? '已完成' : '未完成'}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
            size="small"
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
            size="small"
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 抽屉表格列配置
  const getDrawerColumns = () => {
    const baseColumns = [
      {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'right',
      },
    ];

    if (drawerTitle.includes('到货记录')) {
      baseColumns.push({
        title: '供应商',
        dataIndex: 'supplier',
        key: 'supplier',
      });
    } else if (drawerTitle.includes('验收记录')) {
      baseColumns.push({
        title: '验收员',
        dataIndex: 'inspector',
        key: 'inspector',
      });
    } else if (drawerTitle.includes('合格记录')) {
      // 合格记录不需要额外列
    } else if (drawerTitle.includes('入库记录')) {
      baseColumns.push({
        title: '仓库',
        dataIndex: 'warehouse',
        key: 'warehouse',
      });
    }

    return baseColumns;
  };

  return (
    <div>
      <div className="page-header">
        <h1>采购合同</h1>
      </div>

      {/* 筛选区域 */}
      <Card className="filter-card" style={{ marginBottom: 16 }}>
        <Form form={filterForm} layout="inline">
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item label="合同编号" name="contractNo">
                <Input placeholder="请输入合同编号" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="供应商" name="supplier">
                <Input placeholder="请输入供应商" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="执行状态" name="executionStatus">
                <Select placeholder="请选择执行状态" allowClear>
                  <Select.Option value="completed">已完成</Select.Option>
                  <Select.Option value="pending">未完成</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
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
        title="合同列表"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            新增合同
          </Button>
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
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑合同' : '新增合同'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="合同编号"
            name="contractNo"
            rules={[{ required: true, message: '请输入合同编号' }]}
          >
            <Input placeholder="请输入合同编号" />
          </Form.Item>
          
          <Form.Item
            label="合同日期"
            name="contractDate"
            rules={[{ required: true, message: '请选择合同日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择合同日期" />
          </Form.Item>
          
          <Form.Item
            label="供应商"
            name="supplier"
            rules={[{ required: true, message: '请输入供应商' }]}
          >
            <Input placeholder="请输入供应商" />
          </Form.Item>
          
          <Form.Item
            label="型号"
            name="model"
            rules={[{ required: true, message: '请输入型号' }]}
          >
            <Input placeholder="请输入型号" />
          </Form.Item>
          
          <Form.Item
            label="采购数量"
            name="purchaseQuantity"
            rules={[{ required: true, message: '请输入采购数量' }]}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }} 
              placeholder="请输入采购数量" 
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title={drawerTitle}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        <Table
          dataSource={drawerData}
          columns={getDrawerColumns()}
          pagination={false}
          size="small"
          bordered
        />
      </Drawer>
    </div>
  );
};

export default PurchaseContract;