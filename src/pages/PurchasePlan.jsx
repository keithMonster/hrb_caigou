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
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;
const { Option } = Select;

const PurchasePlan = () => {
  const [filterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [productDataSource, setProductDataSource] = useState([]);
  const [partsDataSource, setPartsDataSource] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(['全部']);
  const [filteredPartsDataSource, setFilteredPartsDataSource] = useState([]);
  const [selectedXun, setSelectedXun] = useState('2025-09-中旬');
  const [selectedFactory, setSelectedFactory] = useState('全部');
  const [selectedQualityRequirement, setSelectedQualityRequirement] = useState('全部');
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const productTableRef = useRef();
  const partsTableRef = useRef();

  // 生成旬期选项
  const generateXunOptions = () => {
    const options = [];
    const currentYear = 2025;
    const currentMonth = dayjs().month() + 1;
    
    // 生成当前年份的所有旬期
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      options.push({
        label: `${currentYear}年${monthStr}月上旬`,
        value: `${currentYear}-${monthStr}-上旬`,
        startDate: dayjs(`${currentYear}-${monthStr}-01`),
        endDate: dayjs(`${currentYear}-${monthStr}-10`)
      });
      options.push({
        label: `${currentYear}年${monthStr}月中旬`,
        value: `${currentYear}-${monthStr}-中旬`,
        startDate: dayjs(`${currentYear}-${monthStr}-11`),
        endDate: dayjs(`${currentYear}-${monthStr}-20`)
      });
      const lastDay = dayjs(`${currentYear}-${monthStr}-01`).endOf('month').date();
      options.push({
        label: `${currentYear}年${monthStr}月下旬`,
        value: `${currentYear}-${monthStr}-下旬`,
        startDate: dayjs(`${currentYear}-${monthStr}-21`),
        endDate: dayjs(`${currentYear}-${monthStr}-${lastDay}`)
      });
    }
    return options;
  };

  const xunOptions = generateXunOptions();

  // 根据选中的旬期生成日期列（10天）
  const generateDateColumns = (selectedXun) => {
    if (!selectedXun) {
      // 默认显示2025年9月中旬
      const startDate = dayjs('2025-09-11');
      const dates = [];
      for (let i = 0; i < 10; i++) {
        dates.push(startDate.add(i, 'day'));
      }
      return dates;
    }
    
    const xunOption = xunOptions.find(option => option.value === selectedXun);
    if (!xunOption) return [];
    
    const dates = [];
    const startDate = xunOption.startDate;
    const endDate = xunOption.endDate;
    const daysDiff = endDate.diff(startDate, 'day') + 1;
    
    // 如果是下旬且天数不足10天，补齐到10天
    const totalDays = Math.max(daysDiff, 10);
    for (let i = 0; i < totalDays && i < 10; i++) {
      dates.push(startDate.add(i, 'day'));
    }
    return dates;
  };

  const dateColumns = generateDateColumns(selectedXun);

  // 物料选项
  const partNameOptions = [
    '内圈-6205',
    '内圈-6206',
    '内圈-6207',
    '外圈-6205',
    '外圈-6206',
    '外圈-6207',
    '外圈-SKF-001',
    '滚动体-6205',
    '滚动体-6206',
    '滚动体-6207',
    '保持架-6205',
    '保持架-6206',
    '保持架-6207',
    '密封件-通用型',
    '密封件-高温型',
    '密封件-低温型',
  ];

  // 物料分类选项
  const categoryOptions = [
    '全部',
    '内圈',
    '外圈',
    '滚动体',
    '保持架',
    '密封件',
  ];

  // 筛选逻辑函数
  const filterPartsByCategory = (categories) => {
    if (!categories || categories.length === 0 || categories.includes('全部')) {
      setFilteredPartsDataSource(partsDataSource);
      return;
    }

    const filtered = partsDataSource.filter((part) => {
      return categories.some(
        (category) => part.partName && part.partName.includes(category)
      );
    });

    setFilteredPartsDataSource(filtered);
  };

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
        dailyPlans: [0, 50, 0, 45, 0, 35, 0, 0, 0, 40],
        dailyInputs: [0, 50, 0, 45, 0, 35, 0, 0, 0, 40],
        totalPlan: 170,
        dec31Demand: 180,
        materials: {
          外圈: {
            spec: '234424BM',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          内圈: {
            spec: '7006C',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          滚动体: {
            spec: '6.35',
            dailyQuantities: [0, 10, 0, 12, 0, 15, 0, 0, 0, 18]
          },
          保持架: {
            spec: '6004',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          密封件: {
            spec: '6004-RZ',
            dailyQuantities: [0, 2, 0, 1, 0, 2, 0, 0, 0, 1]
          }
        }
      },
      {
        key: '2',
        spec: '6206',
        qualityRequirement: '耐高温要求，工作温度≤150°C',
        factory: '铁路',
        dailyPlans: [0, 50, 0, 45, 0, 35, 0, 0, 0, 40],
        dailyInputs: [0, 50, 0, 45, 0, 35, 0, 0, 0, 40],
        totalPlan: 170,
        dec31Demand: 160,
        materials: {
          外圈: {
            spec: '234424BM-HT',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          内圈: {
            spec: '7006C-HT',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          滚动体: {
            spec: '6.35',
            dailyQuantities: [0, 14, 0, 16, 0, 11, 0, 0, 0, 20]
          },
          保持架: {
            spec: '6004-HT',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          密封件: {
            spec: '6004-RZ-HT',
            dailyQuantities: [0, 2, 0, 2, 0, 1, 0, 0, 0, 2]
          }
        }
      },
      {
        key: '3',
        spec: '6206-ZZ',
        qualityRequirement: null,
        factory: '精密',
        dailyPlans: [0, 30, 0, 25, 0, 20, 0, 0, 0, 35],
        dailyInputs: [0, 30, 0, 25, 0, 20, 0, 0, 0, 35],
        totalPlan: 110,
        dec31Demand: 0,
        materials: {
          外圈: {
            spec: '234424BM',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          内圈: {
            spec: '7006C',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          滚动体: {
            spec: '6.35',
            dailyQuantities: [0, 9, 0, 13, 0, 8, 0, 0, 0, 17]
          },
          保持架: {
            spec: '6004',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          密封件: {
            spec: '6004-ZZ',
            dailyQuantities: [0, 2, 0, 1, 0, 0, 0, 0, 0, 2]
          }
        }
      },
      {
        key: '4',
        spec: '6207-RS',
        qualityRequirement: '防腐蚀要求，盐雾试验≥240小时',
        factory: '黄海',
        dailyPlans: [0, 40, 0, 35, 0, 30, 0, 0, 0, 25],
        dailyInputs: [0, 40, 0, 35, 0, 30, 0, 0, 0, 25],
        totalPlan: 130,
        dec31Demand: 0,
        materials: {
          外圈: {
            spec: '234425BM',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          内圈: {
            spec: '7007C',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          滚动体: {
            spec: '7.0',
            dailyQuantities: [0, 12, 0, 19, 0, 15, 0, 0, 0, 8]
          },
          保持架: {
            spec: '6005',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          密封件: {
            spec: '6005-RS',
            dailyQuantities: [0, 2, 0, 1, 0, 2, 0, 0, 0, 0]
          }
        }
      },
      {
        key: '5',
        spec: 'SKF-6208',
        qualityRequirement: null,
        factory: '电机',
        dailyPlans: [0, 25, 0, 20, 0, 15, 0, 0, 0, 30],
        dailyInputs: [0, 25, 0, 20, 0, 15, 0, 0, 0, 30],
        totalPlan: 90,
        dec31Demand: 0,
        materials: {
          外圈: {
            spec: 'SKF-234426BM',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          内圈: {
            spec: 'SKF-7008C',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          滚动体: {
            spec: '8.0',
            dailyQuantities: [0, 16, 0, 11, 0, 14, 0, 0, 0, 20]
          },
          保持架: {
            spec: 'SKF-6006',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          密封件: {
            spec: 'SKF-6006-RZ',
            dailyQuantities: [0, 1, 0, 2, 0, 0, 0, 0, 0, 2]
          }
        }
      },
      {
        key: '6',
        spec: 'NSK-6209',
        qualityRequirement: null,
        factory: '铁路',
        dailyPlans: [0, 35, 0, 28, 0, 22, 0, 0, 0, 25],
        dailyInputs: [0, 35, 0, 28, 0, 22, 0, 0, 0, 25],
        totalPlan: 110,
        dec31Demand: 0,
        materials: {
          外圈: {
            spec: 'NSK-234427BM',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          内圈: {
            spec: 'NSK-7009C',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          滚动体: {
            spec: '9.0',
            dailyQuantities: [0, 18, 0, 13, 0, 10, 0, 0, 0, 15]
          },
          保持架: {
            spec: 'NSK-6007',
            dailyQuantities: [0, 1, 0, 1, 0, 1, 0, 0, 0, 1]
          },
          密封件: {
            spec: 'NSK-6007-RZ',
            dailyQuantities: [0, 2, 0, 1, 0, 2, 0, 0, 0, 1]
          }
        }
      }
    ];
    setProductDataSource(mockData);
  };

  // 初始化物料采购模拟数据
  const initPartsMockData = () => {
    const mockData = [
      {
        key: '1',
        partName: '内圈-6205',
        purchaseType: '外购',
        initialStock: 50,
        dailyPlans: [0, 25, 0, 30, 0, 20, 0, 0, 0, 35],
        dailyInputs: [0, 25, 0, 30, 0, 20, 0, 0, 0, 35],
        totalPlan: 110,
      },
      {
        key: '2',
        partName: '内圈-6206',
        purchaseType: '外购',
        initialStock: 0,
        dailyPlans: [0, 20, 0, 25, 0, 15, 0, 0, 0, 30],
        dailyInputs: [0, 20, 0, 25, 0, 15, 0, 0, 0, 30],
        totalPlan: 90,
      },
      {
        key: '3',
        partName: '外圈-6207',
        purchaseType: '外购',
        initialStock: 80,
        dailyPlans: [0, 30, 0, 35, 0, 25, 0, 0, 0, 40],
        dailyInputs: [0, 30, 0, 35, 0, 25, 0, 0, 0, 40],
        totalPlan: 130,
      },
      {
        key: '4',
        partName: '外圈-SKF-001',
        purchaseType: '自产',
        initialStock: 0,
        dailyPlans: [0, 15, 0, 20, 0, 10, 0, 0, 0, 25],
        dailyInputs: [0, 15, 0, 20, 0, 10, 0, 0, 0, 25],
        totalPlan: 70,
      },
      {
        key: '5',
        partName: '滚动体-6205',
        purchaseType: '外购',
        initialStock: 0,
        dailyPlans: [0, 40, 0, 45, 0, 35, 0, 0, 0, 50],
        dailyInputs: [0, 40, 0, 45, 0, 35, 0, 0, 0, 50],
        totalPlan: 170,
      },
      {
        key: '6',
        partName: '保持架-6206',
        purchaseType: '自产',
        initialStock: 0,
        dailyPlans: [0, 18, 0, 22, 0, 16, 0, 0, 0, 24],
        dailyInputs: [0, 18, 0, 22, 0, 16, 0, 0, 0, 24],
        totalPlan: 80,
      },
      {
        key: '7',
        partName: '密封件-通用型',
        purchaseType: '外购',
        initialStock: 0,
        dailyPlans: [0, 12, 0, 15, 0, 10, 0, 0, 0, 18],
        dailyInputs: [0, 12, 0, 15, 0, 10, 0, 0, 0, 18],
        totalPlan: 55,
      },
    ];

    setPartsDataSource(mockData);
  };

  React.useEffect(() => {
    initProductMockData();
    initPartsMockData();
  }, []);

  // 监听partsDataSource变化，更新筛选结果
  React.useEffect(() => {
    filterPartsByCategory(selectedCategories);
  }, [partsDataSource, selectedCategories]);

  // 处理分类筛选变化
  const handleCategoryChange = (category) => {
    let newCategories;
    if (category === '全部') {
      newCategories = ['全部'];
    } else {
      // 如果选择了其他分类，先移除"全部"
      const filteredCategories = selectedCategories.filter(
        (cat) => cat !== '全部'
      );
      if (filteredCategories.includes(category)) {
        // 如果已选择，则取消选择
        newCategories = filteredCategories.filter((cat) => cat !== category);
        // 如果没有选择任何分类，默认选择"全部"
        if (newCategories.length === 0) {
          newCategories = ['全部'];
        }
      } else {
        // 如果未选择，则添加选择
        newCategories = [...filteredCategories, category];
      }
    }
    setSelectedCategories(newCategories);
    filterPartsByCategory(newCategories);
  };

  // 处理成品每日计划变更
  const handleProductDailyChange = (record, index, value) => {
    const newData = [...productDataSource];
    const targetRecord = newData.find((item) => item.key === record.key);
    if (targetRecord) {
      targetRecord.dailyInputs[index] = value || 0;
      setProductDataSource(newData);
    }
  };

  // 处理物料规格变更
  const handleMaterialSpecChange = (productKey, materialType, newSpec) => {
    const newData = [...productDataSource];
    const targetRecord = newData.find((item) => item.key === productKey);
    if (targetRecord && targetRecord.materials[materialType]) {
      targetRecord.materials[materialType].spec = newSpec;
      setProductDataSource(newData);
    }
  };

  // 处理物料数量变更
  const handleMaterialQuantityChange = (productKey, materialType, dayIndex, value) => {
    const newData = [...productDataSource];
    const targetRecord = newData.find((item) => item.key === productKey);
    if (targetRecord && targetRecord.materials[materialType]) {
      targetRecord.materials[materialType].dailyQuantities[dayIndex] = value || 0;
      setProductDataSource(newData);
    }
  };

  // 处理物料每日计划变更
  const handlePartsDailyChange = (record, index, value) => {
    const newData = [...partsDataSource];
    const targetRecord = newData.find((item) => item.key === record.key);
    if (targetRecord) {
      targetRecord.dailyInputs[index] = value || 0;
      setPartsDataSource(newData);
    }
  };

  // 处理物料名称变更
  const handlePartNameChange = (record, value) => {
    const newData = [...partsDataSource];
    const targetRecord = newData.find((item) => item.key === record.key);
    if (targetRecord) {
      targetRecord.partName = value;
      setPartsDataSource(newData);
    }
  };

  // 处理采购类型变更
  const handlePurchaseTypeChange = (record, value) => {
    const newData = [...partsDataSource];
    const targetRecord = newData.find((item) => item.key === record.key);
    if (targetRecord) {
      targetRecord.purchaseType = value;
      setPartsDataSource(newData);
    }
  };

  // 新增物料行
  const handleAddPartsRow = () => {
    const newKey = Date.now().toString();
    const newRow = {
      key: newKey,
      partName: '',
      purchaseType: '外购',
      initialStock: 0,
      dailyPlans: new Array(dateColumns.length).fill(0),
      dailyInputs: new Array(dateColumns.length).fill(0),
      totalPlan: 0,
    };
    setPartsDataSource([...partsDataSource, newRow]);
  };

  // 生成物料展开内容
  const renderExpandedRow = (record) => {
    const materialTypes = ['外圈', '内圈', '滚动体', '保持架', '密封件'];
    
    return (
      <div style={{ padding: '16px', backgroundColor: '#fafafa' }}>
        <h4 style={{ marginBottom: '16px', color: '#1890ff' }}>物料详情 - {record.spec}</h4>
        <Table
          dataSource={materialTypes.map(type => ({
            key: type,
            materialType: type,
            spec: record.materials[type]?.spec || '',
            dailyQuantities: record.materials[type]?.dailyQuantities || new Array(dateColumns.length).fill(0)
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
                  onChange={(e) => handleMaterialSpecChange(record.key, materialRecord.materialType, e.target.value)}
                  placeholder="请输入规格"
                  style={{ width: '100%' }}
                />
              ),
            },
            ...dateColumns.map((date, index) => ({
              title: date.format('MM/DD'),
              key: `material_day_${index}`,
              width: 90,
              align: 'right',
              render: (_, materialRecord) => (
                <InputNumber
                  size="small"
                  min={0}
                  precision={0}
                  value={materialRecord.dailyQuantities[index] || undefined}
                  onChange={(value) => handleMaterialQuantityChange(record.key, materialRecord.materialType, index, value)}
                  className="daily-input"
                  controls={false}
                  style={{ width: '100%' }}
                />
              ),
            })),
            {
              title: '汇总',
              key: 'material_total',
              width: 80,
              align: 'right',
              render: (_, materialRecord) => {
                const total = materialRecord.dailyQuantities.reduce((sum, val) => sum + (val || 0), 0);
                return <span style={{ fontWeight: 500 }}>{total}</span>;
              },
            }
          ]}
          pagination={false}
          size="small"
          bordered
          scroll={{ x: 800 }}
        />
      </div>
    );
  };

  // 生成成品表格列配置
  const generateProductColumns = () => {
    const columns = [
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
        width: 120,
        fixed: 'left',
        render: (value) => (
          <span style={{ color: value ? '#ff4d4f' : '#999' }}>
            {value || '-'}
          </span>
        ),
      },
    ];

    // 添加日期列
    dateColumns.forEach((date, index) => {
      columns.push({
        title: date.format('MM/DD'),
        key: `day_${index}`,
        width: 90,
        align: 'right',
        render: (_, record) => (
          <div className='cell-content'>
            <div className='plan-value'>{record.dailyPlans[index] || 0}</div>
            <InputNumber
            size='small'
            min={0}
            precision={0}
            value={record.dailyInputs[index] || undefined}
            onChange={(value) =>
              handleProductDailyChange(record, index, value)
            }
            className='daily-input'
            controls={false}
            placeholder=''
          />
          </div>
        ),
      });
    });

    // 添加汇总列
    columns.push({
      title: '汇总',
      key: 'total',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (_, record) => {
        const planTotal = record.dailyPlans.reduce(
          (sum, val) => sum + (val || 0),
          0
        );
        const inputTotal = record.dailyInputs.reduce(
          (sum, val) => sum + (val || 0),
          0
        );
        return (
          <div className='cell-content'>
            <div className='plan-value total-value'>{planTotal}</div>
            <div className='total-value'>{inputTotal}</div>
          </div>
        );
      },
    });

    // 添加12/31需求列
    columns.push({
      title: '12/31',
      dataIndex: 'dec31Demand',
      key: 'dec31Demand',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (value) => (
        <div className='cell-content'>
          <div className='plan-value' style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
            {value || '-'}
          </div>
          <div style={{ height: '24px' }}></div>
        </div>
      ),
    });

    return columns;
  };

  // 生成物料表格列配置
  const generatePartsColumns = () => {
    const columns = [
      {
        title: '物料',
        dataIndex: 'partName',
        key: 'partName',
        width: 150,
        fixed: 'left',
        render: (value, record) => (
          <Select
            size='small'
            value={value}
            onChange={(selectedValue) =>
              handlePartNameChange(record, selectedValue)
            }
            placeholder='请选择物料'
            style={{ width: '100%' }}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {partNameOptions.map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        ),
      },
      {
        title: '采购类型',
        dataIndex: 'purchaseType',
        key: 'purchaseType',
        width: 100,
        fixed: 'left',
        render: (value, record) => (
          <Select
            size='small'
            value={value}
            onChange={(selectedValue) =>
              handlePurchaseTypeChange(record, selectedValue)
            }
            style={{ width: '100%' }}
          >
            <Option value='外购'>外购</Option>
            <Option value='自产'>自产</Option>
          </Select>
        ),
      },

    ];

    // 添加日期列
    dateColumns.forEach((date, index) => {
      columns.push({
        title: date.format('MM/DD'),
        key: `day_${index}`,
        width: 90,
        align: 'right',
        render: (_, record) => (
          <InputNumber
            size='small'
            min={0}
            precision={0}
            value={record.dailyInputs[index] || undefined}
            onChange={(value) => handlePartsDailyChange(record, index, value)}
            className='daily-input'
            controls={false}
            style={{ width: '100%' }}
            placeholder=''
          />
        ),
      });
    });

    // 添加汇总列
    columns.push({
      title: '汇总',
      key: 'total',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (_, record) => {
        const inputTotal = record.dailyInputs.reduce(
          (sum, val) => sum + (val || 0),
          0
        );
        return (
          <span style={{ fontWeight: 500 }} className='total-value'>
            {inputTotal}
          </span>
        );
      },
    });

    return columns;
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
            initialValues={{ xunPeriod: '2025-09-中旬', factory: '全部', qualityRequirement: '全部' }}
          >
          <Form.Item label='计划旬期' name='xunPeriod'>
            <Select
              placeholder='请选择旬期'
              style={{ width: 200 }}
              value={selectedXun}
              onChange={(value) => {
                  setSelectedXun(value);
                  filterForm.setFieldsValue({ xunPeriod: value });
                }}
              allowClear
              onClear={() => setSelectedXun(null)}
            >
              {xunOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
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
              保存计划
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
                style={{ padding: '0 2px' ,color:'#188dfa'}}
              >
                {expanded ? '收起' : '展开'}
              </Button>
            ),
          }}
          summary={() => {
            // 计算物料准备计划合计数据，使用筛选后的数据
            const filteredData = getFilteredProductDataSource();
            const totalDailyPlans = new Array(dateColumns.length).fill(0);
            const totalDailyInputs = new Array(dateColumns.length).fill(0);

            filteredData.forEach((record) => {
              record.dailyPlans.forEach((val, index) => {
                totalDailyPlans[index] += val || 0;
              });
              record.dailyInputs.forEach((val, index) => {
                totalDailyInputs[index] += val || 0;
              });
            });

            const totalPlan = totalDailyPlans.reduce(
              (sum, val) => sum + val,
              0
            );
            const totalInput = totalDailyInputs.reduce(
              (sum, val) => sum + val,
              0
            );
            
            // 计算12/31需求总量
            const totalDec31Demand = filteredData.reduce(
              (sum, record) => sum + (record.dec31Demand || 0),
              0
            );

            return (
              <Table.Summary.Row
                style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}
              >
                <Table.Summary.Cell
                  index={0}
                  style={{ textAlign: 'center' }}
                >
                  -
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={1}
                  style={{ fontWeight: 'bold', color: '#1890ff' }}
                >
                  合计
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={2}
                  style={{ fontWeight: 'bold', textAlign: 'center' }}
                >
                  -
                </Table.Summary.Cell>
                {dateColumns.map((_, index) => (
                  <Table.Summary.Cell
                    key={`product_summary_${index}`}
                    index={index + 3}
                    style={{ textAlign: 'right' }}
                  >
                    <div className='cell-content'>
                      <div
                        className='plan-value'
                        style={{ fontWeight: 'bold' }}
                      >
                        {totalDailyPlans[index]}
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                        {totalDailyInputs[index]}
                      </div>
                    </div>
                  </Table.Summary.Cell>
                ))}
                <Table.Summary.Cell
                  index={dateColumns.length + 3}
                  className='text-right'
                  style={{ fontWeight: 'bold', textAlign: 'right' }}
                >
                  <div className='cell-content'>
                    <div className='plan-value total-value'>{totalPlan}</div>
                    <div style={{ color: '#1890ff' }}>{totalInput}</div>
                  </div>
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={dateColumns.length + 4}
                  style={{ fontWeight: 'bold', textAlign: 'right' }}
                >
                  <div className='cell-content'>
                    <div className='plan-value' style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                      {totalDec31Demand}
                    </div>
                    <div style={{ height: '24px' }}></div>
                  </div>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>

      <Divider />

      {/* 物料物料准备计划表格 */}
      {/* <Card 
        className='table-card'
        title="物料物料准备计划"
        extra={
          <Space>
            <Button
              type='default'
              onClick={handleAddPartsRow}
              icon={<PlusOutlined />}
            >
              新增
            </Button>
            <Button
              type='default'
              onClick={handleExport}
              icon={<DownloadOutlined />}
            >
              导出Excel
            </Button>
            <Button type='primary' onClick={handleSave} icon={<SaveOutlined />}>
              保存计划
            </Button>
          </Space>
        }
      >

        <div
          style={{
            marginBottom: 16,
            padding: '12px 0',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Space wrap>
            {categoryOptions.map((category) => (
              <Button
                key={category}
                type={
                  selectedCategories.includes(category) ? 'primary' : 'default'
                }
                onClick={() => handleCategoryChange(category)}
                size='small'
              >
                {category}
              </Button>
            ))}
          </Space>
        </div>

        <Table
          ref={partsTableRef}
          dataSource={
            selectedCategories.includes('全部')
              ? partsDataSource
              : filteredPartsDataSource
          }
          columns={generatePartsColumns()}
          loading={loading}
          scroll={{ x: 1300 }}
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
          summary={(pageData) => {
            const totalDailyInputs = new Array(dateColumns.length).fill(0);

            pageData.forEach((record) => {
              record.dailyInputs.forEach((val, index) => {
                totalDailyInputs[index] += val || 0;
              });
            });

            const totalInput = totalDailyInputs.reduce(
              (sum, val) => sum + val,
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
                {dateColumns.map((_, index) => (
                  <Table.Summary.Cell
                    key={`parts_summary_${index}`}
                    index={index + 2}
                  >
                    <div
                      style={{
                        fontWeight: 'bold',
                        color: '#1890ff',
                        textAlign: 'right',
                      }}
                    >
                      {totalDailyInputs[index]}
                    </div>
                  </Table.Summary.Cell>
                ))}
                <Table.Summary.Cell
                  index={dateColumns.length + 2}
                  className='text-right'
                  style={{
                    fontWeight: 'bold',
                    color: '#1890ff',
                    textAlign: 'right',
                  }}
                >
                  {totalInput}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card> */}
    </div>
  );
};

export default PurchasePlan;
