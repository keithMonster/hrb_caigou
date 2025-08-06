import dayjs from 'dayjs';

/**
 * 根据日期范围生成日期列数组
 * @param {Array} dateRange - [startDate, endDate]
 * @param {number} maxDays - 最大天数限制，默认31天
 * @returns {Array} 日期数组
 */
export const generateDateColumns = (dateRange, maxDays = 31) => {
  if (!dateRange || !dateRange[0] || !dateRange[1]) {
    return [];
  }
  
  const dates = [];
  const startDate = dateRange[0];
  const endDate = dateRange[1];
  const daysDiff = endDate.diff(startDate, 'day') + 1;
  
  // 限制最大天数
  const totalDays = Math.min(daysDiff, maxDays);
  for (let i = 0; i < totalDays; i++) {
    dates.push(startDate.add(i, 'day'));
  }
  return dates;
};

/**
 * 格式化日期为字符串
 * @param {dayjs.Dayjs} date - dayjs日期对象
 * @param {string} format - 格式化字符串，默认'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

/**
 * 获取日期的简短显示格式
 * @param {dayjs.Dayjs} date - dayjs日期对象
 * @returns {string} 简短格式的日期字符串 (MM-DD)
 */
export const getShortDateFormat = (date) => {
  if (!date) return '';
  return dayjs(date).format('MM-DD');
};

/**
 * 获取日期的星期显示
 * @param {dayjs.Dayjs} date - dayjs日期对象
 * @returns {string} 星期字符串
 */
export const getWeekday = (date) => {
  if (!date) return '';
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `周${weekdays[dayjs(date).day()]}`;
};

/**
 * 创建默认的日期范围
 * @param {string} startDate - 开始日期字符串
 * @param {string} endDate - 结束日期字符串
 * @returns {Array} [startDate, endDate]
 */
export const createDefaultDateRange = (startDate, endDate) => {
  return [dayjs(startDate), dayjs(endDate)];
};

/**
 * 获取当前月份的日期范围
 * @returns {Array} [monthStart, monthEnd]
 */
export const getCurrentMonthRange = () => {
  const now = dayjs();
  return [now.startOf('month'), now.endOf('month')];
};

/**
 * 获取指定月份的日期范围
 * @param {number} year - 年份
 * @param {number} month - 月份 (1-12)
 * @returns {Array} [monthStart, monthEnd]
 */
export const getMonthRange = (year, month) => {
  const date = dayjs().year(year).month(month - 1);
  return [date.startOf('month'), date.endOf('month')];
};