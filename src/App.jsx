import React, { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
  FileTextOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  ContainerOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import ProductionPlan from './pages/ProductionPlan'
import PurchasePlan from './pages/PurchasePlan'
import PurchaseContract from './pages/PurchaseContract'
import Arrival from './pages/Arrival'
import QualityInspection from './pages/QualityInspection'
import Warehousing from './pages/Warehousing'

const { Sider, Content } = Layout

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    {
      key: 'requirements',
      icon: <FileTextOutlined />,
      label: '需求池',
      children: [
        {
          key: '/production',
          icon: <SettingOutlined />,
          label: '生产计划',
        },
        {
          key: '/purchase',
          icon: <ShoppingCartOutlined />,
          label: '采购需求',
        },
      ],
    },
    {
      key: 'professional-oem',
      icon: <ContainerOutlined />,
      label: '专业OEM',
      children: [
        {
          key: '/purchase-contract',
          icon: <ContainerOutlined />,
          label: '采购合同',
        },
        {
          key: '/arrival',
          icon: <InboxOutlined />,
          label: '到货',
        },
        {
          key: '/quality-inspection',
          icon: <CheckCircleOutlined />,
          label: '质量验收',
        },
        {
          key: '/warehousing',
          icon: <DatabaseOutlined />,
          label: '入库',
        },
      ],
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key)
    }
  }

  const getSelectedKeys = () => {
    const path = location.pathname
    if (path === '/' || path === '/production') return ['/production']
    if (path === '/purchase') return ['/purchase']
    if (path === '/purchase-contract') return ['/purchase-contract']
    if (path === '/arrival') return ['/arrival']
    if (path === '/quality-inspection') return ['/quality-inspection']
    if (path === '/warehousing') return ['/warehousing']
    return ['/production']
  }

  const getOpenKeys = () => {
    const path = location.pathname
    if (path.startsWith('/purchase-contract') || path.startsWith('/arrival') || 
        path.startsWith('/quality-inspection') || path.startsWith('/warehousing')) {
      return ['professional-oem']
    }
    return ['requirements']
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={256}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#262626',
            fontSize: collapsed ? 14 : 16,
            fontWeight: 600,
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: '#fff',
          }}
        >
          <img src="/favicon.ico" style={{marginRight: 8}} alt="" />
          {collapsed ? '产供销' : '产供销协同工作台'}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Content>
          <Routes>
            <Route path="/" element={<ProductionPlan />} />
            <Route path="/production" element={<ProductionPlan />} />
            <Route path="/purchase" element={<PurchasePlan />} />
            <Route path="/purchase-contract" element={<PurchaseContract />} />
            <Route path="/arrival" element={<Arrival />} />
            <Route path="/quality-inspection" element={<QualityInspection />} />
            <Route path="/warehousing" element={<Warehousing />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App