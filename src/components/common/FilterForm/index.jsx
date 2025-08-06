import React from 'react';
import { Form, Card, Row, Col, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import './index.css';

const FilterForm = ({
  form,
  children,
  onFinish,
  onReset,
  title = '筛选条件',
  showActions = true,
  actionAlign = 'right',
  cardProps = {},
  formProps = {},
  gutter = [16, 16],
  ...restProps
}) => {
  const handleReset = () => {
    form?.resetFields();
    onReset?.();
  };

  const handleFinish = (values) => {
    onFinish?.(values);
  };

  const actionButtons = showActions && (
    <Space>
      <Button type="primary" icon={<SearchOutlined />} onClick={() => form?.submit()}>
        查询
      </Button>
      <Button icon={<ReloadOutlined />} onClick={handleReset}>
        重置
      </Button>
    </Space>
  );

  return (
    <Card className="filter-card" title={title} {...cardProps}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        {...formProps}
        {...restProps}
      >
        <Row gutter={gutter}>
          {children}
          {showActions && (
            <Col span={24}>
              <div className={`filter-actions filter-actions-${actionAlign}`}>
                {actionButtons}
              </div>
            </Col>
          )}
        </Row>
      </Form>
    </Card>
  );
};

export default FilterForm;