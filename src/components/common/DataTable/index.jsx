import React from 'react';
import { Table, Card } from 'antd';
import './index.css';

const DataTable = ({
  title,
  description,
  columns,
  dataSource,
  loading = false,
  pagination = false,
  scroll,
  summary,
  expandable,
  rowSelection,
  size = 'middle',
  bordered = false,
  className = '',
  cardProps = {},
  tableProps = {},
  ...restProps
}) => {
  const tableConfig = {
    columns,
    dataSource,
    loading,
    pagination,
    scroll,
    summary,
    expandable,
    rowSelection,
    size,
    bordered,
    className: `data-table ${className}`,
    ...tableProps,
    ...restProps
  };

  const content = (
    <>
      {(title || description) && (
        <div className="table-header">
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
        </div>
      )}
      <Table {...tableConfig} />
    </>
  );

  return (
    <Card className="table-card" {...cardProps}>
      {content}
    </Card>
  );
};

export default DataTable;