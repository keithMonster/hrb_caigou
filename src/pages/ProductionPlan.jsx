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
  const [selectedXun, setSelectedXun] = useState('2025-08-上旬');
  const [selectedFactory, setSelectedFactory] = useState('全部');
  const [selectedQualityRequirement, setSelectedQualityRequirement] = useState('全部');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerData, setDrawerData] = useState([]);
  const [drawerTitle, setDrawerTitle] = useState('');
  const tableRef = useRef();

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

  // 初始化模拟数据
  const initMockData = () => {
    const mockData = [
      {
        key: '1',
        model: '6205',
        qualityRequirement: null,
        factory: '电机',
        productionLine: '1',
        type: 'A类',
        initialStock: 100,
        // 预计数据：只有8.2、8.4、8.6、8.10这四天有数据
        expectedPlans: [0, 25, 0, 18, 0, 32, 0, 0, 0, 15],
        // 用户输入的计划数据
        dailyInputs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        key: '2',
        model: '6206',
        qualityRequirement: null,
        factory: '铁路',
        productionLine: '3',
        type: 'B类',
        initialStock: 0,
        expectedPlans: [0, 12, 0, 20, 0, 8, 0, 0, 0, 25],
        dailyInputs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        key: '3',
        model: '6206',
        qualityRequirement: '耐高温要求，工作温度≤150°C',
        factory: '精密',
        productionLine: '5',
        type: 'A类',
        initialStock: 0,
        expectedPlans: [0, 35, 0, 28, 0, 42, 0, 0, 0, 20],
        dailyInputs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        key: '4',
        model: 'SKF-001',
        qualityRequirement: null,
        factory: '黄海',
        productionLine: '7',
        type: 'B类',
        initialStock: 0,
        expectedPlans: [0, 8, 0, 15, 0, 12, 0, 0, 0, 10],
        dailyInputs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        key: '5',
        model: 'NSK-002',
        qualityRequirement: '防腐蚀要求，盐雾试验≥240小时',
        factory: '电机',
        productionLine: '2',
        type: 'A类',
        initialStock: 0,
        expectedPlans: [0, 18, 0, 22, 0, 16, 0, 0, 0, 12],
        dailyInputs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
        const expectedTotal = record.expectedPlans.reduce(
          (sum, val) => sum + (val || 0),
          0
        );
        if (expectedTotal > 0) {
          handleTotalChange(record, expectedTotal);
        }
      });
    }
  }, [dataSource.length]);

  // 处理每日计划变更
  const handleDailyChange = (record, index, value) => {
    const newData = [...dataSource];
    const targetRecord = newData.find((item) => item.key === record.key);
    if (targetRecord) {
      targetRecord.dailyInputs[index] = value || 0;
      setDataSource(newData);
    }
  };

  // 关闭抽屉
  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setDrawerData([]);
    setDrawerTitle('');
  };



  // 处理生产线变更
  const handleProductionLineChange = (record, value) => {
    const newData = [...dataSource];
    const targetRecord = newData.find((item) => item.key === record.key);
    if (targetRecord) {
      targetRecord.productionLine = value;
      setDataSource(newData);
    }
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
        targetRecord.dailyInputs[i] = avgValue + (i < remainder ? 1 : 0);
      }

      setDataSource(newData);
    }
  };

  // 生成表格列配置
  const generateColumns = () => {
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
        width: 120,
        fixed: 'left',
        render: (value) => (
          <span style={{ color: value ? '#ff4d4f' : '#999' }}>
            {value || '-'}
          </span>
        ),
      },
      {
        title: '往期结转',
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
          <div className='cell-content'>
            <div 
              className='plan-value'
              style={{
                cursor: record.expectedPlans[index] > 0 ? 'pointer' : 'default',
                fontWeight: record.expectedPlans[index] > 0 ? 'bold' : 'normal'
              }}
            >
              {record.expectedPlans[index] || '-'}
            </div>
            <InputNumber
              size='small'
              min={0}
              precision={0}
              value={record.dailyInputs[index] || undefined}
              onChange={(value) => handleDailyChange(record, index, value)}
              className='daily-input'
              controls={false}
              placeholder=''
            />
          </div>
        ),
      });
    });



    // 添加生产线列
    columns.push({
      title: '生产线',
      dataIndex: 'productionLine',
      key: 'productionLine',
      width: 100,
      render: (value, record) => (
        <Select
          size='small'
          value={value}
          onChange={(val) => handleProductionLineChange(record, val)}
          style={{ width: '100%', marginTop: '30px' }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <Option key={num} value={num.toString()}>
              {num}
            </Option>
          ))}
        </Select>
      ),
    });

    // 添加汇总列
    columns.push({
      title: '汇总',
      dataIndex: 'total',
      key: 'total',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (_, record) => {
        const expectedTotal = record.expectedPlans.reduce(
          (sum, val) => sum + (val || 0),
          0
        );
        const planTotal = record.dailyInputs.reduce(
          (sum, val) => sum + (val || 0),
          0
        );
        return (
          <div className='cell-content'>
            <div className='plan-value total-value'>{expectedTotal}</div>
            <InputNumber
              size='small'
              min={0}
              precision={0}
              value={planTotal || expectedTotal || undefined}
              onChange={(value) => handleTotalChange(record, value)}
              className='total-input'
              controls={false}
              placeholder=''
            />
          </div>
        );
      },
    });



    return columns;
  };



  // 保存功能
  const handleSave = () => {
    message.success('生产计划已保存');
  };

  // 导出功能
  const handleExport = () => {
    const exportData = dataSource.map((row) => {
      const rowData = {
        型号: row.model,
        质量要求: row.qualityRequirement || '-',
        类型: row.type,
        往期结转: row.initialStock,
      };

      dateColumns.forEach((date, index) => {
        rowData[date.format('MM/DD')] = row.expectedPlans[index];
      });

      rowData['旬总计'] = row.totalPlan;

      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '生产计划');
    XLSX.writeFile(wb, `生产计划_${dayjs().format('YYYY-MM-DD')}.xlsx`);

    message.success('导出成功');
  };

  const modelOptions = ['6205', '6206', '6207', '6208', 'SKF-001', 'NSK-002'];

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
              保存计划
            </Button>
          </Space>
        }
      >

        {/* 分厂筛选器 */}
        <div
          style={{
            marginBottom: 16,
            padding: '12px 0',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Space wrap>
             {['全部', '电机', '铁路', '精密', '黄海'].map((factory) => (
               <Button
                 key={factory}
                 type={selectedFactory === factory ? 'primary' : 'default'}
                 onClick={() => handleFactoryFilterChange(factory)}
                 size='small'
               >
                 {factory}
               </Button>
             ))}
           </Space>
        </div>

        <Table
          ref={tableRef}
          dataSource={getFilteredDataSource()}
          columns={generateColumns()}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={false}
          bordered
          size='small'
          summary={(pageData) => {
            // 计算合计数据
            const totalInitialStock = pageData.reduce(
              (sum, record) => sum + (record.initialStock || 0),
              0
            );
            const totalExpectedPlans = new Array(dateColumns.length).fill(0);
            const totalDailyInputs = new Array(dateColumns.length).fill(0);

            pageData.forEach((record) => {
              record.expectedPlans.forEach((val, index) => {
                totalExpectedPlans[index] += val || 0;
              });
              record.dailyInputs.forEach((val, index) => {
                totalDailyInputs[index] += val || 0;
              });
            });

            const totalExpected = totalExpectedPlans.reduce(
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
                <Table.Summary.Cell
                  index={1}
                  style={{ fontWeight: 'bold', textAlign: 'center' }}
                >
                  -
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={2}
                  className='text-right'
                  style={{ fontWeight: 'bold', textAlign: 'right' }}
                >
                  {totalInitialStock}
                </Table.Summary.Cell>
                {dateColumns.map((_, index) => (
                  <Table.Summary.Cell
                    key={`summary_${index}`}
                    index={index + 3}
                    style={{ textAlign: 'right' }}
                  >
                    <div className='cell-content'>
                      <div
                        className='plan-value'
                        style={{ fontWeight: 'bold' }}
                      >
                        {totalExpectedPlans[index]}
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                        {totalDailyInputs[index]}
                      </div>
                    </div>
                  </Table.Summary.Cell>
                ))}
                <Table.Summary.Cell
                  index={dateColumns.length + 3}
                  style={{ fontWeight: 'bold', textAlign: 'center' }}
                >
                  -
                </Table.Summary.Cell>
                <Table.Summary.Cell
                  index={dateColumns.length + 4}
                  className='text-right'
                  style={{ fontWeight: 'bold', textAlign: 'right' }}
                >
                  <div className='cell-content'>
                    <div className='plan-value total-value'>
                      {totalExpected}
                    </div>
                    <div style={{ color: '#1890ff' }}>{totalInput}</div>
                  </div>
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
    </div>
  );
};

export default ProductionPlan;
