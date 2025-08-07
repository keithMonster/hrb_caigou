import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  FileTextOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  ContainerOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  ReconciliationOutlined,
} from '@ant-design/icons';
import ProductionPlan from './pages/ShengChanJiHua';
import PurchasePlan from './pages/WuLiaoZhunBeiJiHua';
import PurchaseContract from './pages/CaiGouHeTong';
import PurchasePlanPage from './pages/CaiGouJiHua';
import Arrival from './pages/DaoHuo';
import QualityInspection from './pages/ZhiLiangYanShou';
import Warehousing from './pages/RuKu';
import MaterialArrivalRequirement from './pages/WuLiaoDaoHuoXuQiu';
import RecentArrivalPlan from './pages/JinQiDaoHuoJiHua';
import MaterialPreparationRequirement from './pages/WuLiaoZhunBeiXuQiu';
import RawMaterialPurchaseContract from './pages/YuanLiaoCaiGouHeTong';
import OrderWarehousingMatch from './pages/DingDanRuKuPiPei';

const { Sider, Content } = Layout;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: 'order-processing',
      icon: <ReconciliationOutlined />,
      label: '订单处理',
      children: [
        {
          key: '/order-warehousing-match',
          icon: <ReconciliationOutlined />,
          label: '订单入库匹配',
        },
      ],
    },
    {
      key: 'requirements',
      icon: <FileTextOutlined />,
      label: '生产计划',
      children: [
        {
          key: '/production',
          icon: <SettingOutlined />,
          label: '生产计划',
        },
        {
          key: '/purchase',
          icon: <ShoppingCartOutlined />,
          label: '物料准备计划',
        },
        {
          key: '/material-arrival-requirement',
          icon: <InboxOutlined />,
          label: '物料到货需求',
        },
      ],
    },
    {
      key: 'professional-oem',
      icon: <ContainerOutlined />,
      label: '专业OEM',
      children: [
        {
          key: '/purchase-plan',
          icon: <ShoppingCartOutlined />,
          label: '采购需求',
        },
        {
          key: '/purchase-contract',
          icon: <ContainerOutlined />,
          label: '采购合同',
        },
        // {
        //   key: '/quality-inspection',
        //   icon: <CheckCircleOutlined />,
        //   label: '原料进厂检验',
        // },
      ],
    },
    {
      key: 'raw-material-purchase',
      icon: <ShoppingCartOutlined />,
      label: '原料采购',
      children: [
        {
          key: '/material-preparation-requirement',
          icon: <FileTextOutlined />,
          label: '物料准备需求',
        },
        {
          key: '/raw-material-purchase-contract',
          icon: <ContainerOutlined />,
          label: '原料采购合同',
        },
        {
          key: '/recent-arrival-plan',
          icon: <InboxOutlined />,
          label: '近期计划到货',
        },
      ],
    },
    {
      key: 'warehouse-management',
      icon: <DatabaseOutlined />,
      label: '库管',
      children: [
        {
          key: '/arrival',
          icon: <InboxOutlined />,
          label: '到货',
        },
        {
          key: '/warehousing',
          icon: <DatabaseOutlined />,
          label: '入库',
        },
      ],
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key);
    }
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path === '/' || path === '/production') return ['/production'];
    if (path === '/purchase') return ['/purchase'];
    if (path === '/material-arrival-requirement')
      return ['/material-arrival-requirement'];
    if (path === '/purchase-plan') return ['/purchase-plan'];
    if (path === '/purchase-contract') return ['/purchase-contract'];
    if (path === '/material-preparation-requirement')
      return ['/material-preparation-requirement'];
    if (path === '/raw-material-purchase-contract')
      return ['/raw-material-purchase-contract'];
    if (path === '/recent-arrival-plan') return ['/recent-arrival-plan'];
    if (path === '/arrival') return ['/arrival'];
    if (path === '/quality-inspection') return ['/quality-inspection'];
    if (path === '/warehousing') return ['/warehousing'];
    if (path === '/order-warehousing-match')
      return ['/order-warehousing-match'];
    return ['/production'];
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    if (
      path.startsWith('/purchase-plan') ||
      path.startsWith('/purchase-contract') ||
      path.startsWith('/quality-inspection')
    ) {
      return ['professional-oem'];
    }
    if (
      path.startsWith('/material-preparation-requirement') ||
      path.startsWith('/raw-material-purchase-contract') ||
      path.startsWith('/recent-arrival-plan')
    ) {
      return ['raw-material-purchase'];
    }
    if (path.startsWith('/arrival') || path.startsWith('/warehousing')) {
      return ['warehouse-management'];
    }
    if (path.startsWith('/order-warehousing-match')) {
      return ['order-processing'];
    }
    return ['requirements'];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme='light'
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
          <img src='/favicon.ico' style={{ marginRight: 8 }} alt='' />
          {collapsed ? '产供销' : '产供销协同工作台'}
        </div>
        <Menu
          theme='light'
          mode='inline'
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
            <Route path='/' element={<ProductionPlan />} />
            <Route path='/production' element={<ProductionPlan />} />
            <Route path='/purchase' element={<PurchasePlan />} />
            <Route
              path='/material-arrival-requirement'
              element={<MaterialArrivalRequirement />}
            />
            <Route path='/purchase-plan' element={<PurchasePlanPage />} />
            <Route path='/purchase-contract' element={<PurchaseContract />} />
            <Route
              path='/material-preparation-requirement'
              element={<MaterialPreparationRequirement />}
            />
            <Route
              path='/raw-material-purchase-contract'
              element={<RawMaterialPurchaseContract />}
            />
            <Route
              path='/recent-arrival-plan'
              element={<RecentArrivalPlan />}
            />
            <Route path='/arrival' element={<Arrival />} />
            <Route path='/quality-inspection' element={<QualityInspection />} />
            <Route path='/warehousing' element={<Warehousing />} />
            <Route
              path='/order-warehousing-match'
              element={<OrderWarehousingMatch />}
            />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
