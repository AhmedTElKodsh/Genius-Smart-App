const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
  extractUserAndRole,
  requireRole,
  requireAuthority,
  auditAction,
  ROLES
} = require('../middleware/roleAuthMiddleware');

const router = express.Router();

// Helper functions
const loadHolidays = () => {
  try {
    const holidaysPath = path.join(__dirname, '../data/holidays.json');
    const data = JSON.parse(fs.readFileSync(holidaysPath, 'utf8'));
    return data;
  } catch (error) {
    console.error('Error loading holidays:', error);
    return { holidays: [] };
  }
};

const saveHolidays = (holidaysData) => {
  try {
    const holidaysPath = path.join(__dirname, '../data/holidays.json');
    holidaysData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(holidaysPath, JSON.stringify(holidaysData, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving holidays:', error);
    return false;
  }
};

// GET /api/holidays - Get all holidays (Admin and Manager access)
router.get('/', 
  extractUserAndRole,
  requireRole(ROLES.MANAGER),
  (req, res) => {
    try {
      const holidaysData = loadHolidays();
      const { year } = req.query;
      
      let holidays = holidaysData.holidays || [];
      
      // Filter by year if specified
      if (year) {
        holidays = holidays.filter(holiday => {
          const holidayYear = new Date(holiday.date).getFullYear();
          return holidayYear.toString() === year;
        });
      }
      
      // Sort by date
      holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      res.json({
        success: true,
        data: holidays,
        total: holidays.length,
        message: 'Holidays retrieved successfully'
      });
      
    } catch (error) {
      console.error('Error retrieving holidays:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve holidays',
        details: error.message
      });
    }
  }
);

// POST /api/holidays - Add new holiday (Admin only)
router.post('/',
  extractUserAndRole,
  requireRole(ROLES.ADMIN),
  requireAuthority('System Administration'),
  auditAction('ADD_HOLIDAY', 'holiday'),
  (req, res) => {
    try {
      const {
        name,
        nameAr,
        date,
        description,
        descriptionAr,
        isRecurring,
        category
      } = req.body;
      
      // Validation
      if (!name || !nameAr || !date) {
        return res.status(400).json({
          success: false,
          message: 'Holiday name (English & Arabic) and date are required'
        });
      }
      
      // Validate date format
      const holidayDate = new Date(date);
      if (isNaN(holidayDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }
      
      const holidaysData = loadHolidays();
      
      // Check if holiday already exists on this date
      const existingHoliday = holidaysData.holidays.find(h => h.date === date && h.isActive);
      if (existingHoliday) {
        return res.status(400).json({
          success: false,
          message: 'A holiday already exists on this date'
        });
      }
      
      // Create new holiday
      const newHoliday = {
        id: uuidv4(),
        name: name.trim(),
        nameAr: nameAr.trim(),
        date: date,
        description: description?.trim() || '',
        descriptionAr: descriptionAr?.trim() || '',
        isRecurring: Boolean(isRecurring),
        category: category || 'administrative',
        createdAt: new Date().toISOString(),
        createdBy: req.user.id,
        createdByName: req.user.name,
        isActive: true
      };
      
      holidaysData.holidays.push(newHoliday);
      
      if (saveHolidays(holidaysData)) {
        res.status(201).json({
          success: true,
          data: newHoliday,
          message: 'Holiday added successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to save holiday'
        });
      }
      
    } catch (error) {
      console.error('Error adding holiday:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add holiday',
        details: error.message
      });
    }
  }
);

// PUT /api/holidays/:id - Update holiday (Admin only)
router.put('/:id',
  extractUserAndRole,
  requireRole(ROLES.ADMIN),
  requireAuthority('System Administration'),
  auditAction('UPDATE_HOLIDAY', 'holiday'),
  (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        nameAr,
        date,
        description,
        descriptionAr,
        isRecurring,
        category
      } = req.body;
      
      const holidaysData = loadHolidays();
      const holidayIndex = holidaysData.holidays.findIndex(h => h.id === id);
      
      if (holidayIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Holiday not found'
        });
      }
      
      // Validation
      if (!name || !nameAr || !date) {
        return res.status(400).json({
          success: false,
          message: 'Holiday name (English & Arabic) and date are required'
        });
      }
      
      // Validate date format
      const holidayDate = new Date(date);
      if (isNaN(holidayDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }
      
      // Check if another holiday exists on this date (excluding current holiday)
      const existingHoliday = holidaysData.holidays.find(h => h.date === date && h.id !== id && h.isActive);
      if (existingHoliday) {
        return res.status(400).json({
          success: false,
          message: 'Another holiday already exists on this date'
        });
      }
      
      // Store original data for audit
      req.originalData = { ...holidaysData.holidays[holidayIndex] };
      
      // Update holiday
      const updatedHoliday = {
        ...holidaysData.holidays[holidayIndex],
        name: name.trim(),
        nameAr: nameAr.trim(),
        date: date,
        description: description?.trim() || '',
        descriptionAr: descriptionAr?.trim() || '',
        isRecurring: Boolean(isRecurring),
        category: category || holidaysData.holidays[holidayIndex].category,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.id,
        updatedByName: req.user.name
      };
      
      holidaysData.holidays[holidayIndex] = updatedHoliday;
      
      if (saveHolidays(holidaysData)) {
        res.json({
          success: true,
          data: updatedHoliday,
          message: 'Holiday updated successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to save holiday updates'
        });
      }
      
    } catch (error) {
      console.error('Error updating holiday:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update holiday',
        details: error.message
      });
    }
  }
);

// DELETE /api/holidays/:id - Delete holiday (Admin only)
router.delete('/:id',
  extractUserAndRole,
  requireRole(ROLES.ADMIN),
  requireAuthority('System Administration'),
  auditAction('DELETE_HOLIDAY', 'holiday'),
  (req, res) => {
    try {
      const { id } = req.params;
      
      const holidaysData = loadHolidays();
      const holidayIndex = holidaysData.holidays.findIndex(h => h.id === id);
      
      if (holidayIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Holiday not found'
        });
      }
      
      // Store original data for audit
      req.originalData = { ...holidaysData.holidays[holidayIndex] };
      
      // Mark as inactive instead of actually deleting (soft delete)
      holidaysData.holidays[holidayIndex].isActive = false;
      holidaysData.holidays[holidayIndex].deletedAt = new Date().toISOString();
      holidaysData.holidays[holidayIndex].deletedBy = req.user.id;
      holidaysData.holidays[holidayIndex].deletedByName = req.user.name;
      
      if (saveHolidays(holidaysData)) {
        res.json({
          success: true,
          message: 'Holiday deleted successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to delete holiday'
        });
      }
      
    } catch (error) {
      console.error('Error deleting holiday:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete holiday',
        details: error.message
      });
    }
  }
);

// GET /api/holidays/check/:date - Check if a specific date is a holiday
router.get('/check/:date',
  extractUserAndRole,
  requireRole(ROLES.EMPLOYEE),
  (req, res) => {
    try {
      const { date } = req.params;
      
      // Validate date format
      const checkDate = new Date(date);
      if (isNaN(checkDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }
      
      const holidaysData = loadHolidays();
      
      // Check for exact date match
      let holiday = holidaysData.holidays.find(h => 
        h.date === date && h.isActive
      );
      
      // If not found and it's a recurring holiday, check for same month/day in any year
      if (!holiday) {
        const checkMonth = checkDate.getMonth();
        const checkDay = checkDate.getDate();
        
        holiday = holidaysData.holidays.find(h => {
          if (!h.isRecurring || !h.isActive) return false;
          
          const holidayDate = new Date(h.date);
          return holidayDate.getMonth() === checkMonth && holidayDate.getDate() === checkDay;
        });
      }
      
      res.json({
        success: true,
        data: {
          isHoliday: Boolean(holiday),
          holiday: holiday || null
        },
        message: holiday ? 'Date is a holiday' : 'Date is not a holiday'
      });
      
    } catch (error) {
      console.error('Error checking holiday:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check holiday',
        details: error.message
      });
    }
  }
);

module.exports = router; 