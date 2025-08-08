import React, { useState, useRef } from 'react';
import {
  Card,
  Button,
  Space,
  DatePicker,
  Form,
  InputNumber,
  Input,
  Select,
  message,
  Table,
  Divider,
} from 'antd';
import {
  SaveOutlined,
  DownloadOutlined,
  PlusOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, COMPONENT_SIZES } from '../utils/uiConstants';

const { RangePicker } = DatePicker;
const { Option } = Select;

const PurchasePlan = () => {
  const [filterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [productDataSource, setProductDataSource] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState([dayjs('2025-09-01'), dayjs('2025-09-30')]);
  const [selectedFactory, setSelectedFactory] = useState('全部');
  const [selectedQualityRequirement, setSelectedQualityRequirement] = useState('全部');
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const productTableRef = useRef();

  // 根据选中的日期范围生成日期列
  const generateDateColumns = (dateRange) => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      // 默认显示2025年9月整月
      const startDate = dayjs('2025-09-01');
      const endDate = dayjs('2025-09-30');
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

  // 物料类型选项
  const materialTypes = ['外圈', '内圈', '滚动体', '保持架', '密封件'];
  
  // 计划类型选项
  const planTypes = ['外购', '自产'];



  // 处理分厂筛选变化
  const handleFactoryFilterChange = (factory) => {
    setSelectedFactory(factory);
  };

  // 处理质量要求筛选变化
  const handleQualityRequirementChange = (value) => {
    setSelectedQualityRequirement(value || '全部');
  };

  // 获取筛选后的成品数据
  const getFilteredProductDataSource = () => {
    let filtered = [...productDataSource];
    
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

  // 初始化成品采购模拟数据
  const initProductMockData = () => {
    const mockData = [
      {
        key: '1',
        spec: '6206',
        qualityRequirement: null,
        factory: '电机',
        dec31Demand: 180,
        planGroups: [
          {
            key: '1-1',
            groupType: '外购',
            dailyPlans: [0, 50, 0, 45, 0, 35, 0, 0, 0, 40],
            materials: {
              外圈: {
                spec: '234424BM',
                unitConsumption: 1,
                requirement: '表面粗糙度Ra≤0.8'
              },
              内圈: {
                spec: '7006C',
                unitConsumption: 1,
                requirement: '硬度HRC58-62'
              },
              滚动体: {
                spec: '6.35',
                unitConsumption: 10,
                requirement: '球度误差≤0.5μm'
              },
              保持架: {
                spec: '6004',
                unitConsumption: 1,
                requirement: '材质：黄铜'
              },
              密封件: {
                spec: '6004-RZ',
                unitConsumption: 2,
                requirement: '耐温-40~120℃'
              }
            }
          }
        ]
      },
      {
        key: '2',
        spec: '6206',
        qualityRequirement: '耐高温要求，工作温度≤150°C',
        qualityDocument: {
          name: '耐高温技术要求.pdf',
          url: 'https://example.com/documents/high-temp-requirements.pdf'
        },
        factory: '铁路',
        dec31Demand: 160,
        planGroups: [
          {
            key: '2-1',
            groupType: '外购',
            dailyPlans: [0, 30, 0, 25, 0, 20, 0, 0, 0, 25],
            materials: {
               外圈: {
                 spec: '234424BM-HT',
                 unitConsumption: 1,
                 requirement: '耐高温材质'
               },
               内圈: {
                 spec: '7006C-HT',
                 unitConsumption: 1,
                 requirement: '耐高温处理'
               },
               滚动体: {
                 spec: '6.35',
                 unitConsumption: 14,
                 requirement: '高温稳定性'
               },
               保持架: {
                 spec: '6004-HT',
                 unitConsumption: 1,
                 requirement: '耐高温材质'
               },
               密封件: {
                 spec: '6004-RZ-HT',
                 unitConsumption: 2,
                 requirement: '耐高温密封'
               }
             }
           },
           {
             key: '2-2',
             groupType: '自产',
             dailyPlans: [0, 20, 0, 20, 0, 15, 0, 0, 0, 15],
             materials: {
               外圈: {
                 spec: '234424BM-HT-2',
                 unitConsumption: 1,
                 requirement: '自产耐高温'
               },
               内圈: {
                 spec: '7006C-HT-2',
                 unitConsumption: 1,
                 requirement: '自产耐高温'
               }
             }
           }
         ]
      },
      {
        key: '3',
        spec: '6206-ZZ',
        qualityRequirement: null,
        factory: '精密',
        dec31Demand: 110,
        planGroups: [
          {
            key: '3-1',
            groupType: '外购',
            dailyPlans: [0, 30, 0, 25, 0, 20, 0, 0, 0, 35],
            materials: {
              外圈: {
                spec: '234424BM',
                unitConsumption: 1,
                requirement: '精密加工'
              },
              内圈: {
                spec: '7006C',
                unitConsumption: 1,
                requirement: '精密加工'
              },
              滚动体: {
                spec: '6.35',
                unitConsumption: 9,
                requirement: '高精度'
              }
            }
          }
        ]
      },

    ];
    setProductDataSource(mockData);
  };

  React.useEffect(() => {
    initProductMockData();
  }, []);



  // 处理计划组每日计划变更
  const handlePlanGroupDailyChange = (productKey, groupKey, index, value) => {
    const newData = [...productDataSource];
    const targetProduct = newData.find((item) => item.key === productKey);
    if (targetProduct) {
      const targetGroup = targetProduct.planGroups.find((group) => group.key === groupKey);
      if (targetGroup) {
        targetGroup.dailyPlans[index] = value || 0;
        setProductDataSource(newData);
      }
    }
  };

  // 处理物料规格变更
  const handleMaterialSpecChange = (productKey, groupKey, materialType, newSpec) => {
    const newData = [...productDataSource];
    const targetProduct = newData.find((item) => item.key === productKey);
    if (targetProduct) {
      const targetGroup = targetProduct.planGroups.find((group) => group.key === groupKey);
      if (targetGroup && targetGroup.materials[materialType]) {
        targetGroup.materials[materialType].spec = newSpec;
        setProductDataSource(newData);
      }
    }
  };

  // 处理物料单耗变更
  const handleMaterialUnitConsumptionChange = (productKey, groupKey, materialType, newUnitConsumption) => {
    const newData = [...productDataSource];
    const targetProduct = newData.find((item) => item.key === productKey);
    if (targetProduct) {
      const targetGroup = targetProduct.planGroups.find((group) => group.key === groupKey);
      if (targetGroup && targetGroup.materials[materialType]) {
        targetGroup.materials[materialType].unitConsumption = newUnitConsumption || 0;
        setProductDataSource(newData);
      }
    }
  };

  // 处理物料要求变更
  const handleMaterialRequirementChange = (productKey, groupKey, materialType, newRequirement) => {
    const newData = [...productDataSource];
    const targetProduct = newData.find((item) => item.key === productKey);
    if (targetProduct) {
      const targetGroup = targetProduct.planGroups.find((group) => group.key === groupKey);
      if (targetGroup && targetGroup.materials[materialType]) {
        targetGroup.materials[materialType].requirement = newRequirement;
        setProductDataSource(newData);
      }
    }
  };

  // 处理计划组类型变更
  const handleGroupTypeChange = (productKey, groupKey, newType) => {
    const newData = [...productDataSource];
    const targetProduct = newData.find((item) => item.key === productKey);
    if (targetProduct) {
      const targetGroup = targetProduct.planGroups.find((group) => group.key === groupKey);
      if (targetGroup) {
        targetGroup.groupType = newType;
        setProductDataSource(newData);
      }
    }
  };

  // 新增计划组
  const handleAddPlanGroup = (productKey) => {
    const newData = [...productDataSource];
    const targetProduct = newData.find((item) => item.key === productKey);
    if (targetProduct) {
      const newGroupKey = `${productKey}-${Date.now()}`;
      const newGroup = {
        key: newGroupKey,
        groupType: '外购',
        dailyPlans: new Array(dateColumns.length).fill(0),
        materials: {
          外圈: { spec: '', unitConsumption: 0, requirement: '' },
          内圈: { spec: '', unitConsumption: 0, requirement: '' },
          滚动体: { spec: '', unitConsumption: 0, requirement: '' },
          保持架: { spec: '', unitConsumption: 0, requirement: '' },
          密封件: { spec: '', unitConsumption: 0, requirement: '' }
        }
      };
      targetProduct.planGroups.push(newGroup);
      setProductDataSource(newData);
    }
  };

  // 删除计划组
  const handleDeletePlanGroup = (productKey, groupKey) => {
    const newData = [...productDataSource];
    const targetProduct = newData.find((item) => item.key === productKey);
    if (targetProduct && targetProduct.planGroups.length > 1) {
      targetProduct.planGroups = targetProduct.planGroups.filter((group) => group.key !== groupKey);
      setProductDataSource(newData);
    }
  };

  // 生成物料展开内容
  const renderExpandedRow = (record) => {
    return (
      <div style={{ padding: SPACING.XL, backgroundColor: COLORS.BACKGROUND_LIGHT }}>
        {record.planGroups.map((group, groupIndex) => (
          <div key={group.key} style={{ marginBottom: groupIndex < record.planGroups.length - 1 ? SPACING.XXL : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: SPACING.LG, gap: SPACING.LG }}>
              <h4 style={{ margin: '0', color: COLORS.PRIMARY }}>计划 {groupIndex + 1}</h4>
              <Select
                size="small"
                value={group.groupType}
                onChange={(value) => handleGroupTypeChange(record.key, group.key, value)}
                style={{ width: 80 }}
              >
                {planTypes.map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
              <Button
                type="text"
                size="small"
                onClick={() => handleAddPlanGroup(record.key)}
                style={{ color: COLORS.SUCCESS }}
              >
                新增
              </Button>
              {record.planGroups.length > 1 && (
                <Button
                  type="text"
                  size="small"
                  onClick={() => handleDeletePlanGroup(record.key, group.key)}
                  style={{ color: COLORS.ERROR }}
                >
                  删除
                </Button>
              )}
            </div>
            
            {/* 计划数量行 */}
            <div style={{ marginBottom: SPACING.LG }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: SPACING.MD }}>
                <span style={{ fontWeight: 500, minWidth: COMPONENT_SIZES.MIN_WIDTH_MD, flexShrink: 0 }}>计划数量:</span>
                <div style={{ 
                  flex: 1, 
                  overflowX: 'auto', 
                  display: 'flex', 
                  gap: SPACING.MD,
                   paddingBottom: SPACING.SM
                }}>
                  {dateColumns.map((date, index) => (
                    <div key={index} style={{ width: COMPONENT_SIZES.MIN_WIDTH_LG, textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: FONT_SIZES.SM, color: COLORS.TEXT_LIGHT, marginBottom: SPACING.SM }}>
                        {date.format('MM/DD')}
                      </div>
                      <InputNumber
                        size="small"
                        min={0}
                        precision={0}
                        value={group.dailyPlans[index] || undefined}
                        onChange={(value) => handlePlanGroupDailyChange(record.key, group.key, index, value)}
                        style={{ width: '100%' }}
                        controls={false}
                        placeholder="0"
                      />
                    </div>
                  ))}
                  <div style={{ width: COMPONENT_SIZES.MIN_WIDTH_MD, textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: FONT_SIZES.SM, color: COLORS.TEXT_LIGHT, marginBottom: SPACING.SM }}>汇总</div>
                    <span style={{ fontWeight: 500, color: COLORS.PRIMARY }}>
                      {group.dailyPlans.reduce((sum, val) => sum + (val || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 物料表格 */}
            <Table
              dataSource={materialTypes.map(type => ({
                key: `${group.key}-${type}`,
                materialType: type,
                spec: group.materials[type]?.spec || '',
                unitConsumption: group.materials[type]?.unitConsumption || 0,
                requirement: group.materials[type]?.requirement || ''
              }))}
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
                  render: (value, materialRecord) => (
                    <Input
                      size="small"
                      value={value}
                      onChange={(e) => handleMaterialSpecChange(record.key, group.key, materialRecord.materialType, e.target.value)}
                      placeholder="请输入规格"
                      style={{ width: '100%' }}
                    />
                  ),
                },
                {
                  title: '单耗',
                  dataIndex: 'unitConsumption',
                  key: 'unitConsumption',
                  width: 80,
                  fixed: 'left',
                  align: 'right',
                  render: (value, materialRecord) => (
                    <InputNumber
                      size="small"
                      min={0}
                      value={value}
                      onChange={(newValue) => handleMaterialUnitConsumptionChange(record.key, group.key, materialRecord.materialType, newValue)}
                      placeholder="单耗"
                      style={{ width: '100%' }}
                      controls={false}
                    />
                  ),
                },
                {
                  title: '要求',
                  dataIndex: 'requirement',
                  key: 'requirement',
                  width: 150,
                  fixed: 'left',
                  render: (value, materialRecord) => (
                    <Input
                      size="small"
                      value={value}
                      onChange={(e) => handleMaterialRequirementChange(record.key, group.key, materialRecord.materialType, e.target.value)}
                      placeholder="请输入要求"
                      style={{ width: '100%' }}
                    />
                  ),
                },
                ...dateColumns.map((date, index) => ({
                  title: date.format('MM/DD'),
                  key: `material_day_${index}`,
                  width: 90,
                  align: 'right',
                  render: (_, materialRecord) => {
                    // 计算数量：单耗 * 对应日期的计划数量
                    const planQuantity = group.dailyPlans[index] || 0;
                    const unitConsumption = materialRecord.unitConsumption || 0;
                    const calculatedQuantity = planQuantity * unitConsumption;
                    return (
                      <span style={{ fontWeight: 500, color: COLORS.BLACK }}>
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
                    // 计算汇总：单耗 * 计划总数量
                    const unitConsumption = materialRecord.unitConsumption || 0;
                    const totalPlanQuantity = group.dailyPlans.reduce((sum, val) => sum + (val || 0), 0);
                    const total = unitConsumption * totalPlanQuantity;
                    return <span style={{ fontWeight: 500, color: COLORS.PRIMARY }}>{total.toFixed(2)}</span>;
                  },
                }
              ]}
              pagination={false}
              size="small"
              bordered
              scroll={{ x: 1000 }}
            />
          </div>
        ))}
      </div>
    );
  };

  // 生成成品表格列配置
  const generateProductColumns = () => {
    const baseColumns = [
      {
        title: '型号',
        dataIndex: 'spec',
        key: 'spec',
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
            <div style={{ color: value ? COLORS.ERROR : COLORS.TEXT_PLACEHOLDER, marginBottom: SPACING.SM }}>
              {value || '-'}
            </div>
            {record.qualityDocument && (
              <div>
                <FileTextOutlined style={{ color: COLORS.PRIMARY, marginRight: SPACING.SM }} />
                <a 
                  href={record.qualityDocument.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: FONT_SIZES.SM, color: COLORS.PRIMARY }}
                >
                  {record.qualityDocument.name}
                </a>
              </div>
            )}
          </div>
        ),
      },
    ];

    // 添加日期列 - 只显示需求数量
    const dateCols = generateDateColumns(selectedDateRange);
    const dateColumns = dateCols.map((date, index) => ({
      title: date.format('MM/DD'),
      key: `day_${index}`,
      width: 90,
      align: 'right',
      render: () => (
        <span style={{ fontWeight: 500, color: COLORS.BLACK }}>100</span>
      ),
    }));

    // 添加汇总列和12/31需求列
    const summaryColumns = [
      {
        title: '汇总',
        key: 'total',
        width: 80,
        align: 'right',
        fixed: 'right',
        render: () => (
          <span style={{ fontWeight: 500, color: COLORS.PRIMARY }}>1000</span>
        ),
      },
      {
        title: '12/31',
        dataIndex: 'dec31Demand',
        key: 'dec31Demand',
        width: 80,
        align: 'right',
        fixed: 'right',
        render: (value) => (
          <span style={{ fontWeight: 'bold', color: COLORS.ERROR }}>
            {value || '-'}
          </span>
        ),
      }
    ];

    return [...baseColumns, ...dateColumns, ...summaryColumns];
  };





  // 保存功能
  const handleSave = () => {
    message.success('物料准备计划已保存');
  };

  // 导出功能
  const handleExport = () => {
    // 导出物料准备计划
    const productExportData = productDataSource.map((row) => {
      const rowData = {
        型号: row.spec,
      };

      dateColumns.forEach((date, index) => {
        rowData[date.format('MM/DD')] = row.dailyPlans[index];
      });

      rowData['旬总计'] = row.totalPlan;
      return rowData;
    });

    // 导出物料物料准备计划
    const partsExportData = partsDataSource.map((row) => {
      const rowData = {
        物料: row.partName,
        当前库存: row.initialStock,
      };

      dateColumns.forEach((date, index) => {
        rowData[date.format('MM/DD')] = row.dailyPlans[index];
      });

      rowData['汇总'] = row.totalPlan;
      return rowData;
    });

    const wb = XLSX.utils.book_new();

    const productWs = XLSX.utils.json_to_sheet(productExportData);
    XLSX.utils.book_append_sheet(wb, productWs, '物料准备计划');

    const partsWs = XLSX.utils.json_to_sheet(partsExportData);
    XLSX.utils.book_append_sheet(wb, partsWs, '物料物料准备计划');

    XLSX.writeFile(wb, `物料准备计划_${dayjs().format('YYYY-MM-DD')}.xlsx`);

    message.success('导出成功');
  };

  return (
    <div>
      <div className='page-header'>
        <h1>物料准备计划</h1>
      </div>

      {/* 筛选区域 */}
      <Card className='filter-card' size='small'>
          <Form 
            form={filterForm} 
            layout='inline'
            initialValues={{ dateRange: [dayjs('2025-09-01'), dayjs('2025-09-30')], factory: '全部', qualityRequirement: '全部' }}
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

      {/* 物料准备计划表格 */}
      <Card 
        className='table-card'
        title="物料准备计划"
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
          ref={productTableRef}
          dataSource={getFilteredProductDataSource()}
          columns={generateProductColumns()}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            position: ['bottomRight'],
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          bordered
          size='small'
          expandable={{
            expandedRowRender: renderExpandedRow,
            expandedRowKeys: expandedRowKeys,
            onExpand: (expanded, record) => {
              if (expanded) {
                setExpandedRowKeys([...expandedRowKeys, record.key]);
              } else {
                setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.key));
              }
            },
            expandRowByClick: false,
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button
                type="text"
                size="small"
                onClick={e => onExpand(record, e)}
                style={{ padding: `0 ${SPACING.SM}`, color: COLORS.LINK }}
              >
                {expanded ? '收起' : '展开'}
              </Button>
            ),
          }}
          summary={() => {
            // 计算物料准备计划合计数据，使用筛选后的数据
            const filteredData = getFilteredProductDataSource();
            const dateCols = generateDateColumns(selectedDateRange);
            
            // 计算12/31需求总量
            const totalDec31Demand = filteredData.reduce(
              (sum, record) => sum + (record.dec31Demand || 0),
              0
            );

            return (
              <Table.Summary.Row
                style={{ backgroundColor: COLORS.BACKGROUND_LIGHT, fontWeight: 'bold' }}
              >
                <Table.Summary.Cell
                  index={0}
                  style={{ textAlign: 'center' }}
                >
                  -
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={1}
                  style={{ fontWeight: 'bold', color: COLORS.PRIMARY }}
                >
                  合计
                </Table.Summary.Cell>
                {dateCols.map((_, index) => (
                  <Table.Summary.Cell
                    key={`product_summary_${index}`}
                    index={index + 2}
                    style={{ textAlign: 'right' }}
                  >
                    <span style={{ fontWeight: 'bold', color: COLORS.PRIMARY }}>1000</span>
                  </Table.Summary.Cell>
                ))}
                <Table.Summary.Cell
                  index={dateCols.length + 2}
                  style={{ fontWeight: 'bold', textAlign: 'right' }}
                >
                  <span style={{ fontWeight: 'bold', color: COLORS.PRIMARY }}>10000</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={dateCols.length + 3}
                  style={{ fontWeight: 'bold', textAlign: 'right' }}
                >
                  <span style={{ fontWeight: 'bold', color: COLORS.ERROR }}>
                    {totalDec31Demand}
                  </span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default PurchasePlan;
