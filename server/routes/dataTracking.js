const express = require('express');
const router = express.Router();
const { dataTracker, setTrackingData } = require('../middleware/dataTrackingMiddleware');
const { extractUserAndRole, requireRole } = require('../middleware/roleAuthMiddleware');

// Get tracking statistics (Admin only)
router.get('/statistics', extractUserAndRole, requireRole('ADMIN'), (req, res) => {
    try {
        const stats = dataTracker.getTrackingStatistics();
        
        if (!stats) {
            return res.status(404).json({
                success: false,
                message: 'No tracking statistics available'
            });
        }

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching tracking statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tracking statistics',
            error: error.message
        });
    }
});

// Get recent changes (Admin and Manager)
router.get('/recent-changes', extractUserAndRole, requireRole(['ADMIN', 'MANAGER']), (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const changes = dataTracker.getRecentChanges(limit);

        res.json({
            success: true,
            data: changes,
            count: changes.length
        });
    } catch (error) {
        console.error('Error fetching recent changes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent changes',
            error: error.message
        });
    }
});

// Search changes with criteria (Admin only)
router.post('/search', extractUserAndRole, requireRole('ADMIN'), (req, res) => {
    try {
        const { userId, action, targetType, dateFrom, dateTo } = req.body;
        
        const criteria = {};
        if (userId) criteria.userId = userId;
        if (action) criteria.action = action;
        if (targetType) criteria.targetType = targetType;
        if (dateFrom) criteria.dateFrom = dateFrom;
        if (dateTo) criteria.dateTo = dateTo;

        const results = dataTracker.searchChanges(criteria);

        res.json({
            success: true,
            data: results,
            count: results.length,
            criteria: criteria
        });
    } catch (error) {
        console.error('Error searching changes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search changes',
            error: error.message
        });
    }
});

// Get changes for a specific user (Admin and self)
router.get('/user/:userId', extractUserAndRole, (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;

        // Check if user is requesting their own data or is admin/manager
        if (requestingUser.id !== userId && !['ADMIN', 'MANAGER'].includes(requestingUser.role)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this user\'s tracking data'
            });
        }

        const changes = dataTracker.searchChanges({ userId });

        res.json({
            success: true,
            data: changes,
            count: changes.length,
            userId: userId
        });
    } catch (error) {
        console.error('Error fetching user changes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user changes',
            error: error.message
        });
    }
});

// Track manual data change (for external integrations)
router.post('/track', extractUserAndRole, requireRole(['ADMIN', 'MANAGER']), async (req, res) => {
    try {
        const {
            action,
            targetType,
            targetId,
            originalData,
            newData,
            reason
        } = req.body;

        if (!action || !targetType) {
            return res.status(400).json({
                success: false,
                message: 'Action and targetType are required'
            });
        }

        const trackingData = {
            userId: req.user.id,
            userName: req.user.name,
            userRole: req.user.role,
            action: action,
            targetType: targetType,
            targetId: targetId,
            originalData: originalData,
            newData: newData,
            reason: reason || 'Manual tracking entry',
            source: 'manual'
        };

        const result = await dataTracker.trackDataChange(trackingData);

        res.json({
            success: true,
            message: 'Data change tracked successfully',
            trackingId: result?.id
        });
    } catch (error) {
        console.error('Error tracking manual change:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track data change',
            error: error.message
        });
    }
});

// Get data tracking dashboard data (Admin only)
router.get('/dashboard', extractUserAndRole, requireRole('ADMIN'), (req, res) => {
    try {
        const stats = dataTracker.getTrackingStatistics();
        const recentChanges = dataTracker.getRecentChanges(10);
        
        // Calculate additional metrics
        const today = new Date().toISOString().split('T')[0];
        const todayChanges = dataTracker.searchChanges({
            dateFrom: today,
            dateTo: today
        });

        const dashboard = {
            statistics: stats,
            todayStats: {
                totalChanges: todayChanges.length,
                changesByType: {}
            },
            recentChanges: recentChanges,
            topUsers: [],
            systemHealth: {
                trackingEnabled: true,
                lastUpdate: stats?.lastUpdate,
                dataIntegrity: 'good'
            }
        };

        // Calculate today's changes by type
        todayChanges.forEach(change => {
            dashboard.todayStats.changesByType[change.action] = 
                (dashboard.todayStats.changesByType[change.action] || 0) + 1;
        });

        // Calculate top users by activity
        if (stats?.changesByUser) {
            dashboard.topUsers = Object.entries(stats.changesByUser)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([userId, count]) => ({ userId, changeCount: count }));
        }

        res.json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
});

// Export tracking data (Admin only)
router.get('/export', extractUserAndRole, requireRole('ADMIN'), (req, res) => {
    try {
        const { format = 'json', dateFrom, dateTo } = req.query;
        
        let changes = dataTracker.getRecentChanges(10000); // Get more for export
        
        // Filter by date if provided
        if (dateFrom) {
            changes = changes.filter(change => 
                new Date(change.timestamp) >= new Date(dateFrom)
            );
        }
        
        if (dateTo) {
            changes = changes.filter(change => 
                new Date(change.timestamp) <= new Date(dateTo)
            );
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            totalRecords: changes.length,
            dateRange: { from: dateFrom, to: dateTo },
            data: changes
        };

        if (format === 'csv') {
            // Convert to CSV format
            const csvHeaders = 'Timestamp,User,Role,Action,Target Type,Target ID,Changes\n';
            const csvData = changes.map(change => {
                const changesText = change.changes.map(c => c.description).join('; ');
                return `${change.timestamp},${change.userName},${change.userRole},${change.action},${change.targetType},${change.targetId},"${changesText}"`;
            }).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=tracking-data.csv');
            res.send(csvHeaders + csvData);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename=tracking-data.json');
            res.json(exportData);
        }
    } catch (error) {
        console.error('Error exporting tracking data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export tracking data',
            error: error.message
        });
    }
});

module.exports = router; 