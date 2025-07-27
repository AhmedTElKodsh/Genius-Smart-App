const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { sendRequestNotificationEmail, sendRequestStatusEmail } = require('../utils/emailService');
const { cleanupDelayedRequests, getDelayedRequestsStats } = require('../utils/requestCleanup');
const {
  checkManageRequestsAuthority,
  checkDownloadReportsAuthority,
  checkManageAuthoritiesPermission,
  checkPortalAccess
} = require('../middleware/authorityMiddleware');
const router = express.Router();

// Extract manager email from token for authority middleware
const extractManagerEmail = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !token.startsWith('gse_')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token'
      });
    }

    // Extract manager ID from token and find manager email
    const parts = token.split('_');
    if (parts.length < 3) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token format'
      });
    }

    // Handle manager IDs that may contain underscores (e.g., MGR_abc123)
    // Token format: gse_MANAGER_ID_TIMESTAMP
    // So we take everything except the first and last parts
    const managerId = parts.slice(1, -1).join('_');
    
    // Load manager data to get email
    const managersPath = path.join(__dirname, '..', 'data', 'managers.json');
    const managersData = fs.readFileSync(managersPath, 'utf8');
    const managers = JSON.parse(managersData);
    const manager = managers.find(m => m.id === managerId);

    if (!manager || !manager.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Manager not found or inactive'
      });
    }

    // Set manager email for authority middleware
    req.managerEmail = manager.email;
    next();

  } catch (error) {
    console.error('Error extracting manager email:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper function to get manager email (for notifications)
const getManagerEmail = () => {
  try {
    const managersPath = path.join(__dirname, '..', 'data', 'managers.json');
    const data = fs.readFileSync(managersPath, 'utf8');
    const managers = JSON.parse(data);
    // Get the first active manager's email (in production, you might have specific notification preferences)
    const activeManager = managers.find(m => m.isActive);
    return activeManager ? activeManager.email : null;
  } catch (error) {
    console.error('Error getting manager email:', error);
    return null;
  }
};

// Helper function to get teacher email by ID
const getTeacherEmail = (teacherId) => {
  try {
    const teachersPath = path.join(__dirname, '..', 'data', 'teachers.json');
    const data = fs.readFileSync(teachersPath, 'utf8');
    const teachers = JSON.parse(data);
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.email : null;
  } catch (error) {
    console.error('Error getting teacher email:', error);
    return null;
  }
};

// Enhanced notification function with actual email sending
const sendRequestNotification = async (requestData) => {
  try {
    console.log('📧 SENDING REQUEST NOTIFICATION:');
    console.log(`Teacher: ${requestData.name}`);
    console.log(`Type: ${requestData.requestType}`);
    console.log(`Duration: ${requestData.duration}`);
    console.log(`Reason: ${requestData.reason}`);
    console.log(`Applied: ${requestData.appliedDate}`);
    
    // Get manager email
    const managerEmail = getManagerEmail();
    if (!managerEmail) {
      console.log('❌ No manager email found for notification');
      return false;
    }

    // Send email notification to manager
    const emailResult = await sendRequestNotificationEmail(managerEmail, requestData);
    
    if (emailResult.success) {
      console.log(`✅ Email notification sent to manager: ${managerEmail}`);
      return true;
    } else {
      console.log(`❌ Failed to send email notification: ${emailResult.error}`);
      return false;
    }
    
  } catch (error) {
    console.error('Error sending request notification:', error);
    return false;
  }
};



// Helper function to read and parse requests data
function getRequestsData() {
  try {
    // First, try to read from processed JSON file
    const jsonPath = path.join(__dirname, '../data/requests.json');
    
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, 'utf8');
      return JSON.parse(data);
    }
    
    // If JSON doesn't exist, process from CSV
    return processCSVData();
    
  } catch (error) {
    console.error('Error reading requests data:', error);
    return [];
  }
}

// Helper function to save requests data
function saveRequestsData(requests) {
  try {
    const dataDir = path.join(__dirname, '../data');
    const filePath = path.join(dataDir, 'requests.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(requests, null, 2), 'utf8');
    console.log('Requests data saved successfully');
    return true; // Return true on success
    
  } catch (error) {
    console.error('Error saving requests data:', error);
    return false; // Return false on error
  }
}

// Function to process CSV data
function processCSVData() {
  try {
    // Read the CSV file
    const csvFilePath = path.join(__dirname, '../../requests_dataset_csv.txt');
    
    if (!fs.existsSync(csvFilePath)) {
      console.error('CSV file not found:', csvFilePath);
      return [];
    }
    
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csvContent.trim().split('\n');
    
    const requests = [];
    
    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      
      // Skip empty lines or incomplete data
      if (values.length < 4) continue;
      
      const name = values[0]?.trim() || '';
      const requestType = values[1]?.trim() || '';
      const duration = values[2]?.trim() || '';
      const appliedDate = values[3]?.trim() || '';
      const reason = values[4]?.trim() || 'No reason provided';
      const result = values[5]?.trim() || '';
      
      // Skip if essential data is missing
      if (!name || !requestType || !appliedDate) continue;
      
      // Convert appliedDate to ISO format
      let formattedDate = appliedDate;
      try {
        if (appliedDate.includes(' ')) {
          const parts = appliedDate.split(' ');
          if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1];
            const year = parts[2];
            
            // Convert month name to number
            const monthNames = {
              'January': '01', 'February': '02', 'March': '03', 'April': '04',
              'May': '05', 'June': '06', 'July': '07', 'August': '08',
              'September': '09', 'October': '10', 'November': '11', 'December': '12'
            };
            
            const monthNum = monthNames[month] || '01';
            formattedDate = `${year}-${monthNum}-${day}`;
          }
        }
      } catch (error) {
        console.error('Error parsing date:', appliedDate, error);
        formattedDate = new Date().toISOString().split('T')[0];
      }
      
             // Format duration for single-day absences
       let formattedDuration = duration;
       if (requestType === 'Absence' && duration.includes(' - ')) {
         const parts = duration.split(' - ');
         if (parts.length === 2) {
           const start = parts[0].trim();
           const end = parts[1].trim();
           
           // Check if it's the same date (handles cases like "25 July - 25 July 2025")
           if (start === end || (end.includes(start) && end.replace(start, '').trim().match(/^\d{4}$/))) {
             // Single day absence, show the end part (which has the year)
             formattedDuration = end;
           }
         }
       }
       
       const request = {
         id: uuidv4(),
         name: name,
         requestType: requestType,
         duration: formattedDuration,
         appliedDate: formattedDate,
         reason: reason,
         result: result,
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString()
       };
      
      // Only include pending requests (no result)
      if (!result) {
        requests.push(request);
      }
    }
    
    // Save processed data
    saveRequestsData(requests);
    
    console.log(`Processed ${requests.length} pending requests`);
    return requests;
    
  } catch (error) {
    console.error('Error processing CSV data:', error);
    return [];
  }
}

// GET /api/requests/stats - Get request statistics
router.get('/stats', (req, res) => {
  try {
    const requests = getRequestsData();
    
    const stats = {
      total: requests.length,
      byType: {
        'Early Leave': requests.filter(r => r.requestType === 'Early Leave').length,
        'Absence': requests.filter(r => r.requestType === 'Absence').length
      },
      byTimeframe: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        delayed: 0
      }
    };
    
    // Calculate timeframe stats
    const today = new Date();
    requests.forEach(request => {
      try {
        const appliedDate = new Date(request.appliedDate);
        const diffDays = Math.floor((today - appliedDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          stats.byTimeframe.today++;
        } else if (diffDays <= 7) {
          stats.byTimeframe.thisWeek++;
        } else if (diffDays <= 30) {
          stats.byTimeframe.thisMonth++;
        } else {
          stats.byTimeframe.delayed++;
        }
      } catch (error) {
        console.error('Error calculating timeframe for request:', request.id, error);
      }
    });
    
    res.json({
      success: true,
      message: 'Request statistics retrieved successfully',
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching request stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request statistics',
      error: error.message
    });
  }
});

// GET /api/requests - Get all pending requests
router.get('/', (req, res) => {
  try {
    const allRequests = getRequestsData();
    
    // Filter to only show pending requests (not processed)
    const pendingRequests = allRequests.filter(request => {
      // Show requests that don't have a result or status, or have pending status
      const hasResult = request.result && request.result.trim() !== '';
      const hasStatus = request.status && ['approved', 'rejected'].includes(request.status.toLowerCase());
      return !hasResult && !hasStatus;
    });
    
    res.json({
      success: true,
      message: 'Requests retrieved successfully',
      data: pendingRequests,
      count: pendingRequests.length
    });
    
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
});

// PUT /api/requests/:id - Update request status (accept/reject)
router.put('/:id', extractManagerEmail, checkManageRequestsAuthority, async (req, res) => {
  console.log('PUT route hit!', req.params.id, req.body);
  
  try {
    const requestId = req.params.id;
    const { result } = req.body;
    
    console.log('Processing PUT request:', { requestId, result });
    
    if (!result || !['Accepted', 'Rejected'].includes(result)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid result. Must be "Accepted" or "Rejected"'
      });
    }
    
    const requests = getRequestsData();
    console.log('Total requests found:', requests.length);
    
    const requestIndex = requests.findIndex(req => req.id === requestId);
    console.log('Request index found:', requestIndex);
    
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
        requestId: requestId,
        availableIds: requests.map(r => r.id)
      });
    }
    
    // Update the request with both result and status fields
    requests[requestIndex].result = result;
    requests[requestIndex].status = result === 'Accepted' ? 'approved' : 'rejected'; // Map to correct status values
    requests[requestIndex].updatedAt = new Date().toISOString();
    
    // Keep the processed request in the database (don't remove it immediately)
    // This allows teacher notifications to work properly
    // The request can be archived later or filtered out in specific endpoints
    
    // Save updated data with the request still included
    saveRequestsData(requests);

    // Send email notification to teacher
    const teacherEmail = getTeacherEmail(requests[requestIndex].teacherId);
    if (teacherEmail) {
      console.log(`📧 Sending status update email to teacher: ${teacherEmail}`);
      try {
        const emailResult = await sendRequestStatusEmail(teacherEmail, requests[requestIndex], result);
        if (emailResult.success) {
          console.log(`✅ Status update email sent to teacher: ${teacherEmail}`);
        } else {
          console.log(`❌ Failed to send status email: ${emailResult.error}`);
        }
      } catch (emailError) {
        console.error('Error sending status email:', emailError);
      }
    } else {
      console.log('❌ Teacher email not found for notification');
    }
    
    console.log(`Request ${requestId} ${result.toLowerCase()} successfully`);
    
    res.json({
      success: true,
      message: `Request ${result.toLowerCase()} successfully`,
      data: requests[requestIndex]
    });
    
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request',
      error: error.message
    });
  }
});

// POST /api/requests - Submit a new request from teacher
router.post('/', async (req, res) => {
  try {
    const {
      teacherId,
      teacherName,
      type,
      duration,
      fromDate,
      toDate,
      reason,
      subject
    } = req.body;

    // Validate required fields
    if (!teacherId || !teacherName || !type || !fromDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: teacherId, teacherName, type, fromDate'
      });
    }

    // Get existing requests
    const requests = getRequestsData();

    // Generate new request ID using UUID for consistency
    const newId = uuidv4();

    // Map request types to display format
    const requestTypeMap = {
      'earlyLeave': 'Early Leave',
      'lateArrival': 'Late Arrival',
      'authorizedAbsence': 'Authorized Absence',
      'sickLeave': 'Sick Leave',
      'personal': 'Personal Leave',
      'other': 'Other'
    };

    // Calculate duration display format
    let durationDisplay;
    if (duration === 'oneDay') {
      durationDisplay = new Date(fromDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } else {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      durationDisplay = `${startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })} - ${endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`;
    }

    // Create new request object matching existing structure
    const newRequest = {
      id: newId,
      name: teacherName,
      teacherId: teacherId.toString(),
      requestType: requestTypeMap[type] || type,
      appliedDate: new Date().toISOString().split('T')[0],
      duration: durationDisplay,
      startDate: fromDate,
      endDate: toDate || fromDate,
      reason: reason || 'No reason provided',
      status: 'pending',
      result: '', // Keep empty for compatibility with existing data structure
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subject: subject || ''
    };

    // Add to requests array
    requests.push(newRequest);

    // Save to file
    const saved = saveRequestsData(requests);
    
    if (!saved) {
      throw new Error('Failed to save request data');
    }

    // Send notification to manager
    await sendRequestNotification(newRequest);
    
    console.log(`New ${newRequest.requestType} request created by ${teacherName}`);
    
    res.json({
      success: true,
      message: 'Request submitted successfully',
      data: newRequest
    });
    
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit request',
      error: error.message
    });
  }
});

// GET /api/requests/teacher/:teacherId/all - Get all requests for a specific teacher
router.get('/teacher/:teacherId/all', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const requests = getRequestsData();
    
    // Filter requests for this teacher
    const teacherRequests = requests.filter(request => 
      request.teacherId === teacherId || request.teacherId === teacherId.toString()
    );

    res.json({
      success: true,
      data: teacherRequests,
      count: teacherRequests.length
    });

  } catch (error) {
    console.error('Error fetching teacher requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher requests',
      error: error.message
    });
  }
});

// GET /api/requests/teacher/:teacherId - Get notifications for a specific teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { lang } = req.query;
    const isArabic = lang === 'ar';
    const requests = getRequestsData();
    
    // Filter requests for this teacher
    const teacherRequests = requests.filter(request => 
      request.teacherId === teacherId || request.teacherId === teacherId.toString()
    );

    // Convert to notification format
    const notifications = teacherRequests
      .filter(request => {
        const status = request.status ? request.status.toLowerCase() : '';
        return status === 'approved' || status === 'rejected';
      })
      .map(request => {
        const isApproved = request.status && request.status.toLowerCase() === 'approved';
        
        // Handle both old and new request type formats
        const requestType = request.requestType || request.type || 'other';
        
        const requestTypeDisplay = isArabic ? {
          'earlyLeave': 'طلب غياب',
          'lateArrival': 'طلب تأخير وصول', 
          'sickLeave': 'طلب إجازة مرضية',
          'personal': 'طلب إجازة شخصية',
          'travel': 'طلب سفر',
          'other': 'طلب غياب',
          'PERMITTED_LEAVES': 'طلب إجازة مسموح بها',
          'AUTHORIZED_ABSENCE': 'طلب غياب مصرح به'
        } : {
          'earlyLeave': 'leave request',
          'lateArrival': 'late arrival request', 
          'sickLeave': 'sick leave request',
          'personal': 'personal leave request',
          'travel': 'travel request',
          'other': 'absence request',
          'PERMITTED_LEAVES': 'permitted leave request',
          'AUTHORIZED_ABSENCE': 'authorized absence request'
        };

        const message = isArabic 
          ? (isApproved 
              ? `تم قبول ${requestTypeDisplay[requestType] || 'طلبك'} من قبل إدارة الأكاديمية.`
              : `تم رفض ${requestTypeDisplay[requestType] || 'طلبك'} من قبل إدارة الأكاديمية.`)
          : (isApproved 
              ? `Your ${requestTypeDisplay[requestType] || 'request'} has been accepted by administration.`
              : `Your ${requestTypeDisplay[requestType] || 'request'} has been rejected by administration.`);

        return {
          id: `request-${request.id}`,
          type: isApproved ? 'success' : 'error',
          message,
          date: request.submittedAt || new Date().toISOString(),
          category: 'request',
          isRead: false
        };
      });

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Error fetching teacher notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// GET /api/requests/completed - Get all completed requests (Admin Manager only)
router.get('/completed', extractManagerEmail, checkManageAuthoritiesPermission, (req, res) => {
  try {
    // Get all requests
    const allRequests = getRequestsData();
    
    // Filter to only show completed requests (processed)
    const completedRequests = allRequests.filter(request => {
      const hasResult = request.result && request.result.trim() !== '';
      const hasStatus = request.status && ['approved', 'rejected', 'accepted'].includes(request.status.toLowerCase());
      return hasResult || hasStatus;
    });

    // Add additional metadata for admin view
    const enhancedRequests = completedRequests.map(request => ({
      ...request,
      processedDate: request.updatedAt,
      daysSinceSubmission: request.submittedAt ? 
        Math.floor((new Date() - new Date(request.submittedAt)) / (1000 * 60 * 60 * 24)) : null
    }));

    res.json({
      success: true,
      message: 'Completed requests retrieved successfully',
      data: enhancedRequests,
      count: enhancedRequests.length,
      summary: {
        total: enhancedRequests.length,
        approved: enhancedRequests.filter(r => 
          r.status === 'approved' || r.result === 'Accepted'
        ).length,
        rejected: enhancedRequests.filter(r => 
          r.status === 'rejected' || r.result === 'Rejected'
        ).length
      }
    });
    
  } catch (error) {
    console.error('Error fetching completed requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch completed requests',
      error: error.message
    });
  }
});

// GET /api/requests/cleanup/stats - Get delayed requests statistics (Admin Manager only)
router.get('/cleanup/stats', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !token.startsWith('gse_')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token'
      });
    }

    // Extract manager ID and check permissions (similar to above)
    const parts = token.split('_');
    if (parts.length < 3) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token format'
      });
    }

    const managerId = parts.slice(1, -1).join('_');
    
    // Load manager data to check permissions
    try {
      const managersPath = path.join(__dirname, '..', 'data', 'managers.json');
      const managersData = fs.readFileSync(managersPath, 'utf8');
      const managers = JSON.parse(managersData);
      const manager = managers.find(m => m.id === managerId);

      if (!manager || !manager.isActive || manager.managerLevel !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Admin privileges required'
        });
      }

    } catch (error) {
      console.error('Error checking manager permissions:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }

    const stats = getDelayedRequestsStats();
    res.json(stats);
    
  } catch (error) {
    console.error('Error fetching cleanup stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cleanup statistics',
      error: error.message
    });
  }
});

// POST /api/requests/cleanup - Clean up delayed requests (Admin Manager only)
router.post('/cleanup', extractManagerEmail, checkManageAuthoritiesPermission, (req, res) => {
  try {
    const result = cleanupDelayedRequests();
    
    if (result.success) {
      console.log(`🧹 Admin cleanup initiated by ${req.currentManager.name}: ${result.removed} requests removed`);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Error performing cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform cleanup',
      error: error.message
    });
  }
});

// GET /api/requests/manager-summary - Get summary of requests by manager level
router.get('/manager-summary', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || !token.startsWith('gse_')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token'
      });
    }

    // Extract manager ID and get manager info
    const parts = token.split('_');
    if (parts.length < 3) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token format'
      });
    }

    const managerId = parts.slice(1, -1).join('_');
    
    // Load manager data
    try {
      const managersPath = path.join(__dirname, '..', 'data', 'managers.json');
      const managersData = fs.readFileSync(managersPath, 'utf8');
      const managers = JSON.parse(managersData);
      const manager = managers.find(m => m.id === managerId);

      if (!manager || !manager.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Manager not found or inactive'
        });
      }

      const allRequests = getRequestsData();
      
      let requestsToShow;
      let summary;

      if (manager.managerLevel === 'admin' && manager.canViewAllRequests) {
        // Admin manager sees all requests
        requestsToShow = allRequests;
        summary = {
          managerLevel: 'admin',
          viewScope: 'all requests',
          total: allRequests.length,
          pending: allRequests.filter(r => !r.result && !['approved', 'rejected'].includes(r.status?.toLowerCase())).length,
          processed: allRequests.filter(r => r.result || ['approved', 'rejected'].includes(r.status?.toLowerCase())).length
        };
      } else {
        // Regular manager sees only pending requests
        requestsToShow = allRequests.filter(request => {
          const hasResult = request.result && request.result.trim() !== '';
          const hasStatus = request.status && ['approved', 'rejected'].includes(request.status.toLowerCase());
          return !hasResult && !hasStatus;
        });
        
        summary = {
          managerLevel: 'regular',
          viewScope: 'pending requests only',
          total: requestsToShow.length,
          canManageTeachers: manager.canManageTeachers,
          limitations: 'Cannot view completed requests or manage teachers'
        };
      }

      res.json({
        success: true,
        message: 'Manager summary retrieved successfully',
        data: {
          manager: {
            name: manager.name,
            role: manager.role,
            level: manager.managerLevel,
            permissions: manager.permissions
          },
          requests: requestsToShow,
          summary
        }
      });

    } catch (error) {
      console.error('Error loading manager data:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
    
  } catch (error) {
    console.error('Error fetching manager summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch manager summary',
      error: error.message
    });
  }
});

module.exports = router; 