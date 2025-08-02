import React, { useState, useRef } from 'react'
import {
  Card,
  Button,
  Space,
  DatePicker,
  Form,
  InputNumber,
  message,
  Table,
  Divider,
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

const PurchasePlan = () => {
  const [filterForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [productDataSource, setProductDataSource] = useState([])
  const [partsDataSource, setPartsDataSource] = useState([])
  const productTableRef = useRef()
  const partsTableRef = useRef()

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

  // 初始化产品采购模拟数据
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
    ]
    setProductDataSource(mockData)
  }

  // 初始化零件采购模拟数据
  const initPartsMockData = () => {
    const mockData = [
      {
        key: '1',
        partName: '内圈-6205',
        initialStock: 50,
        dailyPlans: [0, 25, 0, 30, 0, 20, 0, 0, 0, 35],
        dailyInputs: [0, 25, 0, 30, 0, 20, 0, 0, 0, 35],
        totalPlan: 110,
      },
      {
        key: '2',
        partName: '内圈-6206',
        initialStock: 0,
        dailyPlans: [0, 20, 0, 25, 0, 15, 0, 0, 0, 30],
        dailyInputs: [0, 20, 0, 25, 0, 15, 0, 0, 0, 30],
        totalPlan: 90,
      },
      {
        key: '3',
        partName: '外圈-6205',
        initialStock: 80,
        dailyPlans: [0, 30, 0, 35, 0, 25, 0, 0, 0, 40],
        dailyInputs: [0, 30, 0, 35, 0, 25, 0, 0, 0, 40],
        totalPlan: 130,
      },
      {
        key: '4',
        partName: '外圈-SKF-001',
        initialStock: 0,
        dailyPlans: [0, 15, 0, 20, 0, 10, 0, 0, 0, 25],
        dailyInputs: [0, 15, 0, 20, 0, 10, 0, 0, 0, 25],
        totalPlan: 70,
      },
      {
        key: '5',
        partName: '滚动体-6205',
        initialStock: 0,
        dailyPlans: [0, 40, 0, 45, 0, 35, 0, 0, 0, 50],
        dailyInputs: [0, 40, 0, 45, 0, 35, 0, 0, 0, 50],
        totalPlan: 170,
      },
      {
        key: '6',
        partName: '保持架-6206',
        initialStock: 0,
        dailyPlans: [0, 18, 0, 22, 0, 16, 0, 0, 0, 24],
        dailyInputs: [0, 18, 0, 22, 0, 16, 0, 0, 0, 24],
        totalPlan: 80,
      },
      {
        key: '7',
        partName: '润滑脂-通用型',
        initialStock: 0,
        dailyPlans: [0, 12, 0, 15, 0, 10, 0, 0, 0, 18],
        dailyInputs: [0, 12, 0, 15, 0, 10, 0, 0, 0, 18],
        totalPlan: 55,
      },
    ]
    
    setPartsDataSource(mockData)
  }

  React.useEffect(() => {
    initProductMockData()
    initPartsMockData()
  }, [])

  // 处理产品每日计划变更
  const handleProductDailyChange = (record, index, value) => {
    const newData = [...productDataSource]
    const targetRecord = newData.find(item => item.key === record.key)
    if (targetRecord) {
      targetRecord.dailyInputs[index] = value || 0
      setProductDataSource(newData)
    }
  }

  // 处理零件每日计划变更
  const handlePartsDailyChange = (record, index, value) => {
    const newData = [...partsDataSource]
    const targetRecord = newData.find(item => item.key === record.key)
    if (targetRecord) {
      targetRecord.dailyInputs[index] = value || 0
      setPartsDataSource(newData)
    }
  }

  // 生成产品表格列配置
  const generateProductColumns = () => {
    const columns = [
      {
        title: '规格',
        dataIndex: 'spec',
        key: 'spec',
        width: 120,
        fixed: 'left',
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
            <div className="plan-value">{record.dailyPlans[index] || 0}</div>
            <InputNumber
              size="small"
              min={0}
              precision={0}
              value={record.dailyInputs[index]}
              onChange={(value) => handleProductDailyChange(record, index, value)}
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
      key: 'total',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const planTotal = record.dailyPlans.reduce((sum, val) => sum + (val || 0), 0)
        const inputTotal = record.dailyInputs.reduce((sum, val) => sum + (val || 0), 0)
        return (
          <div className="cell-content">
            <div className="plan-value total-value">{planTotal}</div>
            <div className="total-value">{inputTotal}</div>
          </div>
        )
      },
    })

    return columns
  }

  // 生成零件表格列配置
  const generatePartsColumns = () => {
    const columns = [
      {
        title: '零件名称',
        dataIndex: 'partName',
        key: 'partName',
        width: 120,
        fixed: 'left',
      },
      {
        title: '剩余库存',
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
            <div className="plan-value">{record.dailyPlans[index] || 0}</div>
            <InputNumber
              size="small"
              min={0}
              precision={0}
              value={record.dailyInputs[index]}
              onChange={(value) => handlePartsDailyChange(record, index, value)}
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
      key: 'total',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const planTotal = record.dailyPlans.reduce((sum, val) => sum + (val || 0), 0)
        const inputTotal = record.dailyInputs.reduce((sum, val) => sum + (val || 0), 0)
        return (
          <div className="cell-content">
            <div className="plan-value total-value">{planTotal}</div>
            <div className="plan-value total-value">{inputTotal}</div>
          </div>
        )
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
    message.success('采购计划已保存')
  }

  // 导出功能
  const handleExport = () => {
    // 导出产品采购计划
    const productExportData = productDataSource.map(row => {
      const rowData = {
        '规格': row.spec,
      }
      
      dateColumns.forEach((date, index) => {
        rowData[date.format('MM/DD')] = row.dailyPlans[index]
      })
      
      rowData['旬总计'] = row.totalPlan
      return rowData
    })
    
    // 导出零件采购计划
    const partsExportData = partsDataSource.map(row => {
      const rowData = {
        '零件名称': row.partName,
        '剩余库存': row.initialStock,
      }
      
      dateColumns.forEach((date, index) => {
        rowData[date.format('MM/DD')] = row.dailyPlans[index]
      })
      
      rowData['汇总'] = row.totalPlan
      return rowData
    })
    
    const wb = XLSX.utils.book_new()
    
    const productWs = XLSX.utils.json_to_sheet(productExportData)
    XLSX.utils.book_append_sheet(wb, productWs, '产品采购计划')
    
    const partsWs = XLSX.utils.json_to_sheet(partsExportData)
    XLSX.utils.book_append_sheet(wb, partsWs, '零件采购计划')
    
    XLSX.writeFile(wb, `采购计划_${dayjs().format('YYYY-MM-DD')}.xlsx`)
    
    message.success('导出成功')
  }

  return (
    <div>
      <div className="page-header">
        <h1>采购计划</h1>
        <p>包含产品采购计划和零件采购计划，按旬（10天）维度进行采购安排</p>
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

      {/* 产品采购计划表格 */}
      <Card className="table-card">
        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3>产品采购计划</h3>
            <p>产品的采购计划安排</p>
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
          ref={productTableRef}
          dataSource={productDataSource}
          columns={generateProductColumns()}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            position: ['bottomRight'],
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          bordered
          size="small"
        />
      </Card>

      <Divider />

      {/* 零件采购计划表格 */}
      <Card className="table-card">
        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3>零件采购计划</h3>
            <p>零件的采购计划安排</p>
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
          ref={partsTableRef}
          dataSource={partsDataSource}
          columns={generatePartsColumns()}
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            position: ['bottomRight'],
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          bordered
          size="small"
        />
      </Card>
    </div>
  )
}

export default PurchasePlan