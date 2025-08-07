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
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { COLORS, FONT_SIZES, SPACING, createProductionSourceStyle } from '../utils/uiConstants';

const MaterialPreparationRequirement = () => {
  const [filterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [filteredDataSource, setFilteredDataSource] = useState([]);

  // 初始化模拟数据
  const initMockData = () => {
    const mockData = [
      {
        key: '1',
        materialType: '外圈',
        qualityRequirement: '表面粗糙度Ra≤0.8μm，硬度HRC58-62',
        attachments: ['技术要求.pdf', '检验标准.doc'],
        materialSource: '外购',
        specification: '234424BM',
        materialRequirement: '表面粗糙度Ra≤0.8',
        requirementDate: '2025-02',
        requirementQuantity: 1000,
      },
      {
        key: '2',
        materialType: '内圈',
        qualityRequirement: '硬度HRC58-62，精度等级P5',
        attachments: ['质量标准.pdf'],
        materialSource: '自产',
        specification: '7006C',
        materialRequirement: '硬度HRC58-62',
        requirementDate: '2025-02',
        requirementQuantity: 800,
      },
      {
        key: '3',
        materialType: '密封件',
        qualityRequirement: '耐温-40℃~+120℃，密封性能良好',
        attachments: ['材料证书.pdf', '测试报告.doc'],
        materialSource: '外购',
        specification: '6004-RZ',
        materialRequirement: '耐温-40~120℃',
        requirementDate: '2025-03',
        requirementQuantity: 2000,
      },
      {
        key: '4',
        materialType: '滚动体',
        qualityRequirement: '球度误差≤0.5μm，表面光洁度高',
        attachments: ['检测报告.pdf'],
        materialSource: '外购',
        specification: '6.35',
        materialRequirement: '球度误差≤0.5μm',
        requirementDate: '2025-03',
        requirementQuantity: 5000,
      },
      {
        key: '5',
        materialType: '保持架',
        qualityRequirement: '材质：黄铜，尺寸精度高',
        attachments: ['材质证明.pdf', '尺寸检测表.xls'],
        materialSource: '自产',
        specification: '6004',
        materialRequirement: '材质：黄铜',
        requirementDate: '2025-04',
        requirementQuantity: 300,
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

    if (values.materialType) {
      filtered = filtered.filter(item => 
        item.materialType.includes(values.materialType)
      );
    }

    if (values.requirementDate) {
      const selectedMonth = values.requirementDate.format('YYYY-MM');
      filtered = filtered.filter(item => 
        item.requirementDate === selectedMonth
      );
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

  // 表格列配置
  const columns = [
    {
      title: '物料类型',
      dataIndex: 'materialType',
      key: 'materialType',
      width: 100,
      fixed: 'left',
    },
    {
      title: '质量要求（含附件）',
      dataIndex: 'qualityRequirement',
      key: 'qualityRequirement',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>{text}</div>
          {record.attachments && record.attachments.length > 0 && (
            <div>
              {record.attachments.map((file, index) => (
                <Button
                  key={index}
                  type="link"
                  size="small"
                  style={{ padding: 0, marginRight: SPACING.MD, fontSize: FONT_SIZES.SM }}
                  onClick={() => message.info(`查看附件：${file}`)}
                >
                  📎 {file}
                </Button>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '物料来源',
      dataIndex: 'materialSource',
      key: 'materialSource',
      width: 100,
      render: (text) => (
        <span style={{ 
          ...createProductionSourceStyle(text),
          fontWeight: 500 
        }}>
          {text}
        </span>
      ),
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 150,
    },
    {
      title: '物料要求',
      dataIndex: 'materialRequirement',
      key: 'materialRequirement',
      width: 200,
    },
    {
      title: '需求日期',
      dataIndex: 'requirementDate',
      key: 'requirementDate',
      width: 120,
      align: 'center',
    },
    {
      title: '需求数量',
      dataIndex: 'requirementQuantity',
      key: 'requirementQuantity',
      width: 120,
      align: 'right',
      render: (value) => value?.toLocaleString(),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>物料准备需求</h1>
      </div>

      {/* 筛选区域 */}
      <Card className="filter-card" style={{ marginBottom: 16 }}>
        <Form form={filterForm} layout="inline">
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={8}>
              <Form.Item label="物料类型" name="materialType">
                <Select placeholder="请选择物料类型" allowClear style={{ width: '100%' }}>
                  <Select.Option value="轴承">轴承</Select.Option>
                  <Select.Option value="密封件">密封件</Select.Option>
                  <Select.Option value="润滑脂">润滑脂</Select.Option>
                  <Select.Option value="钢材">钢材</Select.Option>
                  <Select.Option value="保持架">保持架</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="需求日期" name="requirementDate">
                <DatePicker 
                  picker="month" 
                  placeholder="请选择需求月份" 
                  style={{ width: '100%' }} 
                  allowClear 
                />
              </Form.Item>
            </Col>
            <Col span={8}>
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
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 数据表格 */}
      <Card 
        className="table-card"
        title={`物料需求列表 (共 ${filteredDataSource.length} 条)`}
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
    </div>
  );
};

export default MaterialPreparationRequirement;