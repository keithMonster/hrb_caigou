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
  InputNumber,
} from 'antd';
import {
  DownloadOutlined,
  SaveOutlined,
  EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Option } = Select;

const MaterialArrivalRequirement = () => {
  const [filterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedMaterialType, setSelectedMaterialType] = useState('全部');
  const [isEditMode, setIsEditMode] = useState(true);
  const [selectedMaterialRequirement, setSelectedMaterialRequirement] =
    useState('全部');
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

  // 生成当月的日期列表
  const generateDatesForMonth = (month) => {
    const startDate = month.startOf('month');
    const endDate = month.endOf('month');
    const dates = [];

    for (
      let date = startDate;
      date.isBefore(endDate) || date.isSame(endDate);
      date = date.add(1, 'day')
    ) {
      dates.push({
        date: date.format('YYYY/MM/DD'),
        day: date.date(),
        period:
          date.date() <= 10
            ? 'firstTen'
            : date.date() <= 20
            ? 'middleTen'
            : 'lastTen',
      });
    }

    return dates;
  };

  // 初始化模拟数据
  const initMockData = () => {
    const dates = generateDatesForMonth(selectedMonth);
    const mockData = [
      {
        key: '1',
        materialType: '外圈',
        specification: '234424BM',
        qualityRequirement: '表面粗糙度Ra≤0.8μm，硬度HRC58-62',
        attachments: ['技术要求.pdf', '检验标准.doc'],
        materialSource: '外购',
        materialRequirement: '表面粗糙度Ra≤0.8',
        dailyData: dates.reduce((acc, dateInfo) => {
          acc[dateInfo.date] = {
            demand: dateInfo.day === 1 ? 120 : 0, // 默认在每旬第一天填写数量
            plan: dateInfo.day === 1 ? 100 : 0,
          };
          return acc;
        }, {}),
      },
      {
        key: '2',
        materialType: '内圈',
        specification: '7006C',
        qualityRequirement: '硬度HRC58-62，精度等级P5',
        attachments: ['质量标准.pdf'],
        materialSource: '自产',
        materialRequirement: '硬度HRC58-62',
        dailyData: dates.reduce((acc, dateInfo) => {
          acc[dateInfo.date] = {
            demand: dateInfo.day === 11 ? 160 : 0,
            plan: dateInfo.day === 11 ? 160 : 0,
          };
          return acc;
        }, {}),
      },
      {
        key: '3',
        materialType: '密封件',
        specification: '6004-RZ',
        qualityRequirement: '耐温-40℃~+120℃，密封性能良好',
        attachments: ['材料证书.pdf', '测试报告.doc'],
        materialSource: '外购',
        materialRequirement: '耐温-40~120℃',
        dailyData: dates.reduce((acc, dateInfo) => {
          acc[dateInfo.date] = {
            demand: dateInfo.day === 21 ? 200 : 0,
            plan: dateInfo.day === 21 ? 150 : 0,
          };
          return acc;
        }, {}),
      },
      {
        key: '4',
        materialType: '滚动体',
        specification: '6.35',
        qualityRequirement: '球度误差≤0.5μm，表面光洁度高',
        attachments: ['检测报告.pdf'],
        materialSource: '外购',
        materialRequirement: '球度误差≤0.5μm',
        dailyData: dates.reduce((acc, dateInfo) => {
          acc[dateInfo.date] = {
            demand: [1, 11, 21].includes(dateInfo.day) ? 300 : 0,
            plan: [1, 11, 21].includes(dateInfo.day) ? 280 : 0,
          };
          return acc;
        }, {}),
      },
      {
        key: '5',
        materialType: '保持架',
        specification: '6004',
        qualityRequirement: '材质：黄铜，尺寸精度高',
        attachments: ['材质证明.pdf', '尺寸检测表.xls'],
        materialSource: '自产',
        materialRequirement: '材质：黄铜',
        dailyData: dates.reduce((acc, dateInfo) => {
          acc[dateInfo.date] = {
            demand: [1, 11, 21].includes(dateInfo.day) ? 200 : 0,
            plan: [1, 11, 21].includes(dateInfo.day) ? 180 : 0,
          };
          return acc;
        }, {}),
      },
    ];
    setDataSource(mockData);
  };

  React.useEffect(() => {
    initMockData();
  }, [selectedMonth]);

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
    // 月份变化时会触发useEffect重新生成数据
  };

  // 获取筛选后的数据
  const getFilteredDataSource = () => {
    let filtered = [...dataSource];

    // 按物料类型筛选
    if (selectedMaterialType !== '全部') {
      filtered = filtered.filter(
        (item) => item.materialType === selectedMaterialType
      );
    }

    // 按物料要求筛选
    if (selectedMaterialRequirement !== '全部') {
      filtered = filtered.filter(
        (item) => item.materialRequirement === selectedMaterialRequirement
      );
    }

    return filtered;
  };

  // 处理需求量变化
  const handleDemandChange = (recordKey, date, value) => {
    const updatedData = dataSource.map((item) => {
      if (item.key === recordKey) {
        return {
          ...item,
          dailyData: {
            ...item.dailyData,
            [date]: {
              ...item.dailyData[date],
              demand: value || 0,
            },
          },
        };
      }
      return item;
    });
    setDataSource(updatedData);
  };

  // 保存数据或切换编辑模式
  const handleSave = () => {
    if (isEditMode) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        message.success('保存成功');
        setIsEditMode(false);
      }, 1000);
    } else {
      setIsEditMode(true);
    }
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
    setDrawerTitle(
      `${record.specification} - ${
        period === 'firstTen'
          ? '上旬'
          : period === 'middleTen'
          ? '中旬'
          : '下旬'
      }到货计划`
    );
    setDrawerVisible(true);
  };

  // 生成表格列定义
  const generateColumns = () => {
    const dates = generateDatesForMonth(selectedMonth);

    // 基础固定列
    const fixedColumns = [
      {
        title: '物料类型',
        dataIndex: 'materialType',
        key: 'materialType',
        width: 100,
        fixed: 'left',
      },
      {
        title: '规格',
        dataIndex: 'specification',
        key: 'specification',
        width: 120,
        fixed: 'left',
      },
    ];

    // 滚动列
    const scrollColumns = [
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
                    type='link'
                    size='small'
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
        render: (text) => (
          <span
            style={{
              color: text === '自产' ? '#52c41a' : '#1890ff',
              fontWeight: 500,
            }}
          >
            {text}
          </span>
        ),
      },
      {
        title: '物料要求',
        dataIndex: 'materialRequirement',
        key: 'materialRequirement',
        width: 150,
        render: (text) => text || '-',
      },
    ];

    // 按旬期分组日期列
    const firstTenDates = dates.filter((d) => d.period === 'firstTen');
    const middleTenDates = dates.filter((d) => d.period === 'middleTen');
    const lastTenDates = dates.filter((d) => d.period === 'lastTen');

    // 计算期间合计
    const calculatePeriodTotals = (periodDates, dataSource) => {
      let totalDemand = 0;
      let totalPlan = 0;

      dataSource.forEach((record) => {
        periodDates.forEach((dateInfo) => {
          const dayData = record.dailyData[dateInfo.date] || {
            demand: 0,
            plan: 0,
          };
          totalDemand += dayData.demand || 0;
          totalPlan += dayData.plan || 0;
        });
      });

      return { totalDemand, totalPlan };
    };

    // 检查某一天是否所有规格的需求都为0
    const isDayAllZeroDemand = (dateStr, dataSource) => {
      return dataSource.every(record => {
        const dayData = record.dailyData[dateStr] || { demand: 0, plan: 0 };
        return dayData.demand === 0;
      });
    };

    // 生成日期列
    const generateDateColumns = (periodDates, periodTitle) => {
      const filteredDataSource = getFilteredDataSource();
      
      // 在展示状态下过滤掉需求全为0的日期
      const visibleDates = isEditMode ? periodDates : periodDates.filter(dateInfo => 
        !isDayAllZeroDemand(dateInfo.date, filteredDataSource)
      );
      
      if (visibleDates.length === 0) {
        return null;
      }
      
      const { totalDemand, totalPlan } = calculatePeriodTotals(
        visibleDates,
        filteredDataSource
      );

      return {
        title: (
          <div>
            <div>{periodTitle}</div>
            <div style={{ fontSize: '12px', fontWeight: 'normal' }}>
              <span style={{ color: '#52c41a' }}>计划:{totalPlan}</span>
              <span>/</span>
              <span style={{ color: '#1890ff' }}>需求:{totalDemand}</span>
            </div>
          </div>
        ),
        children: visibleDates.map((dateInfo) => ({
          title: `${dateInfo.date.slice(5)}`,
          key: dateInfo.date,
          width: 80,
          render: (_, record) => {
            const dayData = record.dailyData[dateInfo.date] || {
              demand: 0,
              plan: 0,
            };
            return (
              <div style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: 4 }}>
                  {isEditMode ? (
                    <InputNumber
                      size='small'
                      value={dayData.demand}
                      onChange={(value) =>
                        handleDemandChange(record.key, dateInfo.date, value)
                      }
                      min={0}
                      style={{ width: '60px' }}
                      placeholder='需求'
                    />
                  ) : (
                    <InputNumber
                      size='small'
                      value={dayData.demand}
                      readOnly
                      onChange={(value) =>
                        handleDemandChange(record.key, dateInfo.date, value)
                      }
                      min={0}
                      style={{ width: '60px' }}
                      placeholder='需求'
                    />
                  )}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: dayData.plan > 0 ? '#52c41a' : '#666',
                    fontWeight: dayData.plan > 0 ? '500' : 'normal',
                    width: '6em',
                    textAlign: 'left',
                  }}
                >
                  计划: {dayData.plan}
                </div>
              </div>
            );
          },
        })),
      };
    };

    const dateColumns = [];
    if (firstTenDates.length > 0) {
      const firstTenColumn = generateDateColumns(firstTenDates, '上旬');
      if (firstTenColumn) {
        dateColumns.push(firstTenColumn);
      }
    }
    if (middleTenDates.length > 0) {
      const middleTenColumn = generateDateColumns(middleTenDates, '中旬');
      if (middleTenColumn) {
        dateColumns.push(middleTenColumn);
      }
    }
    if (lastTenDates.length > 0) {
      const lastTenColumn = generateDateColumns(lastTenDates, '下旬');
      if (lastTenColumn) {
        dateColumns.push(lastTenColumn);
      }
    }

    return [...fixedColumns, ...scrollColumns, ...dateColumns];
  };

  const columns = generateColumns();

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
        <Tag color={status === '已确认' ? 'green' : 'orange'}>{status}</Tag>
      ),
    },
  ];

  // 导出Excel
  const handleExport = () => {
    const filteredData = getFilteredDataSource();
    const dates = generateDatesForMonth(selectedMonth);

    const exportData = filteredData.map((item) => {
      const row = {
        物料类型: item.materialType,
        规格: item.specification,
        质量要求: item.qualityRequirement,
        物料来源: item.materialSource,
        物料要求: item.materialRequirement || '-',
      };

      // 添加每日的需求量和计划量
      dates.forEach((dateInfo) => {
        const dayData = item.dailyData[dateInfo.date] || { demand: 0, plan: 0 };
        row[`${dateInfo.day}日需求量`] = dayData.demand;
        row[`${dateInfo.day}日计划量`] = dayData.plan;
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '物料到货需求');
    XLSX.writeFile(
      wb,
      `物料到货需求_${selectedMonth.format('YYYY年MM月')}.xlsx`
    );
  };

  return (
    <div>
      <div className='page-header'>
        <h1>物料到货需求</h1>
      </div>

      <Card
        style={{ marginTop: '16px', marginRight: '16px', marginBottom: '16px' }}
      >
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <span>物料类型：</span>
            <Select
              value={selectedMaterialType}
              onChange={handleMaterialTypeChange}
              style={{ width: 120 }}
            >
              {materialTypeOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>

            <span>物料要求：</span>
            <Select
              value={selectedMaterialRequirement}
              onChange={handleMaterialRequirementChange}
              style={{ width: 200 }}
              placeholder='请选择物料要求'
            >
              {materialRequirementOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>

            <span>日期：</span>
            <DatePicker
              picker='month'
              value={selectedMonth}
              onChange={handleMonthChange}
              format='YYYY年MM月'
            />

            <Button
              type="primary"
              icon={isEditMode ? <SaveOutlined /> : <EditOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              {isEditMode ? '保存' : '编辑'}
            </Button>

            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出Excel
            </Button>
          </Space>
        </div>

        <Table
          ref={tableRef}
          columns={columns}
          dataSource={getFilteredDataSource()}
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Drawer
        title={drawerTitle}
        placement='right'
        width={800}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Table
          columns={drawerColumns}
          dataSource={drawerData}
          pagination={false}
          size='small'
        />
      </Drawer>
    </div>
  );
};

export default MaterialArrivalRequirement;
