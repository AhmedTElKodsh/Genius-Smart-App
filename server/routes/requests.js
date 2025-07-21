const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Simple notification function for demo purposes
const sendRequestNotification = async (requestData) => {
  try {
    // For demo purposes, just log the notification
    console.log('📧 NEW REQUEST NOTIFICATION:');
    console.log(`Teacher: ${requestData.name}`);
    console.log(`Type: ${requestData.requestType}`);
    console.log(`Duration: ${requestData.duration}`);
    console.log(`Reason: ${requestData.reason}`);
    console.log(`Applied: ${requestData.appliedDate}`);
    console.log('-------------------');
    
    // In a real application, you would:
    // 1. Load manager notification preferences
    // 2. Check if the specific notification type is enabled
    // 3. Send actual email using nodemailer
    
    return true;
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

// Helper function to save requests data
function saveRequestsData(requests) {
  try {
    const dataDir = path.join(__dirname, '../data');
    const filePath = path.join(dataDir, 'requests.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(requests, null, 2));
    console.log('Requests data saved successfully');
    
  } catch (error) {
    console.error('Error saving requests data:', error);
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
    const requests = getRequestsData();
    
    res.json({
      success: true,
      message: 'Requests retrieved successfully',
      data: requests,
      count: requests.length
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
router.put('/:id', (req, res) => {
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
    
    // Update the request
    requests[requestIndex].result = result;
    requests[requestIndex].updatedAt = new Date().toISOString();
    
    // Remove the request from pending list (since it's now processed)
    const updatedRequests = requests.filter(req => req.id !== requestId);
    
    // Save updated data
    saveRequestsData(updatedRequests);
    
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

// POST /api/requests - Create a new request (for teacher's app)
router.post('/', async (req, res) => {
  try {
    const { name, requestType, duration, reason } = req.body;
    
    // Validate required fields
    if (!name || !requestType || !duration || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Create new request
    const newRequest = {
      id: uuidv4(),
      name: name.trim(),
      requestType: requestType.trim(),
      duration: duration.trim(),
      appliedDate: new Date().toISOString().split('T')[0],
      reason: reason.trim(),
      result: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Get existing requests
    const requests = getRequestsData();
    requests.push(newRequest);
    
    // Save updated requests
    saveRequestsData(requests);
    
    // Send notification to manager
    await sendRequestNotification(newRequest);
    
    console.log(`New ${requestType} request created by ${name}`);
    
    res.json({
      success: true,
      message: 'Request submitted successfully',
      data: newRequest
    });
    
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create request',
      error: error.message
    });
  }
});

module.exports = router; 