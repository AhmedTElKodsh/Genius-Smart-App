const fs = require('fs');
const path = require('path');

/**
 * Remove delayed requests that meet the criteria:
 * 1. Sent before the current month
 * 2. Exceeding 30 days without being accepted or rejected
 * @returns {Object} - Results of the cleanup operation
 */
function cleanupDelayedRequests() {
  try {
    const requestsPath = path.join(__dirname, '..', 'data', 'requests.json');
    
    if (!fs.existsSync(requestsPath)) {
      return {
        success: false,
        message: 'Requests file not found',
        removed: 0
      };
    }

    const requestsData = fs.readFileSync(requestsPath, 'utf8');
    const requests = JSON.parse(requestsData);
    
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    const firstDayOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    
    // Calculate 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const initialCount = requests.length;
    
    // Filter out delayed requests
    const filteredRequests = requests.filter(request => {
      try {
        const appliedDate = new Date(request.appliedDate || request.submittedAt);
        const hasResult = request.result && request.result.trim() !== '';
        const hasStatus = request.status && ['approved', 'rejected', 'accepted'].includes(request.status.toLowerCase());
        const isProcessed = hasResult || hasStatus;
        
        // Keep if request is already processed (accepted/rejected)
        if (isProcessed) {
          return true;
        }
        
        // Remove if applied before current month
        if (appliedDate < firstDayOfCurrentMonth) {
          console.log(`Removing request ${request.id}: Applied before current month (${appliedDate.toISOString()})`);
          return false;
        }
        
        // Remove if exceeding 30 days without response
        if (appliedDate < thirtyDaysAgo) {
          console.log(`Removing request ${request.id}: Exceeding 30 days without response (${appliedDate.toISOString()})`);
          return false;
        }
        
        return true;
        
      } catch (error) {
        console.error(`Error processing request ${request.id}:`, error);
        // Keep the request if there's an error parsing
        return true;
      }
    });
    
    const removedCount = initialCount - filteredRequests.length;
    
    if (removedCount > 0) {
      // Save the cleaned requests
      fs.writeFileSync(requestsPath, JSON.stringify(filteredRequests, null, 2), 'utf8');
      console.log(`🧹 Cleanup completed: Removed ${removedCount} delayed requests`);
    }
    
    return {
      success: true,
      message: `Cleanup completed successfully`,
      initialCount,
      finalCount: filteredRequests.length,
      removed: removedCount,
      details: {
        beforeCurrentMonth: `Requests applied before ${firstDayOfCurrentMonth.toISOString().split('T')[0]}`,
        exceeding30Days: `Requests older than ${thirtyDaysAgo.toISOString().split('T')[0]} without response`
      }
    };
    
  } catch (error) {
    console.error('Error during request cleanup:', error);
    return {
      success: false,
      message: 'Failed to cleanup requests',
      error: error.message,
      removed: 0
    };
  }
}

/**
 * Get statistics about delayed requests without removing them
 * @returns {Object} - Statistics about delayed requests
 */
function getDelayedRequestsStats() {
  try {
    const requestsPath = path.join(__dirname, '..', 'data', 'requests.json');
    
    if (!fs.existsSync(requestsPath)) {
      return {
        success: false,
        message: 'Requests file not found'
      };
    }

    const requestsData = fs.readFileSync(requestsPath, 'utf8');
    const requests = JSON.parse(requestsData);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const firstDayOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let beforeCurrentMonth = 0;
    let exceeding30Days = 0;
    let totalDelayed = 0;
    
    requests.forEach(request => {
      try {
        const appliedDate = new Date(request.appliedDate || request.submittedAt);
        const hasResult = request.result && request.result.trim() !== '';
        const hasStatus = request.status && ['approved', 'rejected', 'accepted'].includes(request.status.toLowerCase());
        const isProcessed = hasResult || hasStatus;
        
        // Only count unprocessed requests
        if (!isProcessed) {
          if (appliedDate < firstDayOfCurrentMonth) {
            beforeCurrentMonth++;
            totalDelayed++;
          } else if (appliedDate < thirtyDaysAgo) {
            exceeding30Days++;
            totalDelayed++;
          }
        }
      } catch (error) {
        console.error(`Error processing request ${request.id} for stats:`, error);
      }
    });
    
    return {
      success: true,
      totalRequests: requests.length,
      delayedRequests: {
        total: totalDelayed,
        beforeCurrentMonth,
        exceeding30Days
      },
      thresholds: {
        currentMonthStart: firstDayOfCurrentMonth.toISOString().split('T')[0],
        thirtyDaysAgo: thirtyDaysAgo.toISOString().split('T')[0]
      }
    };
    
  } catch (error) {
    console.error('Error getting delayed requests stats:', error);
    return {
      success: false,
      message: 'Failed to get delayed requests statistics',
      error: error.message
    };
  }
}

module.exports = {
  cleanupDelayedRequests,
  getDelayedRequestsStats
}; 