import React, { useState, useRef } from 'react';
import {
  Card,
  Button,
  Space,
  DatePicker,
  Select,
  Form,
  Table,
  Drawer,
  Tag,
  message,
} from 'antd';
import {
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Option } = Select;

const MaterialArrivalRequirement = () => {
  const [filterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedMaterialType, setSelectedMaterialType] = useState('全部');
  const [selectedMaterialRequirement, setSelectedMaterialRequirement] = useState('全部');
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerData, setDrawerData] = useState([]);
  const [drawerTitle, setDrawerTitle] = useState('');
  const tableRef = useRef();

  // 物料类型选项
  const materialTypeOptions = [
    '全部',
    '外圈',
    '内圈',
    '滚动体',
    '保持架',
    '密封件',
  ];

  // 物料要求选项
  const materialRequirementOptions = [
    '全部',
    '表面粗糙度Ra≤0.8',
    '硬度HRC58-62',
    '耐温-40~120℃',
    '球度误差≤0.5μm',
    '材质：黄铜',
  ];

  // 初始化模拟数据
  const initMockData = () => {
    const mockData = [
      {
        key: '1',
        materialType: '外圈',
        specification: '234424BM',
        qualityRequirement: '表面粗糙度Ra≤0.8μm，硬度HRC58-62',
        attachments: ['技术要求.pdf', '检验标准.doc'],
        materialSource: '外购',
        materialRequirement: '表面粗糙度Ra≤0.8',
        firstTen: { demand: 120, plan: 100 },
        middleTen: { demand: 80, plan: 80 },
        lastTen: { demand: 150, plan: 120 },
      },
      {
        key: '2',
        materialType: '内圈',
        specification: '7006C',
        qualityRequirement: '硬度HRC58-62，精度等级P5',
        attachments: ['质量标准.pdf'],
        materialSource: '自产',
        materialRequirement: '硬度HRC58-62',
        firstTen: { demand: 200, plan: 180 },
        middleTen: { demand: 160, plan: 160 },
        lastTen: { demand: 100, plan: 80 },
      },
      {
        key: '3',
        materialType: '密封件',
        specification: '6004-RZ',
        qualityRequirement: '耐温-40℃~+120℃，密封性能良好',
        attachments: ['材料证书.pdf', '测试报告.doc'],
        materialSource: '外购',
        materialRequirement: '耐温-40~120℃',
        firstTen: { demand: 500, plan: 400 },
        middleTen: { demand: 300, plan: 300 },
        lastTen: { demand: 200, plan: 150 },
      },
      {
        key: '4',
        materialType: '滚动体',
        specification: '6.35',
        qualityRequirement: '球度误差≤0.5μm，表面光洁度高',
        attachments: ['检测报告.pdf'],
        materialSource: '外购',
        materialRequirement: '球度误差≤0.5μm',
        firstTen: { demand: 1000, plan: 950 },
        middleTen: { demand: 800, plan: 750 },
        lastTen: { demand: 1200, plan: 1100 },
      },
      {
        key: '5',
        materialType: '保持架',
        specification: '6004',
        qualityRequirement: '材质：黄铜，尺寸精度高',
        attachments: ['材质证明.pdf', '尺寸检测表.xls'],
        materialSource: '自产',
        materialRequirement: '材质：黄铜',
        firstTen: { demand: 300, plan: 280 },
        middleTen: { demand: 250, plan: 250 },
        lastTen: { demand: 200, plan: 180 },
      },
    ];
    setDataSource(mockData);
  };

  React.useEffect(() => {
    initMockData();
  }, []);

  // 处理物料类型筛选变化
  const handleMaterialTypeChange = (value) => {
    setSelectedMaterialType(value || '全部');
  };

  // 处理物料要求筛选变化
  const handleMaterialRequirementChange = (value) => {
    setSelectedMaterialRequirement(value || '全部');
  };

  // 处理月份选择变化
  const handleMonthChange = (date) => {
    setSelectedMonth(date);
  };

  // 获取筛选后的数据
  const getFilteredDataSource = () => {
    let filtered = [...dataSource];
    
    // 按物料类型筛选
    if (selectedMaterialType !== '全部') {
      filtered = filtered.filter(item => item.materialType === selectedMaterialType);
    }
    
    // 按物料要求筛选
    if (selectedMaterialRequirement !== '全部') {
      filtered = filtered.filter(item => item.materialRequirement === selectedMaterialRequirement);
    }
    
    return filtered;
  };

  // 处理计划数量点击
  const handlePlanClick = (record, period) => {
    // 模拟到货计划数据
    const planData = [
      {
        key: '1',
        contractNo: 'HT2025001',
        supplier: '北京精密轴承有限公司',
        model: record.specification,
        planDate: selectedMonth.format('YYYY-MM') + '-05',
        planQuantity: Math.floor(record[period].plan * 0.6),
        status: '已确认',
      },
      {
        key: '2',
        contractNo: 'HT2025002',
        supplier: '上海轴承制造厂',
        model: record.specification,
        planDate: selectedMonth.format('YYYY-MM') + '-08',
        planQuantity: Math.floor(record[period].plan * 0.4),
        status: '待确认',
      },
    ];
    
    setDrawerData(planData);
    setDrawerTitle(`${record.specification} - ${period === 'firstTen' ? '上旬' : period === 'middleTen' ? '中旬' : '下旬'}到货计划`);
    setDrawerVisible(true);
  };

  // 渲染数量单元格
  const renderQuantityCell = (record, period) => {
    const data = record[period];
    const periodName = period === 'firstTen' ? '上旬' : period === 'middleTen' ? '中旬' : '下旬';
    
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 4 }}>需求: {data.demand}</div>
        <div>
          计划: 
          <Button 
            type="link" 
            size="small" 
            style={{ padding: 0, height: 'auto', fontSize: '12px' }}
            onClick={() => handlePlanClick(record, period)}
          >
            {data.plan}
          </Button>
        </div>
      </div>
    );
  };

  // 表格列定义
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
      fixed: 'left',
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
                  style={{ padding: 0, marginRight: 8, fontSize: '12px' }}
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
      fixed: 'left',
      render: (text) => (
        <span style={{ 
          color: text === '自产' ? '#52c41a' : '#1890ff',
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
      fixed: 'left',
    },
    {
      title: '物料要求',
      dataIndex: 'materialRequirement',
      key: 'materialRequirement',
      width: 200,
      render: (text) => text || '-',
    },
    {
      title: '上旬(1-10)',
      key: 'firstTen',
      width: 120,
      render: (_, record) => renderQuantityCell(record, 'firstTen'),
    },
    {
      title: '中旬(11-20)',
      key: 'middleTen',
      width: 120,
      render: (_, record) => renderQuantityCell(record, 'middleTen'),
    },
    {
      title: '下旬(21-30)',
      key: 'lastTen',
      width: 120,
      render: (_, record) => renderQuantityCell(record, 'lastTen'),
    },
  ];

  // 抽屉中的表格列定义
  const drawerColumns = [
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
      width: 200,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 120,
    },
    {
      title: '计划日期',
      dataIndex: 'planDate',
      key: 'planDate',
      width: 120,
    },
    {
      title: '计划数量',
      dataIndex: 'planQuantity',
      key: 'planQuantity',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === '已确认' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
  ];

  // 导出Excel
  const handleExport = () => {
    const filteredData = getFilteredDataSource();
    const exportData = filteredData.map(item => ({
      '物料类型': item.materialType,
      '规格': item.specification,
      '物料要求': item.materialRequirement || '-',
      '上旬需求数量': item.firstTen.demand,
      '上旬计划数量': item.firstTen.plan,
      '中旬需求数量': item.middleTen.demand,
      '中旬计划数量': item.middleTen.plan,
      '下旬需求数量': item.lastTen.demand,
      '下旬计划数量': item.lastTen.plan,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '物料到货需求');
    XLSX.writeFile(wb, `物料到货需求_${selectedMonth.format('YYYY年MM月')}.xlsx`);
  };

  return (
    <div>
      <div className="page-header">
        <h1>物料到货需求</h1>
      </div>
      
      <Card style={{ marginTop: '16px', marginRight: '16px', marginBottom: '16px' }}>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <span>物料类型：</span>
            <Select
              value={selectedMaterialType}
              onChange={handleMaterialTypeChange}
              style={{ width: 120 }}
            >
              {materialTypeOptions.map(option => (
                <Option key={option} value={option}>{option}</Option>
              ))}
            </Select>
            
            <span>物料要求：</span>
            <Select
              value={selectedMaterialRequirement}
              onChange={handleMaterialRequirementChange}
              style={{ width: 200 }}
              placeholder="请选择物料要求"
            >
              {materialRequirementOptions.map(option => (
                <Option key={option} value={option}>{option}</Option>
              ))}
            </Select>
            
            <span>日期：</span>
            <DatePicker
              picker="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              format="YYYY年MM月"
            />
            
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出Excel
            </Button>
          </Space>
        </div>
        
        <Table
          ref={tableRef}
          columns={columns}
          dataSource={getFilteredDataSource()}
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
      
      <Drawer
        title={drawerTitle}
        placement="right"
        width={800}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Table
          columns={drawerColumns}
          dataSource={drawerData}
          pagination={false}
          size="small"
        />
      </Drawer>
    </div>
  );
};

export default MaterialArrivalRequirement;