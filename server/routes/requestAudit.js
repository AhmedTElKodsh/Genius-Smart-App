const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Helper function to read audit data
const getAuditData = () => {
  try {
    const auditPath = path.join(__dirname, '..', 'data', 'action_audit.json');
    const data = fs.readFileSync(auditPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading audit data:', error);
    return { audits: [] };
  }
};

// Helper function to get manager data
const getManagerData = () => {
  try {
    const managersPath = path.join(__dirname, '..', 'data', 'managers.json');
    const data = fs.readFileSync(managersPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading managers data:', error);
    return [];
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  const userId = req.headers['user-id'];
  const userEmail = req.headers['user-email'];
  
  if (!userId && !userEmail) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No user credentials provided'
    });
  }
  
  const managers = getManagerData();
  const manager = managers.find(m => 
    m.id === userId || m.email === userEmail
  );
  
  if (!manager) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: User not found'
    });
  }
  
  if (manager.systemRole !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only Admins can access audit trail'
    });
  }
  
  req.user = manager;
  next();
};

// GET /api/request-audit - Get all audit entries (Admin only)
router.get('/', requireAdmin, (req, res) => {
  try {
    const auditData = getAuditData();
    const { 
      startDate, 
      endDate, 
      performerId,
      actionType,
      requestType,
      limit = 100,
      offset = 0 
    } = req.query;
    
    let audits = [...auditData.audits];
    
    // Apply filters
    if (startDate) {
      audits = audits.filter(a => new Date(a.timestamp) >= new Date(startDate));
    }
    
    if (endDate) {
      audits = audits.filter(a => new Date(a.timestamp) <= new Date(endDate));
    }
    
    if (performerId) {
      audits = audits.filter(a => a.performedBy === performerId);
    }
    
    if (actionType) {
      audits = audits.filter(a => a.actionType === actionType);
    }
    
    if (requestType) {
      audits = audits.filter(a => a.requestType === requestType);
    }
    
    // Sort by timestamp (newest first)
    audits.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const total = audits.length;
    audits = audits.slice(Number(offset), Number(offset) + Number(limit));
    
    res.json({
      success: true,
      data: {
        audits,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: total > Number(offset) + Number(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching audit data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit data',
      error: error.message
    });
  }
});

// GET /api/request-audit/:id - Get specific audit entry (Admin only)
router.get('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const auditData = getAuditData();
    
    const audit = auditData.audits.find(a => a.id === id);
    
    if (!audit) {
      return res.status(404).json({
        success: false,
        message: 'Audit entry not found'
      });
    }
    
    res.json({
      success: true,
      data: audit
    });
    
  } catch (error) {
    console.error('Error fetching audit entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit entry',
      error: error.message
    });
  }
});

// GET /api/request-audit/stats/summary - Get audit statistics (Admin only)
router.get('/stats/summary', requireAdmin, (req, res) => {
  try {
    const auditData = getAuditData();
    const { startDate, endDate } = req.query;
    
    let audits = [...auditData.audits];
    
    // Apply date filters
    if (startDate) {
      audits = audits.filter(a => new Date(a.timestamp) >= new Date(startDate));
    }
    
    if (endDate) {
      audits = audits.filter(a => new Date(a.timestamp) <= new Date(endDate));
    }
    
    // Calculate statistics
    const stats = {
      totalActions: audits.length,
      byActionType: {},
      byPerformer: {},
      byRequestType: {},
      byRole: {}
    };
    
    audits.forEach(audit => {
      // By action type
      stats.byActionType[audit.actionType] = (stats.byActionType[audit.actionType] || 0) + 1;
      
      // By performer
      const performerKey = `${audit.performerName} (${audit.performerRole})`;
      stats.byPerformer[performerKey] = (stats.byPerformer[performerKey] || 0) + 1;
      
      // By request type
      stats.byRequestType[audit.requestType] = (stats.byRequestType[audit.requestType] || 0) + 1;
      
      // By role
      stats.byRole[audit.performerRole] = (stats.byRole[audit.performerRole] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics',
      error: error.message
    });
  }
});

module.exports = router; 