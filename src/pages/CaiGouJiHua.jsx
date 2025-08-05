import React, { useState, useRef } from 'react';
import {
  Card,
  Button,
  Space,
  DatePicker,
  Select,
  Form,
  message,
  Table,
  Pagination,
} from 'antd';

const { RangePicker } = DatePicker;
import {
  DownloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Option } = Select;

const PurchasePlan = () => {
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState([dayjs('2025-08-01'), dayjs('2025-08-10')]);
  const [selectedModel, setSelectedModel] = useState('全部');
  const [selectedQualityRequirement, setSelectedQualityRequirement] = useState('全部');
  const tableRef = useRef();

  // 根据选中的日期范围生成日期列
  const generateDateColumns = (dateRange) => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      // 默认显示2025年8月1日到10日
      const startDate = dayjs('2025-08-01');
      const dates = [];
      for (let i = 0; i < 10; i++) {
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
    const mockData = [
      {
        key: '1',
        model: '6205',
        qualityRequirement: null,
        // 预计采购量：根据日期列数量生成数据
        expectedPurchase: Array(dateColumns.length).fill(0).map((_, index) => 
          [1, 3, 5, 9].includes(index) ? [50, 30, 40, 25][Math.floor(Math.random() * 4)] : 0
        ),
      },
      {
        key: '2',
        model: '6206',
        qualityRequirement: null,
        expectedPurchase: Array(dateColumns.length).fill(0).map((_, index) => 
          [1, 3, 5, 9].includes(index) ? [20, 35, 15, 30][Math.floor(Math.random() * 4)] : 0
        ),
      },
      {
        key: '3',
        model: '6206',
        qualityRequirement: '耐高温要求，工作温度≤150°C',
        expectedPurchase: Array(dateColumns.length).fill(0).map((_, index) => 
          [1, 3, 5, 9].includes(index) ? [60, 45, 55, 40][Math.floor(Math.random() * 4)] : 0
        ),
      },
      {
        key: '4',
        model: '6315-2RZ',
        qualityRequirement: null,
        expectedPurchase: Array(dateColumns.length).fill(0).map((_, index) => 
          [1, 3, 5, 9].includes(index) ? [15, 25, 20, 18][Math.floor(Math.random() * 4)] : 0
        ),
      },
      {
        key: '5',
        model: '6311-2Z',
        qualityRequirement: '防腐蚀要求，盐雾试验≥240小时',
        expectedPurchase: Array(dateColumns.length).fill(0).map((_, index) => 
          [1, 3, 5, 9].includes(index) ? [35, 40, 28, 22][Math.floor(Math.random() * 4)] : 0
        ),
      },
    ];
    setDataSource(mockData);
  };

  React.useEffect(() => {
    initMockData();
  }, []);



  // 处理型号筛选变化
  const handleModelFilterChange = (model) => {
    setSelectedModel(model);
  };

  // 处理质量要求筛选变化
  const handleQualityRequirementChange = (value) => {
    setSelectedQualityRequirement(value || '全部');
  };

  // 获取筛选后的数据
  const getFilteredDataSource = () => {
    let filtered = [...dataSource];
    
    // 按型号筛选
    if (selectedModel !== '全部') {
      filtered = filtered.filter(item => item.model === selectedModel);
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
        width: 200,
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
            <div 
              className='plan-value'
              style={{
                cursor: record.expectedPurchase[index] > 0 ? 'pointer' : 'default',
                fontWeight: record.expectedPurchase[index] > 0 ? 'bold' : 'normal',
                textAlign: 'right',
                padding: '4px 8px'
              }}
            >
              {record.expectedPurchase[index] || '-'}
            </div>
          </div>
        ),
      });
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
        const expectedTotal = record.expectedPurchase.reduce(
          (sum, val) => sum + (val || 0),
          0
        );
        return (
          <div className='cell-content'>
            <div className='plan-value total-value' style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 'bold' }}>
              {expectedTotal}
            </div>
          </div>
        );
      },
    });

    return columns;
  };



  // 导出功能
  const handleExport = () => {
    const exportData = dataSource.map((row) => {
      const rowData = {
        型号: row.model,
        质量要求: row.qualityRequirement || '-',
      };

      dateColumns.forEach((date, index) => {
        rowData[date.format('MM/DD')] = row.expectedPurchase[index];
      });

      rowData['旬总计'] = row.expectedPurchase.reduce((sum, val) => sum + (val || 0), 0);

      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '采购需求');
    XLSX.writeFile(wb, `采购需求_${dayjs().format('YYYY-MM-DD')}.xlsx`);

    message.success('导出成功');
  };

  const modelOptions = ['6205', '6206', '6207', '6208', '6315-2RZ', '6311-2Z'];

  return (
    <div>
      <div className='page-header'>
        <h1>采购需求</h1>
      </div>

      {/* 筛选区域 */}
      <Card className='filter-card' size='small'>
        <Form 
          form={filterForm} 
          layout='inline'
          initialValues={{ dateRange: [dayjs('2025-08-01'), dayjs('2025-08-10')], model: '全部', qualityRequirement: '全部' }}
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
            />
          </Form.Item>
          <Form.Item label='成品型号' name='model'>
            <Select 
              placeholder='请选择型号' 
              allowClear 
              style={{ width: 150 }}
              value={selectedModel}
              onChange={(value) => {
                handleModelFilterChange(value || '全部');
                filterForm.setFieldsValue({ model: value });
              }}
            >
              <Option value='全部'>全部</Option>
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

      {/* 采购需求表格 */}
      <Card 
        className='table-card'
        title="采购需求"
        extra={
          <Space>
            <Button
              type='default'
              onClick={handleExport}
              icon={<DownloadOutlined />}
            >
              导出Excel
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
          summary={(pageData) => {
            // 计算合计数据
            const totalExpectedPurchase = new Array(dateColumns.length).fill(0);

            pageData.forEach((record) => {
              record.expectedPurchase.forEach((val, index) => {
                totalExpectedPurchase[index] += val || 0;
              });
            });

            const totalExpected = totalExpectedPurchase.reduce(
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
                    key={`summary_${index}`}
                    index={index + 2}
                    style={{ textAlign: 'right' }}
                  >
                    <div className='cell-content'>
                      <div
                        className='plan-value'
                        style={{ fontWeight: 'bold', textAlign: 'right', padding: '4px 8px' }}
                      >
                        {totalExpectedPurchase[index]}
                      </div>
                    </div>
                  </Table.Summary.Cell>
                ))}
                <Table.Summary.Cell
                  index={dateColumns.length + 2}
                  className='text-right'
                  style={{ fontWeight: 'bold', textAlign: 'right' }}
                >
                  <div className='cell-content'>
                    <div className='plan-value total-value' style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 'bold' }}>
                      {totalExpected}
                    </div>
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
    </div>
  );
};

export default PurchasePlan;