import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  message,
  Table,
  Modal,
  Drawer,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const Arrival = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerData, setDrawerData] = useState([]);

  // 合同选项（实际应该从采购合同页面获取）
  const contractOptions = [
    { value: 'HT2025001', label: 'HT2025001 - 北京精密轴承有限公司 - 6205-2RS' },
    { value: 'HT2025002', label: 'HT2025002 - 上海轴承制造厂 - 6206-ZZ' },
    { value: 'HT2025003', label: 'HT2025003 - SKF轴承代理商 - SKF-6207' },
  ];

  // 初始化模拟数据
  const initMockData = () => {
    const mockData = [
      {
        key: '1',
        contractNo: 'HT2025001',
        supplier: '北京精密轴承有限公司',
        model: '6205-2RS',
        arrivalDate: '2025-01-20',
        arrivalQuantity: 300,
        inspectionQuantity: 280,
        qualifiedQuantity: 270,
        warehouseQuantity: 270,
      },
      {
        key: '2',
        contractNo: 'HT2025001',
        supplier: '北京精密轴承有限公司',
        model: '6205-2RS',
        arrivalDate: '2025-01-25',
        arrivalQuantity: 500,
        inspectionQuantity: 470,
        qualifiedQuantity: 450,
        warehouseQuantity: 450,
      },
      {
        key: '3',
        contractNo: 'HT2025002',
        supplier: '上海轴承制造厂',
        model: '6206-ZZ',
        arrivalDate: '2025-01-22',
        arrivalQuantity: 400,
        inspectionQuantity: 380,
        qualifiedQuantity: 360,
        warehouseQuantity: 360,
      },
      {
        key: '4',
        contractNo: 'HT2025003',
        supplier: 'SKF轴承代理商',
        model: 'SKF-6207',
        arrivalDate: '2025-01-28',
        arrivalQuantity: 200,
        inspectionQuantity: 190,
        qualifiedQuantity: 185,
        warehouseQuantity: 185,
      },
    ];
    setDataSource(mockData);
  };

  React.useEffect(() => {
    initMockData();
  }, []);

  // 根据合同编号获取供应商和型号信息
  const getContractInfo = (contractNo) => {
    const contractMap = {
      'HT2025001': { supplier: '北京精密轴承有限公司', model: '6205-2RS' },
      'HT2025002': { supplier: '上海轴承制造厂', model: '6206-ZZ' },
      'HT2025003': { supplier: 'SKF轴承代理商', model: 'SKF-6207' },
    };
    return contractMap[contractNo] || { supplier: '', model: '' };
  };

  // 显示新增/编辑模态框
  const showModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        arrivalDate: record.arrivalDate ? dayjs(record.arrivalDate) : null,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 处理合同编号变化
  const handleContractChange = (contractNo) => {
    const contractInfo = getContractInfo(contractNo);
    form.setFieldsValue({
      supplier: contractInfo.supplier,
      model: contractInfo.model,
    });
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        arrivalDate: values.arrivalDate ? values.arrivalDate.format('YYYY-MM-DD') : null,
      };

      if (editingRecord) {
        // 编辑
        const newData = dataSource.map(item => 
          item.key === editingRecord.key 
            ? { ...item, ...formattedValues }
            : item
        );
        setDataSource(newData);
        message.success('到货信息更新成功');
      } else {
        // 新增
        const newRecord = {
          key: Date.now().toString(),
          ...formattedValues,
          inspectionQuantity: 0,
          qualifiedQuantity: 0,
          warehouseQuantity: 0,
        };
        setDataSource([...dataSource, newRecord]);
        
        // 自动生成质量验收记录（模拟）
        message.success('到货记录添加成功，已自动生成质量验收记录');
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
      content: `确定要删除这条到货记录吗？`,
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
      case 'inspection':
        title = `${record.contractNo} - 验收记录`;
        data = [
          { key: '1', date: '2025-01-21', quantity: 280, inspector: '张三', status: '已验收' },
        ];
        break;
      case 'qualified':
        title = `${record.contractNo} - 合格记录`;
        data = [
          { key: '1', date: '2025-01-21', quantity: 270, qualityLevel: '优', inspector: '张三' },
        ];
        break;
      case 'warehouse':
        title = `${record.contractNo} - 入库记录`;
        data = [
          { key: '1', date: '2025-01-22', quantity: 270, warehouse: '仓库A', operator: '王五' },
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
      title: '到货日期',
      dataIndex: 'arrivalDate',
      key: 'arrivalDate',
      width: 120,
    },
    {
      title: '到货数量',
      dataIndex: 'arrivalQuantity',
      key: 'arrivalQuantity',
      width: 100,
      align: 'right',
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

    if (drawerTitle.includes('验收记录')) {
      baseColumns.push(
        {
          title: '验收员',
          dataIndex: 'inspector',
          key: 'inspector',
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          render: (value) => (
            <Tag color={value === '已验收' ? 'green' : 'orange'}>
              {value}
            </Tag>
          ),
        }
      );
    } else if (drawerTitle.includes('合格记录')) {
      baseColumns.push(
        {
          title: '质量等级',
          dataIndex: 'qualityLevel',
          key: 'qualityLevel',
          render: (value) => (
            <Tag color={value === '优' ? 'green' : value === '良' ? 'blue' : 'orange'}>
              {value}
            </Tag>
          ),
        },
        {
          title: '验收员',
          dataIndex: 'inspector',
          key: 'inspector',
        }
      );
    } else if (drawerTitle.includes('入库记录')) {
      baseColumns.push(
        {
          title: '仓库',
          dataIndex: 'warehouse',
          key: 'warehouse',
        },
        {
          title: '操作员',
          dataIndex: 'operator',
          key: 'operator',
        }
      );
    }

    return baseColumns;
  };

  return (
    <div>
      <div className="page-header">
        <h1>到货</h1>
      </div>

      <Card 
        className="table-card"
        title="到货记录"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            新增到货
          </Button>
        }
      >

        <Table
          dataSource={dataSource}
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
        title={editingRecord ? '编辑到货记录' : '新增到货记录'}
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
            rules={[{ required: true, message: '请选择合同编号' }]}
          >
            <Select 
              placeholder="请选择合同编号" 
              onChange={handleContractChange}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {contractOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="供应商"
            name="supplier"
          >
            <Input placeholder="自动填充" disabled />
          </Form.Item>
          
          <Form.Item
            label="型号"
            name="model"
          >
            <Input placeholder="自动填充" disabled />
          </Form.Item>
          
          <Form.Item
            label="到货日期"
            name="arrivalDate"
            rules={[{ required: true, message: '请选择到货日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择到货日期" />
          </Form.Item>
          
          <Form.Item
            label="到货数量"
            name="arrivalQuantity"
            rules={[{ required: true, message: '请输入到货数量' }]}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }} 
              placeholder="请输入到货数量" 
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

export default Arrival;