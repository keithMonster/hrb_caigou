import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  DatePicker,
  InputNumber,
  message,
  Table,
  Drawer,
  Tag,
  Form,
  Input,
  Select,
  Row,
  Col,
} from 'antd';
import {
  SaveOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { COLORS, COMPONENT_SIZES } from '../utils/uiConstants';

const QualityInspection = () => {
  const [filterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerData, setDrawerData] = useState([]);

  // 初始化模拟数据（来自到货记录）
  const initMockData = () => {
    const mockData = [
      {
        key: '1',
        contractNo: 'HT2025001',
        supplier: '北京精密轴承有限公司',
        model: '6205-2RS',
        arrivalDate: '2025-01-20',
        arrivalQuantity: 300,
        inspectionDate: '2025-01-21',
        qualifiedQuantity: 280,
        warehouseQuantity: 280,
        editable: true,
      },
      {
        key: '2',
        contractNo: 'HT2025001',
        supplier: '北京精密轴承有限公司',
        model: '6205-2RS',
        arrivalDate: '2025-01-25',
        arrivalQuantity: 500,
        inspectionDate: '2025-01-26',
        qualifiedQuantity: 470,
        warehouseQuantity: 470,
        editable: true,
      },
      {
        key: '3',
        contractNo: 'HT2025002',
        supplier: '上海轴承制造厂',
        model: '6206-ZZ',
        arrivalDate: '2025-01-22',
        arrivalQuantity: 400,
        inspectionDate: '2025-01-23',
        qualifiedQuantity: 380,
        warehouseQuantity: 380,
        editable: true,
      },
      {
        key: '4',
        contractNo: 'HT2025003',
        supplier: 'SKF轴承代理商',
        model: '6310',
        arrivalDate: '2025-01-28',
        arrivalQuantity: 200,
        inspectionDate: null,
        qualifiedQuantity: 0,
        warehouseQuantity: 0,
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
        const isCompleted = item.qualifiedQuantity > 0 && item.inspectionDate;
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

  // 处理验收日期变更
  const handleInspectionDateChange = (record, date) => {
    const newData = [...dataSource];
    const targetRecord = newData.find(item => item.key === record.key);
    if (targetRecord) {
      targetRecord.inspectionDate = date ? date.format('YYYY-MM-DD') : null;
      setDataSource(newData);
    }
  };

  // 处理合格数量变更
  const handleQualifiedQuantityChange = (record, value) => {
    const newData = [...dataSource];
    const targetRecord = newData.find(item => item.key === record.key);
    if (targetRecord) {
      targetRecord.qualifiedQuantity = value || 0;
      setDataSource(newData);
    }
  };

  // 显示入库记录抽屉
  const showWarehouseDrawer = (record) => {
    const title = `${record.contractNo} - 入库记录`;
    const data = [
      { 
        key: '1', 
        date: '2025-01-22', 
        quantity: record.warehouseQuantity, 
        warehouse: '仓库A', 
        operator: '王五',
        status: '已入库'
      },
    ];
    
    setDrawerTitle(title);
    setDrawerData(data);
    setDrawerVisible(true);
  };

  // 保存验收数据
  const handleSave = () => {
    // 验证必填字段
    const invalidRecords = dataSource.filter(record => 
      record.qualifiedQuantity > 0 && !record.inspectionDate
    );
    
    if (invalidRecords.length > 0) {
      message.error('请填写验收日期');
      return;
    }
    
    message.success('验收数据保存成功');
  };

  // 导出功能
  const handleExport = () => {
    const exportData = dataSource.map(row => ({
      合同编号: row.contractNo,
      供应商: row.supplier,
      型号: row.model,
      到货数量: row.arrivalQuantity,
      验收日期: row.inspectionDate || '',
      合格数量: row.qualifiedQuantity,
      入库数量: row.warehouseQuantity,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '原料进厂检验记录');
    XLSX.writeFile(wb, `原料进厂检验记录_${dayjs().format('YYYY-MM-DD')}.xlsx`);

    message.success('导出成功');
  };

  const columns = [
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
      width: COMPONENT_SIZES.TABLE_COL_LG,
      fixed: 'left',
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: COMPONENT_SIZES.TABLE_COL_XL,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: COMPONENT_SIZES.TABLE_COL_LG,
    },
    {
      title: '到货数量',
      dataIndex: 'arrivalQuantity',
      key: 'arrivalQuantity',
      width: COMPONENT_SIZES.TABLE_COL_MD,
      align: 'right',
      render: (value) => (
        <span style={{ fontWeight: 500 }}>{value}</span>
      ),
    },
    {
      title: '验收日期',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      width: COMPONENT_SIZES.TABLE_COL_MD_LG,
      render: (value, record) => (
        <DatePicker
          size="small"
          value={value ? dayjs(value) : null}
          onChange={(date) => handleInspectionDateChange(record, date)}
          placeholder="请选择验收日期"
          style={{ width: '100%' }}
          disabled={!record.editable}
        />
      ),
    },
    {
      title: '合格数量',
      dataIndex: 'qualifiedQuantity',
      key: 'qualifiedQuantity',
      width: 120,
      align: 'right',
      render: (value, record) => (
        <InputNumber
          size="small"
          min={0}
          max={record.arrivalQuantity}
          value={value}
          onChange={(val) => handleQualifiedQuantityChange(record, val)}
          style={{ width: '100%' }}
          placeholder="请输入合格数量"
          disabled={!record.editable}
        />
      ),
    },
    {
      title: '入库数量',
      dataIndex: 'warehouseQuantity',
      key: 'warehouseQuantity',
      width: COMPONENT_SIZES.TABLE_COL_MD,
      align: 'right',
      render: (value, record) => (
        <Button 
          type="link" 
          onClick={() => showWarehouseDrawer(record)}
          style={{ padding: 0, color: value > 0 ? COLORS.PRIMARY : COLORS.TEXT_TERTIARY }}
        >
          {value}
        </Button>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => {
        if (!record.inspectionDate) {
          return <Tag color="orange">待验收</Tag>;
        }
        if (record.qualifiedQuantity === 0) {
          return <Tag color="red">不合格</Tag>;
        }
        if (record.qualifiedQuantity === record.arrivalQuantity) {
          return <Tag color="green">全部合格</Tag>;
        }
        return <Tag color="blue">部分合格</Tag>;
      },
    },
  ];

  // 抽屉表格列配置
  const drawerColumns = [
    {
      title: '入库日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '入库数量',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value) => (
        <Tag color={value === '已入库' ? 'green' : 'orange'}>
          {value}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>原料进厂检验</h1>
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
                  <Select.Option value="completed">已完成</Select.Option>
                  <Select.Option value="pending">未完成</Select.Option>
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
        title="原料进厂检验记录"
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
              保存验收数据
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
        />
      </Card>

      {/* 入库记录抽屉 */}
      <Drawer
        title={drawerTitle}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        <Table
          dataSource={drawerData}
          columns={drawerColumns}
          pagination={false}
          size="small"
          bordered
        />
      </Drawer>
    </div>
  );
};

export default QualityInspection;