const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { Request, REQUEST_TYPES, REQUEST_STATUS } = require('../models');

const requestsFilePath = path.join(__dirname, '..', 'data', 'requests.json');
const teachersFilePath = path.join(__dirname, '..', 'data', 'teachers.json');

// Helper functions
const readRequests = () => {
  try {
    const data = fs.readFileSync(requestsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const readTeachers = () => {
  try {
    const data = fs.readFileSync(teachersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeRequests = (requests) => {
  fs.writeFileSync(requestsFilePath, JSON.stringify(requests, null, 2));
};

// GET /api/requests - Get all requests with filtering and teacher info
router.get('/', (req, res) => {
  try {
    const requests = readRequests();
    const teachers = readTeachers();
    
    // Apply filters
    let filteredRequests = requests;
    
    const { status, type, teacherId, department, dateFrom, dateTo } = req.query;
    
    if (status) {
      filteredRequests = filteredRequests.filter(request => 
        request.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    if (type) {
      filteredRequests = filteredRequests.filter(request => 
        request.type.toLowerCase() === type.toLowerCase()
      );
    }
    
    if (teacherId) {
      filteredRequests = filteredRequests.filter(request => 
        request.teacherId === teacherId
      );
    }
    
    if (department) {
      const departmentTeachers = teachers.filter(teacher => 
        teacher.department.toLowerCase() === department.toLowerCase()
      );
      const teacherIds = departmentTeachers.map(teacher => teacher.id);
      filteredRequests = filteredRequests.filter(request => 
        teacherIds.includes(request.teacherId)
      );
    }
    
    if (dateFrom) {
      filteredRequests = filteredRequests.filter(request => 
        new Date(request.date) >= new Date(dateFrom)
      );
    }
    
    if (dateTo) {
      filteredRequests = filteredRequests.filter(request => 
        new Date(request.date) <= new Date(dateTo)
      );
    }
    
    // Enrich requests with teacher information and request type details
    const enrichedRequests = filteredRequests.map(request => {
      const teacher = teachers.find(t => t.id === request.teacherId);
      const requestTypeInfo = Object.values(REQUEST_TYPES).find(rt => rt.key === request.type);
      
      return {
        ...request,
        teacher: teacher ? {
          id: teacher.id,
          name: teacher.name,
          department: teacher.department,
          workType: teacher.workType
        } : null,
        typeInfo: requestTypeInfo || null
      };
    });
    
    // Sort by date (newest first)
    enrichedRequests.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedRequests = enrichedRequests.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedRequests,
      pagination: {
        total: enrichedRequests.length,
        page,
        limit,
        pages: Math.ceil(enrichedRequests.length / limit)
      },
      message: `Retrieved ${paginatedRequests.length} requests`
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve requests',
      details: error.message
    });
  }
});

// GET /api/requests/:id - Get specific request
router.get('/:id', (req, res) => {
  try {
    const requests = readRequests();
    const teachers = readTeachers();
    
    const request = requests.find(r => r.id === req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }
    
    const teacher = teachers.find(t => t.id === request.teacherId);
    const requestTypeInfo = Object.values(REQUEST_TYPES).find(rt => rt.key === request.type);
    
    res.json({
      success: true,
      data: {
        ...request,
        teacher: teacher || null,
        typeInfo: requestTypeInfo || null
      },
      message: 'Request retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve request',
      details: error.message
    });
  }
});

// POST /api/requests - Create new request
router.post('/', (req, res) => {
  try {
    const requests = readRequests();
    
    // Validate required fields
    const requiredFields = ['teacherId', 'type', 'reason'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields
      });
    }
    
    // Validate request type
    const validTypes = Object.values(REQUEST_TYPES).map(rt => rt.key);
    if (!validTypes.includes(req.body.type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request type',
        validTypes
      });
    }
    
    // Validate teacher exists
    const teachers = readTeachers();
    const teacher = teachers.find(t => t.id === req.body.teacherId);
    if (!teacher) {
      return res.status(400).json({
        success: false,
        error: 'Teacher not found'
      });
    }
    
    const newRequest = new Request({
      ...req.body,
      date: req.body.date || new Date().toISOString()
    });
    
    requests.push(newRequest.toJSON());
    writeRequests(requests);
    
    res.status(201).json({
      success: true,
      data: newRequest.toJSON(),
      message: 'Request created successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create request',
      details: error.message
    });
  }
});

// PUT /api/requests/:id/approve - Approve a request
router.put('/:id/approve', (req, res) => {
  try {
    const requests = readRequests();
    const requestIndex = requests.findIndex(r => r.id === req.params.id);
    
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }
    
    const request = new Request(requests[requestIndex]);
    
    if (request.status !== REQUEST_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        error: 'Only pending requests can be approved',
        currentStatus: request.status
      });
    }
    
    const managerId = req.body.managerId || 'manager-001';
    request.approve(managerId);
    
    requests[requestIndex] = request.toJSON();
    writeRequests(requests);
    
    res.json({
      success: true,
      data: request.toJSON(),
      message: 'Request approved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to approve request',
      details: error.message
    });
  }
});

// PUT /api/requests/:id/reject - Reject a request
router.put('/:id/reject', (req, res) => {
  try {
    const requests = readRequests();
    const requestIndex = requests.findIndex(r => r.id === req.params.id);
    
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }
    
    const request = new Request(requests[requestIndex]);
    
    if (request.status !== REQUEST_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        error: 'Only pending requests can be rejected',
        currentStatus: request.status
      });
    }
    
    const managerId = req.body.managerId || 'manager-001';
    const reason = req.body.reason || 'No reason provided';
    
    request.reject(managerId, reason);
    
    requests[requestIndex] = request.toJSON();
    writeRequests(requests);
    
    res.json({
      success: true,
      data: request.toJSON(),
      message: 'Request rejected successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reject request',
      details: error.message
    });
  }
});

// PUT /api/requests/:id - Update request (for pending requests only)
router.put('/:id', (req, res) => {
  try {
    const requests = readRequests();
    const requestIndex = requests.findIndex(r => r.id === req.params.id);
    
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }
    
    const currentRequest = requests[requestIndex];
    
    if (currentRequest.status !== REQUEST_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        error: 'Only pending requests can be updated',
        currentStatus: currentRequest.status
      });
    }
    
    // Update allowed fields
    const allowedFields = ['reason', 'hours', 'days'];
    const updatedRequest = { ...currentRequest };
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updatedRequest[field] = req.body[field];
      }
    });
    
    updatedRequest.updatedAt = new Date().toISOString();
    
    requests[requestIndex] = updatedRequest;
    writeRequests(requests);
    
    res.json({
      success: true,
      data: updatedRequest,
      message: 'Request updated successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update request',
      details: error.message
    });
  }
});

// DELETE /api/requests/:id - Delete request (for pending requests only)
router.delete('/:id', (req, res) => {
  try {
    const requests = readRequests();
    const requestIndex = requests.findIndex(r => r.id === req.params.id);
    
    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }
    
    const request = requests[requestIndex];
    
    if (request.status !== REQUEST_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        error: 'Only pending requests can be deleted',
        currentStatus: request.status
      });
    }
    
    requests.splice(requestIndex, 1);
    writeRequests(requests);
    
    res.json({
      success: true,
      data: request,
      message: 'Request deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete request',
      details: error.message
    });
  }
});

// GET /api/requests/stats/summary - Get request statistics
router.get('/stats/summary', (req, res) => {
  try {
    const requests = readRequests();
    
    // Overall statistics
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === REQUEST_STATUS.PENDING).length;
    const approvedRequests = requests.filter(r => r.status === REQUEST_STATUS.APPROVED).length;
    const rejectedRequests = requests.filter(r => r.status === REQUEST_STATUS.REJECTED).length;
    
    // Statistics by type
    const statsByType = Object.values(REQUEST_TYPES).map(type => {
      const typeRequests = requests.filter(r => r.type === type.key);
      return {
        type: type.key,
        english: type.english,
        arabic: type.arabic,
        total: typeRequests.length,
        pending: typeRequests.filter(r => r.status === REQUEST_STATUS.PENDING).length,
        approved: typeRequests.filter(r => r.status === REQUEST_STATUS.APPROVED).length,
        rejected: typeRequests.filter(r => r.status === REQUEST_STATUS.REJECTED).length
      };
    });
    
    // Recent requests (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRequests = requests.filter(r => new Date(r.date) >= thirtyDaysAgo).length;
    
    res.json({
      success: true,
      data: {
        overview: {
          totalRequests,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
          recentRequests
        },
        byType: statsByType,
        approvalRate: totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0
      },
      message: 'Request statistics retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve request statistics',
      details: error.message
    });
  }
});

// GET /api/requests/types - Get all request types with translations
router.get('/types', (req, res) => {
  try {
    res.json({
      success: true,
      data: Object.values(REQUEST_TYPES),
      message: 'Request types retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve request types',
      details: error.message
    });
  }
});

module.exports = router; 