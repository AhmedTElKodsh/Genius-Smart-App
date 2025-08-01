const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Data tracking middleware for comprehensive monitoring
class DataTracker {
    constructor() {
        this.auditPath = path.join(__dirname, '../data/action_audit.json');
        this.backupDir = path.join(__dirname, '../data/backups');
        this.trackingLog = path.join(__dirname, '../data/data_tracking.json');
        
        this.ensureDirectories();
        this.initializeTrackingLog();
    }

    ensureDirectories() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    initializeTrackingLog() {
        if (!fs.existsSync(this.trackingLog)) {
            const initialData = {
                version: "1.0",
                createdAt: new Date().toISOString(),
                changes: [],
                statistics: {
                    totalChanges: 0,
                    changesByType: {},
                    changesByUser: {},
                    lastUpdate: new Date().toISOString()
                }
            };
            fs.writeFileSync(this.trackingLog, JSON.stringify(initialData, null, 2));
        }
    }

    // Track data changes with comprehensive details
    async trackDataChange(changeData) {
        try {
            const tracking = JSON.parse(fs.readFileSync(this.trackingLog, 'utf8'));
            
            const changeRecord = {
                id: uuidv4(),
                timestamp: new Date().toISOString(),
                userId: changeData.userId,
                userName: changeData.userName,
                userRole: changeData.userRole,
                action: changeData.action,
                targetType: changeData.targetType,
                targetId: changeData.targetId,
                originalData: changeData.originalData,
                newData: changeData.newData,
                changes: this.calculateDifferences(changeData.originalData, changeData.newData),
                metadata: {
                    userAgent: changeData.userAgent || '',
                    ipAddress: changeData.ipAddress || '',
                    source: changeData.source || 'web',
                    dataSize: JSON.stringify(changeData.newData || {}).length,
                    changeReason: changeData.reason || 'No reason provided'
                }
            };

            tracking.changes.push(changeRecord);
            tracking.statistics.totalChanges++;
            tracking.statistics.changesByType[changeData.action] = 
                (tracking.statistics.changesByType[changeData.action] || 0) + 1;
            tracking.statistics.changesByUser[changeData.userId] = 
                (tracking.statistics.changesByUser[changeData.userId] || 0) + 1;
            tracking.statistics.lastUpdate = new Date().toISOString();

            // Keep only last 10,000 changes to prevent file bloat
            if (tracking.changes.length > 10000) {
                tracking.changes = tracking.changes.slice(-9000);
            }

            fs.writeFileSync(this.trackingLog, JSON.stringify(tracking, null, 2));
            
            // Also add to audit trail if significant
            if (this.isSignificantChange(changeData)) {
                await this.addToAuditTrail(changeRecord);
            }

            return changeRecord;
        } catch (error) {
            console.error('Error tracking data change:', error);
            return null;
        }
    }

    // Calculate differences between old and new data
    calculateDifferences(oldData, newData) {
        const differences = [];
        
        if (!oldData && newData) {
            return [{ type: 'CREATE', description: 'New record created' }];
        }
        
        if (oldData && !newData) {
            return [{ type: 'DELETE', description: 'Record deleted' }];
        }

        if (typeof oldData === 'object' && typeof newData === 'object') {
            const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
            
            for (const key of allKeys) {
                const oldValue = oldData?.[key];
                const newValue = newData?.[key];
                
                if (oldValue !== newValue) {
                    differences.push({
                        field: key,
                        type: 'UPDATE',
                        oldValue: oldValue,
                        newValue: newValue,
                        description: `${key} changed from '${oldValue}' to '${newValue}'`
                    });
                }
            }
        }

        return differences;
    }

    // Determine if change is significant enough for audit trail
    isSignificantChange(changeData) {
        const significantActions = [
            'CREATE_TEACHER',
            'UPDATE_TEACHER_ROLE',
            'DELETE_TEACHER',
            'APPROVE_REQUEST',
            'REJECT_REQUEST',
            'SYSTEM_CONFIGURATION_CHANGE',
            'BULK_IMPORT',
            'DATA_EXPORT'
        ];
        
        return significantActions.includes(changeData.action) || 
               changeData.userRole === 'ADMIN' ||
               changeData.targetType === 'CRITICAL_SYSTEM_DATA';
    }

    // Add to audit trail for important changes
    async addToAuditTrail(changeRecord) {
        try {
            let audit = { actions: [] };
            
            if (fs.existsSync(this.auditPath)) {
                audit = JSON.parse(fs.readFileSync(this.auditPath, 'utf8'));
            }

            const auditRecord = {
                actionId: changeRecord.id,
                timestamp: changeRecord.timestamp,
                userId: changeRecord.userId,
                userName: changeRecord.userName,
                userRole: changeRecord.userRole,
                action: changeRecord.action,
                targetType: changeRecord.targetType,
                targetId: changeRecord.targetId,
                targetName: changeRecord.newData?.name || 'Unknown',
                details: {
                    changes: changeRecord.changes,
                    reason: changeRecord.metadata.changeReason
                },
                originalData: changeRecord.originalData,
                newData: changeRecord.newData,
                canBeRevoked: this.canBeRevoked(changeRecord.action),
                revokedAt: null,
                revokedBy: null
            };

            audit.actions.push(auditRecord);
            fs.writeFileSync(this.auditPath, JSON.stringify(audit, null, 2));
        } catch (error) {
            console.error('Error adding to audit trail:', error);
        }
    }

    // Determine if action can be revoked
    canBeRevoked(action) {
        const revokableActions = [
            'APPROVE_REQUEST',
            'REJECT_REQUEST',
            'UPDATE_TEACHER',
            'CREATE_TEACHER'
        ];
        return revokableActions.includes(action);
    }

    // Create backup before significant changes
    async createBackup(dataType, data, reason = '') {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(this.backupDir, `${timestamp}_${dataType}_backup.json`);
            
            const backupData = {
                timestamp: new Date().toISOString(),
                dataType: dataType,
                reason: reason,
                data: data
            };

            fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
            return backupFile;
        } catch (error) {
            console.error('Error creating backup:', error);
            return null;
        }
    }

    // Get tracking statistics
    getTrackingStatistics() {
        try {
            const tracking = JSON.parse(fs.readFileSync(this.trackingLog, 'utf8'));
            return tracking.statistics;
        } catch (error) {
            return null;
        }
    }

    // Get recent changes
    getRecentChanges(limit = 50) {
        try {
            const tracking = JSON.parse(fs.readFileSync(this.trackingLog, 'utf8'));
            return tracking.changes.slice(-limit).reverse();
        } catch (error) {
            return [];
        }
    }

    // Search changes by criteria
    searchChanges(criteria) {
        try {
            const tracking = JSON.parse(fs.readFileSync(this.trackingLog, 'utf8'));
            let results = tracking.changes;

            if (criteria.userId) {
                results = results.filter(change => change.userId === criteria.userId);
            }

            if (criteria.action) {
                results = results.filter(change => change.action === criteria.action);
            }

            if (criteria.targetType) {
                results = results.filter(change => change.targetType === criteria.targetType);
            }

            if (criteria.dateFrom) {
                results = results.filter(change => 
                    new Date(change.timestamp) >= new Date(criteria.dateFrom)
                );
            }

            if (criteria.dateTo) {
                results = results.filter(change => 
                    new Date(change.timestamp) <= new Date(criteria.dateTo)
                );
            }

            return results.reverse();
        } catch (error) {
            return [];
        }
    }
}

// Middleware function for Express
const dataTracker = new DataTracker();

const trackDataChange = (req, res, next) => {
    // Store original methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Override response methods to capture data changes
    res.send = function(data) {
        if (req.dataChangeInfo) {
            dataTracker.trackDataChange({
                ...req.dataChangeInfo,
                userAgent: req.get('User-Agent'),
                ipAddress: req.ip || req.connection.remoteAddress,
                responseData: data
            });
        }
        originalSend.call(this, data);
    };

    res.json = function(data) {
        if (req.dataChangeInfo) {
            dataTracker.trackDataChange({
                ...req.dataChangeInfo,
                userAgent: req.get('User-Agent'),
                ipAddress: req.ip || req.connection.remoteAddress,
                responseData: data
            });
        }
        originalJson.call(this, data);
    };

    next();
};

// Helper function to set tracking data
const setTrackingData = (req, trackingData) => {
    req.dataChangeInfo = trackingData;
};

// Helper function for file operations tracking
const trackFileOperation = async (operation, filePath, userId, userName, userRole, originalData = null, newData = null) => {
    const filename = path.basename(filePath);
    
    return await dataTracker.trackDataChange({
        userId: userId,
        userName: userName,
        userRole: userRole,
        action: `FILE_${operation.toUpperCase()}`,
        targetType: 'FILE',
        targetId: filePath,
        originalData: originalData,
        newData: newData,
        source: 'server',
        reason: `File ${operation}: ${filename}`
    });
};

module.exports = {
    DataTracker,
    dataTracker,
    trackDataChange,
    setTrackingData,
    trackFileOperation
}; 