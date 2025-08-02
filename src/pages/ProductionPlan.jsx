import React, { useState, useRef } from 'react'
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
} from 'antd'
import {
  SaveOutlined,
  DownloadOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'

const { RangePicker } = DatePicker
const { Option } = Select

const ProductionPlan = () => {
  const [form] = Form.useForm()
  const [filterForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const tableRef = useRef()

  // 生成当前旬的日期列（10天）
  const generateDateColumns = () => {
    const startDate = dayjs('2024-08-01')
    const dates = []
    for (let i = 0; i < 10; i++) {
      dates.push(startDate.add(i, 'day'))
    }
    return dates
  }

  const dateColumns = generateDateColumns()

  // 初始化模拟数据
  const initMockData = () => {
    const mockData = [
      {
          key: '1',
          model: '6205',
          initialStock: 100,
          // 预计数据：只有8.2、8.4、8.6、8.10这四天有数据
          expectedPlans: [0, 25, 0, 18, 0, 32, 0, 0, 0, 15],
          // 用户输入的计划数据
          dailyInputs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      {
        key: '2',
        model: '6206',
        initialStock: 0,
        expectedPlans: [0, 12, 0, 20, 0, 8, 0, 0, 0, 25],
        dailyInputs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        key: '3',
        model: '6207',
        initialStock: 0,
        expectedPlans: [0, 35, 0, 28, 0, 42, 0, 0, 0, 20],
        dailyInputs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        key: '4',
        model: 'SKF-001',
        initialStock: 0,
        expectedPlans: [0, 8, 0, 15, 0, 12, 0, 0, 0, 10],
        dailyInputs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        key: '5',
        model: 'NSK-002',
        initialStock: 0,
        expectedPlans: [0, 18, 0, 22, 0, 16, 0, 0, 0, 12],
        dailyInputs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    ]
    setDataSource(mockData)
  }

  React.useEffect(() => {
    initMockData()
  }, [])

  // 处理每日计划变更
  const handleDailyChange = (record, index, value) => {
    const newData = [...dataSource]
    const targetRecord = newData.find(item => item.key === record.key)
    if (targetRecord) {
      targetRecord.dailyInputs[index] = value || 0
      setDataSource(newData)
    }
  }

  // 处理总计变更
  const handleTotalChange = (record, value) => {
    const newData = [...dataSource]
    const targetRecord = newData.find(item => item.key === record.key)
    if (targetRecord) {
      const avgValue = Math.floor((value || 0) / 10)
      const remainder = (value || 0) % 10
      
      // 平均分配到每天，余数分配到前几天
      for (let i = 0; i < 10; i++) {
        targetRecord.dailyInputs[i] = avgValue + (i < remainder ? 1 : 0)
      }
      
      setDataSource(newData)
    }
  }

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
        title: '往期结转',
        dataIndex: 'initialStock',
        key: 'initialStock',
        width: 100,
        fixed: 'left',
        render: (value) => <span style={{ fontWeight: 500 }}>{value}</span>,
      },
    ]

    // 添加日期列
    dateColumns.forEach((date, index) => {
      columns.push({
        title: date.format('MM/DD'),
        key: `day_${index}`,
        width: 90,
        render: (_, record) => (
          <div className="cell-content">
            <div className="plan-value">{record.expectedPlans[index] || 0}</div>
            <InputNumber
              size="small"
              min={0}
              precision={0}
              value={record.dailyInputs[index]}
              onChange={(value) => handleDailyChange(record, index, value)}
              className="daily-input"
              controls={false}
            />
          </div>
        ),
      })
    })

    // 添加汇总列
    columns.push({
      title: '汇总',
      dataIndex: 'total',
      key: 'total',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const expectedTotal = record.expectedPlans.reduce((sum, val) => sum + (val || 0), 0)
        const planTotal = record.dailyInputs.reduce((sum, val) => sum + (val || 0), 0)
        return (
          <div className="cell-content">
            <div className="plan-value total-value">{expectedTotal}</div>
            <InputNumber
              size="small"
              min={0}
              precision={0}
              value={planTotal}
              onChange={(value) => handleTotalChange(record, value)}
              className="total-input"
              controls={false}
            />
          </div>
        )
      },
    })

    // 添加期末库存列
    columns.push({
      title: '计划库存',
      dataIndex: 'finalStock',
      key: 'finalStock',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const expectedTotal = record.expectedPlans.reduce((sum, val) => sum + (val || 0), 0)
        const planTotal = record.dailyInputs.reduce((sum, val) => sum + (val || 0), 0)
        const finalStock = record.initialStock + planTotal - expectedTotal
        return <span style={{ fontWeight: 500, color: '#1890ff' }}>{finalStock}</span>
      },
    })

    return columns
  }

  // 筛选功能
  const handleFilter = () => {
    message.success('筛选功能已执行')
  }

  const handleReset = () => {
    filterForm.resetFields()
    message.info('筛选条件已重置')
  }

  // 保存功能
  const handleSave = () => {
    message.success('生产计划已保存')
  }

  // 导出功能
  const handleExport = () => {
    const exportData = dataSource.map(row => {
      const rowData = {
        '型号': row.model,
        '往期结转': row.initialStock,
      }
      
      dateColumns.forEach((date, index) => {
        rowData[date.format('MM/DD')] = row.expectedPlans[index]
      })
      
      rowData['旬总计'] = row.totalPlan
      rowData['计划库存'] = row.finalStock
      
      return rowData
    })
    
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '生产计划')
    XLSX.writeFile(wb, `生产计划_${dayjs().format('YYYY-MM-DD')}.xlsx`)
    
    message.success('导出成功')
  }

  const modelOptions = ['6205', '6206', '6207', '6208', 'SKF-001', 'NSK-002']

  return (
    <div>
      <div className="page-header">
        <h1>生产计划</h1>
        <p>用于生产部门排期计划，按旬（10天）维度进行计划安排</p>
      </div>

      {/* 筛选区域 */}
      <Card className="filter-card" size="small">
        <Form
          form={filterForm}
          layout="inline"
          onFinish={handleFilter}
        >
          <Form.Item label="计划旬期" name="dateRange">
            <RangePicker
              format="YYYY-MM-DD"
              placeholder={['开始日期', '结束日期']}
            />
          </Form.Item>
          <Form.Item label="产品型号" name="model">
            <Select
              placeholder="请选择型号"
              allowClear
              style={{ width: 150 }}
            >
              <Option value="">全部</Option>
              {modelOptions.map(model => (
                <Option key={model} value={model}>{model}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 生产计划表格 */}
      <Card className="table-card">
        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3>生产计划</h3>
            <p>产品的生产计划安排</p>
          </div>
          <Space>
            <Button type="primary" onClick={handleSave} icon={<SaveOutlined />}>
              保存计划
            </Button>
            <Button type="default" onClick={handleExport} icon={<DownloadOutlined />}>
              导出Excel
            </Button>
          </Space>
        </div>
        <Table
          ref={tableRef}
          dataSource={dataSource}
          columns={generateColumns()}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={false}
          bordered
          size="small"
        />
        <div style={{ marginTop: 16, textAlign: 'center', display: 'flex', justifyContent: 'flex-end' }}>
          <Pagination
            current={1}
            total={50}
            pageSize={10}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
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
  )
}

export default ProductionPlan