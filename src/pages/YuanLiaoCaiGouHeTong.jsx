import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Form,
  Input,
  DatePicker,
  message,
  Table,
  Select,
  Row,
  Col,
  Tag,
  Modal,
  InputNumber,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { COMPONENT_SIZES } from '../utils/uiConstants';

const RawMaterialPurchaseContract = () => {
  const [filterForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 初始化模拟数据
  const initMockData = () => {
    const contractData = [
      {
        contractNo: 'YL2025001',
        supplier: '哈尔滨轴承集团公司',
        deliveryDate: '2025-03-15',
        specifications: [
          {
            specification: '外圈-234424BM',
            purchaseQuantity: 1000,
            arrivalQuantity: 800,
            qualifiedQuantity: 750,
            warehouseQuantity: 750,
            returnQuantity: 50,
            status: '未完成',
          },
          {
            specification: '内圈-7006C',
            purchaseQuantity: 1000,
            arrivalQuantity: 800,
            qualifiedQuantity: 780,
            warehouseQuantity: 780,
            returnQuantity: 20,
            status: '未完成',
          },
          {
            specification: '滚动体-6.35',
            purchaseQuantity: 5000,
            arrivalQuantity: 4000,
            qualifiedQuantity: 3950,
            warehouseQuantity: 3950,
            returnQuantity: 50,
            status: '未完成',
          }
        ]
      },
      {
        contractNo: 'YL2025002',
        supplier: '洛阳LYC轴承有限公司',
        deliveryDate: '2025-02-28',
        specifications: [
          {
            specification: '保持架-6004',
            purchaseQuantity: 800,
            arrivalQuantity: 800,
            qualifiedQuantity: 780,
            warehouseQuantity: 780,
            returnQuantity: 20,
            status: '完成',
          },
          {
            specification: '密封件-6004-RZ',
            purchaseQuantity: 800,
            arrivalQuantity: 800,
            qualifiedQuantity: 790,
            warehouseQuantity: 790,
            returnQuantity: 10,
            status: '完成',
          }
        ]
      },
      {
        contractNo: 'YL2025003',
        supplier: '壳牌（中国）有限公司',
        deliveryDate: '2025-04-10',
        specifications: [
          {
            specification: '润滑脂-Shell Alvania R3',
            purchaseQuantity: 500,
            arrivalQuantity: 300,
            qualifiedQuantity: 300,
            warehouseQuantity: 300,
            returnQuantity: 0,
            status: '未完成',
          },
          {
            specification: '润滑脂-Shell Alvania R2',
            purchaseQuantity: 300,
            arrivalQuantity: 200,
            qualifiedQuantity: 200,
            warehouseQuantity: 200,
            returnQuantity: 0,
            status: '未完成',
          }
        ]
      },
      {
        contractNo: 'YL2025004',
        supplier: '瓦房店轴承集团有限责任公司',
        deliveryDate: '2025-05-20',
        specifications: [
          {
            specification: '外圈-234424BM',
            purchaseQuantity: 1200,
            arrivalQuantity: 1200,
            qualifiedQuantity: 1180,
            warehouseQuantity: 1180,
            returnQuantity: 20,
            status: '完成',
          }
        ]
      },
      {
        contractNo: 'YL2025005',
        supplier: '人本集团有限公司',
        deliveryDate: '2025-02-15',
        specifications: [
          {
            specification: '内圈-7006C',
            purchaseQuantity: 600,
            arrivalQuantity: 300,
            qualifiedQuantity: 290,
            warehouseQuantity: 290,
            returnQuantity: 10,
            status: '未完成',
          },
          {
            specification: '滚动体-6.35',
            purchaseQuantity: 3000,
            arrivalQuantity: 1500,
            qualifiedQuantity: 1480,
            warehouseQuantity: 1480,
            returnQuantity: 20,
            status: '未完成',
          }
        ]
      },
      {
        contractNo: 'YL2025006',
        supplier: '江苏高分子材料有限公司',
        deliveryDate: '2025-03-30',
        specifications: [
          {
            specification: '保持架-6208',
            purchaseQuantity: 1200,
            arrivalQuantity: 600,
            qualifiedQuantity: 580,
            warehouseQuantity: 580,
            returnQuantity: 20,
            status: '已关闭',
          },
          {
            specification: '保持架-6209',
            purchaseQuantity: 800,
            arrivalQuantity: 400,
            qualifiedQuantity: 390,
            warehouseQuantity: 390,
            returnQuantity: 10,
            status: '已关闭',
          }
        ]
      },
    ];
    
    // 将嵌套数据转换为平铺数据用于表格显示
    const flattenData = contractData.flatMap(contract => 
      contract.specifications.map((spec, index) => ({
        key: `${contract.contractNo}-${index + 1}`,
        contractNo: contract.contractNo,
        specification: spec.specification,
        supplier: contract.supplier,
        deliveryDate: contract.deliveryDate,
        purchaseQuantity: spec.purchaseQuantity,
        arrivalQuantity: spec.arrivalQuantity,
        qualifiedQuantity: spec.qualifiedQuantity,
        warehouseQuantity: spec.warehouseQuantity,
        returnQuantity: spec.returnQuantity,
        status: spec.status,
        isFirstRow: index === 0,
        totalSpecs: contract.specifications.length
      }))
    );
    
    setDataSource(flattenData);
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

    if (values.status) {
      filtered = filtered.filter(item => item.status === values.status);
    }

    if (values.deliveryDate) {
      const selectedDate = values.deliveryDate.format('YYYY-MM-DD');
      filtered = filtered.filter(item => item.deliveryDate === selectedDate);
    }

    setFilteredDataSource(filtered);
    message.success('筛选完成');
  };

  // 重置筛选
  const handleReset = () => {
    filterForm.resetFields();
    setFilteredDataSource(dataSource);
    message.success('已重置筛选条件');
  };

  // 导出功能
  const handleExport = () => {
    message.success('导出功能开发中...');
  };

  // 编辑状态
  const handleEditStatus = (record) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      status: record.status,
    });
    setEditModalVisible(true);
  };

  // 保存状态编辑
  const handleSaveStatus = async () => {
    try {
      const values = await editForm.validateFields();
      // 更新同一合同下所有规格的状态
      const newData = dataSource.map(item => 
        item.contractNo === editingRecord.contractNo 
          ? { ...item, status: values.status }
          : item
      );
      setDataSource(newData);
      setEditModalVisible(false);
      message.success('合同状态更新成功');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理退货数量编辑
  const handleReturnQuantityChange = (value, record) => {
    const newData = dataSource.map(item => 
      item.key === record.key 
        ? { ...item, returnQuantity: value || 0 }
        : item
    );
    setDataSource(newData);
    setFilteredDataSource(newData.filter(item => {
      const values = filterForm.getFieldsValue();
      let filtered = true;
      
      if (values.contractNo) {
        filtered = filtered && item.contractNo.toLowerCase().includes(values.contractNo.toLowerCase());
      }
      if (values.supplier) {
        filtered = filtered && item.supplier.toLowerCase().includes(values.supplier.toLowerCase());
      }
      if (values.status) {
        filtered = filtered && item.status === values.status;
      }
      if (values.deliveryDate) {
        const selectedDate = values.deliveryDate.format('YYYY-MM-DD');
        filtered = filtered && item.deliveryDate === selectedDate;
      }
      
      return filtered;
    }));
    setHasUnsavedChanges(true);
  };

  // 保存退货数量修改
  const handleSaveReturnQuantity = () => {
    setHasUnsavedChanges(false);
    message.success('退货数量保存成功');
  };

  // 获取状态颜色
  const getStatusColor = (status) => {
    switch (status) {
      case '完成':
        return 'green';
      case '未完成':
        return 'orange';
      case '已关闭':
        return 'red';
      default:
        return 'default';
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
      width: COMPONENT_SIZES.TABLE_COL_LG,
      fixed: 'left',
      render: (value, record, index) => {
        const obj = {
          children: value,
          props: {},
        };
        if (record.isFirstRow) {
          obj.props.rowSpan = record.totalSpecs;
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
          obj.props.rowSpan = record.totalSpecs;
        } else {
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
    {
      title: '交货日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 120,
      align: 'center',
      render: (value, record, index) => {
        const obj = {
          children: value,
          props: {},
        };
        if (record.isFirstRow) {
          obj.props.rowSpan = record.totalSpecs;
        } else {
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: COMPONENT_SIZES.TABLE_COL_XXL,
    },
    {
      title: '采购数量',
      dataIndex: 'purchaseQuantity',
      key: 'purchaseQuantity',
      width: COMPONENT_SIZES.TABLE_COL_MD,
      align: 'right',
      render: (value) => value?.toLocaleString(),
    },
    {
      title: '到货数量',
      dataIndex: 'arrivalQuantity',
      key: 'arrivalQuantity',
      width: 100,
      align: 'right',
      render: (value) => value?.toLocaleString(),
    },
    {
      title: '合格数量',
      dataIndex: 'qualifiedQuantity',
      key: 'qualifiedQuantity',
      width: 100,
      align: 'right',
      render: (value) => value?.toLocaleString(),
    },
    {
      title: '原料入库数量',
      dataIndex: 'warehouseQuantity',
      key: 'warehouseQuantity',
      width: 120,
      align: 'right',
      render: (value) => value?.toLocaleString(),
    },
    {
      title: '退货数量',
      dataIndex: 'returnQuantity',
      key: 'returnQuantity',
      width: 120,
      align: 'right',
      render: (value, record) => (
        <InputNumber
          value={value}
          min={0}
          max={record.arrivalQuantity}
          onChange={(newValue) => handleReturnQuantityChange(newValue, record)}
          style={{ width: '100%' }}
          size="small"
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: COMPONENT_SIZES.TABLE_COL_SM,
      fixed: 'right',
      render: (_, record) => {
        const obj = {
          children: (
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleEditStatus(record)}
              size="small"
            >
              编辑
            </Button>
          ),
          props: {},
        };
        if (record.isFirstRow) {
          obj.props.rowSpan = record.totalSpecs;
        } else {
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>原料采购合同</h1>
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
              <Form.Item label="交货日期" name="deliveryDate">
                <DatePicker placeholder="请选择交货日期" style={{ width: '100%' }} allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="状态" name="status">
                <Select placeholder="请选择状态" allowClear>
                  <Select.Option value="未完成">未完成</Select.Option>
                  <Select.Option value="完成">完成</Select.Option>
                  <Select.Option value="已关闭">已关闭</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} style={{ width: '100%', marginTop: 16 }}>
            <Col span={24}>
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<SearchOutlined />}
                    onClick={handleFilter}
                  >
                    查询
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                  >
                    重置
                  </Button>
                  <Button 
                    icon={<ExportOutlined />}
                    onClick={handleExport}
                  >
                    导出
                  </Button>
                  <Button 
                    type="primary"
                    onClick={handleSaveReturnQuantity}
                    disabled={!hasUnsavedChanges}
                  >
                    保存
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 数据表格 */}
      <Card 
        className="table-card"
        title={`原料采购合同列表`}
      >
        <Table
          dataSource={filteredDataSource}
          columns={columns}
          loading={loading}
          scroll={{ x: 1320 }}
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

      {/* 编辑状态模态框 */}
      <Modal
        title={`编辑合同状态 - ${editingRecord?.contractNo || ''}`}
        open={editModalVisible}
        onOk={handleSaveStatus}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        okText="确定"
        cancelText="取消"
        width={400}
      >
        <Form
          form={editForm}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="未完成">未完成</Select.Option>
              <Select.Option value="完成">完成</Select.Option>
              <Select.Option value="已关闭">已关闭</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RawMaterialPurchaseContract;