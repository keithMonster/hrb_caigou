import React from 'react';
import './index.css';

const PageLayout = ({
  title,
  description,
  children,
  className = '',
  headerExtra,
  ...restProps
}) => {
  return (
    <div className={`page-layout ${className}`} {...restProps}>
      {(title || description || headerExtra) && (
        <div className="page-header">
          <div className="page-header-content">
            {title && <h1>{title}</h1>}
            {description && <p>{description}</p>}
          </div>
          {headerExtra && (
            <div className="page-header-extra">
              {headerExtra}
            </div>
          )}
        </div>
      )}
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;