import React, { useState, useEffect, useRef } from 'react';
import { Input, AutoComplete, Button, Dropdown, Space, Tag } from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
  DownOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { filterByKeyword } from '@/utils/businessUtils';
import './index.css';

const { Search } = Input;

/**
 * 增强搜索输入组件
 * 支持关键词搜索、自动完成、高级筛选等功能
 */
const SearchInput = ({
  // 基础属性
  value,
  defaultValue = '',
  placeholder = '请输入搜索关键词',
  size = 'middle',
  disabled = false,
  allowClear = true,
  
  // 搜索功能
  onSearch,
  onClear,
  onChange,
  searchOnEnter = true,
  searchOnChange = false,
  debounceMs = 300,
  
  // 自动完成
  enableAutoComplete = false,
  autoCompleteOptions = [],
  autoCompleteDataSource = [],
  autoCompleteFields = [],
  maxSuggestions = 10,
  
  // 高级筛选
  enableAdvancedFilter = false,
  filterOptions = [],
  activeFilters = [],
  onFilterChange,
  
  // 搜索历史
  enableHistory = false,
  historyKey = 'search_history',
  maxHistoryItems = 10,
  
  // 样式
  className = '',
  style = {},
  
  // 其他属性
  ...restProps
}) => {
  const [searchValue, setSearchValue] = useState(value || defaultValue);
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  
  // 初始化搜索历史
  useEffect(() => {
    if (enableHistory) {
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      setSearchHistory(history);
    }
  }, [enableHistory, historyKey]);
  
  // 受控组件处理
  useEffect(() => {
    if (value !== undefined) {
      setSearchValue(value);
    }
  }, [value]);
  
  // 防抖搜索
  const debouncedSearch = (searchText) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      handleSearch(searchText);
    }, debounceMs);
  };
  
  // 处理搜索
  const handleSearch = (searchText) => {
    const trimmedText = searchText?.trim();
    
    if (onSearch) {
      onSearch(trimmedText);
    }
    
    // 保存到搜索历史
    if (enableHistory && trimmedText) {
      saveToHistory(trimmedText);
    }
  };
  
  // 保存搜索历史
  const saveToHistory = (searchText) => {
    const newHistory = [searchText, ...searchHistory.filter(item => item !== searchText)]
      .slice(0, maxHistoryItems);
    
    setSearchHistory(newHistory);
    localStorage.setItem(historyKey, JSON.stringify(newHistory));
  };
  
  // 处理输入变化
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    
    if (onChange) {
      onChange(e);
    }
    
    // 实时搜索
    if (searchOnChange) {
      debouncedSearch(newValue);
    }
    
    // 生成自动完成建议
    if (enableAutoComplete) {
      generateSuggestions(newValue);
    }
    
    // 显示搜索历史
    if (enableHistory && !newValue) {
      setShowHistory(true);
    } else {
      setShowHistory(false);
    }
  };
  
  // 生成自动完成建议
  const generateSuggestions = (searchText) => {
    if (!searchText) {
      setSuggestions([]);
      return;
    }
    
    let suggestions = [];
    
    // 从预设选项中筛选
    if (autoCompleteOptions.length > 0) {
      suggestions = autoCompleteOptions
        .filter(option => 
          option.toLowerCase().includes(searchText.toLowerCase())
        )
        .slice(0, maxSuggestions);
    }
    
    // 从数据源中筛选
    if (autoCompleteDataSource.length > 0 && autoCompleteFields.length > 0) {
      const filteredData = filterByKeyword(
        autoCompleteDataSource,
        searchText,
        autoCompleteFields
      );
      
      const dataSuggestions = filteredData
        .slice(0, maxSuggestions)
        .map(item => {
          // 找到匹配的字段值
          for (const field of autoCompleteFields) {
            const value = item[field];
            if (value && value.toLowerCase().includes(searchText.toLowerCase())) {
              return value;
            }
          }
          return item[autoCompleteFields[0]];
        })
        .filter(Boolean);
      
      suggestions = [...new Set([...suggestions, ...dataSuggestions])]
        .slice(0, maxSuggestions);
    }
    
    setSuggestions(suggestions.map(text => ({ value: text, label: text })));
  };
  
  // 处理清空
  const handleClear = () => {
    setSearchValue('');
    setSuggestions([]);
    setShowHistory(false);
    
    if (onClear) {
      onClear();
    }
    
    if (onSearch) {
      onSearch('');
    }
  };
  
  // 处理回车搜索
  const handlePressEnter = (e) => {
    if (searchOnEnter) {
      handleSearch(e.target.value);
    }
  };
  
  // 处理自动完成选择
  const handleAutoCompleteSelect = (value) => {
    setSearchValue(value);
    handleSearch(value);
  };
  
  // 处理历史记录选择
  const handleHistorySelect = (historyItem) => {
    setSearchValue(historyItem);
    setShowHistory(false);
    handleSearch(historyItem);
  };
  
  // 删除历史记录项
  const removeHistoryItem = (item, e) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(h => h !== item);
    setSearchHistory(newHistory);
    localStorage.setItem(historyKey, JSON.stringify(newHistory));
  };
  
  // 清空历史记录
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(historyKey);
    setShowHistory(false);
  };
  
  // 处理筛选器变化
  const handleFilterToggle = (filterKey) => {
    if (!onFilterChange) return;
    
    const newFilters = activeFilters.includes(filterKey)
      ? activeFilters.filter(f => f !== filterKey)
      : [...activeFilters, filterKey];
    
    onFilterChange(newFilters);
  };
  
  // 渲染筛选器下拉菜单
  const renderFilterDropdown = () => {
    if (!enableAdvancedFilter || filterOptions.length === 0) {
      return null;
    }
    
    const menuItems = filterOptions.map(option => ({
      key: option.key,
      label: (
        <div className="filter-option">
          <span>{option.label}</span>
          {activeFilters.includes(option.key) && (
            <span className="filter-active-indicator">✓</span>
          )}
        </div>
      ),
      onClick: () => handleFilterToggle(option.key)
    }));
    
    return (
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomRight"
        trigger={['click']}
      >
        <Button
          icon={<FilterOutlined />}
          className={`filter-button ${activeFilters.length > 0 ? 'has-active-filters' : ''}`}
        >
          筛选 {activeFilters.length > 0 && `(${activeFilters.length})`}
          <DownOutlined />
        </Button>
      </Dropdown>
    );
  };
  
  // 渲染活跃筛选器标签
  const renderActiveFilters = () => {
    if (!enableAdvancedFilter || activeFilters.length === 0) {
      return null;
    }
    
    return (
      <div className="active-filters">
        {activeFilters.map(filterKey => {
          const option = filterOptions.find(opt => opt.key === filterKey);
          return (
            <Tag
              key={filterKey}
              closable
              onClose={() => handleFilterToggle(filterKey)}
              className="filter-tag"
            >
              {option?.label || filterKey}
            </Tag>
          );
        })}
      </div>
    );
  };
  
  // 渲染搜索历史
  const renderSearchHistory = () => {
    if (!enableHistory || !showHistory || searchHistory.length === 0) {
      return null;
    }
    
    return (
      <div className="search-history">
        <div className="search-history-header">
          <span>搜索历史</span>
          <Button
            type="text"
            size="small"
            onClick={clearHistory}
            className="clear-history-btn"
          >
            清空
          </Button>
        </div>
        <div className="search-history-list">
          {searchHistory.map((item, index) => (
            <div
              key={index}
              className="search-history-item"
              onClick={() => handleHistorySelect(item)}
            >
              <span className="history-text">{item}</span>
              <CloseOutlined
                className="remove-history-btn"
                onClick={(e) => removeHistoryItem(item, e)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // 构建自动完成选项
  const autoCompleteOptionsWithHistory = [
    ...suggestions,
    ...(showHistory ? searchHistory.map(item => ({ value: item, label: item })) : [])
  ];
  
  const searchInputProps = {
    ref: inputRef,
    value: searchValue,
    placeholder,
    size,
    disabled,
    allowClear,
    onChange: handleInputChange,
    onPressEnter: handlePressEnter,
    onSearch: searchOnEnter ? handleSearch : undefined,
    className: `enhanced-search-input ${className}`,
    style,
    ...restProps
  };
  
  return (
    <div className="search-input-container">
      <div className="search-input-wrapper">
        <Space.Compact className="search-input-group">
          {enableAutoComplete ? (
            <AutoComplete
              options={autoCompleteOptionsWithHistory}
              onSelect={handleAutoCompleteSelect}
              className="search-autocomplete"
            >
              <Search {...searchInputProps} />
            </AutoComplete>
          ) : (
            <Search {...searchInputProps} />
          )}
          
          {renderFilterDropdown()}
        </Space.Compact>
        
        {renderSearchHistory()}
      </div>
      
      {renderActiveFilters()}
    </div>
  );
};

export default SearchInput;