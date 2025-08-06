import React, { useState, useRef } from 'react';
import {
  Card,
  Button,
  Space,
  DatePicker,
  Select,
  Form,
  InputNumber,
  message,
  Table,
  Pagination,
  Drawer,
  Tag,
} from 'antd';
import {
  SaveOutlined,
  DownloadOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ProductionPlan = () => {
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState([dayjs('2025-08-01'), dayjs('2025-08-31')]);
  const [selectedFactory, setSelectedFactory] = useState('全部');
  const [selectedQualityRequirement, setSelectedQualityRequirement] = useState('全部');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerData, setDrawerData] = useState([]);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [materialDrawerVisible, setMaterialDrawerVisible] = useState(false);
  const [materialDrawerData, setMaterialDrawerData] = useState(null);
  const tableRef = useRef();

  // 根据选中的日期范围生成日期列
  const generateDateColumns = (dateRange = selectedDateRange) => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      // 默认显示2025年8月整月
      const startDate = dayjs('2025-08-01');
      const endDate = dayjs('2025-08-31');
      const dates = [];
      const daysDiff = endDate.diff(startDate, 'day') + 1;
      for (let i = 0; i < daysDiff; i++) {
        dates.push(startDate.add(i, 'day'));
      }
      return dates;
    }
    
    const dates = [];
    const startDate = dateRange[0];
    const endDate = dateRange[1];
    const daysDiff = endDate.diff(startDate, 'day') + 1;
    
    // 最多显示31天
    const totalDays = Math.min(daysDiff, 31);
    for (let i = 0; i < totalDays; i++) {
      dates.push(startDate.add(i, 'day'));
    }
    return dates;
  };

  const dateColumns = generateDateColumns(selectedDateRange);

  // 初始化模拟数据
  const initMockData = () => {
    const dateCols = generateDateColumns(selectedDateRange);
    const colLength = dateCols.length || 10; // 默认10列
    
    const mockData = [
      {
        key: '1',
        model: '6205',
        qualityRequirement: null,
        factory: '电机',
        type: 'A类',
        initialStock: 100,
        demandQuantities: new Array(colLength).fill(0).map((_, index) => {
          if (index === 1) return 25;
          if (index === 3) return 18;
          if (index === 5) return 32;
          if (index === 9) return 15;
          return 0;
        }),
        totalDemand: 90,
        oct31Demand: 150,
        planGroups: [
          {
            key: 'plan_1_1',
            groupType: '计划组1',
            productionLine: '1',
            dailyPlans: new Array(colLength).fill(0),
            totalPlan: 0,
          }
        ],
      },
      {
        key: '2',
        model: '6206',
        qualityRequirement: null,
        factory: '铁路',
        type: 'B类',
        initialStock: 0,
        demandQuantities: new Array(colLength).fill(0).map((_, index) => {
          if (index === 1) return 12;
          if (index === 3) return 20;
          if (index === 5) return 8;
          if (index === 9) return 25;
          return 0;
        }),
        totalDemand: 65,
        oct31Demand: 120,
        planGroups: [
          {
            key: 'plan_2_1',
            groupType: '计划组1',
            productionLine: '3',
            dailyPlans: new Array(colLength).fill(0),
            totalPlan: 0,
          }
        ],
      },
      {
        key: '3',
        model: '6206',
        qualityRequirement: '耐高温要求，工作温度≤150°C',
        qualityDocument: {
          name: '耐高温技术要求.pdf',
          url: 'https://example.com/documents/high-temp-requirements.pdf'
        },
        factory: '精密',
        type: 'A类',
        initialStock: 0,
        demandQuantities: new Array(colLength).fill(0).map((_, index) => {
          if (index === 1) return 35;
          if (index === 3) return 28;
          if (index === 5) return 42;
          if (index === 9) return 20;
          return 0;
        }),
        totalDemand: 125,
        oct31Demand: null,
        planGroups: [
          {
            key: 'plan_3_1',
            groupType: '计划组1',
            productionLine: '5',
            dailyPlans: new Array(colLength).fill(0),
            totalPlan: 0,
          }
        ],
      },
      {
        key: '4',
        model: '6315-2RZ',
        qualityRequirement: null,
        factory: '黄海',
        type: 'B类',
        initialStock: 0,
        demandQuantities: new Array(colLength).fill(0).map((_, index) => {
          if (index === 1) return 8;
          if (index === 3) return 15;
          if (index === 5) return 12;
          if (index === 9) return 10;
          return 0;
        }),
        totalDemand: 45,
        oct31Demand: null,
        planGroups: [
          {
            key: 'plan_4_1',
            groupType: '计划组1',
            productionLine: '7',
            dailyPlans: new Array(colLength).fill(0),
            totalPlan: 0,
          }
        ],
      },
      {
        key: '5',
        model: '6311-2Z',
        qualityRequirement: '防腐蚀要求，盐雾试验≥240小时',
        qualityDocument: {
          name: '防腐蚀测试标准.pdf',
          url: 'https://example.com/documents/corrosion-test-standard.pdf'
        },
        factory: '电机',
        type: 'A类',
        initialStock: 0,
        demandQuantities: new Array(colLength).fill(0).map((_, index) => {
          if (index === 1) return 18;
          if (index === 3) return 22;
          if (index === 5) return 16;
          if (index === 9) return 12;
          return 0;
        }),
        totalDemand: 68,
        oct31Demand: null,
        planGroups: [
          {
            key: 'plan_5_1',
            groupType: '计划组1',
            productionLine: '2',
            dailyPlans: new Array(colLength).fill(0),
            totalPlan: 0,
          }
        ],
      },
    ];
    setDataSource(mockData);
  };

  React.useEffect(() => {
    initMockData();
  }, []);

  // 在数据初始化后，对每条记录执行一次handleTotalChange
  React.useEffect(() => {
    if (dataSource.length > 0) {
      dataSource.forEach((record) => {
        const expectedTotal = record.demandQuantities.reduce(
          (sum, val) => sum + (val || 0),
          0
        );
        if (expectedTotal > 0) {
          handleTotalChange(record, expectedTotal);
        }
      });
    }
  }, [dataSource.length]);

  // 处理需求数量变化
  const handleDemandChange = (recordKey, dateIndex, value) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === recordKey) {
          const newDemandQuantities = [...item.demandQuantities];
          newDemandQuantities[dateIndex] = value || 0;
          const totalDemand = newDemandQuantities.reduce((sum, val) => sum + val, 0);
          return {
            ...item,
            demandQuantities: newDemandQuantities,
            totalDemand,
          };
        }
        return item;
      })
    );
  };

  // 处理计划组日计划数量变化
  const handlePlanGroupDailyChange = (recordKey, groupKey, dateIndex, value) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === recordKey) {
          const newPlanGroups = item.planGroups.map((group) => {
            if (group.key === groupKey) {
              const newDailyPlans = [...group.dailyPlans];
              newDailyPlans[dateIndex] = value || 0;
              const totalPlan = newDailyPlans.reduce((sum, val) => sum + val, 0);
              return {
                ...group,
                dailyPlans: newDailyPlans,
                totalPlan,
              };
            }
            return group;
          });
          return {
            ...item,
            planGroups: newPlanGroups,
          };
        }
        return item;
      })
    );
  };

  // 关闭抽屉
  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setDrawerData([]);
    setDrawerTitle('');
  };



  // 处理生产线变化
  const handleProductionLineChange = (recordKey, groupKey, value) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === recordKey) {
          const newPlanGroups = item.planGroups.map((group) => {
            if (group.key === groupKey) {
              return {
                ...group,
                productionLine: value,
              };
            }
            return group;
          });
          return {
            ...item,
            planGroups: newPlanGroups,
          };
        }
        return item;
      })
    );
  };

  // 处理计划组类型变化
  const handleGroupTypeChange = (recordKey, groupKey, value) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === recordKey) {
          const newPlanGroups = item.planGroups.map((group) => {
            if (group.key === groupKey) {
              return {
                ...group,
                groupType: value,
              };
            }
            return group;
          });
          return {
            ...item,
            planGroups: newPlanGroups,
          };
        }
        return item;
      })
    );
  };

  // 添加计划组
  const handleAddPlanGroup = (recordKey) => {
    const dateCols = generateDateColumns(selectedDateRange);
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === recordKey) {
          const newGroupKey = `plan_${recordKey}_${item.planGroups.length + 1}`;
          const newPlanGroup = {
            key: newGroupKey,
            groupType: `计划组${item.planGroups.length + 1}`,
            productionLine: '生产线1',
            dailyPlans: new Array(dateCols.length || 10).fill(0),
            totalPlan: 0,
          };
          return {
            ...item,
            planGroups: [...item.planGroups, newPlanGroup],
          };
        }
        return item;
      })
    );
  };

  // 删除计划组
  const handleDeletePlanGroup = (recordKey, groupKey) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === recordKey && item.planGroups.length > 1) {
          const newPlanGroups = item.planGroups.filter((group) => group.key !== groupKey);
          return {
            ...item,
            planGroups: newPlanGroups,
          };
        }
        return item;
      })
    );
  };

  // 打开物料准备计划抽屉
  const handleOpenMaterialDrawer = (record, planGroup, groupIndex) => {
    const dateCols = generateDateColumns(selectedDateRange);
    
    // 模拟物料准备计划数据结构
    const materialData = {
      model: record.model,
      planIndex: groupIndex + 1,
      productionLine: planGroup.productionLine,
      dailyPlans: planGroup.dailyPlans,
      totalPlan: planGroup.totalPlan,
      dateColumns: dateCols,
      materials: [
        {
          key: 'material_1',
          materialType: '内圈',
          spec: 'GCr15',
          unitConsumption: 1.2,
          requirement: '热处理硬度HRC58-62'
        },
        {
          key: 'material_2', 
          materialType: '外圈',
          spec: 'GCr15',
          unitConsumption: 1.5,
          requirement: '表面粗糙度Ra0.8'
        },
        {
          key: 'material_3',
          materialType: '钢球',
          spec: 'GCr15',
          unitConsumption: 8.0,
          requirement: '球度误差≤0.5μm'
        },
        {
          key: 'material_4',
          materialType: '保持架',
          spec: '尼龙66',
          unitConsumption: 1.0,
          requirement: '耐温-40℃~120℃'
        },
        {
          key: 'material_5',
          materialType: '润滑脂',
          spec: '锂基脂',
          unitConsumption: 0.05,
          requirement: '滴点≥180℃'
        }
      ]
    };
    
    setMaterialDrawerData(materialData);
    setMaterialDrawerVisible(true);
  };

  // 处理分厂筛选变化
  const handleFactoryFilterChange = (factory) => {
    setSelectedFactory(factory);
  };

  // 处理质量要求筛选变化
  const handleQualityRequirementChange = (value) => {
    setSelectedQualityRequirement(value || '全部');
  };

  // 获取筛选后的数据
  const getFilteredDataSource = () => {
    let filtered = [...dataSource];
    
    // 按分厂筛选
    if (selectedFactory !== '全部') {
      filtered = filtered.filter(item => item.factory === selectedFactory);
    }
    
    // 按质量要求筛选
    if (selectedQualityRequirement !== '全部') {
      if (selectedQualityRequirement === '有') {
        filtered = filtered.filter(item => item.qualityRequirement);
      } else if (selectedQualityRequirement === '无') {
        filtered = filtered.filter(item => !item.qualityRequirement);
      }
    }
    
    return filtered;
  };

  // 处理总计变更
  const handleTotalChange = (record, value) => {
    const newData = [...dataSource];
    const targetRecord = newData.find((item) => item.key === record.key);
    if (targetRecord) {
      const avgValue = Math.floor((value || 0) / 10);
      const remainder = (value || 0) % 10;

      // 平均分配到每天，余数分配到前几天
      for (let i = 0; i < 10; i++) {
        targetRecord.demandQuantities[i] = avgValue + (i < remainder ? 1 : 0);
      }

      setDataSource(newData);
    }
  };

  // 生成表格列配置
  const generateColumns = () => {
    const dateCols = generateDateColumns(selectedDateRange);
    
    const columns = [
      {
        title: '型号',
        dataIndex: 'model',
        key: 'model',
        width: 120,
        fixed: 'left',
      },
      {
        title: '质量要求',
        dataIndex: 'qualityRequirement',
        key: 'qualityRequirement',
        width: 150,
        fixed: 'left',
        render: (value, record) => (
          <div>
            <div style={{ color: value ? '#ff4d4f' : '#999', marginBottom: '4px' }}>
              {value || '-'}
            </div>
            {record.qualityDocument && (
              <div>
                <FileTextOutlined style={{ color: '#1890ff', marginRight: '4px' }} />
                <a 
                  href={record.qualityDocument.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: '12px', color: '#1890ff' }}
                >
                  {record.qualityDocument.name}
                </a>
              </div>
            )}
          </div>
        ),
      },
      {
        title: '往期结转',
        dataIndex: 'initialStock',
        key: 'initialStock',
        width: 80,
        fixed: 'left',
        align: 'right',
        render: (value) => <span style={{ fontWeight: 500 }}>{value}</span>,
      },
    ];

    // 添加需求数量日期列
    dateCols.forEach((date, index) => {
      columns.push({
        title: date.format('MM/DD'),
        key: `demand_${index}`,
        width: 90,
        align: 'right',
        render: (_, record) => (
          <span style={{ fontWeight: 500 }}>
            {record.demandQuantities[index] || 0}
          </span>
        ),
      });
    });

    // 添加需求总计列
    columns.push({
      title: '需求总计',
      key: 'totalDemand',
      width: 80,
      align: 'right',
      render: (_, record) => (
        <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {record.totalDemand || 0}
        </div>
      ),
    });

    // 添加12/31需求列
    columns.push({
      title: '12/31',
      dataIndex: 'oct31Demand',
      key: 'oct31Demand',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (value) => (
        <div style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
          {value || '-'}
        </div>
      ),
    });

    return columns;
  };

  // 渲染展开行
  const renderExpandedRow = (record) => {
    const dateCols = generateDateColumns(selectedDateRange);
    
    return (
      <div style={{ padding: '16px', backgroundColor: '#fafafa' }}>
        {record.planGroups.map((planGroup, groupIndex) => (
          <div key={planGroup.key} style={{ marginBottom: '16px' }}>
            {/* 计划标题行 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '8px',
              padding: '8px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px'
            }}>
              <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
                计划 {groupIndex + 1}:
              </span>
              <InfoCircleOutlined 
                style={{ 
                  color: '#1890ff', 
                  cursor: 'pointer', 
                  marginRight: '16px',
                  fontSize: '16px'
                }}
                onClick={() => handleOpenMaterialDrawer(record, planGroup, groupIndex)}
                title="查看物料准备计划"
              />
              <span style={{ marginRight: '8px' }}>生产线:</span>
              <Select
                size="small"
                value={planGroup.productionLine}
                onChange={(value) => handleProductionLineChange(record.key, planGroup.key, value)}
                style={{ width: 100, marginRight: '16px' }}
              >
                <Option value="生产线1">生产线1</Option>
                <Option value="生产线2">生产线2</Option>
                <Option value="生产线3">生产线3</Option>
                <Option value="生产线4">生产线4</Option>
                <Option value="生产线5">生产线5</Option>
                <Option value="生产线6">生产线6</Option>
                <Option value="生产线7">生产线7</Option>
              </Select>
              <Button
                size="small"
                type="text"
                onClick={() => handleAddPlanGroup(record.key)}
                style={{ marginRight: '8px', color: '#52c41a' }}
              >
                新增
              </Button>
              {record.planGroups.length > 1 && (
                <Button
                  size="small"
                  type="text"
                  onClick={() => handleDeletePlanGroup(record.key, planGroup.key)}
                  style={{ color: '#ff4d4f' }}
                >
                  删除
                </Button>
              )}
            </div>
            
            {/* 计划数量行 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              padding: '8px',
              backgroundColor: '#fff',
              border: '1px solid #d9d9d9',
              borderRadius: '4px'
            }}>
              <div style={{ 
                width: '120px', 
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                计划数量:
              </div>
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                overflowX: 'auto',
                paddingBottom: '4px'
              }}>
                {dateCols.map((date, dateIndex) => (
                    <div key={dateIndex} style={{ 
                      minWidth: '70px', 
                      marginRight: '8px',
                      flexShrink: 0
                    }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666', 
                      textAlign: 'center',
                      marginBottom: '4px'
                    }}>
                      {date.format('MM/DD')}
                    </div>
                    <InputNumber
                      size="small"
                      value={planGroup.dailyPlans[dateIndex]}
                      onChange={(value) => handlePlanGroupDailyChange(record.key, planGroup.key, dateIndex, value)}
                      style={{ width: '70px' }}
                      min={0}
                      precision={0}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <div style={{ 
                width: '100px', 
                textAlign: 'right',
                fontWeight: 'bold',
                color: '#1890ff',
                flexShrink: 0
              }}>
                总计: {planGroup.totalPlan || 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };



  // 保存功能
  const handleSave = () => {
    message.success('生产计划已保存');
  };

  // 导出功能
  const handleExport = () => {
    const dateCols = generateDateColumns(selectedDateRange);
    const exportData = dataSource.map((row) => {
      const rowData = {
        型号: row.model,
        质量要求: row.qualityRequirement || '-',
        类型: row.type,
        往期结转: row.initialStock,
      };

      dateCols.forEach((date, index) => {
        rowData[date.format('MM/DD')] = row.demandQuantities[index];
      });

      rowData['需求总计'] = row.totalDemand;

      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '生产计划');
    XLSX.writeFile(wb, `生产计划_${dayjs().format('YYYY-MM-DD')}.xlsx`);

    message.success('导出成功');
  };

  const modelOptions = ['6205', '6206', '6207', '6208', '6315-2RZ', '6311-2Z'];

  return (
    <div>
      <div className='page-header'>
        <h1>生产计划</h1>
      </div>

      {/* 筛选区域 */}
      <Card className='filter-card' size='small'>
          <Form 
            form={filterForm} 
            layout='inline'
            initialValues={{ dateRange: [dayjs('2025-08-01'), dayjs('2025-08-31')], factory: '全部' }}
          >
          <Form.Item label='日期' name='dateRange'>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              style={{ width: 240 }}
              value={selectedDateRange}
              onChange={(dates) => {
                setSelectedDateRange(dates);
                filterForm.setFieldsValue({ dateRange: dates });
              }}
              allowClear
              onClear={() => setSelectedDateRange(null)}
              picker="date"
            />
          </Form.Item>
          <Form.Item label='成品型号' name='model'>
            <Select placeholder='请选择型号' allowClear style={{ width: 150 }}>
              <Option value=''>全部</Option>
              {modelOptions.map((model) => (
                <Option key={model} value={model}>
                  {model}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label='质量要求' name='qualityRequirement'>
            <Select 
              placeholder='请选择质量要求' 
              allowClear 
              style={{ width: 120 }}
              value={selectedQualityRequirement}
              onChange={(value) => {
                handleQualityRequirementChange(value);
                filterForm.setFieldsValue({ qualityRequirement: value });
              }}
            >
              <Option value='全部'>全部</Option>
              <Option value='有'>有</Option>
              <Option value='无'>无</Option>
            </Select>
          </Form.Item>
          <Form.Item label='分厂' name='factory'>
            <Space wrap>
              {['全部', '电机', '铁路', '精密', '黄海'].map((factory) => (
                <Button
                  key={factory}
                  type={selectedFactory === factory ? 'primary' : 'default'}
                  onClick={() => {
                    handleFactoryFilterChange(factory);
                    filterForm.setFieldsValue({ factory: factory });
                  }}
                  size='small'
                >
                  {factory}
                </Button>
              ))}
            </Space>
          </Form.Item>

        </Form>
      </Card>

      {/* 生产计划表格 */}
      <Card 
        className='table-card'
        title="生产计划"
        extra={
          <Space>
            <Button
              type='default'
              onClick={handleExport}
              icon={<DownloadOutlined />}
            >
              导出Excel
            </Button>
            <Button type='primary' onClick={handleSave} icon={<SaveOutlined />}>
              保存
            </Button>
          </Space>
        }
      >



        <Table
          ref={tableRef}
          dataSource={getFilteredDataSource()}
          columns={generateColumns()}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={false}
          bordered
          size='small'
          expandable={{
            expandedRowRender: renderExpandedRow,
            rowExpandable: () => true,
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button
                type="text"
                size="small"
                onClick={e => onExpand(record, e)}
                style={{ padding: '0 2px', color: '#188dfa' }}
              >
                {expanded ? '收起' : '展开'}
              </Button>
            ),
          }}
          summary={(pageData) => {
            const dateCols = generateDateColumns(selectedDateRange);
            
            // 计算合计数据
            const totalInitialStock = pageData.reduce(
              (sum, record) => sum + (record.initialStock || 0),
              0
            );
            const totalDemandQuantities = new Array(dateCols.length).fill(0);

            pageData.forEach((record) => {
              record.demandQuantities.forEach((val, index) => {
                totalDemandQuantities[index] += val || 0;
              });
            });

            const totalDemand = totalDemandQuantities.reduce(
              (sum, val) => sum + val,
              0
            );
            
            // 计算12/31需求总量
            const totalOct31Demand = pageData.reduce(
              (sum, record) => sum + (record.oct31Demand || 0),
              0
            );

            return (
              <Table.Summary.Row
                style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}
              >
                <Table.Summary.Cell
                  index={0}
                  style={{ fontWeight: 'bold', color: '#1890ff' }}
                >
                  合计
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={1}
                  style={{ fontWeight: 'bold', textAlign: 'center' }}
                >
                  -
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={2}
                  style={{ fontWeight: 'bold', textAlign: 'right' }}
                >
                  {totalInitialStock}
                </Table.Summary.Cell>
                {dateCols.map((_, index) => (
                  <Table.Summary.Cell
                    key={`summary_${index}`}
                    index={index + 3}
                    style={{ textAlign: 'right', fontWeight: 'bold', color: '#1890ff' }}
                  >
                    {totalDemandQuantities[index]}
                  </Table.Summary.Cell>
                ))}
                <Table.Summary.Cell
                  index={dateCols.length + 3}
                  style={{ fontWeight: 'bold', textAlign: 'right', color: '#1890ff' }}
                >
                  {totalDemand}
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={dateCols.length + 4}
                  style={{ fontWeight: 'bold', textAlign: 'right', color: '#ff4d4f' }}
                >
                  {totalOct31Demand}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
        <div
          style={{
            marginTop: 16,
            textAlign: 'right',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Pagination
            current={1}
            total={50}
            pageSize={10}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
            }
            onChange={(page, pageSize) => {
              console.log('页码变化:', page, pageSize);
            }}
            onShowSizeChange={(current, size) => {
              console.log('每页条数变化:', current, size);
            }}
          />
        </div>
      </Card>

      {/* 需求详情抽屉 */}
      <Drawer
        title={drawerTitle}
        placement="right"
        onClose={handleDrawerClose}
        open={drawerVisible}
        width={600}
      >
        <Table
          dataSource={drawerData}
          pagination={false}
          size="small"
          bordered
        >
          <Table.Column
            title="数量"
            dataIndex="quantity"
            key="quantity"
            width={100}
            align="right"
          />
          <Table.Column
            title="类型"
            dataIndex="type"
            key="type"
            width={100}
            align="center"
            render={(value) => (
              <Tag color={value === 'A类' ? 'blue' : 'green'}>
                {value}
              </Tag>
            )}
          />
          <Table.Column
            title="要求"
            dataIndex="requirement"
            key="requirement"
            render={(value) => (
              <span style={{ color: value === '-' ? '#999' : '#000' }}>
                {value}
              </span>
            )}
          />
        </Table>
      </Drawer>

      {/* 物料准备计划抽屉 */}
      <Drawer
        title={materialDrawerData ? `${materialDrawerData.model} - 计划 ${materialDrawerData.planIndex} - 物料准备计划` : '物料准备计划'}
        placement="right"
        width={1200}
        open={materialDrawerVisible}
        onClose={() => setMaterialDrawerVisible(false)}
        destroyOnClose
      >
        {materialDrawerData && (
          <div>
            {/* 计划信息概览 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div><strong>型号:</strong> {materialDrawerData.model}</div>
                <div><strong>生产线:</strong> {materialDrawerData.productionLine}</div>
                <div><strong>计划总量:</strong> <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{materialDrawerData.totalPlan}</span></div>
              </div>
            </Card>

            {/* 计划数量明细 */}
            <Card title="计划数量" size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                {materialDrawerData.dateColumns.map((date, index) => (
                  <div key={index} style={{ minWidth: '70px', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      {date.format('MM/DD')}
                    </div>
                    <div style={{ 
                      padding: '4px 8px', 
                      backgroundColor: '#f0f0f0', 
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      {materialDrawerData.dailyPlans[index] || 0}
                    </div>
                  </div>
                ))}
                <div style={{ minWidth: '80px', textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>汇总</div>
                  <div style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#e6f7ff', 
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    color: '#1890ff'
                  }}>
                    {materialDrawerData.totalPlan}
                  </div>
                </div>
              </div>
            </Card>

            {/* 物料清单 */}
            <Card title="物料清单" size="small">
              <Table
                dataSource={materialDrawerData.materials}
                pagination={false}
                size="small"
                bordered
                scroll={{ x: 1000 }}
                columns={[
                  {
                    title: '物料类型',
                    dataIndex: 'materialType',
                    key: 'materialType',
                    width: 100,
                    fixed: 'left',
                  },
                  {
                    title: '规格',
                    dataIndex: 'spec',
                    key: 'spec',
                    width: 120,
                    fixed: 'left',
                  },
                  {
                    title: '单耗',
                    dataIndex: 'unitConsumption',
                    key: 'unitConsumption',
                    width: 80,
                    fixed: 'left',
                    align: 'right',
                    render: (value) => value?.toFixed(2) || '0.00'
                  },
                  {
                    title: '要求',
                    dataIndex: 'requirement',
                    key: 'requirement',
                    width: 200,
                    fixed: 'left',
                  },
                  ...materialDrawerData.dateColumns.map((date, index) => ({
                    title: date.format('MM/DD'),
                    key: `material_day_${index}`,
                    width: 90,
                    align: 'right',
                    render: (_, materialRecord) => {
                      const planQuantity = materialDrawerData.dailyPlans[index] || 0;
                      const unitConsumption = materialRecord.unitConsumption || 0;
                      const calculatedQuantity = planQuantity * unitConsumption;
                      return (
                        <span style={{ fontWeight: 500, color: '#000' }}>
                          {calculatedQuantity.toFixed(2)}
                        </span>
                      );
                    },
                  })),
                  {
                    title: '汇总',
                    key: 'material_total',
                    width: 80,
                    align: 'right',
                    render: (_, materialRecord) => {
                      const unitConsumption = materialRecord.unitConsumption || 0;
                      const totalPlanQuantity = materialDrawerData.totalPlan || 0;
                      const total = unitConsumption * totalPlanQuantity;
                      return <span style={{ fontWeight: 500, color: '#1890ff' }}>{total.toFixed(2)}</span>;
                    },
                  }
                ]}
              />
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ProductionPlan;
