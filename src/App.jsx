import React, { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
  FileTextOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import ProductionPlan from './pages/ProductionPlan'
import PurchasePlan from './pages/PurchasePlan'

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
          label: '采购计划',
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
    return ['/production']
  }

  const getOpenKeys = () => {
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
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App