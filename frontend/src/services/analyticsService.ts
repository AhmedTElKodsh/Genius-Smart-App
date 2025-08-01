// Analytics Service for fetching analytics data from the backend
import { API_BASE_URL, getAuthHeaders, buildQueryString } from '../config/api';

interface AnalyticsParams {
  period?: string;
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  teacherId?: string;
}

// Mock data for development when server is not available
const getMockData = (type: string) => {
  switch (type) {
    case 'departmentRequests':
      return {
        data: {
          absence: [
            { name: 'رياضيات', value: 15 },
            { name: 'علوم', value: 8 },
            { name: 'لغة عربية', value: 12 },
            { name: 'لغة إنجليزية', value: 6 }
          ],
          late: [
            { name: 'رياضيات', value: 10 },
            { name: 'علوم', value: 5 },
            { name: 'لغة عربية', value: 8 },
            { name: 'لغة إنجليزية', value: 4 }
          ],
          early: [
            { name: 'رياضيات', value: 5 },
            { name: 'علوم', value: 3 },
            { name: 'لغة عربية', value: 4 },
            { name: 'لغة إنجليزية', value: 2 }
          ]
        }
      };
    case 'teacherRequests':
      return {
        data: {
          absence: [
            { name: 'أحمد محمد', value: 8 },
            { name: 'فاطمة علي', value: 5 },
            { name: 'محمد خالد', value: 7 },
            { name: 'نورا سالم', value: 4 }
          ],
          late: [
            { name: 'أحمد محمد', value: 6 },
            { name: 'فاطمة علي', value: 3 },
            { name: 'محمد خالد', value: 5 },
            { name: 'نورا سالم', value: 2 }
          ],
          early: [
            { name: 'أحمد محمد', value: 3 },
            { name: 'فاطمة علي', value: 2 },
            { name: 'محمد خالد', value: 2 },
            { name: 'نورا سالم', value: 1 }
          ]
        }
      };
    case 'departmentAttendance':
      return {
        data: {
          absence: [
            { name: 'رياضيات', value: 12 },
            { name: 'علوم', value: 7 },
            { name: 'لغة عربية', value: 10 },
            { name: 'لغة إنجليزية', value: 5 }
          ],
          late: [
            { name: 'رياضيات', value: 8 },
            { name: 'علوم', value: 4 },
            { name: 'لغة عربية', value: 6 },
            { name: 'لغة إنجليزية', value: 3 }
          ],
          early: [
            { name: 'رياضيات', value: 4 },
            { name: 'علوم', value: 2 },
            { name: 'لغة عربية', value: 3 },
            { name: 'لغة إنجليزية', value: 1 }
          ]
        }
      };
    case 'teacherAttendance':
      return {
        data: {
          absence: [
            { name: 'أحمد محمد', value: 6 },
            { name: 'فاطمة علي', value: 3 },
            { name: 'محمد خالد', value: 5 },
            { name: 'نورا سالم', value: 2 }
          ],
          late: [
            { name: 'أحمد محمد', value: 4 },
            { name: 'فاطمة علي', value: 2 },
            { name: 'محمد خالد', value: 3 },
            { name: 'نورا سالم', value: 1 }
          ],
          early: [
            { name: 'أحمد محمد', value: 2 },
            { name: 'فاطمة علي', value: 1 },
            { name: 'محمد خالد', value: 1 },
            { name: 'نورا سالم', value: 0 }
          ]
        }
      };
    case 'timePatterns':
      return {
        data: {
          peakTimes: [
            { name: '8:00', value: 25 },
            { name: '9:00', value: 15 },
            { name: '10:00', value: 10 },
            { name: '11:00', value: 8 },
            { name: '12:00', value: 12 },
            { name: '13:00', value: 18 },
            { name: '14:00', value: 20 },
            { name: '15:00', value: 22 }
          ],
          monthlyTrends: [
            { name: 'Jan', value: 85 },
            { name: 'Feb', value: 92 },
            { name: 'Mar', value: 78 },
            { name: 'Apr', value: 88 },
            { name: 'May', value: 95 },
            { name: 'Jun', value: 82 }
          ]
        }
      };
    case 'performanceMetrics':
      return {
        data: {
          approvalRates: [
            { name: 'Approved', value: 75 },
            { name: 'Pending', value: 15 },
            { name: 'Rejected', value: 10 }
          ],
          responseTimes: [
            { name: '< 1 hour', value: 45 },
            { name: '1-3 hours', value: 30 },
            { name: '3-6 hours', value: 15 },
            { name: '> 6 hours', value: 10 }
          ]
        }
      };
    default:
      return { data: {} };
  }
};



// Department Request Analytics
export const fetchDepartmentRequests = async (params: AnalyticsParams) => {
  try {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/analytics/departments/requests?${queryString}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch department requests');
    return await response.json();
  } catch (error) {
    console.error('Error fetching department requests:', error);
    // Return mock data if server is unavailable
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.log('Server unavailable, returning mock data');
      return getMockData('departmentRequests');
    }
    throw error;
  }
};

// Teacher Request Analytics
export const fetchTeacherRequests = async (params: AnalyticsParams) => {
  try {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/analytics/teachers/requests?${queryString}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch teacher requests');
    return await response.json();
  } catch (error) {
    console.error('Error fetching teacher requests:', error);
    // Return mock data if server is unavailable
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.log('Server unavailable, returning mock data');
      return getMockData('teacherRequests');
    }
    throw error;
  }
};

// Department Attendance Tracking
export const fetchDepartmentAttendance = async (params: AnalyticsParams) => {
  try {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/analytics/departments/attendance?${queryString}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch department attendance');
    return await response.json();
  } catch (error) {
    console.error('Error fetching department attendance:', error);
    throw error;
  }
};

// Teacher Attendance Tracking
export const fetchTeacherAttendance = async (params: AnalyticsParams) => {
  try {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/analytics/teachers/attendance?${queryString}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch teacher attendance');
    return await response.json();
  } catch (error) {
    console.error('Error fetching teacher attendance:', error);
    throw error;
  }
};

// Time Patterns Analytics
export const fetchTimePatterns = async (params: AnalyticsParams) => {
  try {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/analytics/time-patterns?${queryString}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch time patterns');
    return await response.json();
  } catch (error) {
    console.error('Error fetching time patterns:', error);
    throw error;
  }
};

// Performance Metrics
export const fetchPerformanceMetrics = async (params: AnalyticsParams) => {
  try {
    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/analytics/performance-metrics?${queryString}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Failed to fetch performance metrics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    throw error;
  }
};

// Existing Analytics (for backward compatibility)
export const fetchExistingAnalytics = async (period: string) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const [performanceRes, departmentRes, weeklyRes, summaryRes, requestRes] = await Promise.all([
      fetch(`${API_BASE_URL}/analytics/employees/performance-segments?period=${period}`, {
        headers: getAuthHeaders()
      }),
      fetch(`${API_BASE_URL}/analytics/departments/comparison?period=${period}`, {
        headers: getAuthHeaders()
      }),
      fetch(`${API_BASE_URL}/analytics/attendance/weekly-patterns?period=${period}`, {
        headers: getAuthHeaders()
      }),
      fetch(`${API_BASE_URL}/analytics/attendance/summary?period=${period}`, {
        headers: getAuthHeaders()
      }),
      fetch(`${API_BASE_URL}/analytics/requests/summary?period=${period}`, {
        headers: getAuthHeaders()
      })
    ]);

    if (!performanceRes.ok || !departmentRes.ok || !weeklyRes.ok || !summaryRes.ok || !requestRes.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    const [performance, department, weekly, summary, requests] = await Promise.all([
      performanceRes.json(),
      departmentRes.json(),
      weeklyRes.json(),
      summaryRes.json(),
      requestRes.json()
    ]);

    return {
      performanceSegments: performance.performanceSegments || { excellent: [], good: [], average: [], poor: [], atRisk: [] },
      departmentComparison: department.departmentComparison || [],
      weeklyPatterns: { weeklyPatterns: Array.isArray(weekly) ? weekly : [] },
      attendanceSummary: summary.summary || {},
      requestSummary: requests.summary || {}
    };
  } catch (error) {
    console.error('Error fetching existing analytics:', error);
    throw error;
  }
};
