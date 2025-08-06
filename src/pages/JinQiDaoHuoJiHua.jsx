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
} from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Option } = Select;

const RecentArrivalPlan = () => {
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [selectedMaterialType, setSelectedMaterialType] = useState('全部');
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [editingData, setEditingData] = useState({});

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



  // 模拟数据
  const mockData = [
    {
      key: '1',
      materialType: '外圈',
      qualityRequirement: '表面粗糙度Ra≤0.8μm，硬度HRC58-62',
      attachments: ['技术要求.pdf', '检验标准.doc'],
      materialSource: '外购',
      specification: '234424BM',
      materialRequirement: '表面粗糙度Ra≤0.8',
      firstTen: 500,
      middleTen: 300,
      lastTen: 200,
      subPlans: [
        {
          key: '1_1',
          parentKey: '1',
          arrivalDate: '2025-01-05',
          arrivalQuantity: 500,
        },
        {
          key: '1_2',
          parentKey: '1',
          arrivalDate: '2025-01-15',
          arrivalQuantity: 300,
        },
        {
          key: '1_3',
          parentKey: '1',
          arrivalDate: '2025-01-25',
          arrivalQuantity: 200,
        },
      ],
    },
    {
      key: '2',
      materialType: '内圈',
      qualityRequirement: '硬度HRC58-62，精度等级P5',
      attachments: ['质量标准.pdf'],
      materialSource: '自产',
      specification: '7006C',
      materialRequirement: '硬度HRC58-62',
      firstTen: 400,
      middleTen: 300,
      lastTen: 100,
      subPlans: [
        {
          key: '2_1',
          parentKey: '2',
          arrivalDate: '2025-01-08',
          arrivalQuantity: 400,
        },
        {
          key: '2_2',
          parentKey: '2',
          arrivalDate: '2025-01-18',
          arrivalQuantity: 300,
        },
        {
          key: '2_3',
          parentKey: '2',
          arrivalDate: '2025-01-28',
          arrivalQuantity: 100,
        },
      ],
    },
    {
      key: '3',
      materialType: '密封件',
      qualityRequirement: '耐温-40℃~+120℃，密封性能良好',
      attachments: ['材料证书.pdf', '测试报告.doc'],
      materialSource: '外购',
      specification: '6004-RZ',
      materialRequirement: '耐温-40~120℃',
      firstTen: 1000,
      middleTen: 800,
      lastTen: 600,
      subPlans: [
        {
          key: '3_1',
          parentKey: '3',
          arrivalDate: '2025-01-10',
          arrivalQuantity: 1000,
        },
        {
          key: '3_2',
          parentKey: '3',
          arrivalDate: '2025-01-20',
          arrivalQuantity: 800,
        },
        {
          key: '3_3',
          parentKey: '3',
          arrivalDate: '2025-01-30',
          arrivalQuantity: 600,
        },
      ],
    },
  ];

  const [data, setData] = useState(mockData);

  // 保存数据
  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('保存成功');
    }, 1000);
  };

  // 处理展开行中的新增计划
  const handleAddSubPlan = (parentKey) => {
    const newSubPlan = {
      key: `${parentKey}_${Date.now()}`,
      parentKey,
      arrivalDate: dayjs().format('YYYY-MM-DD'),
      arrivalQuantity: 0,
    };
    
    const updatedData = data.map(item => {
      if (item.key === parentKey) {
        return {
          ...item,
          subPlans: [...(item.subPlans || []), newSubPlan]
        };
      }
      return item;
    });
    
    setData(updatedData);
    message.success('新增计划成功');
  };

  // 处理子计划数据变更
  const handleSubPlanChange = (parentKey, subPlanKey, field, value) => {
    const updatedData = data.map(item => {
      if (item.key === parentKey) {
        const updatedSubPlans = (item.subPlans || []).map(subPlan => {
          if (subPlan.key === subPlanKey) {
            return { ...subPlan, [field]: value };
          }
          return subPlan;
        });
        return { ...item, subPlans: updatedSubPlans };
      }
      return item;
    });
    setData(updatedData);
  };

  // 删除子计划
  const handleDeleteSubPlan = (parentKey, subPlanKey) => {
    const updatedData = data.map(item => {
      if (item.key === parentKey) {
        const updatedSubPlans = (item.subPlans || []).filter(subPlan => subPlan.key !== subPlanKey);
        return { ...item, subPlans: updatedSubPlans };
      }
      return item;
    });
    setData(updatedData);
    message.success('删除计划成功');
  };

  // 渲染展开行内容
   const expandedRowRender = (record) => {
     return (
        <div style={{ padding: '16px', paddingLeft: '80px', backgroundColor: '#fafafa' }}>
         {(record.subPlans || []).map((subPlan, planIndex) => (
           <div key={subPlan.key} style={{ marginBottom: planIndex < (record.subPlans || []).length - 1 ? '24px' : '0' }}>
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
               <h4 style={{ margin: '0', color: '#1890ff' }}>计划 {planIndex + 1}</h4>
               <Button
                 type="text"
                 size="small"
                 onClick={() => handleAddSubPlan(record.key)}
                 style={{ color: '#52c41a' }}
               >
                 新增
               </Button>
               {(record.subPlans || []).length > 1 && (
                 <Button
                   type="text"
                   size="small"
                   onClick={() => handleDeleteSubPlan(record.key, subPlan.key)}
                   style={{ color: '#ff4d4f' }}
                 >
                   删除
                 </Button>
               )}
             </div>
             
             {/* 到货信息行 */}
             <div style={{ marginBottom: '12px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <span style={{ fontWeight: 500, minWidth: '80px', flexShrink: 0 }}>到货日期:</span>
                   <DatePicker
                     value={subPlan.arrivalDate ? dayjs(subPlan.arrivalDate) : null}
                     onChange={(date) => handleSubPlanChange(record.key, subPlan.key, 'arrivalDate', date ? date.format('YYYY-MM-DD') : '')}
                     format="YYYY-MM-DD"
                     size="small"
                     style={{ width: '140px' }}
                   />
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <span style={{ fontWeight: 500, minWidth: '80px', flexShrink: 0 }}>到货数量:</span>
                   <InputNumber
                     value={subPlan.arrivalQuantity}
                     onChange={(value) => handleSubPlanChange(record.key, subPlan.key, 'arrivalQuantity', value)}
                     min={0}
                     size="small"
                     style={{ width: '140px' }}
                     formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                     parser={value => value.replace(/\$\s?|(,*)/g, '')}
                     placeholder="请输入数量"
                   />
                 </div>
               </div>
             </div>
           </div>
         ))}
         
         {/* 新增计划按钮 */}
         {(!record.subPlans || record.subPlans.length === 0) && (
           <div style={{ textAlign: 'center', padding: '20px 0' }}>
             <Button
               type="dashed"
               onClick={() => handleAddSubPlan(record.key)}
               style={{ width: '200px' }}
             >
               + 新增到货计划
             </Button>
           </div>
         )}
       </div>
     );
   };

  // 表格列定义
  const columns = [
    {
      title: '物料类型',
      dataIndex: 'materialType',
      key: 'materialType',
      width: 100,
      fixed: 'left',
    },
    {
      title: '质量要求（含附件）',
      dataIndex: 'qualityRequirement',
      key: 'qualityRequirement',
      width: 200,
      fixed: 'left',
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
      fixed: 'left',
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
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 150,
      fixed: 'left',
    },
    {
      title: '物料要求',
      dataIndex: 'materialRequirement',
      key: 'materialRequirement',
      width: 200,
      render: (text) => text || '-',
    },
    {
      title: '上旬(1-10)',
      key: 'firstTen',
      width: 120,
      render: (_, record) => record.firstTen?.toLocaleString() || 0,
    },
    {
      title: '中旬(11-20)',
      key: 'middleTen',
      width: 120,
      render: (_, record) => record.middleTen?.toLocaleString() || 0,
    },
    {
      title: '下旬(21-30)',
      key: 'lastTen',
      width: 120,
      render: (_, record) => record.lastTen?.toLocaleString() || 0,
    },
  ];

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
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              保存
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
          expandable={{
             expandedRowRender,
             expandedRowKeys,
             onExpandedRowsChange: setExpandedRowKeys,
             defaultExpandAllRows: true,
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
          scroll={{ x: 1000 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
      

    </div>
  );
};

export default RecentArrivalPlan;