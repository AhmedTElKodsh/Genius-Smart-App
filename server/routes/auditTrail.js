const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
  extractUserAndRole,
  requireRole,
  requireAuthority,
  auditAction,
  logAction,
  ROLES
} = require('../middleware/roleAuthMiddleware');

const router = express.Router();

// Helper function to load audit data
const loadAuditData = () => {
  try {
    const auditPath = path.join(__dirname, '../data/action_audit.json');
    return JSON.parse(fs.readFileSync(auditPath, 'utf8'));
  } catch (error) {
    console.error('Error loading audit data:', error);
    return { actions: [] };
  }
};

// Helper function to save audit data
const saveAuditData = (auditData) => {
  try {
    const auditPath = path.join(__dirname, '../data/action_audit.json');
    fs.writeFileSync(auditPath, JSON.stringify(auditData, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving audit data:', error);
    return false;
  }
};

// Helper function to load requests data
const loadRequestsData = () => {
  try {
    const requestsPath = path.join(__dirname, '../data/requests.json');
    return JSON.parse(fs.readFileSync(requestsPath, 'utf8'));
  } catch (error) {
    console.error('Error loading requests data:', error);
    return [];
  }
};

// Helper function to save requests data
const saveRequestsData = (requests) => {
  try {
    const requestsPath = path.join(__dirname, '../data/requests.json');
    fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving requests data:', error);
    return false;
  }
};

// GET /api/audit - Get audit trail (Admin only)
router.get('/', 
  extractUserAndRole,
  requireRole(ROLES.ADMIN),
  requireAuthority('View Action Audit Trail'),
  (req, res) => {
    try {
      const auditData = loadAuditData();
      const { page = 1, limit = 50, action, userId, targetType, canBeRevoked } = req.query;
      
      let filteredActions = auditData.actions;
      
      // Apply filters
      if (action) {
        filteredActions = filteredActions.filter(a => a.action.includes(action));
      }
      
      if (userId) {
        filteredActions = filteredActions.filter(a => a.userId === userId);
      }
      
      if (targetType) {
        filteredActions = filteredActions.filter(a => a.targetType === targetType);
      }
      
      if (canBeRevoked !== undefined) {
        const revocable = canBeRevoked === 'true';
        filteredActions = filteredActions.filter(a => 
          a.canBeRevoked === revocable && !a.revokedAt
        );
      }
      
      // Sort by timestamp (newest first)
      filteredActions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedActions = filteredActions.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: {
          actions: paginatedActions,
          pagination: {
            total: filteredActions.length,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(filteredActions.length / limit)
          },
          summary: {
            totalActions: auditData.actions.length,
            revocableActions: auditData.actions.filter(a => a.canBeRevoked && !a.revokedAt).length,
            revokedActions: auditData.actions.filter(a => a.revokedAt).length
          }
        },
        message: 'Audit trail retrieved successfully'
      });
      
    } catch (error) {
      console.error('Error retrieving audit trail:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve audit trail',
        details: error.message
      });
    }
  }
);

// GET /api/audit/revocable - Get only revocable actions (Admin only)
router.get('/revocable',
  extractUserAndRole,
  requireRole(ROLES.ADMIN),
  requireAuthority('Revoke Manager Actions'),
  (req, res) => {
    try {
      const auditData = loadAuditData();
      
      const revocableActions = auditData.actions.filter(action => 
        action.canBeRevoked && !action.revokedAt
      );
      
      // Group by action type for easier management
      const groupedActions = revocableActions.reduce((acc, action) => {
        if (!acc[action.action]) {
          acc[action.action] = [];
        }
        acc[action.action].push(action);
        return acc;
      }, {});
      
      res.json({
        success: true,
        data: {
          revocableActions,
          groupedActions,
          total: revocableActions.length
        },
        message: 'Revocable actions retrieved successfully'
      });
      
    } catch (error) {
      console.error('Error retrieving revocable actions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve revocable actions',
        details: error.message
      });
    }
  }
);

// POST /api/audit/revoke/:actionId - Revoke a manager action (Admin only)
router.post('/revoke/:actionId',
  extractUserAndRole,
  requireRole(ROLES.ADMIN),
  requireAuthority('Revoke Manager Actions'),
  auditAction('REVOKE_ACTION', 'audit'),
  async (req, res) => {
    try {
      const { actionId } = req.params;
      const { reason } = req.body;
      
      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Revocation reason is required'
        });
      }
      
      const auditData = loadAuditData();
      const actionIndex = auditData.actions.findIndex(a => a.actionId === actionId);
      
      if (actionIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Action not found'
        });
      }
      
      const action = auditData.actions[actionIndex];
      
      if (!action.canBeRevoked) {
        return res.status(400).json({
          success: false,
          message: 'This action cannot be revoked'
        });
      }
      
      if (action.revokedAt) {
        return res.status(400).json({
          success: false,
          message: 'Action has already been revoked'
        });
      }
      
      // Mark action as revoked
      auditData.actions[actionIndex].revokedAt = new Date().toISOString();
      auditData.actions[actionIndex].revokedBy = req.user.id;
      auditData.actions[actionIndex].revokedReason = reason.trim();
      
      // If this was a request approval, revert the request status
      if (action.action === 'APPROVE_REQUEST' && action.targetType === 'request') {
        const requests = loadRequestsData();
        const requestIndex = requests.findIndex(r => r.id === action.targetId);
        
        if (requestIndex !== -1) {
          // Revert request to pending status
          requests[requestIndex].status = 'pending';
          requests[requestIndex].result = null;
          requests[requestIndex].approvedBy = null;
          requests[requestIndex].approverName = null;
          requests[requestIndex].approverRole = null;
          requests[requestIndex].approvedAt = null;
          requests[requestIndex].revokedAt = new Date().toISOString();
          requests[requestIndex].revokedBy = req.user.name;
          requests[requestIndex].revocationReason = reason;
          requests[requestIndex].updatedAt = new Date().toISOString();
          
          saveRequestsData(requests);
        }
      }
      
      // Save updated audit data
      saveAuditData(auditData);
      
      res.json({
        success: true,
        data: {
          revokedAction: auditData.actions[actionIndex],
          revocationDetails: {
            revokedBy: req.user.name,
            revokedAt: auditData.actions[actionIndex].revokedAt,
            reason: reason
          }
        },
        message: 'Action revoked successfully'
      });
      
    } catch (error) {
      console.error('Error revoking action:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to revoke action',
        details: error.message
      });
    }
  }
);

// GET /api/audit/users/:userId - Get actions by specific user (Admin only)
router.get('/users/:userId',
  extractUserAndRole,
  requireRole(ROLES.ADMIN),
  requireAuthority('View Action Audit Trail'),
  (req, res) => {
    try {
      const { userId } = req.params;
      const auditData = loadAuditData();
      
      const userActions = auditData.actions.filter(action => action.userId === userId);
      userActions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Calculate summary stats for this user
      const summary = {
        totalActions: userActions.length,
        actionTypes: {},
        revocableActions: userActions.filter(a => a.canBeRevoked && !a.revokedAt).length,
        revokedActions: userActions.filter(a => a.revokedAt).length
      };
      
      userActions.forEach(action => {
        summary.actionTypes[action.action] = (summary.actionTypes[action.action] || 0) + 1;
      });
      
      res.json({
        success: true,
        data: {
          userId,
          actions: userActions,
          summary
        },
        message: 'User actions retrieved successfully'
      });
      
    } catch (error) {
      console.error('Error retrieving user actions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user actions',
        details: error.message
      });
    }
  }
);

module.exports = router; 