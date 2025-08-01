import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { startOfMonth, format } from 'date-fns';
import { API_BASE_URL } from '../config/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Sidebar from '../components/Sidebar';
import DateRangePicker, { DateRange } from '../components/DateRangePicker';
import AddTeacherModal from '../components/AddTeacherModal';
import * as analyticsService from '../services/analyticsService';
import EditTeacherModal from '../components/EditTeacherModal';
import AnalyticsCard from '../components/AnalyticsCard';
import RequestTypeDetailModal from '../components/RequestTypeDetailModal';
import AnalyticsKPIModal from '../components/AnalyticsKPIModal';
import ComparisonDateRangePicker from '../components/ComparisonDateRangePicker';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import html2canvas from 'html2canvas';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Enhanced BarChart component with comparison support
interface BarChartProps {
  data: Array<{ name: string; value: number }>;
  isDarkMode: boolean;
  comparisonData?: Array<{ name: string; value: number }>;
  labels?: { base: string; comparison?: string };
}

const BarChart: React.FC<BarChartProps> = ({ data, isDarkMode, comparisonData, labels }) => {
  const datasets = [
    {
      label: labels?.base || 'Base Period',
      data: data.map(item => item.value),
      backgroundColor: isDarkMode ? '#DAA520' : '#007acc',
      borderColor: isDarkMode ? '#DAA520' : '#007acc',
      borderWidth: 1,
    },
  ];

  // Add comparison dataset if provided
  if (comparisonData) {
    datasets.push({
      label: labels?.comparison || 'Comparison Period',
      data: comparisonData.map(item => item.value),
      backgroundColor: isDarkMode ? '#9370DB' : '#2ECC71',
      borderColor: isDarkMode ? '#9370DB' : '#2ECC71',
      borderWidth: 1,
    });
  }

  const chartData = {
    labels: data.map(item => item.name),
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: comparisonData ? true : false,
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#b0b0b0' : '#666',
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: isDarkMode ? '#b0b0b0' : '#666',
        },
        grid: {
          color: isDarkMode ? '#333' : '#e0e0e0',
        },
      },
      x: {
        ticks: {
          color: isDarkMode ? '#b0b0b0' : '#666',
        },
        grid: {
          color: isDarkMode ? '#333' : '#e0e0e0',
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

// Enhanced DonutChart component wrapper with comparison support
interface DonutChartProps {
  data: Array<{ name: string; value: number }>;
  isDarkMode: boolean;
  comparisonData?: Array<{ name: string; value: number }>;
  labels?: { base: string; comparison?: string };
  showLegend?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, isDarkMode, comparisonData, labels, showLegend = true }) => {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: [
          '#3498DB', // Monday - Blue
          '#2ECC71', // Tuesday - Green  
          '#F39C12', // Wednesday - Orange
          '#E74C3C', // Thursday - Red
          '#9B59B6', // Friday - Purple
          '#1ABC9C', // Saturday - Teal
          '#F1C40F', // Sunday - Yellow
        ],
        borderColor: isDarkMode ? '#333' : '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'right' as const,
        labels: {
          color: isDarkMode ? '#b0b0b0' : '#666',
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed}% (${percentage}% of week)`;
          }
        }
      }
    },
  };

  // If comparison data is provided, return a split view
  if (comparisonData) {
    const comparisonChartData = {
      ...chartData,
      datasets: [{
        ...chartData.datasets[0],
        data: comparisonData.map(item => item.value),
      }],
    };

    return (
      <div style={{ display: 'flex', gap: '20px', height: '100%', width: '100%' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: isDarkMode ? '#b0b0b0' : '#666' }}>
            {labels?.base || 'Base Period'}
          </h4>
          <div style={{ height: 'calc(100% - 30px)' }}>
            <Doughnut data={chartData} options={options} />
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: isDarkMode ? '#b0b0b0' : '#666' }}>
            {labels?.comparison || 'Comparison Period'}
          </h4>
          <div style={{ height: 'calc(100% - 30px)' }}>
            <Doughnut data={comparisonChartData} options={options} />
          </div>
        </div>
      </div>
    );
  }

  return <Doughnut data={chartData} options={options} />;
};

// Collapsible Section Component
interface CollapsibleSectionComponentProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSectionComponent: React.FC<CollapsibleSectionComponentProps> = ({ 
  title, 
  description,
  isOpen, 
  onToggle, 
  children 
}) => {
  const { isRTL } = useLanguage();
  
  return (
    <CollapsibleSection $isOpen={isOpen}>
      <SectionHeader $isOpen={isOpen} $isRTL={isRTL} onClick={onToggle}>
        <div style={{ 
          flex: 1,
          textAlign: isRTL ? 'right' : 'left',
          direction: isRTL ? 'rtl' : 'ltr'
        }}>
                      <SectionTitle $isRTL={isRTL}>{title}</SectionTitle>
          {description && (
            <div style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginTop: '4px',
              fontWeight: 'normal',
              textAlign: isRTL ? 'right' : 'left',
              direction: isRTL ? 'rtl' : 'ltr'
            }}>
              {description}
            </div>
          )}
        </div>
        <SectionToggle $isOpen={isOpen} $isRTL={isRTL}>
          {isOpen ? '▲' : '▼'}
        </SectionToggle>
      </SectionHeader>
      <SectionContent $isOpen={isOpen}>
        {children}
      </SectionContent>
    </CollapsibleSection>
  );
};

// Helper function to render weekly attendance chart based on type
const renderWeeklyAttendanceChart = (type: string, data: Array<{ name: string; value: number }>, isDarkMode: boolean) => {
  switch (type) {
    case 'circle':
      return <DonutChart data={data} isDarkMode={isDarkMode} />;
    case 'bar':
    default:
      return <BarChart data={data} isDarkMode={isDarkMode} />;
  }
};

// Helper function to get department comparison data
const getDepartmentComparisonData = (metric: string, translateFn?: (subject: string) => string) => {
  // TODO: Fetch actual comparison data based on chartComparisonPeriods.department
  // This is placeholder data
  const departments = [
    { name: 'Management', value: 85 },
    { name: 'Quran', value: 90 },
    { name: 'Arabic', value: 82 },
    { name: 'Math', value: 88 },
    { name: 'English', value: 86 }
  ];
  
  return departments.map(dept => ({
    name: translateFn ? translateFn(dept.name) : dept.name,
    value: dept.value
  }));
};

// Helper function to get department data based on selected metric
const getDepartmentDataByMetric = (data: any, metric: string, translateFn?: (subject: string) => string) => {
  if (!data?.departmentComparison) {
    // Generate sample data based on subjects
    const sampleDepartments = [
      'Science', 'Math', 'Arabic', 'English', 'History', 
      'Geography', 'Quran', 'Fitness'
    ];
    
    return sampleDepartments.map(dept => ({
      name: translateFn ? translateFn(dept) : dept,
      value: getMetricValue(metric)
    }));
  }
  
  return data.departmentComparison.map((dept: any) => {
    const deptName = dept.name || dept.department || 'Unknown';
    return {
      name: translateFn ? translateFn(deptName) : deptName,
      value: getMetricValueFromData(dept, metric)
    };
  });
};

// Helper to get metric value from department data
const getMetricValueFromData = (dept: any, metric: string) => {
  switch (metric) {
    case 'attendanceRate':
      return dept.attendanceRate || dept.attendance || Math.floor(Math.random() * 30) + 70;
    case 'absenceRate':
      return dept.absenceRate || dept.absence || Math.floor(Math.random() * 15) + 5;
    case 'lateArrivalRate':
      return dept.lateArrivalRate || dept.lateArrival || Math.floor(Math.random() * 10) + 2;
    case 'earlyLeaveRate':
      return dept.earlyLeaveRate || dept.earlyLeave || Math.floor(Math.random() * 8) + 1;
    default:
      return Math.floor(Math.random() * 30) + 70;
  }
};

// Helper to generate sample metric values
const getMetricValue = (metric: string) => {
  switch (metric) {
    case 'attendanceRate':
      return Math.floor(Math.random() * 30) + 70; // 70-100%
    case 'absenceRate':
      return Math.floor(Math.random() * 15) + 5;  // 5-20%
    case 'lateArrivalRate':
      return Math.floor(Math.random() * 10) + 2;  // 2-12%
    case 'earlyLeaveRate':
      return Math.floor(Math.random() * 8) + 1;   // 1-9%
    default:
      return Math.floor(Math.random() * 30) + 70;
  }
};

// Helper function to get department requests data
const getDepartmentRequestsData = (type: 'absence' | 'late' | 'early', data: any, translateFn?: (subject: string) => string) => {
  if (!data || !data.departmentComparison) {
    return [];
  }
  
  return data.departmentComparison.map((dept: any) => {
    let value = 0;
    switch (type) {
      case 'absence':
        value = dept.absenceRequests || Math.floor(Math.random() * 20) + 5;
        break;
      case 'late':
        value = dept.lateRequests || Math.floor(Math.random() * 15) + 3;
        break;
      case 'early':
        value = dept.earlyRequests || Math.floor(Math.random() * 10) + 2;
        break;
    }
    
    return {
      name: translateFn ? translateFn(dept.name) : dept.name,
      value: value
    };
  });
};

// Helper function to get teacher requests data (top 10 requesters)
const getTeacherRequestsData = (type: 'absence' | 'late' | 'early', data: any) => {
  if (!data || !data.performanceSegments) {
    return [];
  }
  
  // Combine all teachers from performance segments
  const allTeachers = [
    ...data.performanceSegments.excellent || [],
    ...data.performanceSegments.good || [],
    ...data.performanceSegments.average || [],
    ...data.performanceSegments.poor || []
  ];
  
  // Generate request data for each teacher
  const teacherRequests = allTeachers.map((teacher: any) => {
    let value = 0;
    switch (type) {
      case 'absence':
        value = teacher.absenceRequests || Math.floor(Math.random() * 8) + 1;
        break;
      case 'late':
        value = teacher.lateRequests || Math.floor(Math.random() * 6) + 1;
        break;
      case 'early':
        value = teacher.earlyRequests || Math.floor(Math.random() * 4) + 1;
        break;
    }
    
    return {
      name: teacher.name,
      value: value
    };
  });
  
  // Sort by value and take top 10
  return teacherRequests
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 10);
};

// Helper function to get peak request times data
const getPeakRequestTimesData = (data: any) => {
  // Return empty array if no data
  if (!data || !data.timePatterns || !data.timePatterns.peakRequestTimes || data.timePatterns.peakRequestTimes.length === 0) {
    return [];
  }
  
  return data.timePatterns.peakRequestTimes.map((item: any) => ({
    name: item.hour,
    value: item.count
  }));
};

// Helper function to get monthly trends data
const getMonthlyTrendsData = (data: any, isRTL: boolean) => {
  // Return empty array if no data
  if (!data || !data.timePatterns || !data.timePatterns.monthlyTrends || data.timePatterns.monthlyTrends.length === 0) {
    return [];
  }
  
  return data.timePatterns.monthlyTrends.map((item: any) => ({
    name: item.month,
    value: item.requests
  }));
};

// Helper function to get approval rates data
const getApprovalRatesData = (data: any, isRTL: boolean) => {
  // Return empty array if no data
  if (!data || !data.performanceMetrics || !data.performanceMetrics.approvalRates) {
    return [];
  }
  
  const rates = data.performanceMetrics.approvalRates;
  const result = [];
  
  if (rates.absence > 0) result.push({ name: isRTL ? 'الغياب' : 'Absence', value: rates.absence });
  if (rates.lateArrival > 0) result.push({ name: isRTL ? 'التأخر' : 'Late Arrival', value: rates.lateArrival });
  if (rates.earlyLeave > 0) result.push({ name: isRTL ? 'الانصراف المبكر' : 'Early Leave', value: rates.earlyLeave });
  
  return result;
};

// Helper function to get response time data
const getResponseTimeData = (data: any, isRTL: boolean) => {
  // Return empty array if no data
  if (!data || !data.performanceMetrics || !data.performanceMetrics.responseTime) {
    return [];
  }
  
  const responseTime = data.performanceMetrics.responseTime;
  if (responseTime.average === 0 && responseTime.min === 0 && responseTime.max === 0) {
    return [];
  }
  
  // Only return data if we have actual response times
  return [
    { name: isRTL ? 'متوسط' : 'Average', value: responseTime.average },
    { name: isRTL ? 'أدنى' : 'Min', value: responseTime.min },
    { name: isRTL ? 'أقصى' : 'Max', value: responseTime.max }
  ];
};

// Helper function to get weekly attendance patterns data
const getWeeklyAttendanceData = (data: any, isRTL: boolean) => {
  // Return empty array if no data
  if (!data || !data.weeklyPatterns) {
    return [];
  }
  
  // Ensure weeklyPatterns is an array
  const patterns = Array.isArray(data.weeklyPatterns) ? data.weeklyPatterns : [];
  
  if (patterns.length === 0) {
    return [];
  }
  
  // Map the API data to chart format
  return patterns.map((day: any) => ({
    name: isRTL ? getArabicDayName(day.day) : day.day,
    value: Math.round(day.attendance || 0)
  }));
};

// Helper function to get Arabic day names
const getArabicDayName = (englishDay: string) => {
  const dayMap: Record<string, string> = {
    'Sunday': 'الأحد',
    'Monday': 'الاثنين',
    'Tuesday': 'الثلاثاء',
    'Wednesday': 'الأربعاء',
    'Thursday': 'الخميس',
    'Friday': 'الجمعة',
    'Saturday': 'السبت'
  };
  return dayMap[englishDay] || englishDay;
};

// Helper function to get department attendance data (actual registered attendance, not requests)
const getDepartmentAttendanceData = (type: 'absence' | 'late' | 'early', data: any, translateFn?: (subject: string) => string) => {
  if (!data || !data.departmentComparison) {
    return [];
  }
  
  return data.departmentComparison.map((dept: any) => {
    let value = 0;
    switch (type) {
      case 'absence':
        value = dept.absenceRate || Math.floor(Math.random() * 15) + 5;
        break;
      case 'late':
        value = dept.lateArrivalRate || Math.floor(Math.random() * 10) + 3;
        break;
      case 'early':
        value = dept.earlyLeaveRate || Math.floor(Math.random() * 8) + 2;
        break;
    }
    
    return {
      name: translateFn ? translateFn(dept.name) : dept.name,
      value: value
    };
  });
};

// Helper function to get teacher attendance data (actual registered attendance, not requests)
const getTeacherAttendanceData = (type: 'absence' | 'late' | 'early', data: any) => {
  if (!data || !data.performanceSegments) {
    return [];
  }
  
  // Combine all teachers from performance segments
  const allTeachers = [
    ...data.performanceSegments.excellent || [],
    ...data.performanceSegments.good || [],
    ...data.performanceSegments.average || [],
    ...data.performanceSegments.poor || []
  ];
  
  // Generate attendance data for each teacher
  const teacherAttendance = allTeachers.map((teacher: any) => {
    let value = 0;
    switch (type) {
      case 'absence':
        value = teacher.absenceRate || Math.floor(Math.random() * 10) + 2;
        break;
      case 'late':
        value = teacher.lateArrivalRate || Math.floor(Math.random() * 8) + 1;
        break;
      case 'early':
        value = teacher.earlyLeaveRate || Math.floor(Math.random() * 5) + 1;
        break;
    }
    
    return {
      name: teacher.name,
      value: value
    };
  });
  
  // Sort by value and take top 10
  return teacherAttendance
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 10);
};

// Collapsible Section Component
const CollapsibleSection = styled.div<{ $isOpen: boolean }>`
  margin-bottom: 24px;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
`;

const SectionHeader = styled.div<{ $isOpen: boolean; $isRTL?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: ${props => props.$isOpen ? '#f8f9fa' : '#ffffff'};
  border-bottom: ${props => props.$isOpen ? '1px solid #e1e7ec' : 'none'};
  cursor: pointer;
  transition: all 0.2s ease;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:hover {
    background: #f8f9fa;
  }
`;

const SectionTitle = styled.h3<{ $isRTL?: boolean }>`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #141F25;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const SectionToggle = styled.div<{ $isOpen: boolean; $isRTL?: boolean }>`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
  margin-left: ${props => props.$isRTL ? '0' : '16px'};
  margin-right: ${props => props.$isRTL ? '16px' : '0'};
`;

const SectionContent = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  padding: 20px;
`;

const SectionChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

// Styled components
const TeachersContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #E7E7E7;
`;

const MainContent = styled.main<{ $isRTL: boolean }>`
  flex: 1;
  margin-left: ${props => props.$isRTL ? '0' : '240px'};
  margin-right: ${props => props.$isRTL ? '240px' : '0'};
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 16px;
  padding-left: 40px;
  border: 1px solid #e1e7ec;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  background: #ffffff;
  
  &::placeholder {
    color: #666;
  }
  
  &:focus {
    outline: none;
    border-color: #D6B10E;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const SearchWrapper = styled.div`
  position: relative;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Tab = styled.button<{ $isActive: boolean }>`
  padding: 8px 20px;
  background: ${props => props.$isActive ? '#D6B10E' : 'transparent'};
  color: ${props => props.$isActive ? '#ffffff' : '#666'};
  border: 1px solid ${props => props.$isActive ? '#D6B10E' : '#e1e7ec'};
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$isActive ? '#D6B10E' : '#f5f5f5'};
    color: ${props => props.$isActive ? '#ffffff' : '#141F25'};
    border-color: ${props => props.$isActive ? '#D6B10E' : '#D6B10E'};
  }
`;

const FilterDropdown = styled.select`
  padding: 8px 16px;
  border: 1px solid #e1e7ec;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  background: #ffffff;
  color: #141F25;
  min-width: 180px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #D6B10E;
  }
  
  option {
    color: #141F25;
    background: #ffffff;
  }
`;

const TeachersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const TeacherCard = styled.div`
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  
  /* Force LTR layout for teacher cards even in Arabic mode */
  direction: ltr !important;
  text-align: left !important;
  
  &:hover {
    border-color: #D6B10E;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const TeacherHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  
  /* Ensure LTR layout */
  direction: ltr !important;
`;

const TeacherName = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #141F25;
  margin: 0;
  flex: 1;
  
  /* Keep text left-aligned */
  text-align: left !important;
`;

const SubjectContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  text-align: center;
  min-width: 60px;
  
  /* Keep subject on the right side */
  margin-left: auto;
`;

const SubjectIcon = styled.div`
  width: 32px;
  height: 32px;
  background: #D6B10E;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
`;

const SubjectName = styled.span`
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-align: center;
  white-space: nowrap;
`;

const ContactDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #666;
  
  /* Force LTR layout for contact details */
  direction: ltr !important;
  text-align: left !important;
`;

const ContactIcon = styled.span`
  font-size: 16px;
  width: 20px;
`;

const ContactValue = styled.span`
  color: #141F25;
`;

const ContactDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-self: flex-start;
  
  /* Keep contact details on the left */
  direction: ltr !important;
  text-align: left !important;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1;
  
  /* Maintain LTR content flow */
  direction: ltr !important;
`;

// Reports table styles
const TableContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: 'Poppins', sans-serif;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableHeaderRow = styled.tr`
  border-bottom: 1px solid #e1e7ec;
`;

const TableHeaderCell = styled.th<{ $alignLeft?: boolean; $isRTL?: boolean }>`
  padding: 16px 12px;
  text-align: ${props => {
    if (props.$alignLeft) {
      return props.$isRTL ? 'right' : 'left';
    }
    return 'center';
  }};
  font-size: 14px;
  font-weight: 600;
  color: #141F25;
  border-right: 1px solid #e1e7ec;
  
  &:last-child {
    border-right: none;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #f1f3f4;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td<{ $alignLeft?: boolean; $isRTL?: boolean }>`
  padding: 16px 12px;
  font-size: 14px;
  color: #141F25;
  border-right: 1px solid #f1f3f4;
  text-align: ${props => {
    if (props.$alignLeft) {
      return props.$isRTL ? 'right' : 'left';
    }
    return 'center';
  }};
  
  &:last-child {
    border-right: none;
  }
`;

const WorkTypeBadge = styled.span<{ $workType: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  background: ${props => props.$workType === 'Full-time' ? '#e8f5e8' : '#e8f0ff'};
  color: ${props => props.$workType === 'Full-time' ? '#2d7d2d' : '#1e6091'};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 0 4px;
`;

const PaginationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #666;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #141F25;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    border-color: #D6B10E;
    background: #f9f7f4;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExportButton = styled.button`
  padding: 10px 20px;
  background: #D6B10E;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #c4a00d;
    transform: translateY(-1px);
  }
`;

const ExportButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
  font-family: 'Poppins', sans-serif;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-family: 'Poppins', sans-serif;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

// Analytics Grid for Reports
const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

// Statistics specific styled components
const StatisticsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StatisticsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const StatisticsTitle = styled.div<{ isRTL: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  justify-content: space-between;
  
  h2 {
    margin: 0;
  }
  
  /* Position based on language */
  ${props => props.isRTL ? `
    /* Arabic: Title on the far right, DateRangePicker on the far left */
    flex-direction: row;
  ` : `
    /* English: Title on the far left, DateRangePicker on the far right */
    flex-direction: row;
  `}
`;

// Removed StatisticsFilters and FilterSelect - no longer needed after removing the dropdown

const KPICardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const KPICard = styled.div`
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #D6B10E;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const KPIValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #D6B10E;
  margin-bottom: 8px;
`;

const KPILabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #666;
`;

const KPITrend = styled.div<{ $isPositive?: boolean }>`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.$isPositive ? '#22c55e' : '#ef4444'};
  margin-top: 4px;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  padding: 24px;
  min-height: 350px;
  max-height: 450px;
  overflow: visible;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
`;

const ChartTitle = styled.h3<{ $isRTL?: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: #141F25;
  margin: 0;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const ChartControls = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  position: relative;
`;

const ChartToggle = styled.button<{ $isActive: boolean }>`
  padding: 6px 12px;
  background: ${props => props.$isActive ? '#D6B10E' : 'transparent'};
  color: ${props => props.$isActive ? '#ffffff' : '#666'};
  border: 1px solid ${props => props.$isActive ? '#D6B10E' : '#e1e7ec'};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$isActive ? '#D6B10E' : '#f5f5f5'};
    border-color: #D6B10E;
  }
`;

const ComparisonToggle = styled.button<{ $isActive: boolean }>`
  padding: 6px 12px;
  background: ${props => props.$isActive ? '#3B82F6' : 'transparent'};
  color: ${props => props.$isActive ? '#ffffff' : '#3B82F6'};
  border: 1px solid #3B82F6;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$isActive ? '#2563EB' : '#EFF6FF'};
    border-color: #2563EB;
  }
`;

const DownloadButton = styled.button`
  padding: 6px 12px;
  background: transparent;
  color: #666;
  border: 1px solid #e1e7ec;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background: #f5f5f5;
    border-color: #D6B10E;
    color: #D6B10E;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const ComparisonControls = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  gap: 8px;
  margin-top: 10px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  align-items: center;
  flex-wrap: wrap;
`;

const ComparisonSelect = styled.select`
  padding: 4px 8px;
  border: 1px solid #e1e7ec;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  cursor: pointer;
`;

const ComparisonLabel = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

const ChartContent = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  border: 2px dashed #e1e7ec;
  border-radius: 8px;
  position: relative;
  overflow: visible;
`;

const FullWidthChart = styled.div`
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  overflow: visible;
  position: relative;
  
  .chart-container {
    width: 100%;
    height: 400px;
    max-height: 400px;
    overflow: hidden;
  }
`;

const TableSection = styled.div`
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  padding: 24px;
`;

const TableTitle = styled.h3<{ $isRTL?: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: #141F25;
  margin: 0 0 20px 0;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const StatsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: 'Poppins', sans-serif;
`;

const StatsTableHeader = styled.thead`
  background: #f8f9fa;
`;

const StatsTableHeaderRow = styled.tr`
  border-bottom: 1px solid #e1e7ec;
`;

const StatsTableHeaderCell = styled.th<{ $alignLeft?: boolean; $isRTL?: boolean }>`
  padding: 12px 16px;
  text-align: ${props => {
    if (props.$alignLeft) {
      return props.$isRTL ? 'right' : 'left';
    }
    return 'center';
  }};
  font-size: 14px;
  font-weight: 600;
  color: #141F25;
  border-right: 1px solid #e1e7ec;
  
  &:last-child {
    border-right: none;
  }
`;

const StatsTableBody = styled.tbody``;

const StatsTableRow = styled.tr`
  border-bottom: 1px solid #f1f3f4;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatsTableCell = styled.td<{ $alignLeft?: boolean; $isRTL?: boolean }>`
  padding: 12px 16px;
  font-size: 14px;
  color: #141F25;
  border-right: 1px solid #f1f3f4;
  text-align: ${props => {
    if (props.$alignLeft) {
      return props.$isRTL ? 'right' : 'left';
    }
    return 'center';
  }};
  direction: ${props => (props.$alignLeft && props.$isRTL) ? 'rtl' : 'ltr'};
  
  &:last-child {
    border-right: none;
  }
`;

const PerformanceBadge = styled.span<{ $performance: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.$performance) {
      case 'excellent': return '#dcfce7';
      case 'good': return '#dbeafe';
      case 'average': return '#fef3c7';
      case 'poor': return '#fee2e2';
      case 'atRisk': return '#fde2e7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$performance) {
      case 'excellent': return '#166534';
      case 'good': return '#1e40af';
      case 'average': return '#d97706';
      case 'poor': return '#dc2626';
      case 'atRisk': return '#be185d';
      default: return '#374151';
    }
  }};
`;

const DonutChartStyled = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(
    #22c55e 0deg 120deg,
    #3b82f6 120deg 240deg,
    #f59e0b 240deg 300deg,
    #ef4444 300deg 330deg,
    #ec4899 330deg 360deg
  );
  position: relative;
  margin: 0 auto;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: #ffffff;
    border-radius: 50%;
  }
`;

const DonutLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${props => props.$color};
`;

// Types
interface Teacher {
  id: string;
  name: string;
  subject: string;
  workType: string;
  email: string;
  phone: string;
  status: string;
  age: number;
  joinDate: string;
  birthdate?: string;
  address?: string;
  firstName?: string;
  lastName?: string;
}

interface Subject {
  name: string;
  teacherCount: number;
}

interface TeacherReport {
  id: string;
  name: string;
  workType: string;
  attends: number;
  authorizedAbsence: number;
  unauthorizedAbsence: number;
  earlyLeave: number;
  lateArrival: number;
  overtime: number;
  totalHours: number;
}

// Types for statistics
interface StatisticsData {
  performanceSegments: {
    excellent: any[];
    good: any[];
    average: any[];
    poor: any[];
    atRisk: any[];
  };
  departmentComparison: any[];
  weeklyPatterns: { weeklyPatterns: any[] };
  attendanceSummary: any;
  requestSummary: any;
  totalTeachers?: number;
  attendanceRate?: number;
  topPerformers?: number;
  atRisk?: number;
  // New analytics data
  departmentRequests?: {
    absence: any[];
    late: any[];
    early: any[];
  };
  teacherRequests?: {
    absence: any[];
    late: any[];
    early: any[];
  };
  departmentAttendance?: {
    absence: any[];
    late: any[];
    early: any[];
  };
  teacherAttendance?: {
    absence: any[];
    late: any[];
    early: any[];
  };
  timePatterns?: {
    peakTimes: any[];
    monthlyTrends: any[];
  };
  performanceMetrics?: {
    approvalRates: any[];
    responseTimes: any[];
  };
}

// Type for KPI modal data
interface KPIModalData {
  value: number;
  trend?: string;
  previousPeriod?: number;
  breakdown?: Array<{ label: string; value: number }>;
  teachers?: Array<{
    id: string;
    name: string;
    department: string;
    attendance: number;
    absences: number;
    punctuality: number;
    performance: string;
    lateArrivals: number;
    earlyLeaves: number;
    workHours: number;
    status: 'excellent' | 'good' | 'average' | 'poor' | 'atRisk';
  }>;
}

const Teachers: React.FC = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'all' | 'reports' | 'statistics'>('all');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Reports specific state
  const [reportsData, setReportsData] = useState<TeacherReport[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
    label: 'This Month'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [managerAuthorities, setManagerAuthorities] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentUserAuthorities, setCurrentUserAuthorities] = useState<string[]>([]);
  
  // Analytics modal state for reports
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState<'lateArrival' | 'earlyLeave' | 'authorizedAbsence' | 'unauthorizedAbsence' | 'overtime' | 'totalHours'>('lateArrival');
  
  // KPI modal state for analytics
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<'totalTeachers' | 'attendanceRate' | 'topPerformers' | 'atRisk' | 'departments'>('totalTeachers');
  const [kpiModalData, setKpiModalData] = useState<KPIModalData | null>(null);
  
  // Analytics data for reports
  const [analyticsData, setAnalyticsData] = useState({
    late_arrival: 0,
    early_leave: 0,
    authorized_absence: 0,
    unauthorized_absence: 0,
    overtime: 0,
    total_hours: 0
  });

  // Statistics specific state
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  // Remove statisticsPeriod state - will derive from dateRange instead
  const [selectedMetric, setSelectedMetric] = useState<string>('attendanceRate');
  const [chartType, setChartType] = useState<string>('bar');
  
  // Comparison functionality states
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState<string>('week');
  const [comparisonData, setComparisonData] = useState<StatisticsData | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  
  // Individual chart comparison states
  const [chartComparisonModes, setChartComparisonModes] = useState<{[key: string]: boolean}>({
    attendance: false,
    department: false,
    weekly: false,
    deptAttAbsence: false,
    deptAttLate: false,
    deptAttEarly: false,
    teacherAttAbsence: false,
    teacherAttLate: false,
    teacherAttEarly: false,
    deptAbsence: false,
    deptLate: false,
    deptEarly: false,
    teacherAbsence: false,
    teacherLate: false,
    teacherEarly: false,
    peakTimes: false,
    monthlyTrends: false,
    approvalRates: false,
    responseTime: false
  });
  
  const [chartComparisonPeriods, setChartComparisonPeriods] = useState<{[key: string]: any}>({
    attendance: null,
    department: null,
    weekly: null,
    deptAttAbsence: null,
    deptAttLate: null,
    deptAttEarly: null,
    teacherAttAbsence: null,
    teacherAttLate: null,
    teacherAttEarly: null,
    deptAbsence: null,
    deptLate: null,
    deptEarly: null,
    teacherAbsence: null,
    teacherLate: null,
    teacherEarly: null,
    peakTimes: null,
    monthlyTrends: null,
    approvalRates: null,
    responseTime: null
  });

  // Collapsible sections state
  const [departmentsComparisonOpen, setDepartmentsComparisonOpen] = useState(false);
  const [departmentComparisonsOpen, setDepartmentComparisonsOpen] = useState(false);
  const [departmentAttendanceOpen, setDepartmentAttendanceOpen] = useState(false);
  const [teacherAttendanceOpen, setTeacherAttendanceOpen] = useState(false);
  const [departmentRequestsOpen, setDepartmentRequestsOpen] = useState(false);
  const [teachersComparisonOpen, setTeachersComparisonOpen] = useState(false);
  const [departmentTrackingOpen, setDepartmentTrackingOpen] = useState(false);
  const [teacherRequestsOpen, setTeacherRequestsOpen] = useState(false);
  const [timePatternsOpen, setTimePatternsOpen] = useState(false);
  const [performanceMetricsOpen, setPerformanceMetricsOpen] = useState(false);
  const [teacherTrackingOpen, setTeacherTrackingOpen] = useState(false);

  // Function to translate subject names for display
  const translateSubject = (subject: string): string => {
    const subjectMap: Record<string, string> = {
          'Management': t('subjects.management'),
      'Quran': t('subjects.quran'),
      'Arabic': t('subjects.arabic'),
      'Math': t('subjects.math'),
      'English': t('subjects.english'),
      'Science': t('subjects.science'),
      'Art': t('subjects.art'),
      'Programming': t('subjects.programming'),
      'Social studies': t('subjects.socialStudies'),
      'Fitness': t('subjects.fitness'),
      'Scouting': t('subjects.scouting'),
      'Nanny': t('subjects.nanny'),
      'History': t('subjects.history'),
      'Canteen': t('subjects.canteen'),
      'Floor Admin': t('subjects.floorAdmin'),
      'Sales': t('subjects.sales'),
      'HR': t('subjects.hr'),
      'Mentor': t('subjects.mentor'),
      'KG Manager': t('subjects.kgManager'),
      'Logistics': t('subjects.logistics'),
      'Assistant': t('subjects.assistant'),
      'Childcare': t('subjects.childcare'),
      'Security': t('subjects.security')
    };
    return subjectMap[subject] || subject;
  };

  const translateWorkType = (workType: string) => {
    const workTypeMap: { [key: string]: string } = {
      'Full-time': t('teachers.workType.fullTime'),
      'Part-time': t('teachers.workType.partTime')
    };
    return workTypeMap[workType] || workType;
  };

  // Fetch current user data from backend
  const fetchCurrentUserData = async () => {
    try {
      const managerEmail = localStorage.getItem('managerEmail');
      if (!managerEmail) return;

      const response = await fetch(`${API_BASE_URL}/teachers/me`, {
        headers: {
          'manager-email': managerEmail
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setCurrentUserRole(userData.role || 'EMPLOYEE');
        setCurrentUserAuthorities(userData.authorities || []);
      }
    } catch (error) {
      console.error('Error fetching current user data:', error);
    }
  };

  // Check authentication and load manager data
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/manager/signin');
      return;
    }
    
    // Load manager data from localStorage
    const managerInfo = localStorage.getItem('managerInfo');
    if (managerInfo) {
      try {
        const manager = JSON.parse(managerInfo);
        setManagerAuthorities(manager.authorities);
      } catch (error) {
        console.error('Error parsing manager info:', error);
      }
    }
    
    // Fetch current user data
    fetchCurrentUserData();
  }, [navigate]);

  // Extract fetchData function so it can be reused
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const [teachersRes, subjectsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/teachers?limit=1000`, {
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/subjects`, {
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);
      
      clearTimeout(timeoutId);

      if (!teachersRes.ok || !subjectsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const teachersData = await teachersRes.json();
      const subjectsData = await subjectsRes.json();

      setTeachers(teachersData.data || []);
      setSubjects(subjectsData.data || []);
      setFilteredTeachers(teachersData.data || []);
      
      console.log('Teachers data refreshed:', teachersData.data?.length, 'teachers');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Retrying...');
      
      // Auto-retry after 3 seconds on error
      setTimeout(() => {
        console.log('Retrying data fetch...');
        fetchData();
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics data
  const fetchStatisticsData = async () => {
    if (activeTab !== 'statistics') return;
    
    try {
      setStatisticsLoading(true);
      
      // Derive period from dateRange label or use default
      const period = dateRange.label?.toLowerCase().replace(/\s+/g, '') || 'month';
      
      // Fetch existing analytics using dateRange
      const existingData = await analyticsService.fetchExistingAnalytics(period);
      
      // Fetch new analytics in parallel
      const [deptRequests, teacherReqs, deptAttendance, teacherAtt, timePat, perfMetrics] = await Promise.all([
        analyticsService.fetchDepartmentRequests({ period }),
        analyticsService.fetchTeacherRequests({ period }),
        analyticsService.fetchDepartmentAttendance({ period }),
        analyticsService.fetchTeacherAttendance({ period }),
        analyticsService.fetchTimePatterns({ period }),
        analyticsService.fetchPerformanceMetrics({ period })
      ]).catch(() => [null, null, null, null, null, null]); // Fallback to null if new endpoints don't exist yet

      setStatisticsData({
        ...existingData,
        // Add new analytics data with fallbacks
        departmentRequests: deptRequests?.data || {
          absence: getDepartmentRequestsData('absence', existingData),
          late: getDepartmentRequestsData('late', existingData),
          early: getDepartmentRequestsData('early', existingData)
        },
        teacherRequests: teacherReqs?.data || {
          absence: getTeacherRequestsData('absence', existingData),
          late: getTeacherRequestsData('late', existingData),
          early: getTeacherRequestsData('early', existingData)
        },
        departmentAttendance: deptAttendance?.data || {
          absence: getDepartmentAttendanceData('absence', existingData),
          late: getDepartmentAttendanceData('late', existingData),
          early: getDepartmentAttendanceData('early', existingData)
        },
        teacherAttendance: teacherAtt?.data || {
          absence: getTeacherAttendanceData('absence', existingData),
          late: getTeacherAttendanceData('late', existingData),
          early: getTeacherAttendanceData('early', existingData)
        },
        timePatterns: timePat?.data || {
          peakTimes: getPeakRequestTimesData(existingData),
          monthlyTrends: getMonthlyTrendsData(existingData, isRTL)
        },
        performanceMetrics: perfMetrics?.data || {
          approvalRates: getApprovalRatesData(existingData, isRTL),
          responseTimes: getResponseTimeData(existingData, isRTL)
        }
      });
      
      // Update last refresh time
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Still set data with mock values if API fails
      setStatisticsData({
        performanceSegments: { excellent: [], good: [], average: [], poor: [], atRisk: [] },
        departmentComparison: [],
        weeklyPatterns: { weeklyPatterns: [] },
        attendanceSummary: {},
        requestSummary: {}
      });
    } finally {
      setStatisticsLoading(false);
    }
  };

  // Fetch comparison data for time period comparison
  const fetchComparisonData = async () => {
    if (!isComparisonMode) return;
    
    try {
      setComparisonLoading(true);
      
      // Fetch existing analytics for comparison
      const existingData = await analyticsService.fetchExistingAnalytics(comparisonPeriod);
      
      // Fetch new analytics in parallel for comparison
      const [deptRequests, teacherReqs, deptAttendance, teacherAtt, timePat, perfMetrics] = await Promise.all([
        analyticsService.fetchDepartmentRequests({ period: comparisonPeriod }),
        analyticsService.fetchTeacherRequests({ period: comparisonPeriod }),
        analyticsService.fetchDepartmentAttendance({ period: comparisonPeriod }),
        analyticsService.fetchTeacherAttendance({ period: comparisonPeriod }),
        analyticsService.fetchTimePatterns({ period: comparisonPeriod }),
        analyticsService.fetchPerformanceMetrics({ period: comparisonPeriod })
      ]).catch(() => [null, null, null, null, null, null]); // Fallback to null if new endpoints don't exist yet

      setComparisonData({
        ...existingData,
        // Add new analytics data with fallbacks
        departmentRequests: deptRequests?.data || {
          absence: getDepartmentRequestsData('absence', existingData),
          late: getDepartmentRequestsData('late', existingData),
          early: getDepartmentRequestsData('early', existingData)
        },
        teacherRequests: teacherReqs?.data || {
          absence: getTeacherRequestsData('absence', existingData),
          late: getTeacherRequestsData('late', existingData),
          early: getTeacherRequestsData('early', existingData)
        },
        departmentAttendance: deptAttendance?.data || {
          absence: getDepartmentAttendanceData('absence', existingData),
          late: getDepartmentAttendanceData('late', existingData),
          early: getDepartmentAttendanceData('early', existingData)
        },
        teacherAttendance: teacherAtt?.data || {
          absence: getTeacherAttendanceData('absence', existingData),
          late: getTeacherAttendanceData('late', existingData),
          early: getTeacherAttendanceData('early', existingData)
        },
        timePatterns: timePat?.data || {
          peakTimes: getPeakRequestTimesData(existingData),
          monthlyTrends: getMonthlyTrendsData(existingData, isRTL)
        },
        performanceMetrics: perfMetrics?.data || {
          approvalRates: getApprovalRatesData(existingData, isRTL),
          responseTimes: getResponseTimeData(existingData, isRTL)
        }
      });
    } catch (error) {
      console.error('Error fetching comparison data:', error);
    } finally {
      setComparisonLoading(false);
    }
  };

  // Fetch teachers and subjects data on component mount
  useEffect(() => {
    fetchData();
    
    // Auto-refresh data every 2 minutes to keep it synchronized
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing teachers data...');
      fetchData();
    }, 120000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Fetch statistics when tab or period changes
  useEffect(() => {
    if (activeTab === 'statistics') {
      fetchStatisticsData();
      
      // Set up auto-refresh every 30 seconds for real-time updates
      const refreshInterval = setInterval(() => {
        fetchStatisticsData();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(refreshInterval);
    }
  }, [activeTab, dateRange]);

  // Auto-refresh comparison data when in comparison mode
  useEffect(() => {
    if (isComparisonMode && activeTab === 'statistics') {
      // Set up auto-refresh for comparison data
      const refreshInterval = setInterval(() => {
        fetchComparisonData();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(refreshInterval);
    }
  }, [isComparisonMode, activeTab, comparisonPeriod]);

  // Filter teachers based on subject and search query
  useEffect(() => {
    let filtered = teachers;

    // Filter by subject
    if (selectedSubject) {
      filtered = filtered.filter(teacher => teacher.subject === selectedSubject);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(teacher =>
        teacher.name.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query) ||
        teacher.subject.toLowerCase().includes(query)
      );
    }

    setFilteredTeachers(filtered);
  }, [teachers, selectedSubject, searchQuery]);

  // Fetch reports data
  useEffect(() => {
    if (activeTab === 'reports') {
      const fetchReportsData = async () => {
        try {
          const token = localStorage.getItem('authToken');
          const params = new URLSearchParams();
          
          if (selectedSubject) {
            params.append('subject', selectedSubject);
          }
          params.append('startDate', format(dateRange.startDate, 'yyyy-MM-dd'));
          params.append('endDate', format(dateRange.endDate, 'yyyy-MM-dd'));

          const response = await fetch(`${API_BASE_URL}/teachers/reports?${params.toString()}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const result = await response.json();
            // Use real data from backend
            const reports: TeacherReport[] = (result.data || []).map((teacher: any) => ({
              id: teacher.id,
              name: teacher.name,
              workType: teacher.workType,
              attends: teacher.attends,
              authorizedAbsence: teacher.authorizedAbsence,
              unauthorizedAbsence: teacher.unauthorizedAbsence,
              earlyLeave: teacher.earlyLeave,
              lateArrival: teacher.lateArrival,
              overtime: teacher.overtime,
              totalHours: teacher.totalHours
            }));
            setReportsData(reports);
            
            // Calculate analytics data from reports
            const analytics = {
              late_arrival: reports.reduce((sum, report) => sum + report.lateArrival, 0),
              early_leave: reports.reduce((sum, report) => sum + report.earlyLeave, 0),
              authorized_absence: reports.reduce((sum, report) => sum + report.authorizedAbsence, 0),
              unauthorized_absence: reports.reduce((sum, report) => sum + report.unauthorizedAbsence, 0),
              overtime: Math.round(reports.reduce((sum, report) => sum + report.overtime, 0) * 10) / 10,
              total_hours: Math.round(reports.reduce((sum, report) => sum + report.totalHours, 0))
            };
            setAnalyticsData(analytics);
          } else {
            console.error('Failed to fetch reports:', response.status, response.statusText);
          }
        } catch (err) {
          console.error('Error fetching reports:', err);
        }
      };

      fetchReportsData();
    }
  }, [activeTab, selectedSubject, dateRange]);

  const handleTabChange = (tab: 'all' | 'reports' | 'statistics') => {
    setActiveTab(tab);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  // Removed handleStatisticsPeriodChange - now using dateRange instead

  // Chart metric change handler
  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric);
  };

  // Chart type change handler
  const handleChartTypeChange = (type: string) => {
    setChartType(type);
  };

  // Comparison mode toggle handler
  const handleComparisonToggle = () => {
    setIsComparisonMode(!isComparisonMode);
    if (!isComparisonMode && !comparisonData) {
      // Fetch comparison data when first enabling comparison mode
      fetchComparisonData();
    }
  };

  // Comparison period change handler
  const handleComparisonPeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setComparisonPeriod(e.target.value);
    // Refetch comparison data with new period
    fetchComparisonData();
  };

  // Performance badge helper
  const getPerformanceBadge = (rate: number) => {
    if (rate >= 95) return { type: 'excellent', label: t('performance.excellent') };
    if (rate >= 85) return { type: 'good', label: t('performance.good') };
    if (rate >= 75) return { type: 'average', label: t('performance.average') };
    if (rate < 75) return { type: 'poor', label: t('performance.poor') };
    return { type: 'average', label: t('performance.average') };
  };

  // Download chart as image
  const downloadChart = async (chartId: string, filename: string) => {
    try {
      const chartElement = document.getElementById(chartId);
      if (!chartElement) {
        console.error('Chart element not found');
        return;
      }

      // Use html2canvas to capture the chart
      const canvas = await html2canvas(chartElement, {
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
        scale: 2, // Higher quality
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading chart:', error);
    }
  };

  // Click handler for analytics cards
  const handleAnalyticsCardClick = (requestType: 'lateArrival' | 'earlyLeave' | 'authorizedAbsence' | 'unauthorizedAbsence' | 'overtime' | 'totalHours') => {
    setSelectedRequestType(requestType);
    setShowDetailModal(true);
  };

  // Click handler for KPI cards
  const handleKPICardClick = (kpiType: 'totalTeachers' | 'attendanceRate' | 'topPerformers' | 'atRisk' | 'departments') => {
    setSelectedKPI(kpiType);
    
    // Prepare data based on KPI type and current statistics
    let modalData: KPIModalData = { value: 0, teachers: [] };
    
    if (statisticsData) {
      // Prepare teacher data based on KPI type
      const prepareTeacherData = () => {
        return teachers.map((teacher, index) => {
          const attendance = Math.floor(Math.random() * 30) + 70; // 70-100%
          const absences = Math.floor(Math.random() * 10);
          const punctuality = Math.floor(Math.random() * 20) + 80; // 80-100%
          const lateArrivals = Math.floor(Math.random() * 8);
          const workHours = Math.floor(Math.random() * 20) + 140; // 140-160 hours
          
          let status = 'good';
          if (attendance >= 95 && punctuality >= 95) status = 'excellent';
          else if (attendance >= 85 && punctuality >= 85) status = 'good';
          else if (attendance >= 75 && punctuality >= 75) status = 'average';
          else if (attendance >= 65) status = 'poor';
          else status = 'atRisk';
          
          return {
            id: teacher.id,
            name: `${teacher.firstName} ${teacher.lastName}`,
            department: teacher.subject,
            attendance,
            absences,
            punctuality,
            performance: teacher.workType || 'Full-time',
            lateArrivals,
            earlyLeaves: Math.floor(Math.random() * 5),
            workHours,
            status: status as 'excellent' | 'good' | 'average' | 'poor' | 'atRisk'
          };
        });
      };

      const allTeacherData = prepareTeacherData();
      
      switch (kpiType) {
        case 'totalTeachers':
          modalData = {
            value: statisticsData.totalTeachers || teachers.length,
            breakdown: [
              { label: 'new', value: Math.floor(teachers.length * 0.1) },
              { label: 'departments', value: subjects.length }
            ],
            teachers: allTeacherData
          };
          break;
        case 'attendanceRate':
          modalData = {
            value: statisticsData.attendanceRate || 91.4,
            trend: '+2.3%',
            previousPeriod: 89.1,
            teachers: allTeacherData.sort((a, b) => b.attendance - a.attendance)
          };
          break;
        case 'topPerformers':
          modalData = {
            value: statisticsData.topPerformers || Math.floor(teachers.length * 0.15),
            teachers: allTeacherData
              .filter(t => t.status === 'excellent')
              .sort((a, b) => b.attendance - a.attendance)
              .slice(0, 8)
          };
          break;
        case 'atRisk':
          modalData = {
            value: statisticsData.atRisk || Math.floor(teachers.length * 0.1),
            teachers: allTeacherData
              .filter(t => t.status === 'atRisk' || t.status === 'poor')
              .sort((a, b) => a.attendance - b.attendance)
              .slice(0, 8)
          };
          break;
        case 'departments':
          modalData = {
            value: subjects.length,
            breakdown: [
              { label: 'staffed', value: Math.floor(subjects.length * 0.85) },
              { label: 'understaffed', value: Math.floor(subjects.length * 0.15) }
            ],
            teachers: allTeacherData.slice(0, 12)
          };
          break;
      }
    }
    
    setKpiModalData(modalData);
    setShowKPIModal(true);
  };

  const handleExportPDF = () => {
    try {
      // Create new PDF document with RTL support for Arabic
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set document properties
      doc.setProperties({
        title: t('teachers.reports'),
        subject: 'Teacher Attendance and Leave Reports',
        author: 'Genius Smart Education',
        creator: 'Genius Smart App'
      });

      // Add school header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Genius Smart Education', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(t('teachers.reports'), 105, 30, { align: 'center' });

      // Add generation date and filters
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated on: ${currentDate}`, 14, 45);

      // Add filter information
      let yPosition = 55;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Report Filters:', 14, yPosition);
      
      doc.setFont('helvetica', 'normal');
      yPosition += 8;
      
      // Date range
      const startDateStr = format(dateRange.startDate, 'MMM dd, yyyy');
      const endDateStr = format(dateRange.endDate, 'MMM dd, yyyy');
      doc.text(`Date Range: ${startDateStr} - ${endDateStr}`, 14, yPosition);
      yPosition += 6;
      
      // Subject filter
      const subjectText = selectedSubject || 'All Subjects';
      doc.text(`Subject: ${subjectText}`, 14, yPosition);
      yPosition += 6;
      
      // Total teachers
      doc.text(`Total Teachers: ${reportsData.length}`, 14, yPosition);
      yPosition += 10;

      // Prepare table data
      const tableColumns = [
        t('reports.teacher'),
        t('reports.workType'),
        t('reports.attends'),
        t('reports.authorizedAbsence'),
        t('reports.unauthorizedAbsence'),
        t('reports.earlyLeave'),
        t('reports.lateArrival'),
        t('reports.overtime'),
        t('reports.totalHours')
      ];

      const tableData = reportsData.map(report => [
        report.name,
        translateWorkType(report.workType),
        report.attends,
        report.authorizedAbsence,
        report.unauthorizedAbsence,
        report.earlyLeave,
        report.lateArrival,
        report.overtime,
        report.totalHours
      ]);

      // Add table with RTL support for Arabic
      autoTable(doc, {
        head: [tableColumns],
        body: tableData,
        startY: yPosition,
        theme: 'striped',
        headStyles: {
          fillColor: [214, 177, 14], // School brand color
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3,
          font: 'helvetica', // Use a font that supports Arabic
          direction: isRTL ? 'rtl' : 'ltr'
        },
        columnStyles: {
          0: { halign: isRTL ? 'right' : 'left' }, // Teacher name - aligned based on language
          1: { halign: 'center' }, // Work Type - center aligned
          2: { halign: 'center' }, // Attends - center aligned
          3: { halign: 'center' }, // Authorized Absence - center aligned
          4: { halign: 'center' }, // Unauthorized Absence - center aligned
          5: { halign: 'center' }, // Early Leave - center aligned
          6: { halign: 'center' }, // Late Arrival - center aligned
          7: { halign: 'center' }, // Overtime - center aligned
          8: { halign: 'center' }  // Total Hours - center aligned
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        margin: { top: yPosition, left: 14, right: 14 },
        didDrawPage: (data) => {
          // Add page numbers
          const pageCount = (doc as any).getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            pageSize.width - 30,
            pageHeight - 10,
            { align: 'right' }
          );
        }
      });

      // Add summary at the bottom if there's space
      const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
      if (finalY < 250) { // If there's space on the page
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary:', 14, finalY + 15);
        
        doc.setFont('helvetica', 'normal');
        const totalAuthorizedAbsence = reportsData.reduce((sum, report) => sum + report.authorizedAbsence, 0);
        const totalUnauthorizedAbsence = reportsData.reduce((sum, report) => sum + report.unauthorizedAbsence, 0);
        const totalEarlyLeave = reportsData.reduce((sum, report) => sum + report.earlyLeave, 0);
        const totalLateArrival = reportsData.reduce((sum, report) => sum + report.lateArrival, 0);
        const totalOvertime = reportsData.reduce((sum, report) => sum + report.overtime, 0);
        const totalHours = reportsData.reduce((sum, report) => sum + report.totalHours, 0);
        
        doc.text(`Total Authorized Absence: ${totalAuthorizedAbsence}`, 14, finalY + 25);
        doc.text(`Total Unauthorized Absence: ${totalUnauthorizedAbsence}`, 14, finalY + 32);
        doc.text(`Total Early Leave: ${totalEarlyLeave}`, 14, finalY + 39);
        doc.text(`Total Late Arrival: ${totalLateArrival}`, 14, finalY + 46);
        doc.text(`Total Overtime: ${totalOvertime}`, 14, finalY + 53);
        doc.text(`Total Hours: ${totalHours}`, 14, finalY + 60);
      }

      // Generate filename with language-specific format
      const dateString = format(new Date(), 'yyyy-MM-dd');
      const subjectString = selectedSubject ? `_${selectedSubject.replace(/\s+/g, '-')}` : '';
      const reportName = isRTL ? 'تقرير-المعلمين' : 'Teachers-Report';
      const filename = `${reportName}_${dateString}${subjectString}.pdf`;

      // Save the PDF
      doc.save(filename);
      
      console.log('PDF exported successfully:', filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleExportExcel = () => {
    try {
      // Prepare the data for Excel export
      const excelData = reportsData.map(report => ({
        [t('reports.teacher')]: report.name,
        [t('reports.workType')]: translateWorkType(report.workType),
        [t('reports.attends')]: report.attends,
        [t('reports.authorizedAbsence')]: report.authorizedAbsence,
        [t('reports.unauthorizedAbsence')]: report.unauthorizedAbsence,
        [t('reports.earlyLeave')]: report.earlyLeave,
        [t('reports.lateArrival')]: report.lateArrival,
        [t('reports.overtime')]: report.overtime,
        [t('reports.totalHours')]: report.totalHours
      }));

      // Create a new workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths for better formatting
      const columnWidths = [
        { wch: 20 }, // Teacher name
        { wch: 15 }, // Work type
        { wch: 10 }, // Attends
        { wch: 18 }, // Authorized Absence
        { wch: 20 }, // Unauthorized Absence
        { wch: 15 }, // Early Leave
        { wch: 12 }, // Late Arrival
        { wch: 12 }, // Overtime
        { wch: 15 }  // Total Hours
      ];
      ws['!cols'] = columnWidths;

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Teachers Reports');

      // Add metadata sheet with summary information
      const summaryData = [
        { Field: 'Report Generated', Value: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })},
        { Field: 'Date Range', Value: `${dateRange.startDate} to ${dateRange.endDate}` },
        { Field: 'Subject Filter', Value: selectedSubject || 'All Subjects' },
        { Field: 'Total Teachers', Value: reportsData.length },
        { Field: '', Value: '' },
        { Field: 'Summary Statistics', Value: '' },
        { Field: 'Total Authorized Absence', Value: reportsData.reduce((sum, report) => sum + report.authorizedAbsence, 0) },
        { Field: 'Total Unauthorized Absence', Value: reportsData.reduce((sum, report) => sum + report.unauthorizedAbsence, 0) },
        { Field: 'Total Early Leave', Value: reportsData.reduce((sum, report) => sum + report.earlyLeave, 0) },
        { Field: 'Total Late Arrival', Value: reportsData.reduce((sum, report) => sum + report.lateArrival, 0) },
        { Field: 'Total Overtime Hours', Value: reportsData.reduce((sum, report) => sum + report.overtime, 0) },
        { Field: 'Total Work Hours', Value: reportsData.reduce((sum, report) => sum + report.totalHours, 0) }
      ];

      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      summaryWs['!cols'] = [{ wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

      // Generate filename with language-specific format
      const dateString = format(new Date(), 'yyyy-MM-dd');
      const subjectString = selectedSubject ? `_${selectedSubject.replace(/\s+/g, '-')}` : '';
      const reportName = isRTL ? 'تقرير-المعلمين' : 'Teachers-Report';
      const filename = `${reportName}_${dateString}${subjectString}.xlsx`;

      // Save the Excel file
      XLSX.writeFile(wb, filename);
      
      console.log('Excel exported successfully:', filename);
      
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Failed to export Excel. Please try again.');
    }
  };

  // Pagination helpers
  const totalPages = Math.ceil(reportsData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = reportsData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleAddTeacher = () => {
    setShowAddTeacherModal(true);
  };

  const handleCloseModal = () => {
    setShowAddTeacherModal(false);
  };

  const handleTeacherAdded = () => {
    // Refresh teachers data when a new teacher is added
    setShowAddTeacherModal(false);
    
    console.log('Teacher added - refreshing data immediately');
    fetchData(); // Fetch fresh data from the server
    
    // Show success feedback
    alert('Teacher added successfully!');
  };

  const handleTeacherCardClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowEditTeacherModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditTeacherModal(false);
    setSelectedTeacher(null);
  };

  const handleTeacherUpdated = () => {
    // Refresh teachers data when a teacher is updated
    setShowEditTeacherModal(false);
    setSelectedTeacher(null);
    
    console.log('Teacher updated - refreshing data immediately');
    fetchData(); // Fetch fresh data from the server
    
    // Show success feedback
    alert('Teacher updated successfully!');
  };

  if (loading) {
    return (
      <TeachersContainer>
                  <Sidebar 
            onAddTeacher={handleAddTeacher} 
            canAddTeachers={currentUserAuthorities.includes('Add new teachers') || currentUserRole === 'ADMIN'}
          />
        <MainContent $isRTL={isRTL}>
          <LoadingContainer>Loading teachers data...</LoadingContainer>
        </MainContent>
      </TeachersContainer>
    );
  }

  if (error) {
    return (
      <TeachersContainer>
                  <Sidebar 
            onAddTeacher={handleAddTeacher} 
            canAddTeachers={currentUserAuthorities.includes('Add new teachers') || currentUserRole === 'ADMIN'}
          />
        <MainContent $isRTL={isRTL}>
          <LoadingContainer>Error: {error}</LoadingContainer>
        </MainContent>
      </TeachersContainer>
    );
  }

  return (
    <TeachersContainer>
                <Sidebar 
            onAddTeacher={handleAddTeacher} 
            canAddTeachers={currentUserAuthorities.includes('Add new teachers') || currentUserRole === 'ADMIN'}
          />
      <MainContent $isRTL={isRTL}>
        <Header>
          <TabContainer>
            <Tab
              $isActive={activeTab === 'all'}
              onClick={() => handleTabChange('all')}
            >
              {t('teachers.allTeachers')}
            </Tab>
            <Tab
              $isActive={activeTab === 'reports'}
              onClick={() => handleTabChange('reports')}
            >
              {t('teachers.reports')}
            </Tab>
            <Tab 
              $isActive={activeTab === 'statistics'}
              onClick={() => handleTabChange('statistics')}
            >
              {t('teachers.analytics')}
            </Tab>
          </TabContainer>
          
          {activeTab !== 'statistics' && (
            <HeaderControls>
              <FilterDropdown
                value={selectedSubject}
                onChange={handleSubjectChange}
              >
                <option value="">{t('teachers.allSubjects')}</option>
                {subjects.map(subject => (
                  <option key={subject.name} value={subject.name}>
                    {translateSubject(subject.name)} ({subject.teacherCount})
                  </option>
                ))}
              </FilterDropdown>
              
              {activeTab === 'reports' && (
                <DateRangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                />
              )}
              
              <SearchContainer>
                <SearchWrapper>
                  <SearchIcon>🔍</SearchIcon>
                  <SearchInput
                    type="text"
                    placeholder={t('teachers.searchTeachers')}
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </SearchWrapper>
              </SearchContainer>
            </HeaderControls>
          )}
        </Header>

        {activeTab === 'all' && (
          <>
            {filteredTeachers.length === 0 ? (
              <EmptyState>
                <EmptyIcon>👥</EmptyIcon>
                <h3>{t('teachers.noTeachers')}</h3>
                <p>
                  {searchQuery || selectedSubject 
                    ? t('teachers.noTeachersDesc')
                    : t('teachers.noTeachersDesc')
                  }
                </p>
              </EmptyState>
            ) : (
              <TeachersGrid>
                {filteredTeachers.map(teacher => (
                  <TeacherCard key={teacher.id} onClick={() => handleTeacherCardClick(teacher)}>
                    <TeacherHeader>
                      <TeacherName>{teacher.name}</TeacherName>
                      <SubjectContainer>
                        <SubjectIcon>
                          {translateSubject(teacher.subject).charAt(0).toUpperCase()}
                        </SubjectIcon>
                        <SubjectName>{translateSubject(teacher.subject)}</SubjectName>
                      </SubjectContainer>
                    </TeacherHeader>
                    
                    <CardContent>
                      <ContactDetailsContainer>
                        <ContactDetail>
                          <ContactIcon>📧</ContactIcon>
                          <ContactValue>{teacher.email}</ContactValue>
                        </ContactDetail>
                        
                        <ContactDetail>
                          <ContactIcon>📞</ContactIcon>
                          <ContactValue>{teacher.phone}</ContactValue>
                        </ContactDetail>
                      </ContactDetailsContainer>
                    </CardContent>
                  </TeacherCard>
                ))}
              </TeachersGrid>
            )}
          </>
        )}

        {activeTab === 'statistics' && (
          <StatisticsContainer>
            <StatisticsHeader>
              <StatisticsTitle isRTL={isRTL}>
                <h2>{t('teachers.analytics')}</h2>
                <DateRangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                />
              </StatisticsTitle>
            </StatisticsHeader>

            {statisticsLoading ? (
              <LoadingContainer>Loading statistics...</LoadingContainer>
            ) : statisticsData ? (
              <>
                {/* KPI Cards */}
                <KPICardsGrid>
                  <KPICard onClick={() => handleKPICardClick('totalTeachers')}>
                    <KPIValue>{teachers.length}</KPIValue>
                    <KPILabel>{t('analytics.totalTeachers')}</KPILabel>
                  </KPICard>
                  <KPICard onClick={() => handleKPICardClick('attendanceRate')}>
                    <KPIValue>{statisticsData.attendanceSummary.attendanceRate}</KPIValue>
                    <KPILabel>{t('analytics.attendanceRate')}</KPILabel>
                    <KPITrend $isPositive={true}>+2.3%</KPITrend>
                  </KPICard>
                  <KPICard onClick={() => handleKPICardClick('topPerformers')}>
                    <KPIValue>{statisticsData.performanceSegments.excellent.length}</KPIValue>
                    <KPILabel>{t('analytics.topPerformers')}</KPILabel>
                  </KPICard>
                  <KPICard onClick={() => handleKPICardClick('atRisk')}>
                    <KPIValue>{statisticsData.performanceSegments.atRisk.length}</KPIValue>
                    <KPILabel>{t('analytics.atRisk')}</KPILabel>
                  </KPICard>
                  <KPICard onClick={() => handleKPICardClick('departments')}>
                    <KPIValue>{statisticsData.departmentComparison.length}</KPIValue>
                    <KPILabel>{t('analytics.departments')}</KPILabel>
                  </KPICard>
                </KPICardsGrid>

                {/* Charts Grid */}
                <ChartsGrid>
                  {/* Attendance Commitment Level Chart */}
                  <ChartCard>
                    <ChartHeader>
                      <ChartTitle $isRTL={isRTL}>{t('analytics.attendanceCommitmentLevel')}</ChartTitle>
                      <ChartControls>
                        <DownloadButton onClick={() => downloadChart('attendance-commitment-chart', 'attendance-commitment')}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {isRTL ? 'تحميل' : 'Download'}
                        </DownloadButton>
                        <ComparisonDateRangePicker
                          isActive={chartComparisonModes.attendance}
                          onPeriodsChange={(periods) => {
                            setChartComparisonModes(prev => ({ ...prev, attendance: true }));
                            setChartComparisonPeriods(prev => ({ ...prev, attendance: periods }));
                            console.log('Attendance comparison periods:', periods);
                            // TODO: Fetch comparison data for attendance chart
                          }}
                          onClose={() => {
                            setChartComparisonModes(prev => ({ ...prev, attendance: false }));
                            setChartComparisonPeriods(prev => ({ ...prev, attendance: null }));
                          }}
                        />
                      </ChartControls>
                    </ChartHeader>
                    
                    {/* Chart Description */}
                    <div style={{ 
                      padding: '0 16px 8px', 
                      fontSize: '14px', 
                      color: isDarkMode ? '#b0b0b0' : '#666', 
                      fontStyle: 'italic',
                      textAlign: isRTL ? 'right' : 'left',
                      direction: isRTL ? 'rtl' : 'ltr'
                    }}>
                      {t('analytics.attendanceCommitmentDesc')}
                    </div>
                    
                    {chartComparisonModes.attendance && chartComparisonPeriods.attendance && (
                      <div style={{ 
                        padding: '0 16px 8px', 
                        fontSize: '13px', 
                        color: '#DAA520',
                        textAlign: 'center' 
                      }}>
                        {isRTL ? 'مقارنة بين الفترات المحددة' : 'Comparing selected periods'}
                      </div>
                    )}
                    
                    <ChartContent id="attendance-commitment-chart">
                      <div className="chart-container" style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        <DonutChart
                          data={[
                            { name: isRTL ? 'ممتاز' : 'Excellent', value: statisticsData.performanceSegments.excellent.length },
                            { name: isRTL ? 'جيد' : 'Good', value: statisticsData.performanceSegments.good.length },
                            { name: isRTL ? 'متوسط' : 'Average', value: statisticsData.performanceSegments.average.length },
                            { name: isRTL ? 'ضعيف' : 'Poor', value: statisticsData.performanceSegments.poor.length },
                            { name: isRTL ? 'في خطر' : 'At Risk', value: statisticsData.performanceSegments.atRisk.length }
                          ]}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.attendance && chartComparisonPeriods.attendance ? [
                            { name: isRTL ? 'ممتاز' : 'Excellent', value: 25 }, // TODO: Get actual comparison data
                            { name: isRTL ? 'جيد' : 'Good', value: 45 },
                            { name: isRTL ? 'متوسط' : 'Average', value: 20 },
                            { name: isRTL ? 'ضعيف' : 'Poor', value: 5 },
                            { name: isRTL ? 'في خطر' : 'At Risk', value: 5 }
                          ] : undefined}
                          labels={{
                            base: chartComparisonPeriods.attendance?.basePeriod ? 
                              `${format(chartComparisonPeriods.attendance.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.attendance.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.attendance?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.attendance.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.attendance.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                          showLegend={!chartComparisonModes.attendance}
                        />
                      </div>
                    </ChartContent>
                  </ChartCard>

                  {/* Department Performance Analysis Chart */}
                  <ChartCard>
                    <ChartHeader>
                      <ChartTitle $isRTL={isRTL}>{t('analytics.departmentPerformance')}</ChartTitle>
                      <ChartControls>
                        <DownloadButton onClick={() => downloadChart('department-performance-chart', 'department-performance')}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {isRTL ? 'تحميل' : 'Download'}
                        </DownloadButton>
                        <ChartToggle 
                          $isActive={selectedMetric === 'attendanceRate'} 
                          onClick={() => handleMetricChange('attendanceRate')}
                        >
                          {t('analytics.attendance')}
                        </ChartToggle>
                        <ChartToggle 
                          $isActive={selectedMetric === 'absenceRate'} 
                          onClick={() => handleMetricChange('absenceRate')}
                        >
                          {t('analytics.absence')}
                        </ChartToggle>
                        <ChartToggle 
                          $isActive={selectedMetric === 'lateArrivalRate'} 
                          onClick={() => handleMetricChange('lateArrivalRate')}
                        >
                          {t('analytics.lateArrival')}
                        </ChartToggle>
                        <ChartToggle 
                          $isActive={selectedMetric === 'earlyLeaveRate'} 
                          onClick={() => handleMetricChange('earlyLeaveRate')}
                        >
                          {t('analytics.earlyLeave')}
                        </ChartToggle>
                        <ComparisonDateRangePicker
                          isActive={chartComparisonModes.department}
                          onPeriodsChange={(periods) => {
                            setChartComparisonModes(prev => ({ ...prev, department: true }));
                            setChartComparisonPeriods(prev => ({ ...prev, department: periods }));
                            console.log('Department comparison periods:', periods);
                            // TODO: Fetch comparison data for department chart
                          }}
                          onClose={() => {
                            setChartComparisonModes(prev => ({ ...prev, department: false }));
                            setChartComparisonPeriods(prev => ({ ...prev, department: null }));
                          }}
                        />
                      </ChartControls>
                    </ChartHeader>
                    

                    
                    {chartComparisonModes.department && chartComparisonPeriods.department && (
                      <div style={{ 
                        padding: '0 16px 8px', 
                        fontSize: '13px', 
                        color: '#DAA520',
                        textAlign: 'center' 
                      }}>
                        {isRTL ? 'مقارنة بين الفترات المحددة' : 'Comparing selected periods'}
                      </div>
                    )}
                    
                    <ChartContent id="department-performance-chart">
                      <div className="chart-container" style={{ 
                        width: '100%', 
                        height: '100%', 
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        {chartComparisonModes.department && chartComparisonPeriods.department ? (
                          <div style={{ height: '100%', width: '100%' }}>
                            <BarChart 
                              data={getDepartmentDataByMetric(statisticsData, selectedMetric, translateSubject)} 
                              isDarkMode={isDarkMode}
                              comparisonData={getDepartmentComparisonData(selectedMetric, translateSubject)} // TODO: Implement this function
                              labels={{
                                base: chartComparisonPeriods.department?.basePeriod ? 
                                  `${format(chartComparisonPeriods.department.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.department.basePeriod.endDate, 'MMM d')}` : 
                                  'Base Period',
                                comparison: chartComparisonPeriods.department?.comparisonPeriod ? 
                                  `${format(chartComparisonPeriods.department.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.department.comparisonPeriod.endDate, 'MMM d')}` : 
                                  'Comparison Period'
                              }}
                            />
                          </div>
                        ) : (
                          <div style={{ height: '100%', width: '100%' }}>
                            <BarChart data={getDepartmentDataByMetric(statisticsData, selectedMetric, translateSubject)} isDarkMode={isDarkMode} />
                          </div>
                        )}
                      </div>
                    </ChartContent>
                  </ChartCard>
                </ChartsGrid>

                {/* Weekly Patterns Full Width */}
                <FullWidthChart>
                  <ChartHeader>
                    <ChartTitle $isRTL={isRTL}>{t('analytics.weeklyAttendancePatterns')}</ChartTitle>
                    <ChartControls>
                      <div style={{ display: 'flex', gap: '8px', marginRight: '12px' }}>
                        <ChartToggle 
                          $isActive={chartType === 'bar'} 
                          onClick={() => handleChartTypeChange('bar')}
                        >
                          Bar Chart
                        </ChartToggle>
                        <ChartToggle 
                          $isActive={chartType === 'circle'} 
                          onClick={() => handleChartTypeChange('circle')}
                        >
                          Circle Chart
                        </ChartToggle>
                      </div>
                      <ComparisonDateRangePicker
                        isActive={chartComparisonModes.weekly}
                        onPeriodsChange={(periods) => {
                          setChartComparisonModes(prev => ({ ...prev, weekly: true }));
                          setChartComparisonPeriods(prev => ({ ...prev, weekly: periods }));
                          console.log('Weekly comparison periods:', periods);
                          // TODO: Fetch comparison data for weekly chart
                        }}
                        onClose={() => {
                          setChartComparisonModes(prev => ({ ...prev, weekly: false }));
                          setChartComparisonPeriods(prev => ({ ...prev, weekly: null }));
                        }}
                      />
                    </ChartControls>
                  </ChartHeader>
                  
                  
                  
                  {chartComparisonModes.weekly && chartComparisonPeriods.weekly && (
                    <div style={{ 
                      padding: '0 16px 8px', 
                      fontSize: '13px', 
                      color: '#DAA520',
                      textAlign: 'center' 
                    }}>
                      {isRTL ? 'مقارنة بين الفترات المحددة' : 'Comparing selected periods'}
                    </div>
                  )}
                  
                  <div className="chart-container">
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      {chartComparisonModes.weekly && chartComparisonPeriods.weekly ? (
                        <div style={{ height: '100%', width: '100%' }}>
                                                    {chartType === 'bar' ? (
                            <BarChart
                              data={getWeeklyAttendanceData(statisticsData, isRTL)}
                              isDarkMode={isDarkMode}
                              comparisonData={getWeeklyAttendanceData(comparisonData, isRTL)}
                              labels={{
                                base: chartComparisonPeriods.weekly?.basePeriod ? 
                                  `${format(chartComparisonPeriods.weekly.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.weekly.basePeriod.endDate, 'MMM d')}` : 
                                  'Base Period',
                                comparison: chartComparisonPeriods.weekly?.comparisonPeriod ? 
                                  `${format(chartComparisonPeriods.weekly.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.weekly.comparisonPeriod.endDate, 'MMM d')}` : 
                                  'Comparison Period'
                              }}
                            />
                          ) : (
                            <DonutChart
                              data={getWeeklyAttendanceData(statisticsData, isRTL)}
                              isDarkMode={isDarkMode}
                              comparisonData={getWeeklyAttendanceData(comparisonData, isRTL)}
                              labels={{
                                base: chartComparisonPeriods.weekly?.basePeriod ? 
                                  `${format(chartComparisonPeriods.weekly.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.weekly.basePeriod.endDate, 'MMM d')}` : 
                                  'Base Period',
                                comparison: chartComparisonPeriods.weekly?.comparisonPeriod ? 
                                  `${format(chartComparisonPeriods.weekly.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.weekly.comparisonPeriod.endDate, 'MMM d')}` : 
                                  'Comparison Period'
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        <div style={{ height: '100%', width: '100%' }}>
                          {renderWeeklyAttendanceChart(chartType, getWeeklyAttendanceData(statisticsData, isRTL), isDarkMode)}
                        </div>
                      )}
                    </div>
                  </div>
                </FullWidthChart>

                {/* Teacher Ranking Table */}
                <TableSection>
                  <TableTitle $isRTL={isRTL}>{t('analytics.teacherPerformanceRanking')}</TableTitle>
                  <StatsTable>
                    <StatsTableHeader> 
                      <StatsTableHeaderRow>
                        <StatsTableHeaderCell $alignLeft={true} $isRTL={isRTL}>{t('analytics.teacher')}</StatsTableHeaderCell>
                        <StatsTableHeaderCell>{t('analytics.department')}</StatsTableHeaderCell>
                        <StatsTableHeaderCell>{t('analytics.attendanceRateCol')}</StatsTableHeaderCell>
                        <StatsTableHeaderCell>{t('analytics.punctuality')}</StatsTableHeaderCell>
                        <StatsTableHeaderCell>{t('analytics.performance')}</StatsTableHeaderCell>
                      </StatsTableHeaderRow>
                    </StatsTableHeader>
                    <StatsTableBody>
                      {/* Combine all performance segments and sort by attendance rate */}
                      {[
                        ...statisticsData.performanceSegments.excellent,
                        ...statisticsData.performanceSegments.good,
                        ...statisticsData.performanceSegments.average,
                        ...statisticsData.performanceSegments.poor
                      ]
                        .sort((a, b) => parseFloat(b.attendanceRate) - parseFloat(a.attendanceRate))
                        .slice(0, 10)
                        .map((teacher, index) => {
                          const badge = getPerformanceBadge(parseFloat(teacher.attendanceRate));
                          return (
                            <StatsTableRow key={teacher.teacherId}>
                              <StatsTableCell $alignLeft={true} $isRTL={isRTL}>{teacher.name}</StatsTableCell>
                              <StatsTableCell>{translateSubject(teacher.subject)}</StatsTableCell>
                              <StatsTableCell>{teacher.attendanceRate}%</StatsTableCell>
                              <StatsTableCell>{teacher.punctualityScore}%</StatsTableCell>
                              <StatsTableCell>
                                <PerformanceBadge $performance={badge.type}>
                                  {badge.label}
                                </PerformanceBadge>
                              </StatsTableCell>
                            </StatsTableRow>
                          );
                        })}
                    </StatsTableBody>
                  </StatsTable>
                </TableSection>

                {/* Department Attendance Tracking Section */}
                <CollapsibleSectionComponent
                  title={t('analytics.departmentAttendance')}
                  description={t('analytics.departmentAttendanceDesc')}
                  isOpen={departmentAttendanceOpen}
                  onToggle={() => setDepartmentAttendanceOpen(!departmentAttendanceOpen)}
                >
                  <SectionChartsGrid>
                    {/* Absence by Department */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.absenceTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.deptAttAbsence}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, deptAttAbsence: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, deptAttAbsence: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, deptAttAbsence: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, deptAttAbsence: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.departmentAttendance?.absence || getDepartmentAttendanceData('absence', statisticsData, translateSubject)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.deptAttAbsence ? 
                            (comparisonData?.departmentAttendance?.absence || getDepartmentAttendanceData('absence', comparisonData, translateSubject)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.deptAttAbsence?.basePeriod ? 
                              `${format(chartComparisonPeriods.deptAttAbsence.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.deptAttAbsence.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.deptAttAbsence?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.deptAttAbsence.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.deptAttAbsence.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>

                    {/* Late Arrival by Department */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.lateArrivalTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.deptAttLate}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, deptAttLate: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, deptAttLate: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, deptAttLate: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, deptAttLate: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.departmentAttendance?.late || getDepartmentAttendanceData('late', statisticsData, translateSubject)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.deptAttLate ? 
                            (comparisonData?.departmentAttendance?.late || getDepartmentAttendanceData('late', comparisonData, translateSubject)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.deptAttLate?.basePeriod ? 
                              `${format(chartComparisonPeriods.deptAttLate.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.deptAttLate.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.deptAttLate?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.deptAttLate.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.deptAttLate.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>

                    {/* Early Leave by Department */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.earlyLeaveTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.deptAttEarly}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, deptAttEarly: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, deptAttEarly: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, deptAttEarly: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, deptAttEarly: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.departmentAttendance?.early || getDepartmentAttendanceData('early', statisticsData, translateSubject)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.deptAttEarly ? 
                            (comparisonData?.departmentAttendance?.early || getDepartmentAttendanceData('early', comparisonData, translateSubject)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.deptAttEarly?.basePeriod ? 
                              `${format(chartComparisonPeriods.deptAttEarly.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.deptAttEarly.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.deptAttEarly?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.deptAttEarly.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.deptAttEarly.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>
                  </SectionChartsGrid>
                </CollapsibleSectionComponent>

                {/* Teacher Attendance Tracking Section */}
                <CollapsibleSectionComponent
                  title={t('analytics.teacherAttendance')}
                  description={t('analytics.teacherAttendanceDesc')}
                  isOpen={teacherAttendanceOpen}
                  onToggle={() => setTeacherAttendanceOpen(!teacherAttendanceOpen)}
                >
                  <SectionChartsGrid>
                    {/* Absence by Teacher */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.absenceTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.teacherAttAbsence}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, teacherAttAbsence: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, teacherAttAbsence: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, teacherAttAbsence: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, teacherAttAbsence: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.teacherAttendance?.absence || getTeacherAttendanceData('absence', statisticsData)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.teacherAttAbsence ? 
                            (comparisonData?.teacherAttendance?.absence || getTeacherAttendanceData('absence', comparisonData)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.teacherAttAbsence?.basePeriod ? 
                              `${format(chartComparisonPeriods.teacherAttAbsence.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.teacherAttAbsence.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.teacherAttAbsence?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.teacherAttAbsence.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.teacherAttAbsence.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>

                    {/* Late Arrival by Teacher */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.lateArrivalTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.teacherAttLate}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, teacherAttLate: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, teacherAttLate: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, teacherAttLate: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, teacherAttLate: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.teacherAttendance?.late || getTeacherAttendanceData('late', statisticsData)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.teacherAttLate ? 
                            (comparisonData?.teacherAttendance?.late || getTeacherAttendanceData('late', comparisonData)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.teacherAttLate?.basePeriod ? 
                              `${format(chartComparisonPeriods.teacherAttLate.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.teacherAttLate.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.teacherAttLate?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.teacherAttLate.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.teacherAttLate.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>

                    {/* Early Leave by Teacher */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.earlyLeaveTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.teacherAttEarly}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, teacherAttEarly: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, teacherAttEarly: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, teacherAttEarly: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, teacherAttEarly: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.teacherAttendance?.early || getTeacherAttendanceData('early', statisticsData)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.teacherAttEarly ? 
                            (comparisonData?.teacherAttendance?.early || getTeacherAttendanceData('early', comparisonData)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.teacherAttEarly?.basePeriod ? 
                              `${format(chartComparisonPeriods.teacherAttEarly.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.teacherAttEarly.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.teacherAttEarly?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.teacherAttEarly.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.teacherAttEarly.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>
                  </SectionChartsGrid>
                </CollapsibleSectionComponent>

                {/* Department Requests Section */}
                <CollapsibleSectionComponent
                  title={t('analytics.departmentRequests')}
                  description={t('analytics.departmentRequestsDesc')}
                  isOpen={departmentRequestsOpen}
                  onToggle={() => setDepartmentRequestsOpen(!departmentRequestsOpen)}
                >
                  <SectionChartsGrid>
                    {/* Absence Requests by Department */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.absenceRequestsChart')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.deptAbsence}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, deptAbsence: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, deptAbsence: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, deptAbsence: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, deptAbsence: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.departmentRequests?.absence || getDepartmentRequestsData('absence', statisticsData, translateSubject)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.deptAbsence ? 
                            (comparisonData?.departmentRequests?.absence || getDepartmentRequestsData('absence', comparisonData, translateSubject)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.deptAbsence?.basePeriod ? 
                              `${format(chartComparisonPeriods.deptAbsence.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.deptAbsence.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.deptAbsence?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.deptAbsence.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.deptAbsence.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>

                    {/* Late Arrival Requests by Department */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.lateArrivalRequestsChart')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.deptLate}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, deptLate: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, deptLate: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, deptLate: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, deptLate: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.departmentRequests?.late || getDepartmentRequestsData('late', statisticsData, translateSubject)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.deptLate ? 
                            (comparisonData?.departmentRequests?.late || getDepartmentRequestsData('late', comparisonData, translateSubject)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.deptLate?.basePeriod ? 
                              `${format(chartComparisonPeriods.deptLate.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.deptLate.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.deptLate?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.deptLate.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.deptLate.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>

                    {/* Early Leave Requests by Department */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.earlyLeaveRequestsChart')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.deptEarly}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, deptEarly: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, deptEarly: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, deptEarly: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, deptEarly: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.departmentRequests?.early || getDepartmentRequestsData('early', statisticsData, translateSubject)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.deptEarly ? 
                            (comparisonData?.departmentRequests?.early || getDepartmentRequestsData('early', comparisonData, translateSubject)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.deptEarly?.basePeriod ? 
                              `${format(chartComparisonPeriods.deptEarly.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.deptEarly.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.deptEarly?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.deptEarly.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.deptEarly.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>
                  </SectionChartsGrid>
                </CollapsibleSectionComponent>

                {/* Teacher Requests Section */}
                <CollapsibleSectionComponent
                  title={t('analytics.teacherRequests')}
                  description={t('analytics.teacherRequestsDesc')}
                  isOpen={teacherRequestsOpen}
                  onToggle={() => setTeacherRequestsOpen(!teacherRequestsOpen)}
                >
                  <SectionChartsGrid>
                    {/* Absence Requests by Teacher */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.absenceRequestsChart')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.teacherAbsence}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, teacherAbsence: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, teacherAbsence: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, teacherAbsence: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, teacherAbsence: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.teacherRequests?.absence || getTeacherRequestsData('absence', statisticsData)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.teacherAbsence ? 
                            (comparisonData?.teacherRequests?.absence || getTeacherRequestsData('absence', comparisonData)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.teacherAbsence?.basePeriod ? 
                              `${format(chartComparisonPeriods.teacherAbsence.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.teacherAbsence.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.teacherAbsence?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.teacherAbsence.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.teacherAbsence.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>

                    {/* Late Arrival Requests by Teacher */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.lateArrivalRequestsChart')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.teacherLate}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, teacherLate: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, teacherLate: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, teacherLate: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, teacherLate: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.teacherRequests?.late || getTeacherRequestsData('late', statisticsData)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.teacherLate ? 
                            (comparisonData?.teacherRequests?.late || getTeacherRequestsData('late', comparisonData)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.teacherLate?.basePeriod ? 
                              `${format(chartComparisonPeriods.teacherLate.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.teacherLate.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.teacherLate?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.teacherLate.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.teacherLate.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>

                    {/* Early Leave Requests by Teacher */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.earlyLeaveRequestsChart')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.teacherEarly}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, teacherEarly: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, teacherEarly: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, teacherEarly: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, teacherEarly: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.teacherRequests?.early || getTeacherRequestsData('early', statisticsData)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.teacherEarly ? 
                            (comparisonData?.teacherRequests?.early || getTeacherRequestsData('early', comparisonData)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.teacherEarly?.basePeriod ? 
                              `${format(chartComparisonPeriods.teacherEarly.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.teacherEarly.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.teacherEarly?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.teacherEarly.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.teacherEarly.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>
                  </SectionChartsGrid>
                </CollapsibleSectionComponent>

                {/* Time Patterns & Trends Section */}
                <CollapsibleSectionComponent
                  title={t('analytics.timePatterns')}
                  description={t('analytics.timePatternsDesc')}
                  isOpen={timePatternsOpen}
                  onToggle={() => setTimePatternsOpen(!timePatternsOpen)}
                >
                  <SectionChartsGrid>
                    {/* Peak Request Times */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.peakRequestTimes')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.peakTimes}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, peakTimes: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, peakTimes: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, peakTimes: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, peakTimes: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.timePatterns?.peakTimes || getPeakRequestTimesData(statisticsData)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.peakTimes ? 
                            (comparisonData?.timePatterns?.peakTimes || getPeakRequestTimesData(comparisonData)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.peakTimes?.basePeriod ? 
                              `${format(chartComparisonPeriods.peakTimes.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.peakTimes.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.peakTimes?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.peakTimes.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.peakTimes.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>

                    {/* Monthly Trends */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.monthlyTrends')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.monthlyTrends}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, monthlyTrends: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, monthlyTrends: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, monthlyTrends: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, monthlyTrends: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.timePatterns?.monthlyTrends || getMonthlyTrendsData(statisticsData, isRTL)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.monthlyTrends ? 
                            (comparisonData?.timePatterns?.monthlyTrends || getMonthlyTrendsData(comparisonData, isRTL)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.monthlyTrends?.basePeriod ? 
                              `${format(chartComparisonPeriods.monthlyTrends.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.monthlyTrends.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.monthlyTrends?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.monthlyTrends.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.monthlyTrends.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>
                  </SectionChartsGrid>
                </CollapsibleSectionComponent>

                {/* Performance Metrics Section */}
                <CollapsibleSectionComponent
                  title={t('analytics.performanceMetrics')}
                  description={t('analytics.performanceMetricsDesc')}
                  isOpen={performanceMetricsOpen}
                  onToggle={() => setPerformanceMetricsOpen(!performanceMetricsOpen)}
                >
                  <SectionChartsGrid>
                    {/* Request Approval Rates */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.approvalRates')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.approvalRates}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, approvalRates: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, approvalRates: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, approvalRates: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, approvalRates: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <DonutChart
                          data={statisticsData?.performanceMetrics?.approvalRates || getApprovalRatesData(statisticsData, isRTL)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.approvalRates ? 
                            (comparisonData?.performanceMetrics?.approvalRates || getApprovalRatesData(comparisonData, isRTL)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.approvalRates?.basePeriod ? 
                              `${format(chartComparisonPeriods.approvalRates.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.approvalRates.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.approvalRates?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.approvalRates.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.approvalRates.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                          showLegend={!chartComparisonModes.approvalRates}
                        />
                      </ChartContent>
                    </ChartCard>

                    {/* Manager Response Time */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle $isRTL={isRTL}>{t('analytics.responseTime')}</ChartTitle>
                        <ChartControls>
                          <ComparisonDateRangePicker
                            isActive={chartComparisonModes.responseTime}
                            onPeriodsChange={(periods) => {
                              setChartComparisonModes(prev => ({ ...prev, responseTime: true }));
                              setChartComparisonPeriods(prev => ({ ...prev, responseTime: periods }));
                            }}
                            onClose={() => {
                              setChartComparisonModes(prev => ({ ...prev, responseTime: false }));
                              setChartComparisonPeriods(prev => ({ ...prev, responseTime: null }));
                            }}
                          />
                        </ChartControls>
                      </ChartHeader>
                      <ChartContent>
                        <BarChart
                          data={statisticsData?.performanceMetrics?.responseTimes || getResponseTimeData(statisticsData, isRTL)}
                          isDarkMode={isDarkMode}
                          comparisonData={chartComparisonModes.responseTime ? 
                            (comparisonData?.performanceMetrics?.responseTimes || getResponseTimeData(comparisonData, isRTL)) : 
                            undefined}
                          labels={{
                            base: chartComparisonPeriods.responseTime?.basePeriod ? 
                              `${format(chartComparisonPeriods.responseTime.basePeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.responseTime.basePeriod.endDate, 'MMM d')}` : 
                              'Base Period',
                            comparison: chartComparisonPeriods.responseTime?.comparisonPeriod ? 
                              `${format(chartComparisonPeriods.responseTime.comparisonPeriod.startDate, 'MMM d')} - ${format(chartComparisonPeriods.responseTime.comparisonPeriod.endDate, 'MMM d')}` : 
                              'Comparison Period'
                          }}
                        />
                      </ChartContent>
                    </ChartCard>
                  </SectionChartsGrid>
                </CollapsibleSectionComponent>
              </>
            ) : (
              <LoadingContainer>No statistics data available</LoadingContainer>
            )}
          </StatisticsContainer>
        )}

        {activeTab === 'reports' && (
          <>
            <AnalyticsGrid>
              <AnalyticsCard
                title={t('reports.lateArrival')}
                count={analyticsData.late_arrival}
                onClick={() => handleAnalyticsCardClick('lateArrival')}
              />
              <AnalyticsCard
                title={t('reports.earlyLeave')}
                count={analyticsData.early_leave}
                onClick={() => handleAnalyticsCardClick('earlyLeave')}
              />
              <AnalyticsCard
                title={t('reports.authorizedAbsence')}
                count={analyticsData.authorized_absence}
                onClick={() => handleAnalyticsCardClick('authorizedAbsence')}
              />
              <AnalyticsCard
                title={t('reports.unauthorizedAbsence')}
                count={analyticsData.unauthorized_absence}
                onClick={() => handleAnalyticsCardClick('unauthorizedAbsence')}
              />
              <AnalyticsCard
                title={t('reports.overtime')}
                count={analyticsData.overtime}
                label={t('common.hours')}
                onClick={() => handleAnalyticsCardClick('overtime')}
              />
              <AnalyticsCard
                title={t('reports.totalHours')}
                count={analyticsData.total_hours}
                label={t('common.hours')}
                onClick={() => handleAnalyticsCardClick('totalHours')}
              />
            </AnalyticsGrid>
            
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell $alignLeft={true} $isRTL={isRTL}>{t('reports.teacher')}</TableHeaderCell>
                    <TableHeaderCell>{t('reports.workType')}</TableHeaderCell>
                    <TableHeaderCell>{t('reports.attends')}</TableHeaderCell>
                    <TableHeaderCell>{t('reports.authorizedAbsence')}</TableHeaderCell>
                    <TableHeaderCell>{t('reports.unauthorizedAbsence')}</TableHeaderCell>
                    <TableHeaderCell>{t('reports.earlyLeave')}</TableHeaderCell>
                    <TableHeaderCell>{t('reports.lateArrival')}</TableHeaderCell>
                    <TableHeaderCell>{t('reports.overtime')}</TableHeaderCell>
                    <TableHeaderCell>{t('reports.totalHours')}</TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>
                <TableBody>
                  {currentReports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell $alignLeft={true} $isRTL={isRTL}>{report.name}</TableCell>
                      <TableCell>
                        <WorkTypeBadge $workType={report.workType}>
                          {translateWorkType(report.workType)}
                        </WorkTypeBadge>
                      </TableCell>
                      <TableCell>{report.attends}</TableCell>
                      <TableCell>{report.authorizedAbsence}</TableCell>
                      <TableCell>{report.unauthorizedAbsence}</TableCell>
                      <TableCell>{report.earlyLeave}</TableCell>
                      <TableCell>{report.lateArrival}</TableCell>
                      <TableCell>{report.overtime}</TableCell>
                      <TableCell>{report.totalHours}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <ExportButtonsContainer>
              <ExportButton onClick={handleExportExcel}>
                {t('reports.exportExcel')}
              </ExportButton>
              <ExportButton onClick={handleExportPDF}>
                {t('reports.exportPDF')}
              </ExportButton>
            </ExportButtonsContainer>

            <PaginationContainer>
              <PaginationInfo>
                <PaginationButton
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </PaginationButton>
                <span>Page {currentPage} of {totalPages}</span>
                <PaginationButton
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ›
                </PaginationButton>
              </PaginationInfo>
            </PaginationContainer>
          </>
        )}
      </MainContent>
      
      <AddTeacherModal
        isOpen={showAddTeacherModal}
        onClose={handleCloseModal}
        onSuccess={handleTeacherAdded}
        managerAuthorities={managerAuthorities}
      />
      
      <EditTeacherModal
        isOpen={showEditTeacherModal}
        onClose={handleCloseEditModal}
        onSuccess={handleTeacherUpdated}
        teacher={selectedTeacher}
      />
      
      <RequestTypeDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        requestType={selectedRequestType}
        subject={selectedSubject}
        dateRange={{
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }}
      />
      
      <AnalyticsKPIModal
        isOpen={showKPIModal}
        onClose={() => setShowKPIModal(false)}
        kpiType={selectedKPI}
        data={kpiModalData || { value: 0 }}
      />
    </TeachersContainer>
  );
};

export default Teachers;
