import React, { useState, useRef } from 'react';
import {
  Card,
  Button,
  Space,
  DatePicker,
  Select,
  Form,
  Table,
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

const RecentArrivalPlan = () => {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [selectedMaterialType, setSelectedMaterialType] = useState('全部');
  const [isEditMode, setIsEditMode] = useState(true);

  // 物料类型选项
  const materialTypeOptions = [
    '全部',
    '外圈',
    '内圈',
    '滚动体',
    '保持架',
    '密封件',
  ];

  // 处理物料类型筛选变化
  const handleMaterialTypeChange = (value) => {
    setSelectedMaterialType(value || '全部');
  };

  // 处理月份选择变化
  const handleMonthChange = (date) => {
    setSelectedMonth(date);
  };

  // 获取筛选后的数据
  const getFilteredDataSource = () => {
    let filtered = [...data];
    
    // 按物料类型筛选
    if (selectedMaterialType !== '全部') {
      filtered = filtered.filter(item => item.materialType === selectedMaterialType);
    }
    
    return filtered;
  };



  // 生成当月的日期列表
  const generateDatesForMonth = (month) => {
    const startDate = month.startOf('month');
    const endDate = month.endOf('month');
    const dates = [];
    
    for (let date = startDate; date.isBefore(endDate) || date.isSame(endDate); date = date.add(1, 'day')) {
      dates.push({
        date: date.format('YYYY-MM-DD'),
        day: date.date(),
        period: date.date() <= 10 ? 'firstTen' : date.date() <= 20 ? 'middleTen' : 'lastTen'
      });
    }
    
    return dates;
  };

  // 模拟数据
  const generateMockData = () => {
    const dates = generateDatesForMonth(selectedMonth);
    return [
      {
        key: '1',
        materialType: '外圈',
        qualityRequirement: '表面粗糙度Ra≤0.8μm，硬度HRC58-62',
        attachments: ['技术要求.pdf', '检验标准.doc'],
        materialSource: '外购',
        specification: '234424BM',
        materialRequirement: '表面粗糙度Ra≤0.8',
        dailyData: dates.reduce((acc, dateInfo) => {
          acc[dateInfo.date] = {
            demand: [1, 11, 21].includes(dateInfo.day) ? 150 : 0,
            plan: [1, 11, 21].includes(dateInfo.day) ? 120 : 0
          };
          return acc;
        }, {}),
      },
      {
        key: '2',
        materialType: '内圈',
        qualityRequirement: '硬度HRC58-62，精度等级P5',
        attachments: ['质量标准.pdf'],
        materialSource: '外购',
        specification: '7006C',
        materialRequirement: '硬度HRC58-62',
        dailyData: dates.reduce((acc, dateInfo) => {
          acc[dateInfo.date] = {
            demand: [5, 15, 25].includes(dateInfo.day) ? 100 : 0,
            plan: [5, 15, 25].includes(dateInfo.day) ? 90 : 0
          };
          return acc;
        }, {}),
      },
      {
        key: '3',
        materialType: '密封件',
        qualityRequirement: '耐温-40℃~+120℃，密封性能良好',
        attachments: ['材料证书.pdf', '测试报告.doc'],
        materialSource: '外购',
        specification: '6004-RZ',
        materialRequirement: '耐温-40~120℃',
        dailyData: dates.reduce((acc, dateInfo) => {
          acc[dateInfo.date] = {
            demand: [3, 13, 23].includes(dateInfo.day) ? 200 : 0,
            plan: [3, 13, 23].includes(dateInfo.day) ? 180 : 0
          };
          return acc;
        }, {}),
      },
    ];
  };

  const [data, setData] = useState([]);

  // 初始化数据
  React.useEffect(() => {
    setData(generateMockData());
  }, [selectedMonth]);

  // 处理计划量变化
  const handlePlanChange = (recordKey, date, value) => {
    const updatedData = data.map(item => {
      if (item.key === recordKey) {
        return {
          ...item,
          dailyData: {
            ...item.dailyData,
            [date]: {
              ...item.dailyData[date],
              plan: value || 0
            }
          }
        };
      }
      return item;
    });
    setData(updatedData);
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
        title: '物料要求',
        dataIndex: 'materialRequirement',
        key: 'materialRequirement',
        width: 150,
        render: (text) => text || '-',
      },
    ];

    // 按旬期分组日期列
    const firstTenDates = dates.filter(d => d.period === 'firstTen');
    const middleTenDates = dates.filter(d => d.period === 'middleTen');
    const lastTenDates = dates.filter(d => d.period === 'lastTen');

    // 计算期间合计
     const calculatePeriodTotals = (periodDates, dataSource) => {
       let totalDemand = 0;
       let totalPlan = 0;
       
       dataSource.forEach(record => {
         periodDates.forEach(dateInfo => {
           const dayData = record.dailyData[dateInfo.date] || { demand: 0, plan: 0 };
           totalDemand += dayData.demand || 0;
           totalPlan += dayData.plan || 0;
         });
       });
       
       return { totalDemand, totalPlan };
     };

     // 检查某一天是否所有规格的计划都为0
      const isDayAllZeroPlan = (dateStr, dataSource) => {
        return dataSource.every(record => {
          const dayData = record.dailyData[dateStr] || { demand: 0, plan: 0 };
          return dayData.plan === 0;
        });
      };

      // 生成日期列
      const generateDateColumns = (periodDates, periodTitle) => {
        const filteredDataSource = getFilteredDataSource();
        
        // 在展示状态下过滤掉计划全为0的日期
        const visibleDates = isEditMode ? periodDates : periodDates.filter(dateInfo => 
          !isDayAllZeroPlan(dateInfo.date, filteredDataSource)
        );
        
        if (visibleDates.length === 0) {
          return null;
        }
        
        const { totalDemand, totalPlan } = calculatePeriodTotals(visibleDates, filteredDataSource);
        
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
          children: visibleDates.map(dateInfo => ({
            title: `${dateInfo.date.slice(5)}`,
            key: dateInfo.date,
            width: 80,
            render: (_, record) => {
              const dayData = record.dailyData[dateInfo.date] || { demand: 0, plan: 0 };
              return (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    marginBottom: 4, 
                    fontSize: '12px', 
                    color: dayData.demand > 0 ? '#1890ff' : '#666',
                    width: '6em',
                    textAlign: 'left'
                  }}>
                    需求: {dayData.demand}
                  </div>
                  <div>
                    {isEditMode ? (
                      <InputNumber
                        size="small"
                        value={dayData.plan}
                        onChange={(value) => handlePlanChange(record.key, dateInfo.date, value)}
                        min={0}
                        style={{ width: '60px' }}
                        placeholder="计划"
                      />
                    ) : (
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{dayData.plan}</span>
                    )}
                  </div>
                </div>
              );
            },
          }))
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

  // 导出Excel
  const handleExport = () => {
    const exportData = [];
    data.forEach(item => {
      (item.subPlans || []).forEach(subPlan => {
        exportData.push({
          '物料类型': item.materialType,
          '质量要求（含附件）': item.qualityRequirement,
          '物料来源': item.materialSource,
          '规格': item.specification,
          '物料要求': item.materialRequirement || '-',
          '到货日期': subPlan.arrivalDate,
          '到货数量': subPlan.arrivalQuantity,
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '近期计划到货');
    XLSX.writeFile(wb, `近期计划到货_${selectedMonth.format('YYYY年MM月')}.xlsx`);
  };

  return (
    <div>
      <div className="page-header">
        <h1>近期计划到货</h1>
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
            
            <span>日期：</span>
            <DatePicker
              picker="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              format="YYYY年MM月"
            />
            
            <Button
              type="primary"
              icon={isEditMode ? <SaveOutlined /> : <EditOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              {isEditMode ? '保存' : '编辑'}
            </Button>
            
            <Button 
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出Excel
            </Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={getFilteredDataSource()}
          loading={loading}
          pagination={{
            total: getFilteredDataSource().length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1500, y: 600 }}
          size="small"
        />
      </Card>
      

    </div>
  );
};

export default RecentArrivalPlan;