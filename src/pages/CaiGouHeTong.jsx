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
  MinusCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { COLORS, COMPONENT_SIZES, createValueStyle } from '../utils/uiConstants';

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
    const contractData = [
      {
        contractNo: 'HT2025001',
        contractDate: '2025-01-15',
        supplier: '北京精密轴承有限公司',
        models: [
          {
            model: '6205-2RS',
            purchaseQuantity: 1000,
            arrivalQuantity: 800,
            inspectionQuantity: 750,
            qualifiedQuantity: 720,
            warehouseQuantity: 720,
          },
          {
            model: '6206-ZZ',
            purchaseQuantity: 500,
            arrivalQuantity: 400,
            inspectionQuantity: 380,
            qualifiedQuantity: 360,
            warehouseQuantity: 360,
          }
        ]
      },
      {
        contractNo: 'HT2025002',
        contractDate: '2025-01-20',
        supplier: '上海轴承制造厂',
        models: [
          {
            model: '6206-ZZ',
            purchaseQuantity: 800,
            arrivalQuantity: 600,
            inspectionQuantity: 580,
            qualifiedQuantity: 560,
            warehouseQuantity: 560,
          },
          {
            model: '6207-2RS',
            purchaseQuantity: 300,
            arrivalQuantity: 250,
            inspectionQuantity: 240,
            qualifiedQuantity: 230,
            warehouseQuantity: 230,
          },
          {
            model: '6208-ZZ',
            purchaseQuantity: 200,
            arrivalQuantity: 150,
            inspectionQuantity: 140,
            qualifiedQuantity: 135,
            warehouseQuantity: 135,
          }
        ]
      },
      {
        contractNo: 'HT2025003',
        contractDate: '2025-01-25',
        supplier: 'SKF轴承代理商',
        models: [
          {
            model: '6310',
            purchaseQuantity: 500,
            arrivalQuantity: 300,
            inspectionQuantity: 280,
            qualifiedQuantity: 270,
            warehouseQuantity: 270,
          }
        ]
      },
      {
        contractNo: 'HT2025004',
        contractDate: '2025-01-30',
        supplier: '天津轴承集团',
        models: [
          {
            model: '6309-2RS',
            purchaseQuantity: 600,
            arrivalQuantity: 400,
            inspectionQuantity: 380,
            qualifiedQuantity: 370,
            warehouseQuantity: 370,
          }
        ]
      },
      {
        contractNo: 'HT2025005',
        contractDate: '2025-02-05',
        supplier: '洛阳轴承研究所',
        models: [
          {
            model: '6311-ZZ',
            purchaseQuantity: 400,
            arrivalQuantity: 200,
            inspectionQuantity: 180,
            qualifiedQuantity: 175,
            warehouseQuantity: 175,
          }
        ]
      },
      {
        contractNo: 'HT2025006',
        contractDate: '2025-02-10',
        supplier: '哈尔滨轴承制造有限公司',
        models: [
          {
            model: '6312-2RZ',
            purchaseQuantity: 350,
            arrivalQuantity: 150,
            inspectionQuantity: 140,
            qualifiedQuantity: 135,
            warehouseQuantity: 135,
          }
        ]
      },
    ];
    
    // 将数据展开为每个型号一行
    const mockData = [];
    let keyCounter = 1;
    
    contractData.forEach(contract => {
      contract.models.forEach((modelData, index) => {
        mockData.push({
          key: keyCounter.toString(),
          contractNo: contract.contractNo,
          contractDate: contract.contractDate,
          supplier: contract.supplier,
          model: modelData.model,
          purchaseQuantity: modelData.purchaseQuantity,
          arrivalQuantity: modelData.arrivalQuantity,
          inspectionQuantity: modelData.inspectionQuantity,
          qualifiedQuantity: modelData.qualifiedQuantity,
          warehouseQuantity: modelData.warehouseQuantity,
          isFirstRow: index === 0, // 标记是否为该合同的第一行
          totalModels: contract.models.length, // 该合同总共有多少个型号
        });
        keyCounter++;
      });
    });
    
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

  // 编辑状态模态框相关状态
  const [editStatusModalVisible, setEditStatusModalVisible] = useState(false);
  const [editStatusForm] = Form.useForm();
  const [editingStatusRecord, setEditingStatusRecord] = useState(null);

  // 显示编辑状态模态框
  const showEditStatusModal = (record) => {
    setEditingStatusRecord(record);
    const isCompleted = record.warehouseQuantity === record.purchaseQuantity;
    editStatusForm.setFieldsValue({
      status: isCompleted ? 'completed' : 'pending',
    });
    setEditStatusModalVisible(true);
  };

  // 保存状态编辑
  const handleSaveStatus = async () => {
    try {
      const values = await editStatusForm.validateFields();
      // 根据状态更新入库数量
      const newWarehouseQuantity = values.status === 'completed' 
        ? editingStatusRecord.purchaseQuantity 
        : editingStatusRecord.warehouseQuantity;
      
      const newData = dataSource.map(item => 
        item.key === editingStatusRecord.key 
          ? { ...item, warehouseQuantity: newWarehouseQuantity }
          : item
      );
      setDataSource(newData);
      setEditStatusModalVisible(false);
      message.success('状态更新成功');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
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
        // 编辑 - 暂时保持原有逻辑，后续可以扩展为支持编辑多型号
        const newData = dataSource.map(item => 
          item.key === editingRecord.key 
            ? { ...item, model: formattedValues.models[0]?.model, purchaseQuantity: formattedValues.models[0]?.purchaseQuantity }
            : item
        );
        setDataSource(newData);
        message.success('合同信息更新成功');
      } else {
        // 新增 - 为每个型号创建一行数据
        const newRecords = [];
        let keyCounter = Date.now();
        
        formattedValues.models.forEach((modelData, index) => {
          newRecords.push({
            key: (keyCounter + index).toString(),
            contractNo: formattedValues.contractNo,
            contractDate: formattedValues.contractDate,
            supplier: formattedValues.supplier,
            model: modelData.model,
            purchaseQuantity: modelData.purchaseQuantity,
            arrivalQuantity: 0,
            inspectionQuantity: 0,
            qualifiedQuantity: 0,
            warehouseQuantity: 0,
            isFirstRow: index === 0,
            totalModels: formattedValues.models.length,
          });
        });
        
        setDataSource([...dataSource, ...newRecords]);
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
      width: COMPONENT_SIZES.TABLE_COL_LG,
      render: (value, record, index) => {
        const obj = {
          children: value,
          props: {},
        };
        if (record.isFirstRow) {
          obj.props.rowSpan = record.totalModels;
        } else {
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
    {
      title: '交货日期',
      dataIndex: 'contractDate',
      key: 'contractDate',
      width: 120,
      render: (value, record, index) => {
        const obj = {
          children: value,
          props: {},
        };
        if (record.isFirstRow) {
          obj.props.rowSpan = record.totalModels;
        } else {
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: COMPONENT_SIZES.TABLE_COL_XL,
      render: (value, record, index) => {
        const obj = {
          children: value,
          props: {},
        };
        if (record.isFirstRow) {
          obj.props.rowSpan = record.totalModels;
        } else {
          obj.props.rowSpan = 0;
        }
        return obj;
      },
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
      width: COMPONENT_SIZES.TABLE_COL_MD,
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
          style={{ padding: 0, color: value > 0 ? COLORS.PRIMARY : COLORS.TEXT_TERTIARY }}
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
          style={{ padding: 0, color: value > 0 ? COLORS.PRIMARY : COLORS.TEXT_TERTIARY }}
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
          style={{ padding: 0, color: value > 0 ? COLORS.PRIMARY : COLORS.TEXT_TERTIARY }}
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
          style={{ padding: 0, color: value > 0 ? COLORS.PRIMARY : COLORS.TEXT_TERTIARY }}
        >
          {value}
        </Button>
      ),
    },
    {
      title: '状态',
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
      width: COMPONENT_SIZES.TABLE_COL_SM,
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EditOutlined />} 
          onClick={() => showEditStatusModal(record)}
          size="small"
        >
          编辑状态
        </Button>
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
              <Form.Item label="交货日期" name="contractDate">
                <DatePicker placeholder="请选择交货日期" style={{ width: '100%' }} allowClear />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} style={{ width: '100%', marginTop: 16 }}>
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
        title="合同列表"
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
            label="交货日期"
            name="contractDate"
            rules={[{ required: true, message: '请选择交货日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="请选择交货日期" />
          </Form.Item>
          
          <Form.Item
            label="供应商"
            name="supplier"
            rules={[{ required: true, message: '请输入供应商' }]}
          >
            <Input placeholder="请输入供应商" />
          </Form.Item>
          
          <Form.Item label="型号及数量" required>
            <Form.List
              name="models"
              rules={[
                {
                  validator: async (_, models) => {
                    if (!models || models.length < 1) {
                      return Promise.reject(new Error('至少添加一个型号'));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'model']}
                        rules={[{ required: true, message: '请选择型号' }]}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Select placeholder="请选择型号" style={{ width: COMPONENT_SIZES.TABLE_COL_XXL }}>
                          <Select.Option value="6206">6206</Select.Option>
                          <Select.Option value="6206-ZZ">6206-ZZ</Select.Option>
                          <Select.Option value="6315-2RZ">6315-2RZ</Select.Option>
                          <Select.Option value="6311-2Z">6311-2Z</Select.Option>
                          <Select.Option value="6309">6309</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'purchaseQuantity']}
                        rules={[{ required: true, message: '请输入数量' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber
                          min={1}
                          placeholder="数量"
                          style={{ width: COMPONENT_SIZES.TABLE_COL_LG }}
                        />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      添加型号
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑状态模态框 */}
      <Modal
        title={`编辑型号状态 - ${editingStatusRecord?.model}`}
        open={editStatusModalVisible}
        onOk={handleSaveStatus}
        onCancel={() => {
          setEditStatusModalVisible(false);
          editStatusForm.resetFields();
        }}
        width={400}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={editStatusForm}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="pending">未完成</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
            </Select>
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