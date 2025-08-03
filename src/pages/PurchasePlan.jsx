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
  SearchOutlined,
  ReloadOutlined,
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
  const [selectedXun, setSelectedXun] = useState('2025-08-上旬');
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
      // 默认显示2025年8月上旬
      const startDate = dayjs('2025-08-01');
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

  // 原材料选项
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

  // 原材料分类选项
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

  // 初始化成品采购模拟数据
  const initProductMockData = () => {
    const mockData = [
      {
        key: '1',
        spec: '6205-2RS',
        dailyPlans: [0, 50, 0, 45, 0, 35, 0, 0, 0, 40],
        dailyInputs: [0, 50, 0, 45, 0, 35, 0, 0, 0, 40],
        totalPlan: 170,
      },
      {
        key: '2',
        spec: '6206-ZZ',
        dailyPlans: [0, 30, 0, 25, 0, 20, 0, 0, 0, 35],
        dailyInputs: [0, 30, 0, 25, 0, 20, 0, 0, 0, 35],
        totalPlan: 110,
      },
      {
        key: '3',
        spec: '6207-RS',
        dailyPlans: [0, 40, 0, 35, 0, 30, 0, 0, 0, 25],
        dailyInputs: [0, 40, 0, 35, 0, 30, 0, 0, 0, 25],
        totalPlan: 130,
      },
      {
        key: '4',
        spec: 'SKF-6208',
        dailyPlans: [0, 25, 0, 20, 0, 15, 0, 0, 0, 30],
        dailyInputs: [0, 25, 0, 20, 0, 15, 0, 0, 0, 30],
        totalPlan: 90,
      },
      {
        key: '5',
        spec: 'NSK-6209',
        dailyPlans: [0, 35, 0, 28, 0, 22, 0, 0, 0, 25],
        dailyInputs: [0, 35, 0, 28, 0, 22, 0, 0, 0, 25],
        totalPlan: 110,
      },
    ];
    setProductDataSource(mockData);
  };

  // 初始化原材料采购模拟数据
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

  // 处理原材料每日计划变更
  const handlePartsDailyChange = (record, index, value) => {
    const newData = [...partsDataSource];
    const targetRecord = newData.find((item) => item.key === record.key);
    if (targetRecord) {
      targetRecord.dailyInputs[index] = value || 0;
      setPartsDataSource(newData);
    }
  };

  // 处理原材料名称变更
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

  // 新增原材料行
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

    return columns;
  };

  // 生成原材料表格列配置
  const generatePartsColumns = () => {
    const columns = [
      {
        title: '原材料',
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
            placeholder='请选择原材料'
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
      {
        title: '当前库存',
        dataIndex: 'initialStock',
        key: 'initialStock',
        width: 100,
        fixed: 'left',
        align: 'right',
        render: (value) => <span style={{ fontWeight: 500 }}>{value}</span>,
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

  // 筛选功能
  const handleFilter = () => {
    message.success('筛选功能已执行');
  };

  const handleReset = () => {
    filterForm.resetFields();
    message.info('筛选条件已重置');
  };

  // 保存功能
  const handleSave = () => {
    message.success('采购计划已保存');
  };

  // 导出功能
  const handleExport = () => {
    // 导出成品采购计划
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

    // 导出原材料采购计划
    const partsExportData = partsDataSource.map((row) => {
      const rowData = {
        原材料: row.partName,
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
    XLSX.utils.book_append_sheet(wb, productWs, '成品采购计划');

    const partsWs = XLSX.utils.json_to_sheet(partsExportData);
    XLSX.utils.book_append_sheet(wb, partsWs, '原材料采购计划');

    XLSX.writeFile(wb, `采购计划_${dayjs().format('YYYY-MM-DD')}.xlsx`);

    message.success('导出成功');
  };

  return (
    <div>
      <div className='page-header'>
        <h1>采购计划</h1>
        <p>包含成品采购计划和原材料采购计划，按旬（10天）维度进行采购安排</p>
      </div>

      {/* 筛选区域 */}
      <Card className='filter-card' size='small'>
          <Form 
            form={filterForm} 
            layout='inline' 
            onFinish={handleFilter}
            initialValues={{ xunPeriod: '2025-08-上旬' }}
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
               defaultValue="2025-08-上旬"
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
          <Form.Item>
            <Space>
              <Button
                type='primary'
                htmlType='submit'
                icon={<SearchOutlined />}
              >
                查询
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 成品采购计划表格 */}
      <Card className='table-card'>
        <div
          className='table-header'
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h3>成品采购计划</h3>
            <p>成品的采购计划安排</p>
          </div>
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
        </div>
        <Table
          ref={productTableRef}
          dataSource={productDataSource}
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
          summary={(pageData) => {
            // 计算成品采购计划合计数据
            const totalDailyPlans = new Array(dateColumns.length).fill(0);
            const totalDailyInputs = new Array(dateColumns.length).fill(0);

            pageData.forEach((record) => {
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
                {dateColumns.map((_, index) => (
                  <Table.Summary.Cell
                    key={`product_summary_${index}`}
                    index={index + 1}
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
                  index={dateColumns.length + 1}
                  className='text-right'
                  style={{ fontWeight: 'bold', textAlign: 'right' }}
                >
                  <div className='cell-content'>
                    <div className='plan-value total-value'>{totalPlan}</div>
                    <div style={{ color: '#1890ff' }}>{totalInput}</div>
                  </div>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>

      <Divider />

      {/* 原材料采购计划表格 */}
      <Card className='table-card'>
        <div
          className='table-header'
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h3>原材料采购计划</h3>
            <p>原材料的采购计划安排</p>
          </div>
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
        </div>

        {/* 分类筛选器 */}
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
            // 计算原材料采购计划合计数据
            const totalInitialStock = pageData.reduce(
              (sum, record) => sum + (record.initialStock || 0),
              0
            );
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
                  className='text-right' 
                  style={{ fontWeight: 'bold', textAlign: 'right' }}
                >
                  {totalInitialStock}
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
      </Card>
    </div>
  );
};

export default PurchasePlan;
