const fs = require('fs');
const path = require('path');

// Helper function to get general settings from manager data
const getGeneralSettings = () => {
  try {
    const managerPath = path.join(__dirname, '../data/manager.json');
    if (fs.existsSync(managerPath)) {
      const managerData = JSON.parse(fs.readFileSync(managerPath, 'utf8'));
      return managerData.generalSettings || {
        weekendDays: [5, 6], // Default: Friday (5) and Saturday (6)
        nationalHolidays: []
      };
    }
  } catch (error) {
    console.error('Error loading general settings:', error);
  }
  
  // Return default settings if error
  return {
    weekendDays: [5, 6], // Default: Friday (5) and Saturday (6)
    nationalHolidays: []
  };
};

// Helper function to get all holidays from holidays.json
const getHolidays = () => {
  try {
    const holidaysPath = path.join(__dirname, '../data/holidays.json');
    if (fs.existsSync(holidaysPath)) {
      const holidaysData = JSON.parse(fs.readFileSync(holidaysPath, 'utf8'));
      return holidaysData.holidays || [];
    }
  } catch (error) {
    console.error('Error loading holidays:', error);
  }
  return [];
};

// Check if a date is a weekend based on dynamic settings
const isWeekend = (date) => {
  const settings = getGeneralSettings();
  const dayOfWeek = new Date(date).getDay();
  return settings.weekendDays.includes(dayOfWeek);
};

// Check if a date is a holiday
const isHoliday = (date) => {
  const settings = getGeneralSettings();
  const holidays = getHolidays();
  
  // Normalize the date to compare only year-month-day
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  // Check in manager's selected national holidays
  const isNationalHoliday = settings.nationalHolidays.some(holiday => {
    const holidayDate = new Date(holiday);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate.getTime() === checkDate.getTime();
  });
  
  if (isNationalHoliday) return true;
  
  // Also check in holidays.json for active holidays
  return holidays.some(holiday => {
    if (!holiday.isActive) return false;
    const holidayDate = new Date(holiday.date);
    holidayDate.setHours(0, 0, 0, 0);
    return holidayDate.getTime() === checkDate.getTime();
  });
};

// Check if a date is a working day (not weekend, not holiday)
const isWorkingDay = (date) => {
  return !isWeekend(date) && !isHoliday(date);
};

// Get the next working day from a given date
const getNextWorkingDay = (date) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  
  while (!isWorkingDay(nextDate)) {
    nextDate.setDate(nextDate.getDate() + 1);
  }
  
  return nextDate;
};

// Get the previous working day from a given date
const getPreviousWorkingDay = (date) => {
  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);
  
  while (!isWorkingDay(prevDate)) {
    prevDate.setDate(prevDate.getDate() - 1);
  }
  
  return prevDate;
};

// Count working days between two dates
const countWorkingDays = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    if (isWorkingDay(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
};

module.exports = {
  getGeneralSettings,
  getHolidays,
  isWeekend,
  isHoliday,
  isWorkingDay,
  getNextWorkingDay,
  getPreviousWorkingDay,
  countWorkingDays
}; 