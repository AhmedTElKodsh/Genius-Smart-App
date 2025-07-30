import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { startOfMonth, format, startOfWeek, endOfWeek, startOfDay, endOfDay, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isSameDay, endOfMonth, subDays } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Sidebar from '../components/Sidebar';
import DateRangePicker, { DateRange } from '../components/DateRangePicker';
import AddTeacherModal from '../components/AddTeacherModal';
import EditTeacherModal from '../components/EditTeacherModal';
import AnalyticsCard from '../components/AnalyticsCard';
import RequestTypeDetailModal from '../components/RequestTypeDetailModal';
import AnalyticsKPIModal from '../components/AnalyticsKPIModal';
import AnalyticsDateRangePicker, { AnalyticsDateRange } from '../components/AnalyticsDateRangePicker';
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
import { ar } from 'date-fns/locale';

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

// Simple BarChart component wrapper
interface BarChartProps {
  data: Array<{ name: string; value: number }>;
  isDarkMode: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ data, isDarkMode }) => {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: isDarkMode ? '#DAA520' : '#007acc',
        borderColor: isDarkMode ? '#DAA520' : '#007acc',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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

// Simple DonutChart component wrapper
interface DonutChartProps {
  data: Array<{ name: string; value: number }>;
  isDarkMode: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, isDarkMode }) => {
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
        display: true,
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

  return <Doughnut data={chartData} options={options} />;
};

// Collapsible Section Component
interface CollapsibleSectionComponentProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isRTL?: boolean;
}

const CollapsibleSectionComponent: React.FC<CollapsibleSectionComponentProps> = ({ 
  title, 
  description,
  isOpen, 
  onToggle, 
  children,
  isRTL 
}) => {
  const { isDarkMode } = useTheme();
  
  return (
    <CollapsibleSection $isOpen={isOpen}>
      <SectionHeader $isOpen={isOpen} onClick={onToggle}>
        <div style={{ flex: 1 }}>
          <SectionTitle isRTL={isRTL}>{title}</SectionTitle>
          {description && (
            <div style={{
              fontSize: '12px',
              color: isDarkMode ? '#b0b0b0' : '#666',
              marginTop: '4px',
              textAlign: isRTL ? 'right' : 'left'
            }}>
              {description}
            </div>
          )}
        </div>
        <SectionToggle $isOpen={isOpen}>
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

// Helper function to get department data based on selected metric
const getDepartmentDataByMetric = (data: any, metric: string) => {
  if (!data?.departmentComparison) {
    // Generate sample data based on subjects
    const sampleDepartments = [
      'العلوم', 'الرياضيات', 'اللغة العربية', 'اللغة الإنجليزية', 'التاريخ', 
      'الجغرافيا', 'التربية الإسلامية', 'التربية البدنية'
    ];
    
    return sampleDepartments.map(dept => ({
      name: dept,
      value: getMetricValue(metric)
    }));
  }
  
  return data.departmentComparison.map((dept: any) => ({
    name: dept.name || dept.department || 'Unknown',
    value: getMetricValueFromData(dept, metric)
  }));
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

// Collapsible Section Component
const CollapsibleSection = styled.div<{ $isOpen: boolean }>`
  margin-bottom: 24px;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  overflow: visible;
  background: #ffffff;
`;

const SectionHeader = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: ${props => props.$isOpen ? '#f8f9fa' : '#ffffff'};
  border-bottom: ${props => props.$isOpen ? '1px solid #e1e7ec' : 'none'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const SectionTitle = styled.h3<{ isRTL?: boolean }>`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #141F25;
  font-family: ${props => props.isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const SectionToggle = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

const SectionContent = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  padding: 20px;
`;

const SectionChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  overflow: visible;
  
  /* Keep all charts the same width, even when odd numbered */
  > * {
    min-width: 0;
    width: 100%;
  }
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

const RoleBadge = styled.span<{ $role: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${props => {
    switch (props.$role) {
      case 'ADMIN':
        return `
          background: #fee4e2;
          color: #dc2626;
          border: 1px solid #fca5a5;
        `;
      case 'MANAGER':
        return `
          background: #fef3c7;
          color: #d97706;
          border: 1px solid #fcd34d;
        `;
      case 'EMPLOYEE':
      default:
        return `
          background: #dbeafe;
          color: #1e40af;
          border: 1px solid #93c5fd;
        `;
    }
  }}
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

const TableHeaderCell = styled.th<{ $alignLeft?: boolean; isRTL?: boolean; $isFirstColumn?: boolean }>`
  padding: 12px 16px;
  text-align: ${props => {
    if (props.$isFirstColumn && props.isRTL) return 'right';
    if (props.$alignLeft) return 'left';
    return 'center';
  }};
  font-size: 14px;
  font-weight: 600;
  color: #141F25;
  border-right: 1px solid #e1e7ec;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  
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

const TableCell = styled.td<{ $alignLeft?: boolean; isRTL?: boolean; $isFirstColumn?: boolean }>`
  padding: 12px 16px;
  font-size: 14px;
  color: #141F25;
  border-right: 1px solid #f1f3f4;
  text-align: ${props => {
    if (props.$isFirstColumn && props.isRTL) return 'right';
    if (props.$alignLeft) return 'left';
    return 'center';
  }};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  
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
  flex-wrap: wrap;
  gap: 16px;
`;

const StatisticsFilters = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 8px 16px;
  border: 1px solid #e1e7ec;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  background: #ffffff;
  color: #141F25;
  min-width: 150px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #D6B10E;
  }
`;

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
  overflow: visible;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div<{ $isComparisonMode?: boolean }>`
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  padding: ${props => props.$isComparisonMode ? '30px' : '24px'};
  min-height: ${props => props.$isComparisonMode ? '500px' : '420px'};
  max-height: ${props => props.$isComparisonMode ? '650px' : '550px'};
  overflow: visible;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  
  ${props => props.$isComparisonMode && `
    grid-column: span 2;
    
    @media (max-width: 1200px) {
      grid-column: span 1;
    }
  `}
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
`;

const ChartTitle = styled.h3<{ isRTL?: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: #141F25;
  margin: 0;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  font-family: ${props => props.isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
`;

const ComparisonSubTitle = styled.h5<{ isRTL?: boolean }>`
  margin: 0 0 15px 0;
  font-size: 13px;
  color: #666;
  text-align: ${props => props.isRTL ? 'right' : 'center'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  font-family: ${props => props.isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-weight: 600;
`;

const ChartControls = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

const ComparisonControls = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  gap: 8px;
  margin-top: 10px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  overflow: visible;
`;

const ComparisonSelect = styled.select`
  padding: 4px 8px;
  border: 1px solid #e1e7ec;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  cursor: pointer;
`;

const ComparisonPeriodButton = styled.button<{ $isRTL?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 4px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 11px;
  color: #2563EB;
  cursor: pointer;
  transition: all 0.2s ease;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  min-width: 80px;
  font-weight: 500;
  position: relative;
  
  &:hover {
    border-color: #2563EB;
    background: #EFF6FF;
  }
  
  .icon {
    color: #666;
    font-size: 10px;
  }
`;

const ComparisonLabel = styled.span`
  font-size: 11px;
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

const ComparisonChartGrid = styled.div<{ $columns?: number }>`
  display: grid;
  grid-template-columns: ${props => props.$columns === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))'};
  gap: 20px;
  height: 400px;
  width: 100%;
  padding: 0 10px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    height: auto;
    gap: 30px;
  }
`;

const ComparisonChartItem = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 350px;
  width: 100%;
`;

const ComparisonChartTitle = styled.h5<{ $isRTL?: boolean }>`
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: 600;
  color: #444;
  text-align: center;
  padding: 8px;
  background: #f8fafb;
  border-radius: 6px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const ComparisonChartContent = styled.div`
  flex: 1;
  min-height: 0;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const FullWidthChart = styled.div`
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  overflow: visible;
  
  .chart-container {
    width: 100%;
    height: 400px;
    max-height: 400px;
    overflow: visible;
  }
`;

const TableSection = styled.div`
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  padding: 24px;
`;

const TableTitle = styled.h3<{ isRTL?: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: #141F25;
  margin: 0 0 20px 0;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
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

const StatsTableHeaderCell = styled.th<{ $alignLeft?: boolean; isRTL?: boolean; $isFirstColumn?: boolean }>`
  padding: 12px 16px;
  text-align: ${props => {
    if (props.$isFirstColumn && props.isRTL) return 'right';
    if (props.$alignLeft) return 'left';
    return 'center';
  }};
  font-size: 14px;
  font-weight: 600;
  color: #141F25;
  border-right: 1px solid #e1e7ec;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  
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

const StatsTableCell = styled.td<{ $alignLeft?: boolean; isRTL?: boolean; $isFirstColumn?: boolean }>`
  padding: 12px 16px;
  font-size: 14px;
  color: #141F25;
  border-right: 1px solid #f1f3f4;
  text-align: ${props => {
    if (props.$isFirstColumn && props.isRTL) return 'right';
    if (props.$alignLeft) return 'left';
    return 'center';
  }};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  
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
  role?: string;
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

interface TeacherPerformanceData {
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
  weeklyPatterns: Record<string, any>;
  attendanceSummary: any;
  requestSummary: any;
  totalTeachers?: number;
  attendanceRate?: number;
  topPerformers?: number;
  atRisk?: number;
}

const Teachers: React.FC = () => {
  const navigate = useNavigate();
  const { t, isRTL, language } = useLanguage();
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
  
  // Analytics modal state for reports
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState<'lateArrival' | 'earlyLeave' | 'authorizedAbsence' | 'unauthorizedAbsence' | 'overtime' | 'totalHours'>('lateArrival');
  
  // KPI modal state for analytics
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<'totalTeachers' | 'attendanceRate' | 'topPerformers' | 'atRisk' | 'departments'>('totalTeachers');
  const [kpiModalData, setKpiModalData] = useState<any>(null);
  
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

  const [selectedMetric, setSelectedMetric] = useState<string>('attendanceRate');
  const [chartType, setChartType] = useState<string>('bar');
  
  // Comparison functionality states
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState<string>('week');
  const [comparisonData, setComparisonData] = useState<StatisticsData | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonDateRange, setComparisonDateRange] = useState<[Date, Date]>([
    startOfWeek(new Date()),
    endOfWeek(new Date())
  ]);
  const [isComparisonDatePickerOpen, setIsComparisonDatePickerOpen] = useState(false);

  // Collapsible sections state
  const [departmentsComparisonOpen, setDepartmentsComparisonOpen] = useState(false);
  const [departmentComparisonsOpen, setDepartmentComparisonsOpen] = useState(false);
  const [departmentRequestsOpen, setDepartmentRequestsOpen] = useState(false);
  const [teachersComparisonOpen, setTeachersComparisonOpen] = useState(false);
  const [departmentTrackingOpen, setDepartmentTrackingOpen] = useState(false);
  const [teacherTrackingOpen, setTeacherTrackingOpen] = useState(false);

  // Analytics date range state
  const [analyticsDateRange, setAnalyticsDateRange] = useState<AnalyticsDateRange>({
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
    label: t('common.thisMonth')
  });
  const [isAnalyticsDatePickerOpen, setIsAnalyticsDatePickerOpen] = useState(false);

  // Individual chart comparison states - each chart has independent comparison mode
  const [chartComparisons, setChartComparisons] = useState<Record<string, {
    isActive: boolean;
    comparisonDateRange: AnalyticsDateRange;
    isDatePickerOpen: boolean;
    comparisonData: any;
    loading: boolean;
  }>>({});

  // Individual chart data states - each chart has its own data state
  const [chartData, setChartData] = useState<Record<string, {
    data: any[];
    loading: boolean;
    error: string | null;
  }>>({});

  // Function to fetch data for a specific chart
  const fetchChartData = async (chartId: string, dateRange?: AnalyticsDateRange) => {
    const range = dateRange || analyticsDateRange;
    const startDate = format(range.startDate, 'yyyy-MM-dd');
    const endDate = format(range.endDate, 'yyyy-MM-dd');
    const token = localStorage.getItem('authToken');

    // Set loading state
    setChartData(prev => ({
      ...prev,
      [chartId]: {
        ...prev[chartId],
        loading: true,
        error: null
      }
    }));

    try {
      let apiEndpoint = '';
      
      // Map chart IDs to API endpoints
      switch (chartId) {
        // Department charts
        case 'dept-absence-comparison':
          apiEndpoint = `/api/analytics/departments/absence-comparison?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-early-leave-comparison':
          apiEndpoint = `/api/analytics/departments/early-leave-comparison?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-late-arrival-comparison':
          apiEndpoint = `/api/analytics/departments/late-arrival-comparison?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-absence-requests':
          apiEndpoint = `/api/analytics/departments/absence-requests?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-early-leave-requests':
          apiEndpoint = `/api/analytics/departments/early-leave-requests?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-late-arrival-requests':
          apiEndpoint = `/api/analytics/departments/late-arrival-requests?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-registered-absence-tracking':
          apiEndpoint = `/api/analytics/departments/absence-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-registered-early-leaves-tracking':
          apiEndpoint = `/api/analytics/departments/early-leave-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-registered-late-arrival-tracking':
          apiEndpoint = `/api/analytics/departments/late-arrival-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-absence-requests-tracking':
        case 'dept-absence-requests-tracking-2':
          apiEndpoint = `/api/analytics/departments/absence-requests-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-early-leave-requests-tracking':
          apiEndpoint = `/api/analytics/departments/early-leave-requests-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-late-arrival-requests-tracking':
          apiEndpoint = `/api/analytics/departments/late-arrival-requests-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        
        // Teacher charts
        case 'teacher-absence-comparison':
          apiEndpoint = `/api/analytics/teachers/absence-comparison?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-early-leave-comparison':
          apiEndpoint = `/api/analytics/teachers/early-leave-comparison?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-late-arrival-comparison':
          apiEndpoint = `/api/analytics/teachers/late-arrival-comparison?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-absence-requests':
          apiEndpoint = `/api/analytics/teachers/absence-requests?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-early-leave-requests-chart':
          apiEndpoint = `/api/analytics/teachers/early-leave-requests?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-late-arrival-requests-chart':
          apiEndpoint = `/api/analytics/teachers/late-arrival-requests?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-registered-absence-tracking':
          apiEndpoint = `/api/analytics/teachers/absence-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-registered-early-leaves-tracking':
          apiEndpoint = `/api/analytics/teachers/early-leave-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-registered-late-arrival-tracking':
          apiEndpoint = `/api/analytics/teachers/late-arrival-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-absence-requests-tracking':
          apiEndpoint = `/api/analytics/teachers/absence-requests-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-early-leave-requests-tracking':
          apiEndpoint = `/api/analytics/teachers/early-leave-requests-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-late-arrival-requests-tracking':
          apiEndpoint = `/api/analytics/teachers/late-arrival-requests-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        
        // Other charts
        case 'weekly-patterns-chart':
          apiEndpoint = `/api/analytics/attendance/weekly-patterns?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'attendance-summary':
          apiEndpoint = `/api/analytics/attendance/summary?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'performance-segments':
          apiEndpoint = `/api/analytics/employees/performance-segments?startDate=${startDate}&endDate=${endDate}`;
          break;
        
        default:
          console.warn(`No API endpoint defined for chart: ${chartId}`);
          throw new Error(`No API endpoint for chart: ${chartId}`);
      }

      const response = await fetch(`http://localhost:5000${apiEndpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();

      // Update chart data state
      setChartData(prev => ({
        ...prev,
        [chartId]: {
          data: data.data || data, // Handle both { data: [...] } and direct array responses
          loading: false,
          error: null
        }
      }));

    } catch (error) {
      console.error(`Error fetching data for ${chartId}:`, error);
      
      // Set error state but also provide fallback data
      setChartData(prev => ({
        ...prev,
        [chartId]: {
          data: [], // Empty data on error
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch data'
        }
      }));
    }
  };

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
      'Nanny': t('subjects.nanny')
    };
    return subjectMap[subject] || subject;
  };

  // List of all chart IDs to fetch data for
  const chartIds = [
    // Department charts
    'dept-absence-comparison',
    'dept-early-leave-comparison',
    'dept-late-arrival-comparison',
    'dept-absence-requests',
    'dept-early-leave-requests',
    'dept-late-arrival-requests',
    'dept-registered-absence-tracking',
    'dept-registered-early-leaves-tracking',
    'dept-registered-late-arrival-tracking',
    'dept-absence-requests-tracking',
    'dept-absence-requests-tracking-2',
    'dept-early-leave-requests-tracking',
    'dept-late-arrival-requests-tracking',
    // Teacher charts
    'teacher-absence-comparison',
    'teacher-early-leave-comparison',
    'teacher-late-arrival-comparison',
    'teacher-absence-requests',
    'teacher-early-leave-requests-chart',
    'teacher-late-arrival-requests-chart',
    'teacher-registered-absence-tracking',
    'teacher-registered-early-leaves-tracking',
    'teacher-registered-late-arrival-tracking',
    'teacher-absence-requests-tracking',
    'teacher-early-leave-requests-tracking',
    'teacher-late-arrival-requests-tracking',
    // Other charts
    'weekly-patterns-chart',
    'attendance-summary',
    'performance-segments'
  ];

  // Fetch data for all charts when component mounts or date range changes
  useEffect(() => {
    if (activeTab === 'statistics') {
      // Fetch data for all charts
      chartIds.forEach(chartId => {
        fetchChartData(chartId);
      });
    }
  }, [activeTab, analyticsDateRange]); // Re-fetch when tab changes to statistics or date range changes

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
        fetch('http://localhost:5000/api/teachers?limit=1000', {
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/subjects', {
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
      const token = localStorage.getItem('authToken');
      
      // Format dates for API calls
      const startDate = format(analyticsDateRange.startDate, 'yyyy-MM-dd');
      const endDate = format(analyticsDateRange.endDate, 'yyyy-MM-dd');
      
      const [performanceRes, departmentRes, weeklyRes, summaryRes, requestRes] = await Promise.all([
        fetch(`http://localhost:5000/api/analytics/employees/performance-segments?startDate=${startDate}&endDate=${endDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:5000/api/analytics/departments/comparison?startDate=${startDate}&endDate=${endDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:5000/api/analytics/attendance/weekly-patterns?startDate=${startDate}&endDate=${endDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:5000/api/analytics/attendance/summary?startDate=${startDate}&endDate=${endDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:5000/api/analytics/requests/summary?startDate=${startDate}&endDate=${endDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (performanceRes.ok && departmentRes.ok && weeklyRes.ok && summaryRes.ok && requestRes.ok) {
        const [performance, department, weekly, summary, requests] = await Promise.all([
          performanceRes.json(),
          departmentRes.json(),
          weeklyRes.json(),
          summaryRes.json(),
          requestRes.json()
        ]);

        setStatisticsData({
          performanceSegments: performance.performanceSegments || { excellent: [], good: [], average: [], poor: [], atRisk: [] },
          departmentComparison: department.departmentComparison || [],
          weeklyPatterns: weekly.weeklyPatterns || {},
          attendanceSummary: summary.summary || {},
          requestSummary: requests.summary || {}
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatisticsLoading(false);
    }
  };

  // Fetch comparison data for time period comparison
  const fetchComparisonData = async () => {
    if (!isComparisonMode) return;
    
    try {
      setComparisonLoading(true);
      const token = localStorage.getItem('authToken');
      
      const [performanceRes, departmentRes, weeklyRes, summaryRes, requestRes] = await Promise.all([
        fetch(`http://localhost:5000/api/analytics/employees/performance-segments?period=${comparisonPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:5000/api/analytics/departments/comparison?period=${comparisonPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:5000/api/analytics/attendance/weekly-patterns?period=${comparisonPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:5000/api/analytics/attendance/summary?period=${comparisonPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:5000/api/analytics/requests/summary?period=${comparisonPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (performanceRes.ok && departmentRes.ok && weeklyRes.ok && summaryRes.ok && requestRes.ok) {
        const [performance, department, weekly, summary, requests] = await Promise.all([
          performanceRes.json(),
          departmentRes.json(),
          weeklyRes.json(),
          summaryRes.json(),
          requestRes.json()
        ]);

        setComparisonData({
          performanceSegments: performance.performanceSegments || { excellent: [], good: [], average: [], poor: [], atRisk: [] },
          departmentComparison: department.departmentComparison || [],
          weeklyPatterns: weekly.weeklyPatterns || {},
          attendanceSummary: summary.summary || {},
          requestSummary: requests.summary || {}
        });
      }
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
    }
  }, [activeTab, analyticsDateRange]);

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

          const response = await fetch(`http://localhost:5000/api/teachers/reports?${params.toString()}`, {
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

  // Statistics period change handler


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

  // Click handler for analytics cards
  const handleAnalyticsCardClick = (requestType: 'lateArrival' | 'earlyLeave' | 'authorizedAbsence' | 'unauthorizedAbsence' | 'overtime' | 'totalHours') => {
    setSelectedRequestType(requestType);
    setShowDetailModal(true);
  };

  // Click handler for KPI cards
  const handleKPICardClick = (kpiType: 'totalTeachers' | 'attendanceRate' | 'topPerformers' | 'atRisk' | 'departments') => {
    setSelectedKPI(kpiType);
    
    // Prepare data based on KPI type and current statistics
    let modalData: { value: number; teachers: TeacherPerformanceData[]; breakdown?: any[]; trend?: string; previousPeriod?: number; } = { value: 0, teachers: [] };
    
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
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set document properties
      doc.setProperties({
        title: 'Teachers Reports',
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
      doc.text('Teachers Reports', 105, 30, { align: 'center' });

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
      const subjectText = selectedSubject || t('teachers.allSubjects');
              doc.text(`${t('subjects.subject')}: ${subjectText}`, 14, yPosition);
      yPosition += 6;
      
      // Total teachers
      doc.text(`Total Teachers: ${reportsData.length}`, 14, yPosition);
      yPosition += 10;

      // Prepare table data
      const tableColumns = [
        'Teacher',
        'Work Type',
        'Attends',
        'Authorized\nAbsence',
        'Unauthorized\nAbsence',
        'Early Leave',
        'Late Arrival',
        'Overtime',
        'Total Hours'
      ];

      const tableData = reportsData.map(report => [
        report.name,
        report.workType,
        report.attends,
        report.authorizedAbsence,
        report.unauthorizedAbsence,
        report.earlyLeave,
        report.lateArrival,
        report.overtime,
        report.totalHours
      ]);

      // Add table
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
          cellPadding: 3
        },
        columnStyles: {
          0: { halign: 'left' }, // Teacher name - left aligned
          1: { halign: 'center' }, // Work Type - center aligned
          2: { halign: 'center' }, // Attends - center aligned
          3: { halign: 'center' }, // Permitted Leaves - center aligned
          4: { halign: 'center' }, // Unpermitted Leaves - center aligned
          5: { halign: 'center' }, // Authorized Absence - center aligned
          6: { halign: 'center' }, // Unauthorized Absence - center aligned
          7: { halign: 'center' } // Late Arrival - center aligned
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

      // Generate filename
      const dateString = format(new Date(), 'yyyy-MM-dd');
      const subjectString = selectedSubject ? `_${selectedSubject.replace(/\s+/g, '-')}` : '';
      const filename = `Teachers-Report_${dateString}${subjectString}.pdf`;

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
        [t('reports.workType')]: report.workType,
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
        { Field: t('teachers.subjectFilter'), Value: selectedSubject || t('teachers.allSubjects') },
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

      // Generate filename
      const dateString = format(new Date(), 'yyyy-MM-dd');
      const subjectString = selectedSubject ? `_${selectedSubject.replace(/\s+/g, '-')}` : '';
      const filename = `Teachers-Report_${dateString}${subjectString}.xlsx`;

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

  // Handle analytics date range change
  const handleAnalyticsDateRangeChange = (range: AnalyticsDateRange) => {
    setAnalyticsDateRange(range);
  };

  // Handle comparison date range change
  const handleComparisonDateRangeChange = (range: [Date, Date]) => {
    setComparisonDateRange(range);
    // Set to custom period for now
    setComparisonPeriod('custom');
    // Refetch comparison data with new range
    fetchComparisonData();
    setIsComparisonDatePickerOpen(false);
  };

  // Get comparison period display label
  const getComparisonPeriodLabel = () => {
    const now = new Date();
    const start = comparisonDateRange[0];
    const end = comparisonDateRange[1];
    const locale = language === 'ar' ? ar : undefined;
    
    // Check for predefined periods
    if (isSameDay(start, startOfDay(now)) && isSameDay(end, endOfDay(now))) {
      return language === 'ar' ? 'اليوم' : 'Today';
    } else if (isSameDay(start, startOfWeek(now)) && isSameDay(end, endOfWeek(now))) {
      return language === 'ar' ? 'هذا الأسبوع' : 'This Week';
    } else if (isSameDay(start, startOfMonth(now)) && isSameDay(end, endOfMonth(now))) {
      return language === 'ar' ? 'هذا الشهر' : 'This Month';
    } else if (isSameDay(start, startOfQuarter(now)) && isSameDay(end, endOfQuarter(now))) {
      return language === 'ar' ? 'هذا الربع' : 'This Quarter';
    } else if (isSameDay(start, startOfYear(now)) && isSameDay(end, endOfYear(now))) {
      return language === 'ar' ? 'هذا العام' : 'This Year';
    }
    
    // Custom range
    return `${format(start, 'd MMM', { locale })} - ${format(end, 'd MMM', { locale })}`;
  };

  // Helper functions for individual chart comparison management
  const initializeChartComparison = (chartId: string) => {
    if (!chartComparisons[chartId]) {
      setChartComparisons(prev => ({
        ...prev,
        [chartId]: {
          isActive: false,
          comparisonDateRange: {
            startDate: startOfWeek(new Date()),
            endDate: endOfWeek(new Date()),
            label: t('common.thisWeek')
          },
          isDatePickerOpen: false,
          comparisonData: null,
          loading: false
        }
      }));
    }
  };

  const toggleChartComparison = (chartId: string) => {
    initializeChartComparison(chartId);
    const currentState = chartComparisons[chartId];
    const newActiveState = !currentState?.isActive;
    
    setChartComparisons(prev => ({
      ...prev,
      [chartId]: {
        ...prev[chartId],
        isActive: newActiveState
      }
    }));

    // Fetch comparison data when activating comparison
    if (newActiveState) {
      const comparisonDateRange = currentState?.comparisonDateRange || {
        startDate: startOfWeek(new Date()),
        endDate: endOfWeek(new Date()),
        label: t('common.thisWeek')
      };
      fetchChartComparisonData(chartId, comparisonDateRange);
    }
  };

  const updateChartComparisonDateRange = (chartId: string, dateRange: AnalyticsDateRange) => {
    setChartComparisons(prev => ({
      ...prev,
      [chartId]: {
        ...prev[chartId],
        comparisonDateRange: dateRange,
        isDatePickerOpen: false
      }
    }));
  };

  const toggleChartDatePicker = (chartId: string) => {
    initializeChartComparison(chartId);
    setChartComparisons(prev => ({
      ...prev,
      [chartId]: {
        ...prev[chartId],
        isDatePickerOpen: !prev[chartId]?.isDatePickerOpen
      }
    }));
  };

  const getChartComparison = (chartId: string) => {
    return chartComparisons[chartId] || {
      isActive: false,
      comparisonDateRange: {
        startDate: startOfWeek(new Date()),
        endDate: endOfWeek(new Date()),
        label: t('common.thisWeek')
      },
      isDatePickerOpen: false,
      comparisonData: null,
      loading: false
    };
  };

  const handleChartDateRangeChange = (chartId: string, newRange: AnalyticsDateRange) => {
    setChartComparisons(prev => ({
      ...prev,
      [chartId]: {
        ...prev[chartId],
        comparisonDateRange: newRange,
        isDatePickerOpen: false
      }
    }));
    
    // Fetch new comparison data for the updated date range
    if (chartComparisons[chartId]?.isActive) {
      fetchChartComparisonData(chartId, newRange);
    }
  };

  // Function to fetch comparison data for individual charts
  const fetchChartComparisonData = async (chartId: string, dateRange: AnalyticsDateRange) => {
    try {
      // Set loading state for this specific chart
      setChartComparisons(prev => ({
        ...prev,
        [chartId]: {
          ...prev[chartId],
          loading: true
        }
      }));

      const token = localStorage.getItem('authToken');
      const startDate = format(dateRange.startDate, 'yyyy-MM-dd');
      const endDate = format(dateRange.endDate, 'yyyy-MM-dd');

      let apiEndpoint = '';
      
      // Determine the appropriate API endpoint based on chart type
      switch (chartId) {
        // Department tracking charts
        case 'dept-registered-absence-tracking':
          apiEndpoint = `http://localhost:5000/api/analytics/departments/absence-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-registered-early-leaves-tracking':
          apiEndpoint = `http://localhost:5000/api/analytics/departments/early-leave-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-registered-late-arrival-tracking':
          apiEndpoint = `http://localhost:5000/api/analytics/departments/late-arrival-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-absence-requests-tracking':
          apiEndpoint = `http://localhost:5000/api/analytics/departments/absence-requests-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-early-leave-requests-tracking':
          apiEndpoint = `http://localhost:5000/api/analytics/departments/early-leave-requests-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-late-arrival-requests-tracking':
          apiEndpoint = `http://localhost:5000/api/analytics/departments/late-arrival-requests-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        
        // Teacher tracking charts
        case 'teacher-registered-absence-tracking':
          apiEndpoint = `http://localhost:5000/api/analytics/teachers/absence-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-registered-early-leaves-tracking':
          apiEndpoint = `http://localhost:5000/api/analytics/teachers/early-leave-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-registered-late-arrival-tracking':
          apiEndpoint = `http://localhost:5000/api/analytics/teachers/late-arrival-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-absence-requests-tracking':
          apiEndpoint = `http://localhost:5000/api/analytics/teachers/absence-requests-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-early-leave-requests-tracking':
          apiEndpoint = `http://localhost:5000/api/analytics/teachers/early-leave-requests-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-late-arrival-requests-tracking':
          apiEndpoint = `http://localhost:5000/api/analytics/teachers/late-arrival-requests-tracking?startDate=${startDate}&endDate=${endDate}`;
          break;
        
        // Other comparison charts
        case 'dept-absence-comparison':
          apiEndpoint = `http://localhost:5000/api/analytics/departments/absence-comparison?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-early-leave-comparison':
          apiEndpoint = `http://localhost:5000/api/analytics/departments/early-leave-comparison?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'dept-late-arrival-comparison':
          apiEndpoint = `http://localhost:5000/api/analytics/departments/late-arrival-comparison?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-absence-comparison':
          apiEndpoint = `http://localhost:5000/api/analytics/teachers/absence-comparison?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-early-leave-comparison':
          apiEndpoint = `http://localhost:5000/api/analytics/teachers/early-leave-comparison?startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'teacher-late-arrival-comparison':
          apiEndpoint = `http://localhost:5000/api/analytics/teachers/late-arrival-comparison?startDate=${startDate}&endDate=${endDate}`;
          break;
        
        default:
          console.warn(`No API endpoint defined for chart: ${chartId}`);
          return;
      }

      // For development, immediately set loading to false with mock data
      // In production, uncomment the actual API call below
      setChartComparisons(prev => ({
        ...prev,
        [chartId]: {
          ...prev[chartId],
          comparisonData: null, // This will trigger the fallback mock data in getComparisonChartData
          loading: false
        }
      }));
      return;
      
      /* Original API call code - kept for reference
      const response = await fetch(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch comparison data for ${chartId}`);
      }

      const comparisonData = await response.json();

      // Update the chart's comparison data
      setChartComparisons(prev => ({
        ...prev,
        [chartId]: {
          ...prev[chartId],
          comparisonData: comparisonData,
          loading: false
        }
      }));
      */

    } catch (error) {
      console.error(`Error fetching comparison data for ${chartId}:`, error);
      
      // Set error state and stop loading
      setChartComparisons(prev => ({
        ...prev,
        [chartId]: {
          ...prev[chartId],
          comparisonData: null,
          loading: false
        }
      }));
    }
  };

  // Helper function to get chart data (current period)
  const getCurrentChartData = (chartId: string) => {
    // First check if we have fetched data for this chart
    const fetchedData = chartData[chartId];
    if (fetchedData && fetchedData.data && fetchedData.data.length > 0) {
      return fetchedData.data;
    }
    
    // Return loading state if data is being fetched
    if (fetchedData && fetchedData.loading) {
      return [{ name: 'Loading...', value: 0 }];
    }
    

    
    // Otherwise return mock data as fallback
    // This ensures the chart renders even if API is unavailable
    switch (chartId) {
      case 'dept-registered-absence-tracking':
        return [
          { name: 'Math', value: 25 },
          { name: 'Science', value: 30 },
          { name: 'English', value: 22 },
          { name: 'Arabic', value: 35 },
          { name: 'History', value: 28 },
          { name: 'Art', value: 31 }
        ];
      case 'dept-registered-early-leaves-tracking':
        return [
          { name: 'Math', value: 15 },
          { name: 'Science', value: 20 },
          { name: 'English', value: 12 },
          { name: 'Arabic', value: 25 },
          { name: 'History', value: 18 },
          { name: 'Art', value: 21 }
        ];
      case 'dept-registered-late-arrival-tracking':
        return [
          { name: 'Math', value: 18 },
          { name: 'Science', value: 24 },
          { name: 'English', value: 16 },
          { name: 'Arabic', value: 28 },
          { name: 'History', value: 20 },
          { name: 'Art', value: 23 }
        ];
      case 'dept-late-arrival-requests-tracking':
        return [
          { name: 'Jan', value: 15 },
          { name: 'Feb', value: 18 },
          { name: 'Mar', value: 12 },
          { name: 'Apr', value: 21 },
          { name: 'May', value: 16 },
          { name: 'Jun', value: 19 }
        ];
      case 'dept-absence-requests-tracking':
        return [
          { name: 'Jan', value: 30 },
          { name: 'Feb', value: 35 },
          { name: 'Mar', value: 28 },
          { name: 'Apr', value: 40 },
          { name: 'May', value: 33 },
          { name: 'Jun', value: 37 }
        ];
      case 'dept-early-leave-requests-tracking':
        return [
          { name: 'Jan', value: 22 },
          { name: 'Feb', value: 26 },
          { name: 'Mar', value: 20 },
          { name: 'Apr', value: 30 },
          { name: 'May', value: 24 },
          { name: 'Jun', value: 28 }
        ];
      case 'teacher-registered-absence-tracking':
        return [
          { name: 'Ahmed Ali', value: 3 },
          { name: 'Sara Hassan', value: 5 },
          { name: 'Mohamed Omar', value: 2 },
          { name: 'Fatima Ahmad', value: 7 },
          { name: 'Hassan Ibrahim', value: 4 }
        ];
      case 'teacher-registered-early-leaves-tracking':
        return [
          { name: 'Ahmed Ali', value: 2 },
          { name: 'Sara Hassan', value: 4 },
          { name: 'Mohamed Omar', value: 1 },
          { name: 'Fatima Ahmad', value: 6 },
          { name: 'Hassan Ibrahim', value: 3 }
        ];
      case 'teacher-registered-late-arrival-tracking':
        return [
          { name: 'Ahmed Ali', value: 4 },
          { name: 'Sara Hassan', value: 6 },
          { name: 'Mohamed Omar', value: 3 },
          { name: 'Fatima Ahmad', value: 8 },
          { name: 'Hassan Ibrahim', value: 5 }
        ];
      case 'dept-late-arrival-comparison':
        return [
          { name: 'Math', value: 7 },
          { name: 'Science', value: 9 },
          { name: 'English', value: 5 },
          { name: 'Arabic', value: 6 },
          { name: 'History', value: 8 }
        ];
      case 'dept-early-leave-requests-tracking':
        return [
          { name: 'Jan', value: 20 },
          { name: 'Feb', value: 25 },
          { name: 'Mar', value: 18 },
          { name: 'Apr', value: 28 },
          { name: 'May', value: 22 },
          { name: 'Jun', value: 26 }
        ];
      case 'teacher-absence-requests':
        return [
          { name: 'Ahmed Ali', value: 8 },
          { name: 'Sara Hassan', value: 12 },
          { name: 'Mohamed Omar', value: 5 },
          { name: 'Fatima Nour', value: 15 },
          { name: 'Hassan Ibrahim', value: 9 }
        ];
      case 'teacher-early-leave-requests-chart':
        return [
          { name: 'Ahmed Ali', value: 4 },
          { name: 'Sara Hassan', value: 6 },
          { name: 'Mohamed Omar', value: 2 },
          { name: 'Fatima Nour', value: 8 },
          { name: 'Hassan Ibrahim', value: 5 }
        ];
      case 'teacher-late-arrival-requests-chart':
        return [
          { name: 'Ahmed Ali', value: 3 },
          { name: 'Sara Hassan', value: 5 },
          { name: 'Mohamed Omar', value: 1 },
          { name: 'Fatima Nour', value: 7 },
          { name: 'Hassan Ibrahim', value: 4 }
        ];
      case 'dept-absence-requests-tracking-2':
        return [
          { name: 'Jan', value: 35 },
          { name: 'Feb', value: 42 },
          { name: 'Mar', value: 38 },
          { name: 'Apr', value: 48 },
          { name: 'May', value: 41 },
          { name: 'Jun', value: 45 }
        ];
      case 'teacher-absence-requests-tracking':
        return [
          { name: 'Jan', value: 20 },
          { name: 'Feb', value: 25 },
          { name: 'Mar', value: 18 },
          { name: 'Apr', value: 28 },
          { name: 'May', value: 22 },
          { name: 'Jun', value: 26 }
        ];
      case 'teacher-early-leave-requests-tracking':
        return [
          { name: 'Jan', value: 15 },
          { name: 'Feb', value: 18 },
          { name: 'Mar', value: 12 },
          { name: 'Apr', value: 20 },
          { name: 'May', value: 16 },
          { name: 'Jun', value: 19 }
        ];
      case 'teacher-late-arrival-requests-tracking':
        return [
          { name: 'Jan', value: 10 },
          { name: 'Feb', value: 12 },
          { name: 'Mar', value: 8 },
          { name: 'Apr', value: 15 },
          { name: 'May', value: 11 },
          { name: 'Jun', value: 13 }
        ];
      default:

        return [
          { name: 'Item 1', value: 10 },
          { name: 'Item 2', value: 15 },
          { name: 'Item 3', value: 8 },
          { name: 'Item 4', value: 20 },
          { name: 'Item 5', value: 12 }
        ];
    }
  };

  // Helper function to render comparison charts with consistent layout
  const renderComparisonChart = (chartId: string, currentData: any[], comparisonData: any[]) => (
    <ComparisonChartGrid>
      <ComparisonChartItem>
        <ComparisonChartTitle $isRTL={isRTL}>
          {t('comparison.current')}: {analyticsDateRange.label}
        </ComparisonChartTitle>
        <ComparisonChartContent>
          <BarChart 
            data={currentData} 
            isDarkMode={isDarkMode} 
          />
        </ComparisonChartContent>
      </ComparisonChartItem>
      <ComparisonChartItem>
        <ComparisonChartTitle $isRTL={isRTL}>
          {t('comparison.compare')}: {getChartComparison(chartId).comparisonDateRange.label}
        </ComparisonChartTitle>
        <ComparisonChartContent>
          <BarChart 
            data={comparisonData} 
            isDarkMode={isDarkMode} 
          />
        </ComparisonChartContent>
      </ComparisonChartItem>
    </ComparisonChartGrid>
  );

  // Helper function to get comparison chart data
  const getComparisonChartData = (chartId: string) => {
    const comparisonState = getChartComparison(chartId);
    
    // If we're loading, return loading placeholder data
    if (comparisonState.loading) {
      return [
        { name: 'Loading...', value: 0 }
      ];
    }
    
    // If we have fetched comparison data, use it
    if (comparisonState.comparisonData && comparisonState.comparisonData.data) {
      return comparisonState.comparisonData.data;
    }
    
    // Otherwise, return mock comparison data based on current data with some variations
    const currentData = getCurrentChartData(chartId);
    return currentData.map(item => ({
      ...item,
      value: Math.max(1, Math.floor(item.value * (0.7 + Math.random() * 0.6))) // Vary by ±30%
    }));
  };

  if (loading) {
    return (
      <TeachersContainer>
        <Sidebar onAddTeacher={handleAddTeacher} />
                  <MainContent $isRTL={isRTL}>
            <LoadingContainer>Loading teachers data...</LoadingContainer>
          </MainContent>
      </TeachersContainer>
    );
  }

  if (error) {
    return (
      <TeachersContainer>
        <Sidebar onAddTeacher={handleAddTeacher} />
        <MainContent $isRTL={isRTL}>
          <LoadingContainer>Error: {error}</LoadingContainer>
        </MainContent>
      </TeachersContainer>
    );
  }

  return (
    <TeachersContainer>
      <Sidebar onAddTeacher={handleAddTeacher} />
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
                  value={[dateRange.startDate, dateRange.endDate]}
                  onChange={(range) => handleDateRangeChange({
                    startDate: range[0],
                    endDate: range[1],
                    label: `${range[0].toLocaleDateString()} - ${range[1].toLocaleDateString()}`
                  })}
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <TeacherName>{teacher.name}</TeacherName>
                        <RoleBadge $role={teacher.role || 'EMPLOYEE'}>
                          {teacher.role === 'ADMIN' ? (isRTL ? 'مدير عام' : 'Admin') :
                           teacher.role === 'MANAGER' ? (isRTL ? 'مدير' : 'Manager') :
                           (isRTL ? 'موظف' : 'Employee')}
                        </RoleBadge>
                      </div>
                      <SubjectContainer>
                        <SubjectIcon>
                          {teacher.subject.charAt(0).toUpperCase()}
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
              <h2>{t('teachers.analytics')}</h2>
              <StatisticsFilters>
                <div style={{ position: 'relative' }}>
                  <button
                    style={{
                      padding: '8px 16px',
                      background: isDarkMode ? '#374151' : '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      color: isDarkMode ? '#ffffff' : '#374151',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onClick={() => setIsAnalyticsDatePickerOpen(!isAnalyticsDatePickerOpen)}
                  >
                    <span>📅</span>
                    {analyticsDateRange.label}
                  </button>
                  {isAnalyticsDatePickerOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: isRTL ? 'auto' : '0',
                      left: isRTL ? '0' : 'auto',
                      zIndex: 10001,
                      marginTop: '4px'
                    }}>
                      <AnalyticsDateRangePicker
                        value={analyticsDateRange}
                        onChange={handleAnalyticsDateRangeChange}
                        onClose={() => setIsAnalyticsDatePickerOpen(false)}
                      />
                    </div>
                  )}
                </div>
              </StatisticsFilters>
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
                      <ChartTitle isRTL={isRTL}>{t('analytics.attendanceCommitmentLevel')}</ChartTitle>
                      <ChartControls>
                        <ComparisonToggle 
                          $isActive={getChartComparison('attendance-commitment').isActive}
                          onClick={() => toggleChartComparison('attendance-commitment')}
                        >
                          {getChartComparison('attendance-commitment').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                        </ComparisonToggle>
                      </ChartControls>
                    </ChartHeader>
                    <div style={{
                      fontSize: '12px',
                      color: isDarkMode ? '#b0b0b0' : '#666',
                      margin: '0 0 10px 0',
                      padding: '0 20px',
                      textAlign: isRTL ? 'right' : 'left'
                    }}>
                      {t('analytics.attendanceCommitmentDesc')}
                    </div>
                    
                    <ComparisonControls $isVisible={getChartComparison('attendance-commitment').isActive}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        fontSize: '12px',
                        color: isDarkMode ? '#b0b0b0' : '#666'
                      }}>
                        <span>{t('comparison.compareWith')}:</span>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                        <ComparisonPeriodButton 
                          $isRTL={isRTL}
                            onClick={() => toggleChartDatePicker('attendance-commitment')}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              minWidth: 'auto',
                              height: 'auto'
                            }}
                          >
                            <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                            {getChartComparison('attendance-commitment').comparisonDateRange.label}
                        </ComparisonPeriodButton>
                          {getChartComparison('attendance-commitment').isDatePickerOpen && (
                          <>
                            <div style={{
                              position: 'fixed',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'transparent',
                              zIndex: 10000,
                            }} onClick={() => toggleChartDatePicker('attendance-commitment')} />
                            <div style={{ 
                              position: 'absolute', 
                              top: '100%', 
                              left: 0, 
                              zIndex: 10001, 
                              marginTop: '4px',
                              transform: 'scale(0.75)',
                              transformOrigin: 'top left'
                            }}>
                              <AnalyticsDateRangePicker
                                value={getChartComparison('attendance-commitment').comparisonDateRange}
                                onChange={(range) => updateChartComparisonDateRange('attendance-commitment', range)}
                                onClose={() => toggleChartDatePicker('attendance-commitment')}
                              />
                            </div>
                          </>
                        )}
                      </div>
                        <span>{t('comparison.vs')} {t('comparison.current')}: {analyticsDateRange.label}</span>
                      </div>
                    </ComparisonControls>
                    
                    <ChartContent>
                      <div className="chart-container" style={{ 
                        width: '100%', 
                        height: '100%', 
                        overflow: 'visible',
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        {getChartComparison('attendance-commitment').isActive && comparisonData ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '15px', 
                            width: '100%',
                            height: '100%',
                            alignItems: 'center'
                          }}>
                            {/* Current Period */}
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center',
                              height: '100%',
                              justifyContent: 'center'
                            }}>
                              <h5 style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                Current: {t(`periods.${comparisonPeriod}`)}
                              </h5>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '15px',
                                width: '100%',
                                justifyContent: 'center'
                              }}>
                                <div style={{ flexShrink: 0 }}>
                                  <DonutChartStyled style={{ transform: 'scale(0.7)' }} />
                                </div>
                                <DonutLegend style={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: '4px',
                                  fontSize: '11px'
                                }}>
                                  <LegendItem style={{ margin: '2px 0' }}>
                                    <LegendColor $color="#22c55e" />
                                    <span>Excellent ({statisticsData.performanceSegments.excellent.length})</span>
                                  </LegendItem>
                                  <LegendItem style={{ margin: '2px 0' }}>
                                    <LegendColor $color="#3b82f6" />
                                    <span>Good ({statisticsData.performanceSegments.good.length})</span>
                                  </LegendItem>
                                  <LegendItem style={{ margin: '2px 0' }}>
                                    <LegendColor $color="#f59e0b" />
                                    <span>Average ({statisticsData.performanceSegments.average.length})</span>
                                  </LegendItem>
                                </DonutLegend>
                              </div>
                            </div>
                            
                            {/* Comparison Period */}
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center',
                              height: '100%',
                              justifyContent: 'center'
                            }}>
                              <h5 style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                Compare: {t(`periods.${comparisonPeriod}`)}
                              </h5>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '15px',
                                width: '100%',
                                justifyContent: 'center'
                              }}>
                                <div style={{ flexShrink: 0 }}>
                                  <DonutChartStyled style={{ transform: 'scale(0.7)' }} />
                                </div>
                                <DonutLegend style={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: '4px',
                                  fontSize: '11px'
                                }}>
                                  <LegendItem style={{ margin: '2px 0' }}>
                                    <LegendColor $color="#22c55e" />
                                    <span>Excellent ({comparisonData.performanceSegments.excellent.length})</span>
                                  </LegendItem>
                                  <LegendItem style={{ margin: '2px 0' }}>
                                    <LegendColor $color="#3b82f6" />
                                    <span>Good ({comparisonData.performanceSegments.good.length})</span>
                                  </LegendItem>
                                  <LegendItem style={{ margin: '2px 0' }}>
                                    <LegendColor $color="#f59e0b" />
                                    <span>Average ({comparisonData.performanceSegments.average.length})</span>
                                  </LegendItem>
                                </DonutLegend>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '30px',
                            width: '100%',
                            height: '100%'
                          }}>
                            {/* Chart Section */}
                            <div style={{ flexShrink: 0 }}>
                              <DonutChartStyled />
                            </div>
                            
                            {/* Legend Section */}
                            <DonutLegend style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '8px',
                              alignItems: 'flex-start'
                            }}>
                              <LegendItem>
                                <LegendColor $color="#22c55e" />
                                <span>Excellent ({statisticsData.performanceSegments.excellent.length})</span>
                              </LegendItem>
                              <LegendItem>
                                <LegendColor $color="#3b82f6" />
                                <span>Good ({statisticsData.performanceSegments.good.length})</span>
                              </LegendItem>
                              <LegendItem>
                                <LegendColor $color="#f59e0b" />
                                <span>Average ({statisticsData.performanceSegments.average.length})</span>
                              </LegendItem>
                              <LegendItem>
                                <LegendColor $color="#ef4444" />
                                <span>Poor ({statisticsData.performanceSegments.poor.length})</span>
                              </LegendItem>
                              <LegendItem>
                                <LegendColor $color="#ec4899" />
                                <span>At Risk ({statisticsData.performanceSegments.atRisk.length})</span>
                              </LegendItem>
                            </DonutLegend>
                          </div>
                        )}
                      </div>
                    </ChartContent>
                  </ChartCard>

                  {/* Department Performance Analysis Chart */}
                  <ChartCard>
                    <ChartHeader>
                      <ChartTitle isRTL={isRTL}>{t('analytics.departmentPerformance')}</ChartTitle>
                      <ChartControls>
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
                        <ComparisonToggle 
                          $isActive={getChartComparison('department-performance').isActive}
                          onClick={() => toggleChartComparison('department-performance')}
                        >
                          {getChartComparison('department-performance').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                        </ComparisonToggle>
                      </ChartControls>
                    </ChartHeader>
                    <div style={{
                      fontSize: '12px',
                      color: isDarkMode ? '#b0b0b0' : '#666',
                      margin: '0 0 10px 0',
                      padding: '0 20px',
                      textAlign: isRTL ? 'right' : 'left'
                    }}>
                      {t('analytics.departmentPerformanceDesc')}
                    </div>
                    

                    
                    <ComparisonControls $isVisible={getChartComparison('department-performance').isActive}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        fontSize: '12px',
                        color: isDarkMode ? '#b0b0b0' : '#666'
                      }}>
                        <span>{t('comparison.compareWith')}:</span>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                        <ComparisonPeriodButton 
                          $isRTL={isRTL}
                            onClick={() => toggleChartDatePicker('department-performance')}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              minWidth: 'auto',
                              height: 'auto'
                            }}
                          >
                            <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                            {getChartComparison('department-performance').comparisonDateRange.label}
                        </ComparisonPeriodButton>
                          {getChartComparison('department-performance').isDatePickerOpen && (
                          <div style={{ 
                            position: 'absolute', 
                            top: '100%', 
                            left: 0, 
                              zIndex: 10001, 
                            marginTop: '4px',
                              transform: 'scale(0.75)',
                            transformOrigin: 'top left'
                          }}>
                              <AnalyticsDateRangePicker
                                value={getChartComparison('department-performance').comparisonDateRange}
                                onChange={(range) => updateChartComparisonDateRange('department-performance', range)}
                                onClose={() => toggleChartDatePicker('department-performance')}
                            />
                          </div>
                        )}
                      </div>
                        <span>{t('comparison.vs')} {t('comparison.current')}: {analyticsDateRange.label}</span>
                      </div>
                    </ComparisonControls>
                    
                    <ChartContent>
                      <div className="chart-container" style={{ 
                        width: '100%', 
                        height: '100%', 
                        overflow: 'visible',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                                              {getChartComparison('department-performance').isActive ? (
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '15px', 
                          height: '100%'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            height: '100%'
                          }}>
                            <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                              Current: {analyticsDateRange.label}
                            </h5>
                            <div style={{ flex: 1, minHeight: 0 }}>
                              <BarChart data={getDepartmentDataByMetric(statisticsData, selectedMetric)} isDarkMode={isDarkMode} />
                            </div>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            height: '100%'
                          }}>
                            <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                              Compare: {getChartComparison('department-performance').comparisonDateRange.label}
                            </h5>
                            <div style={{ flex: 1, minHeight: 0 }}>
                              <BarChart data={getComparisonChartData('department-performance')} isDarkMode={isDarkMode} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ height: '100%', width: '100%' }}>
                          <BarChart data={getDepartmentDataByMetric(statisticsData, selectedMetric)} isDarkMode={isDarkMode} />
                        </div>
                      )}
                      </div>
                    </ChartContent>
                  </ChartCard>
                </ChartsGrid>

                {/* Weekly Patterns Full Width */}
                <FullWidthChart>
                  <ChartHeader>
                    <ChartTitle isRTL={isRTL}>{t('analytics.weeklyAttendancePatterns')}</ChartTitle>
                    <ChartControls>
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
                      <ComparisonToggle 
                        $isActive={getChartComparison('weekly-patterns').isActive}
                        onClick={() => toggleChartComparison('weekly-patterns')}
                      >
                        {getChartComparison('weekly-patterns').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                      </ComparisonToggle>
                    </ChartControls>
                  </ChartHeader>
                  <div style={{
                    fontSize: '12px',
                    color: isDarkMode ? '#b0b0b0' : '#666',
                    margin: '0 0 10px 0',
                    padding: '0 20px',
                    textAlign: isRTL ? 'right' : 'left'
                  }}>
                    {t('analytics.weeklyAttendancePatternsDesc')}
                  </div>
                  

                  
                  <ComparisonControls $isVisible={getChartComparison('weekly-patterns').isActive}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontSize: '12px',
                      color: isDarkMode ? '#b0b0b0' : '#666'
                    }}>
                      <span>{t('comparison.compareWith')}:</span>
                      <div style={{ position: 'relative', zIndex: 1 }}>
                      <ComparisonPeriodButton 
                        $isRTL={isRTL}
                          onClick={() => toggleChartDatePicker('weekly-patterns')}
                          style={{
                            padding: '4px 8px',
                            fontSize: '11px',
                            minWidth: 'auto',
                            height: 'auto'
                          }}
                        >
                          <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                          {getChartComparison('weekly-patterns').comparisonDateRange.label}
                      </ComparisonPeriodButton>
                        {getChartComparison('weekly-patterns').isDatePickerOpen && (
                        <div style={{ 
                          position: 'absolute', 
                          top: '100%', 
                          left: 0, 
                            zIndex: 10001, 
                          marginTop: '4px',
                            transform: 'scale(0.75)',
                          transformOrigin: 'top left'
                        }}>
                            <AnalyticsDateRangePicker
                              value={getChartComparison('weekly-patterns').comparisonDateRange}
                              onChange={(range) => updateChartComparisonDateRange('weekly-patterns', range)}
                              onClose={() => toggleChartDatePicker('weekly-patterns')}
                          />
                        </div>
                      )}
                    </div>
                      <span>{t('comparison.vs')} {t('comparison.current')}: {analyticsDateRange.label}</span>
                    </div>
                  </ComparisonControls>
                  
                  <div className="chart-container">
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      overflow: 'visible',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      {getChartComparison('weekly-patterns').isActive ? (
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '15px', 
                          height: '100%'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            height: '100%'
                          }}>
                            <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                              Current: {analyticsDateRange.label}
                            </h5>
                            <div style={{ flex: 1, minHeight: 0 }}>
                              {renderWeeklyAttendanceChart(chartType, [
                                { name: 'Monday', value: 92 },
                                { name: 'Tuesday', value: 94 },
                                { name: 'Wednesday', value: 89 },
                                { name: 'Thursday', value: 91 },
                                { name: 'Friday', value: 88 },
                                { name: 'Saturday', value: 85 },
                                { name: 'Sunday', value: 87 }
                              ], isDarkMode)}
                            </div>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            height: '100%'
                          }}>
                            <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                              Compare: {getChartComparison('weekly-patterns').comparisonDateRange.label}
                            </h5>
                            <div style={{ flex: 1, minHeight: 0 }}>
                              {renderWeeklyAttendanceChart(chartType, getComparisonChartData('weekly-patterns'), isDarkMode)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ height: '100%', width: '100%' }}>
                          {renderWeeklyAttendanceChart(chartType, [
                            { name: 'Monday', value: 92 },
                            { name: 'Tuesday', value: 94 },
                            { name: 'Wednesday', value: 89 },
                            { name: 'Thursday', value: 91 },
                            { name: 'Friday', value: 88 },
                            { name: 'Saturday', value: 85 },
                            { name: 'Sunday', value: 87 }
                          ], isDarkMode)}
                        </div>
                      )}
                    </div>
                  </div>
                </FullWidthChart>

                {/* Teacher Ranking Table */}
                <TableSection>
                  <TableTitle isRTL={isRTL}>{t('analytics.teacherPerformanceRanking')}</TableTitle>
                  <div style={{
                    fontSize: '12px',
                    color: isDarkMode ? '#b0b0b0' : '#666',
                    margin: '0 0 10px 0',
                    textAlign: isRTL ? 'right' : 'left'
                  }}>
                    {t('analytics.teachersPerformanceComparisonDesc')}
                  </div>
                  <StatsTable>
                    <StatsTableHeader>
                      <StatsTableHeaderRow>
                        <StatsTableHeaderCell $alignLeft={true} isRTL={isRTL} $isFirstColumn={true}>{t('analytics.teacher')}</StatsTableHeaderCell>
                        <StatsTableHeaderCell isRTL={isRTL}>{t('analytics.department')}</StatsTableHeaderCell>
                        <StatsTableHeaderCell isRTL={isRTL}>{t('analytics.attendanceRateCol')}</StatsTableHeaderCell>
                        <StatsTableHeaderCell isRTL={isRTL}>{t('analytics.punctuality')}</StatsTableHeaderCell>
                        <StatsTableHeaderCell isRTL={isRTL}>{t('analytics.performance')}</StatsTableHeaderCell>
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
                              <StatsTableCell $alignLeft={true} isRTL={isRTL} $isFirstColumn={true}>{teacher.name}</StatsTableCell>
                              <StatsTableCell isRTL={isRTL}>{translateSubject(teacher.subject)}</StatsTableCell>
                              <StatsTableCell isRTL={isRTL}>{teacher.attendanceRate}%</StatsTableCell>
                              <StatsTableCell isRTL={isRTL}>{teacher.punctualityScore}%</StatsTableCell>
                              <StatsTableCell isRTL={isRTL}>
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

                <CollapsibleSectionComponent
                  title={t('analytics.departmentComparisons')}
                  description={t('analytics.departmentComparisonsDesc')}
                  isOpen={departmentComparisonsOpen}
                  onToggle={() => setDepartmentComparisonsOpen(!departmentComparisonsOpen)}
                  isRTL={isRTL}
                >
                  <SectionChartsGrid>
                    {/* Absence Comparison Chart */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.departmentAbsenceComparison')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('dept-absence-comparison').isActive}
                            onClick={() => toggleChartComparison('dept-absence-comparison')}
                          >
                            {getChartComparison('dept-absence-comparison').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      
                      <ComparisonControls $isVisible={getChartComparison('dept-absence-comparison').isActive}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontSize: '12px',
                          color: isDarkMode ? '#b0b0b0' : '#666'
                        }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative' }}>
                            <ComparisonPeriodButton 
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('dept-absence-comparison')}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px'
                              }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('dept-absence-comparison').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('dept-absence-comparison').isDatePickerOpen && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 10001, 
                                marginTop: '4px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('dept-absence-comparison').comparisonDateRange}
                                  onChange={(newRange) => handleChartDateRangeChange('dept-absence-comparison', newRange)}
                                  onClose={() => toggleChartDatePicker('dept-absence-comparison')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      


                      <ChartContent>
                        {getChartComparison('dept-absence-comparison').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.current')} {analyticsDateRange.label}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={[
                                    { name: 'Math', value: 15 },
                                    { name: 'Science', value: 12 },
                                    { name: 'English', value: 18 },
                                    { name: 'Arabic', value: 8 },
                                    { name: 'History', value: 10 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.compare')}: {getChartComparison('dept-absence-comparison').comparisonDateRange.label}
                              </ComparisonSubTitle>
                                                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={[
                                    { name: 'Math', value: 12 },
                                    { name: 'Science', value: 10 },
                                    { name: 'English', value: 16 },
                                    { name: 'Arabic', value: 6 },
                                    { name: 'History', value: 8 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={[
                                { name: 'Math', value: 15 },
                                { name: 'Science', value: 12 },
                                { name: 'English', value: 18 },
                                { name: 'Arabic', value: 8 },
                                { name: 'History', value: 10 }
                              ]} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Early Leave Comparison Chart */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.departmentEarlyLeaveComparison')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('dept-early-leave-comparison').isActive}
                            onClick={() => toggleChartComparison('dept-early-leave-comparison')}
                          >
                            {getChartComparison('dept-early-leave-comparison').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      
                      <ComparisonControls $isVisible={getChartComparison('dept-early-leave-comparison').isActive}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontSize: '12px',
                          color: isDarkMode ? '#b0b0b0' : '#666'
                        }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative' }}>
                            <ComparisonPeriodButton 
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('dept-early-leave-comparison')}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px'
                              }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('dept-early-leave-comparison').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('dept-early-leave-comparison').isDatePickerOpen && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 10001, 
                                marginTop: '4px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('dept-early-leave-comparison').comparisonDateRange}
                                  onChange={(newRange) => handleChartDateRangeChange('dept-early-leave-comparison', newRange)}
                                  onClose={() => toggleChartDatePicker('dept-early-leave-comparison')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      


                      <ChartContent>
                        {getChartComparison('dept-early-leave-comparison').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.current')} {analyticsDateRange.label}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={[
                                    { name: 'Math', value: 5 },
                                    { name: 'Science', value: 8 },
                                    { name: 'English', value: 3 },
                                    { name: 'Arabic', value: 6 },
                                    { name: 'History', value: 4 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.compare')}: {getChartComparison('dept-early-leave-comparison').comparisonDateRange.label}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={[
                                    { name: 'Math', value: 3 },
                                    { name: 'Science', value: 6 },
                                    { name: 'English', value: 2 },
                                    { name: 'Arabic', value: 4 },
                                    { name: 'History', value: 3 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={[
                                { name: 'Math', value: 5 },
                                { name: 'Science', value: 8 },
                                { name: 'English', value: 3 },
                                { name: 'Arabic', value: 6 },
                                { name: 'History', value: 4 }
                              ]} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Late Arrival Comparison Chart */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.departmentLateArrivalComparison')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('dept-late-arrival-comparison').isActive}
                            onClick={() => toggleChartComparison('dept-late-arrival-comparison')}
                          >
                            {getChartComparison('dept-late-arrival-comparison').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      
                      <ComparisonControls $isVisible={getChartComparison('dept-late-arrival-comparison').isActive}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontSize: '12px',
                          color: isDarkMode ? '#b0b0b0' : '#666'
                        }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative' }}>
                            <ComparisonPeriodButton 
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('dept-late-arrival-comparison')}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px'
                              }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('dept-late-arrival-comparison').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('dept-late-arrival-comparison').isDatePickerOpen && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 10001, 
                                marginTop: '4px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('dept-late-arrival-comparison').comparisonDateRange}
                                  onChange={(newRange) => handleChartDateRangeChange('dept-late-arrival-comparison', newRange)}
                                  onClose={() => toggleChartDatePicker('dept-late-arrival-comparison')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      


                      <ChartContent>
                        {getChartComparison('dept-late-arrival-comparison').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.current')} {analyticsDateRange.label}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getCurrentChartData('dept-late-arrival-comparison')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.compare')}: {getChartComparison('dept-late-arrival-comparison').comparisonDateRange.label}
                                {getChartComparison('dept-late-arrival-comparison').loading && ' (Loading...)'}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getComparisonChartData('dept-late-arrival-comparison')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={getCurrentChartData('dept-late-arrival-comparison')} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>
                  </SectionChartsGrid>
                </CollapsibleSectionComponent>

                {/* Department Requests */}
                <CollapsibleSectionComponent
                  title={t('analytics.departmentRequests')}
                  isOpen={departmentRequestsOpen}
                  onToggle={() => setDepartmentRequestsOpen(!departmentRequestsOpen)}
                  isRTL={isRTL}
                >
                  <div style={{
                    fontSize: '12px',
                    color: isDarkMode ? '#b0b0b0' : '#666',
                    margin: '-10px 0 20px 0',
                    padding: '0 20px',
                    textAlign: isRTL ? 'right' : 'left'
                  }}>
                    {t('analytics.departmentRequestsDesc')}
                  </div>


                  <SectionChartsGrid>
                    {/* Absence Requests Chart */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.absenceRequests')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('dept-absence-requests').isActive}
                            onClick={() => toggleChartComparison('dept-absence-requests')}
                          >
                            {getChartComparison('dept-absence-requests').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      
                      <ComparisonControls $isVisible={getChartComparison('dept-absence-requests').isActive}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontSize: '12px',
                          color: isDarkMode ? '#b0b0b0' : '#666'
                        }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative' }}>
                            <ComparisonPeriodButton 
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('dept-absence-requests')}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px'
                              }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('dept-absence-requests').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('dept-absence-requests').isDatePickerOpen && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 10001, 
                                marginTop: '4px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('dept-absence-requests').comparisonDateRange}
                                  onChange={(newRange) => handleChartDateRangeChange('dept-absence-requests', newRange)}
                                  onClose={() => toggleChartDatePicker('dept-absence-requests')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      


                      <ChartContent>
                        {getChartComparison('dept-absence-requests').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%'
                            }}>
                              <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                Current: {t(`periods.${comparisonPeriod}`)}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0 }}>
                                <BarChart 
                                  data={[
                                    { name: 'Math', value: 12 },
                                    { name: 'Science', value: 15 },
                                    { name: 'English', value: 9 },
                                    { name: 'Arabic', value: 11 },
                                    { name: 'History', value: 13 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%'
                            }}>
                              <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                Compare: {t(`periods.${comparisonPeriod}`)}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0 }}>
                                <BarChart 
                                  data={[
                                    { name: 'Math', value: 10 },
                                    { name: 'Science', value: 12 },
                                    { name: 'English', value: 7 },
                                    { name: 'Arabic', value: 9 },
                                    { name: 'History', value: 11 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={[
                                { name: 'Math', value: 12 },
                                { name: 'Science', value: 15 },
                                { name: 'English', value: 9 },
                                { name: 'Arabic', value: 11 },
                                { name: 'History', value: 13 }
                              ]} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Early Leave Requests Chart */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.earlyLeavesRequests')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('dept-early-leave-requests').isActive}
                            onClick={() => toggleChartComparison('dept-early-leave-requests')}
                          >
                            {getChartComparison('dept-early-leave-requests').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      


                      <ComparisonControls $isVisible={getChartComparison('dept-early-leave-requests').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton
                              onClick={() => toggleChartDatePicker('dept-early-leave-requests')}
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              📅 {getChartComparison('dept-early-leave-requests').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('dept-early-leave-requests').isDatePickerOpen && (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left',
                                zIndex: 10001
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('dept-early-leave-requests').comparisonDateRange}
                                  onChange={(dateRange) => handleChartDateRangeChange('dept-early-leave-requests', dateRange)}
                                  onClose={() => toggleChartDatePicker('dept-early-leave-requests')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>

                      <ChartContent>
                        {getChartComparison('dept-early-leave-requests').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <h5 style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666', textAlign: 'center', fontWeight: '600' }}>
                                Current: {analyticsDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getCurrentChartData('dept-early-leave-requests')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <h5 style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666', textAlign: 'center', fontWeight: '600' }}>
                                Compare: {getChartComparison('dept-early-leave-requests').comparisonDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getComparisonChartData('dept-early-leave-requests')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={[
                                { name: 'Math', value: 8 },
                                { name: 'Science', value: 12 },
                                { name: 'English', value: 6 },
                                { name: 'Arabic', value: 9 },
                                { name: 'History', value: 7 }
                              ]} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Late Arrival Requests Chart */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.lateArrivalRequests')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('dept-late-arrival-requests').isActive}
                            onClick={() => toggleChartComparison('dept-late-arrival-requests')}
                          >
                            {getChartComparison('dept-late-arrival-requests').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      


                      <ComparisonControls $isVisible={getChartComparison('dept-late-arrival-requests').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton
                              onClick={() => toggleChartDatePicker('dept-late-arrival-requests')}
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              📅 {getChartComparison('dept-late-arrival-requests').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('dept-late-arrival-requests').isDatePickerOpen && (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left',
                                zIndex: 10001
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('dept-late-arrival-requests').comparisonDateRange}
                                  onChange={(dateRange) => handleChartDateRangeChange('dept-late-arrival-requests', dateRange)}
                                  onClose={() => toggleChartDatePicker('dept-late-arrival-requests')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>

                      <ChartContent>
                        {getChartComparison('dept-late-arrival-requests').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.current')} {analyticsDateRange.label}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={[
                                    { name: 'Math', value: 4 },
                                    { name: 'Science', value: 7 },
                                    { name: 'English', value: 3 },
                                    { name: 'Arabic', value: 5 },
                                    { name: 'History', value: 6 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.compare')}: {getChartComparison('dept-late-arrival-requests').comparisonDateRange.label}
                                {getChartComparison('dept-late-arrival-requests').loading && ' (Loading...)'}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getComparisonChartData('dept-late-arrival-requests')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={[
                                { name: 'Math', value: 4 },
                                { name: 'Science', value: 7 },
                                { name: 'English', value: 3 },
                                { name: 'Arabic', value: 5 },
                                { name: 'History', value: 6 }
                              ]} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>
                  </SectionChartsGrid>
                </CollapsibleSectionComponent>

                {/* Teachers Performance Comparison */}
                <CollapsibleSectionComponent
                  title={t('analytics.teachersPerformanceComparison')}
                  isOpen={teachersComparisonOpen}
                  onToggle={() => setTeachersComparisonOpen(!teachersComparisonOpen)}
                  isRTL={isRTL}
                >
                  <SectionChartsGrid>
                    {/* Teacher Absence Comparison Chart */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.teacherAbsenceComparison')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('teacher-absence-comparison').isActive}
                            onClick={() => toggleChartComparison('teacher-absence-comparison')}
                          >
                            {getChartComparison('teacher-absence-comparison').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      


                      <ComparisonControls $isVisible={getChartComparison('teacher-absence-comparison').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton
                              onClick={() => toggleChartDatePicker('teacher-absence-comparison')}
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              📅 {getChartComparison('teacher-absence-comparison').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('teacher-absence-comparison').isDatePickerOpen && (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left',
                                zIndex: 10001
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('teacher-absence-comparison').comparisonDateRange}
                                  onChange={(dateRange) => handleChartDateRangeChange('teacher-absence-comparison', dateRange)}
                                  onClose={() => toggleChartDatePicker('teacher-absence-comparison')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>

                      <ChartContent>
                        {getChartComparison('teacher-absence-comparison').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.current')} {analyticsDateRange.label}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={[
                                    { name: 'Ahmed Ali', value: 2 },
                                    { name: 'Sara Omar', value: 1 },
                                    { name: 'Mohamed Hassan', value: 3 },
                                    { name: 'Fatima Ahmad', value: 0 },
                                    { name: 'Khalid Saeed', value: 2 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.compare')}: {getChartComparison('teacher-late-arrival-comparison').comparisonDateRange.label}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={[
                                    { name: 'Ahmed Ali', value: 1 },
                                    { name: 'Sara Omar', value: 0 },
                                    { name: 'Mohamed Hassan', value: 2 },
                                    { name: 'Fatima Ahmad', value: 1 },
                                    { name: 'Khalid Saeed', value: 1 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={[
                                { name: 'Ahmed Ali', value: 2 },
                                { name: 'Sara Omar', value: 1 },
                                { name: 'Mohamed Hassan', value: 3 },
                                { name: 'Fatima Ahmad', value: 0 },
                                { name: 'Khalid Saeed', value: 2 }
                              ]} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Teacher Early Leave Comparison Chart */}
                    <ChartCard>
                      <ChartHeader>
                          <ChartTitle isRTL={isRTL}>{t('analytics.teacherEarlyLeaveComparison')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                              $isActive={getChartComparison('teacher-early-leave-comparison').isActive}
                              onClick={() => toggleChartComparison('teacher-early-leave-comparison')}
                          >
                              {getChartComparison('teacher-early-leave-comparison').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      


                        <ComparisonControls $isVisible={getChartComparison('teacher-early-leave-comparison').isActive}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                            <span>{t('comparison.compareWith')}:</span>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                              <ComparisonPeriodButton
                                onClick={() => toggleChartDatePicker('teacher-early-leave-comparison')}
                                style={{ fontSize: '11px', padding: '4px 8px' }}
                              >
                                📅 {getChartComparison('teacher-early-leave-comparison').comparisonDateRange.label}
                              </ComparisonPeriodButton>
                              {getChartComparison('teacher-early-leave-comparison').isDatePickerOpen && (
                                <div style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  transform: 'scale(0.75)',
                                  transformOrigin: 'top left',
                                  zIndex: 10001
                                }}>
                                  <AnalyticsDateRangePicker
                                    value={getChartComparison('teacher-early-leave-comparison').comparisonDateRange}
                                    onChange={(dateRange) => handleChartDateRangeChange('teacher-early-leave-comparison', dateRange)}
                                    onClose={() => toggleChartDatePicker('teacher-early-leave-comparison')}
                                  />
                                </div>
                              )}
                            </div>
                            <span>{t('comparison.vs')}</span>
                            <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                          </div>
                        </ComparisonControls>

                      <ChartContent>
                          {getChartComparison('teacher-early-leave-comparison').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <h5 style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666', textAlign: 'center', fontWeight: '600' }}>
                                Current: {analyticsDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={[
                                    { name: 'Ahmed Ali', value: 2 },
                                    { name: 'Sara Hassan', value: 4 },
                                    { name: 'Mohamed Omar', value: 1 },
                                    { name: 'Fatima Nour', value: 6 },
                                    { name: 'Hassan Ibrahim', value: 3 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <h5 style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666', textAlign: 'center', fontWeight: '600' }}>
                                Compare: {getChartComparison('teacher-late-arrival-comparison').comparisonDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={[
                                    { name: 'Ahmed Ali', value: 1 },
                                    { name: 'Sara Hassan', value: 2 },
                                    { name: 'Mohamed Omar', value: 1 },
                                    { name: 'Fatima Nour', value: 4 },
                                    { name: 'Hassan Ibrahim', value: 2 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={[
                                { name: 'Ahmed Ali', value: 2 },
                                { name: 'Sara Hassan', value: 4 },
                                { name: 'Mohamed Omar', value: 1 },
                                { name: 'Fatima Nour', value: 6 },
                                { name: 'Hassan Ibrahim', value: 3 }
                              ]} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Teacher Late Arrival Comparison Chart */}
                    <ChartCard>
                      <ChartHeader>
                          <ChartTitle isRTL={isRTL}>{t('analytics.teacherLateArrivalComparison')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                              $isActive={getChartComparison('teacher-late-arrival-comparison').isActive}
                              onClick={() => toggleChartComparison('teacher-late-arrival-comparison')}
                          >
                              {getChartComparison('teacher-late-arrival-comparison').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      


                        <ComparisonControls $isVisible={getChartComparison('teacher-late-arrival-comparison').isActive}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                            <span>{t('comparison.compareWith')}:</span>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                              <ComparisonPeriodButton
                                onClick={() => toggleChartDatePicker('teacher-late-arrival-comparison')}
                                style={{ fontSize: '11px', padding: '4px 8px' }}
                              >
                                📅 {getChartComparison('teacher-late-arrival-comparison').comparisonDateRange.label}
                              </ComparisonPeriodButton>
                              {getChartComparison('teacher-late-arrival-comparison').isDatePickerOpen && (
                                <div style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  transform: 'scale(0.75)',
                                  transformOrigin: 'top left',
                                  zIndex: 10001
                                }}>
                                  <AnalyticsDateRangePicker
                                    value={getChartComparison('teacher-late-arrival-comparison').comparisonDateRange}
                                    onChange={(dateRange) => handleChartDateRangeChange('teacher-late-arrival-comparison', dateRange)}
                                    onClose={() => toggleChartDatePicker('teacher-late-arrival-comparison')}
                                  />
                                </div>
                              )}
                            </div>
                            <span>{t('comparison.vs')}</span>
                            <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                          </div>
                        </ComparisonControls>

                      <ChartContent>
                          {getChartComparison('teacher-late-arrival-comparison').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '15px', 
                            height: '300px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%'
                            }}>
                              <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                Current: {t(`periods.${comparisonPeriod}`)}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0 }}>
                                <BarChart 
                                  data={[
                                    { name: 'Ahmed Ali', value: 3 },
                                    { name: 'Sara Hassan', value: 7 },
                                    { name: 'Mohamed Omar', value: 2 },
                                    { name: 'Fatima Nour', value: 9 },
                                    { name: 'Hassan Ibrahim', value: 4 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%'
                            }}>
                              <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                Compare: {t(`periods.${comparisonPeriod}`)}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0 }}>
                                <BarChart 
                                  data={[
                                    { name: 'Ahmed Ali', value: 2 },
                                    { name: 'Sara Hassan', value: 5 },
                                    { name: 'Mohamed Omar', value: 1 },
                                    { name: 'Fatima Nour', value: 7 },
                                    { name: 'Hassan Ibrahim', value: 3 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ height: '300px', width: '100%' }}>
                            <BarChart 
                              data={[
                                { name: 'Ahmed Ali', value: 3 },
                                { name: 'Sara Hassan', value: 7 },
                                { name: 'Mohamed Omar', value: 2 },
                                { name: 'Fatima Nour', value: 9 },
                                { name: 'Hassan Ibrahim', value: 4 }
                              ]} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Teacher Absence Requests Chart */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.teacherAbsenceRequests')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('teacher-absence-requests').isActive}
                            onClick={() => toggleChartComparison('teacher-absence-requests')}
                          >
                            {getChartComparison('teacher-absence-requests').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      <ComparisonControls $isVisible={getChartComparison('teacher-absence-requests').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton 
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('teacher-absence-requests')}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('teacher-absence-requests').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('teacher-absence-requests').isDatePickerOpen && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 10001, 
                                marginTop: '4px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('teacher-absence-requests').comparisonDateRange}
                                  onChange={(newRange) => handleChartDateRangeChange('teacher-absence-requests', newRange)}
                                  onClose={() => toggleChartDatePicker('teacher-absence-requests')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      


                      <ChartContent>
                        {getChartComparison('teacher-absence-requests').isActive ? (
                          renderComparisonChart(
                            'teacher-absence-requests',
                            getCurrentChartData('teacher-absence-requests'),
                            getComparisonChartData('teacher-absence-requests')
                          )
                        ) : (
                          <div style={{ height: '300px', width: '100%' }}>
                            <BarChart 
                              data={getCurrentChartData('teacher-absence-requests')} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Teacher Early Leave Requests Chart */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.teacherEarlyLeaveRequests')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('teacher-early-leave-requests-chart').isActive}
                            onClick={() => toggleChartComparison('teacher-early-leave-requests-chart')}
                          >
                            {getChartComparison('teacher-early-leave-requests-chart').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      <ComparisonControls $isVisible={getChartComparison('teacher-early-leave-requests-chart').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton 
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('teacher-early-leave-requests-chart')}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('teacher-early-leave-requests-chart').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('teacher-early-leave-requests-chart').isDatePickerOpen && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 10001, 
                                marginTop: '4px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('teacher-early-leave-requests-chart').comparisonDateRange}
                                  onChange={(newRange) => handleChartDateRangeChange('teacher-early-leave-requests-chart', newRange)}
                                  onClose={() => toggleChartDatePicker('teacher-early-leave-requests-chart')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      


                      <ChartContent>
                        {getChartComparison('teacher-early-leave-requests-chart').isActive ? (
                          renderComparisonChart(
                            'teacher-early-leave-requests-chart',
                            getCurrentChartData('teacher-early-leave-requests-chart'),
                            getComparisonChartData('teacher-early-leave-requests-chart')
                          )
                        ) : (
                          <div style={{ height: '300px', width: '100%' }}>
                            <BarChart 
                              data={[
                                { name: 'Ahmed Ali', value: 4 },
                                { name: 'Sara Hassan', value: 6 },
                                { name: 'Mohamed Omar', value: 2 },
                                { name: 'Fatima Nour', value: 8 },
                                { name: 'Hassan Ibrahim', value: 5 }
                              ]} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Teacher Late Arrival Requests Chart */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.teacherLateArrivalRequests')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('teacher-late-arrival-requests-chart').isActive}
                            onClick={() => toggleChartComparison('teacher-late-arrival-requests-chart')}
                          >
                            {getChartComparison('teacher-late-arrival-requests-chart').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      <ComparisonControls $isVisible={getChartComparison('teacher-late-arrival-requests-chart').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton 
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('teacher-late-arrival-requests-chart')}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('teacher-late-arrival-requests-chart').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('teacher-late-arrival-requests-chart').isDatePickerOpen && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 10001, 
                                marginTop: '4px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('teacher-late-arrival-requests-chart').comparisonDateRange}
                                  onChange={(newRange) => handleChartDateRangeChange('teacher-late-arrival-requests-chart', newRange)}
                                  onClose={() => toggleChartDatePicker('teacher-late-arrival-requests-chart')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      


                      <ChartContent>
                        {getChartComparison('teacher-late-arrival-requests-chart').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '15px', 
                            height: '300px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%'
                            }}>
                              <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                Current: {analyticsDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0 }}>
                                <BarChart 
                                  data={[
                                    { name: 'Ahmed Ali', value: 3 },
                                    { name: 'Sara Hassan', value: 5 },
                                    { name: 'Mohamed Omar', value: 1 },
                                    { name: 'Fatima Nour', value: 7 },
                                    { name: 'Hassan Ibrahim', value: 4 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%'
                            }}>
                              <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                Compare: {getChartComparison('teacher-late-arrival-requests-chart').comparisonDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0 }}>
                                <BarChart 
                                  data={getComparisonChartData('teacher-late-arrival-requests-chart')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ height: '300px', width: '100%' }}>
                            <BarChart 
                              data={[
                                { name: 'Ahmed Ali', value: 3 },
                                { name: 'Sara Hassan', value: 5 },
                                { name: 'Mohamed Omar', value: 1 },
                                { name: 'Fatima Nour', value: 7 },
                                { name: 'Hassan Ibrahim', value: 4 }
                              ]} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>
                  </SectionChartsGrid>
                </CollapsibleSectionComponent>

                {/* Department Performance Tracking */}
                <CollapsibleSectionComponent
                  title={t('analytics.departmentPerformanceTracking')}
                  isOpen={departmentTrackingOpen}
                  onToggle={() => setDepartmentTrackingOpen(!departmentTrackingOpen)}
                  isRTL={isRTL}
                >
                  <div style={{
                    fontSize: '12px',
                    color: isDarkMode ? '#b0b0b0' : '#666',
                    margin: '-10px 0 20px 0',
                    padding: '0 20px',
                    textAlign: isRTL ? 'right' : 'left'
                  }}>
                    {t('analytics.departmentPerformanceTrackingDesc')}
                  </div>


                  <SectionChartsGrid>
                    {/* Department Registered Absence Tracking */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.departmentRegisteredAbsenceTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('dept-registered-absence-tracking').isActive}
                            onClick={() => toggleChartComparison('dept-registered-absence-tracking')}
                          >
                            {getChartComparison('dept-registered-absence-tracking').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      <ComparisonControls $isVisible={getChartComparison('dept-registered-absence-tracking').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton 
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('dept-registered-absence-tracking')}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('dept-registered-absence-tracking').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('dept-registered-absence-tracking').isDatePickerOpen && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 10001, 
                                marginTop: '4px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('dept-registered-absence-tracking').comparisonDateRange}
                                  onChange={(newRange) => handleChartDateRangeChange('dept-registered-absence-tracking', newRange)}
                                  onClose={() => toggleChartDatePicker('dept-registered-absence-tracking')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')} {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      <ChartContent>
                        {getChartComparison('dept-registered-absence-tracking').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.current')} {analyticsDateRange.label}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                          <BarChart 
                                  data={getCurrentChartData('dept-registered-absence-tracking')} 
                            isDarkMode={isDarkMode} 
                          />
                        </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.compare')}: {getChartComparison('dept-registered-absence-tracking').comparisonDateRange.label}
                                {getChartComparison('dept-registered-absence-tracking').loading && ' (Loading...)'}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getComparisonChartData('dept-registered-absence-tracking')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                                    <div style={{ 
            height: '380px', 
            width: '100%', 
            padding: '15px', 
            background: '#fafafa', 
            borderRadius: '8px',
            marginTop: '10px'
          }}>
            <BarChart 
              data={getCurrentChartData('dept-registered-absence-tracking')} 
              isDarkMode={isDarkMode} 
            />
          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Department Registered Early Leaves Tracking */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.departmentRegisteredEarlyLeavesTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('dept-registered-early-leaves-tracking').isActive}
                            onClick={() => toggleChartComparison('dept-registered-early-leaves-tracking')}
                          >
                            {getChartComparison('dept-registered-early-leaves-tracking').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      <ComparisonControls $isVisible={getChartComparison('dept-registered-early-leaves-tracking').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton 
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('dept-registered-early-leaves-tracking')}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('dept-registered-early-leaves-tracking').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('dept-registered-early-leaves-tracking').isDatePickerOpen && (
                              <>
                                <div style={{
                                  position: 'fixed',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: 'transparent',
                                  zIndex: 10000,
                                }} onClick={() => toggleChartDatePicker('dept-registered-early-leaves-tracking')} />
                                <div style={{ 
                                  position: 'absolute', 
                                  top: '100%', 
                                  left: 0, 
                                  zIndex: 10001, 
                                  marginTop: '4px',
                                  transform: 'scale(0.75)',
                                  transformOrigin: 'top left'
                                }}>
                                  <AnalyticsDateRangePicker
                                    value={getChartComparison('dept-registered-early-leaves-tracking').comparisonDateRange}
                                    onChange={(newRange) => handleChartDateRangeChange('dept-registered-early-leaves-tracking', newRange)}
                                    onClose={() => toggleChartDatePicker('dept-registered-early-leaves-tracking')}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')} {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>

                      <ChartContent>
                        {getChartComparison('dept-registered-early-leaves-tracking').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.current')} {analyticsDateRange.label}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getCurrentChartData('dept-registered-early-leaves-tracking')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.compare')}: {getChartComparison('dept-registered-early-leaves-tracking').comparisonDateRange.label}
                                {getChartComparison('dept-registered-early-leaves-tracking').loading && ' (Loading...)'}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getComparisonChartData('dept-registered-early-leaves-tracking')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={getCurrentChartData('dept-registered-early-leaves-tracking')} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Department Registered Late Arrival Tracking */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.departmentRegisteredLateArrivalTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('dept-registered-late-arrival-tracking').isActive}
                            onClick={() => toggleChartComparison('dept-registered-late-arrival-tracking')}
                          >
                            {getChartComparison('dept-registered-late-arrival-tracking').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      <ComparisonControls $isVisible={getChartComparison('dept-registered-late-arrival-tracking').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton 
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('dept-registered-late-arrival-tracking')}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('dept-registered-late-arrival-tracking').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('dept-registered-late-arrival-tracking').isDatePickerOpen && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 10001, 
                                marginTop: '4px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('dept-registered-late-arrival-tracking').comparisonDateRange}
                                  onChange={(newRange) => handleChartDateRangeChange('dept-registered-late-arrival-tracking', newRange)}
                                  onClose={() => toggleChartDatePicker('dept-registered-late-arrival-tracking')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')} {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      <ChartContent>
                        {getChartComparison('dept-registered-late-arrival-tracking').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.current')} {analyticsDateRange.label}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getCurrentChartData('dept-registered-late-arrival-tracking')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.compare')}: {getChartComparison('dept-registered-late-arrival-tracking').comparisonDateRange.label}
                                {getChartComparison('dept-registered-late-arrival-tracking').loading && ' (Loading...)'}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getComparisonChartData('dept-registered-late-arrival-tracking')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={getCurrentChartData('dept-registered-late-arrival-tracking')} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Department Absence Requests Tracking */}
                    <ChartCard>
                      <ChartHeader>
                          <ChartTitle isRTL={isRTL}>{t('analytics.departmentAbsenceRequestsTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                              $isActive={getChartComparison('dept-absence-requests-tracking-2').isActive}
                              onClick={() => toggleChartComparison('dept-absence-requests-tracking-2')}
                          >
                              {getChartComparison('dept-absence-requests-tracking-2').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      <ComparisonControls $isVisible={getChartComparison('dept-absence-requests-tracking-2').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('dept-absence-requests-tracking-2')}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('dept-absence-requests-tracking-2').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('dept-absence-requests-tracking-2').isDatePickerOpen && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 10001, 
                                marginTop: '4px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('dept-absence-requests-tracking-2').comparisonDateRange}
                                  onChange={(dateRange) => handleChartDateRangeChange('dept-absence-requests-tracking-2', dateRange)}
                                  onClose={() => toggleChartDatePicker('dept-absence-requests-tracking-2')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      <ChartContent>
                        {getChartComparison('dept-absence-requests-tracking-2').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '300px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <h5 style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666', textAlign: 'center', fontWeight: '600' }}>
                                Current: {analyticsDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getCurrentChartData('dept-absence-requests-tracking-2')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <h5 style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666', textAlign: 'center', fontWeight: '600' }}>
                                Compare: {getChartComparison('dept-absence-requests-tracking-2').comparisonDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getComparisonChartData('dept-absence-requests-tracking-2')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ height: '300px', width: '100%' }}>
                            <BarChart 
                              data={getCurrentChartData('dept-absence-requests-tracking-2')} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Department Early Leave Requests Tracking */}
                    <ChartCard>
                      <ChartHeader>
                          <ChartTitle isRTL={isRTL}>{t('analytics.departmentEarlyLeaveRequestsTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                              $isActive={getChartComparison('dept-early-leave-requests-tracking').isActive}
                              onClick={() => toggleChartComparison('dept-early-leave-requests-tracking')}
                          >
                              {getChartComparison('dept-early-leave-requests-tracking').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>

                      <ComparisonControls $isVisible={getChartComparison('dept-early-leave-requests-tracking').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton
                              onClick={() => toggleChartDatePicker('dept-early-leave-requests-tracking')}
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              📅 {getChartComparison('dept-early-leave-requests-tracking').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('dept-early-leave-requests-tracking').isDatePickerOpen && (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left',
                                zIndex: 10001
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('dept-early-leave-requests-tracking').comparisonDateRange}
                                  onChange={(dateRange) => handleChartDateRangeChange('dept-early-leave-requests-tracking', dateRange)}
                                  onClose={() => toggleChartDatePicker('dept-early-leave-requests-tracking')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>

                      <ChartContent>
                        {getChartComparison('dept-early-leave-requests-tracking').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.current')} {analyticsDateRange.label}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getCurrentChartData('dept-early-leave-requests-tracking')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.compare')}: {getChartComparison('dept-early-leave-requests-tracking').comparisonDateRange.label}
                                {getChartComparison('dept-early-leave-requests-tracking').loading && ' (Loading...)'}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getComparisonChartData('dept-early-leave-requests-tracking')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={getCurrentChartData('dept-early-leave-requests-tracking')} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Department Late Arrival Requests Tracking */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.departmentLateArrivalRequestsTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('dept-late-arrival-requests-tracking').isActive}
                            onClick={() => toggleChartComparison('dept-late-arrival-requests-tracking')}
                          >
                            {getChartComparison('dept-late-arrival-requests-tracking').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      <ComparisonControls $isVisible={getChartComparison('dept-late-arrival-requests-tracking').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton 
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('dept-late-arrival-requests-tracking')}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('dept-late-arrival-requests-tracking').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('dept-late-arrival-requests-tracking').isDatePickerOpen && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 10001, 
                                marginTop: '4px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('dept-late-arrival-requests-tracking').comparisonDateRange}
                                  onChange={(newRange) => handleChartDateRangeChange('dept-late-arrival-requests-tracking', newRange)}
                                  onClose={() => toggleChartDatePicker('dept-late-arrival-requests-tracking')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')} {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      <ChartContent>
                        {getChartComparison('dept-late-arrival-requests-tracking').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.current')} {analyticsDateRange.label}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={[
                                    { name: 'Jan', value: 15 },
                                    { name: 'Feb', value: 18 },
                                    { name: 'Mar', value: 12 },
                                    { name: 'Apr', value: 21 },
                                    { name: 'May', value: 16 },
                                    { name: 'Jun', value: 19 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.compare')}: {getChartComparison('dept-late-arrival-requests-tracking').comparisonDateRange.label}
                                {getChartComparison('dept-late-arrival-requests-tracking').loading && ' (Loading...)'}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getComparisonChartData('dept-late-arrival-requests-tracking')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={[
                                { name: 'Jan', value: 15 },
                                { name: 'Feb', value: 18 },
                                { name: 'Mar', value: 12 },
                                { name: 'Apr', value: 21 },
                                { name: 'May', value: 16 },
                                { name: 'Jun', value: 19 }
                              ]} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>
                  </SectionChartsGrid>
                </CollapsibleSectionComponent>

                {/* Teacher Performance Tracking */}
                <CollapsibleSectionComponent
                  title={t('analytics.teacherPerformanceTracking')}
                  isOpen={teacherTrackingOpen}
                  onToggle={() => setTeacherTrackingOpen(!teacherTrackingOpen)}
                  isRTL={isRTL}
                >
                  <div style={{
                    fontSize: '12px',
                    color: isDarkMode ? '#b0b0b0' : '#666',
                    margin: '-10px 0 20px 0',
                    padding: '0 20px',
                    textAlign: isRTL ? 'right' : 'left'
                  }}>
                    {t('analytics.departmentPerformanceTrackingDesc')}
                  </div>


                  <SectionChartsGrid>
                    {/* Teacher Registered Absence Tracking */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.teacherRegisteredAbsenceTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('teacher-registered-absence-tracking').isActive}
                            onClick={() => toggleChartComparison('teacher-registered-absence-tracking')}
                          >
                            {getChartComparison('teacher-registered-absence-tracking').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      <ComparisonControls $isVisible={getChartComparison('teacher-registered-absence-tracking').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton 
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('teacher-registered-absence-tracking')}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('teacher-registered-absence-tracking').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('teacher-registered-absence-tracking').isDatePickerOpen && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 10001, 
                                marginTop: '4px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('teacher-registered-absence-tracking').comparisonDateRange}
                                  onChange={(newRange) => handleChartDateRangeChange('teacher-registered-absence-tracking', newRange)}
                                  onClose={() => toggleChartDatePicker('teacher-registered-absence-tracking')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')} {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      <ChartContent>
                        {getChartComparison('teacher-registered-absence-tracking').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.current')} {analyticsDateRange.label}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                          <BarChart 
                                  data={getCurrentChartData('teacher-registered-absence-tracking')} 
                            isDarkMode={isDarkMode} 
                          />
                        </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.compare')}: {getChartComparison('teacher-registered-absence-tracking').comparisonDateRange.label}
                                {getChartComparison('teacher-registered-absence-tracking').loading && ' (Loading...)'}
                              </ComparisonSubTitle>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={getComparisonChartData('teacher-registered-absence-tracking')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={getCurrentChartData('teacher-registered-absence-tracking')} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Teacher Registered Early Leaves Tracking */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.teacherRegisteredEarlyLeavesTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('teacher-registered-early-leaves-tracking').isActive}
                            onClick={() => toggleChartComparison('teacher-registered-early-leaves-tracking')}
                          >
                            {getChartComparison('teacher-registered-early-leaves-tracking').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      <ComparisonControls $isVisible={getChartComparison('teacher-registered-early-leaves-tracking').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton 
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('teacher-registered-early-leaves-tracking')}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('teacher-registered-early-leaves-tracking').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('teacher-registered-early-leaves-tracking').isDatePickerOpen && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 10001, 
                                marginTop: '4px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('teacher-registered-early-leaves-tracking').comparisonDateRange}
                                  onChange={(newRange) => handleChartDateRangeChange('teacher-registered-early-leaves-tracking', newRange)}
                                  onClose={() => toggleChartDatePicker('teacher-registered-early-leaves-tracking')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')} {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      <ChartContent>
                        {getChartComparison('teacher-registered-early-leaves-tracking').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '15px', 
                            height: '300px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%'
                            }}>
                              <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                {t('comparison.current')}: {analyticsDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0 }}>
                                <BarChart 
                                  data={getCurrentChartData('teacher-registered-early-leaves-tracking')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%'
                            }}>
                              <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                {t('comparison.compare')}: {getChartComparison('teacher-registered-early-leaves-tracking').comparisonDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0 }}>
                                <BarChart 
                                  data={getComparisonChartData('teacher-registered-early-leaves-tracking')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ height: '300px', width: '100%' }}>
                            <BarChart 
                              data={getCurrentChartData('teacher-registered-early-leaves-tracking')} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Teacher Registered Late Arrival Tracking */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.teacherRegisteredLateArrivalTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('teacher-registered-late-arrival-tracking').isActive}
                            onClick={() => toggleChartComparison('teacher-registered-late-arrival-tracking')}
                          >
                            {getChartComparison('teacher-registered-late-arrival-tracking').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>
                      <ComparisonControls $isVisible={getChartComparison('teacher-registered-late-arrival-tracking').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: isDarkMode ? '#b0b0b0' : '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton 
                              $isRTL={isRTL}
                              onClick={() => toggleChartDatePicker('teacher-registered-late-arrival-tracking')}
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <span className="icon" style={{ fontSize: '10px' }}>📅</span>
                              {getChartComparison('teacher-registered-late-arrival-tracking').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('teacher-registered-late-arrival-tracking').isDatePickerOpen && (
                              <div style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 10001, 
                                marginTop: '4px',
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left'
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('teacher-registered-late-arrival-tracking').comparisonDateRange}
                                  onChange={(newRange) => handleChartDateRangeChange('teacher-registered-late-arrival-tracking', newRange)}
                                  onClose={() => toggleChartDatePicker('teacher-registered-late-arrival-tracking')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')} {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      <ChartContent>
                        {getChartComparison('teacher-registered-late-arrival-tracking').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '15px', 
                            height: '300px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%'
                            }}>
                              <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                {t('comparison.current')}: {analyticsDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0 }}>
                                <BarChart 
                                  data={getCurrentChartData('teacher-registered-late-arrival-tracking')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%'
                            }}>
                              <h5 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                {t('comparison.compare')}: {getChartComparison('teacher-registered-late-arrival-tracking').comparisonDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0 }}>
                                <BarChart 
                                  data={getComparisonChartData('teacher-registered-late-arrival-tracking')} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ height: '300px', width: '100%' }}>
                            <BarChart 
                              data={getCurrentChartData('teacher-registered-late-arrival-tracking')} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Teacher Absence Requests Tracking */}
                    <ChartCard>
                      <ChartHeader>
                          <ChartTitle isRTL={isRTL}>{t('analytics.teacherAbsenceRequestsTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                              $isActive={getChartComparison('teacher-absence-requests-tracking').isActive}
                              onClick={() => toggleChartComparison('teacher-absence-requests-tracking')}
                          >
                              {getChartComparison('teacher-absence-requests-tracking').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>

                        <ComparisonControls $isVisible={getChartComparison('teacher-absence-requests-tracking').isActive}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                            <span>{t('comparison.compareWith')}:</span>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                              <ComparisonPeriodButton
                                onClick={() => toggleChartDatePicker('teacher-absence-requests-tracking')}
                                style={{ fontSize: '11px', padding: '4px 8px' }}
                              >
                                📅 {getChartComparison('teacher-absence-requests-tracking').comparisonDateRange.label}
                              </ComparisonPeriodButton>
                              {getChartComparison('teacher-absence-requests-tracking').isDatePickerOpen && (
                                <div style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  transform: 'scale(0.75)',
                                  transformOrigin: 'top left',
                                  zIndex: 10001
                                }}>
                                  <AnalyticsDateRangePicker
                                    value={getChartComparison('teacher-absence-requests-tracking').comparisonDateRange}
                                    onChange={(dateRange) => handleChartDateRangeChange('teacher-absence-requests-tracking', dateRange)}
                                    onClose={() => toggleChartDatePicker('teacher-absence-requests-tracking')}
                                  />
                                </div>
                              )}
                            </div>
                            <span>{t('comparison.vs')}</span>
                            <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                          </div>
                        </ComparisonControls>

                      <ChartContent>
                          {getChartComparison('teacher-absence-requests-tracking').isActive ? (
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: '1fr 1fr', 
                              gap: '20px', 
                              height: '380px',
                              marginTop: '10px'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                height: '100%',
                                padding: '10px',
                                background: '#fafafa',
                                borderRadius: '8px'
                              }}>
                                <h5 style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666', textAlign: 'center', fontWeight: '600' }}>
                                  Current: {analyticsDateRange.label}
                                </h5>
                                <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                          <BarChart 
                            data={[
                              { name: 'Jan', value: 5 },
                              { name: 'Feb', value: 8 },
                              { name: 'Mar', value: 4 },
                              { name: 'Apr', value: 10 },
                              { name: 'May', value: 7 },
                              { name: 'Jun', value: 9 }
                            ]} 
                            isDarkMode={isDarkMode} 
                          />
                        </div>
                              </div>
                              <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                height: '100%',
                                padding: '10px',
                                background: '#fafafa',
                                borderRadius: '8px'
                              }}>
                                                              <ComparisonSubTitle isRTL={isRTL}>
                                {t('comparison.compare')}: {getChartComparison('teacher-absence-requests-tracking').comparisonDateRange.label}
                              </ComparisonSubTitle>
                                <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                  <BarChart 
                                    data={[
                                      { name: 'Jan', value: 3 },
                                      { name: 'Feb', value: 6 },
                                      { name: 'Mar', value: 2 },
                                      { name: 'Apr', value: 8 },
                                      { name: 'May', value: 5 },
                                      { name: 'Jun', value: 7 }
                                    ]} 
                                    isDarkMode={isDarkMode} 
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ 
                              height: '380px', 
                              width: '100%', 
                              padding: '15px', 
                              background: '#fafafa', 
                              borderRadius: '8px',
                              marginTop: '10px'
                            }}>
                              <BarChart 
                                data={[
                                  { name: 'Jan', value: 5 },
                                  { name: 'Feb', value: 8 },
                                  { name: 'Mar', value: 4 },
                                  { name: 'Apr', value: 10 },
                                  { name: 'May', value: 7 },
                                  { name: 'Jun', value: 9 }
                                ]} 
                                isDarkMode={isDarkMode} 
                              />
                            </div>
                          )}
                      </ChartContent>
                    </ChartCard>

                    {/* Teacher Early Leave Requests Tracking */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.teacherEarlyLeaveRequestsTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('teacher-early-leave-requests-tracking').isActive}
                            onClick={() => toggleChartComparison('teacher-early-leave-requests-tracking')}
                          >
                            {getChartComparison('teacher-early-leave-requests-tracking').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>

                      <ComparisonControls $isVisible={getChartComparison('teacher-early-leave-requests-tracking').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton
                              onClick={() => toggleChartDatePicker('teacher-early-leave-requests-tracking')}
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              📅 {getChartComparison('teacher-early-leave-requests-tracking').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('teacher-early-leave-requests-tracking').isDatePickerOpen && (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left',
                                zIndex: 10001
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('teacher-early-leave-requests-tracking').comparisonDateRange}
                                  onChange={(dateRange) => handleChartDateRangeChange('teacher-early-leave-requests-tracking', dateRange)}
                                  onClose={() => toggleChartDatePicker('teacher-early-leave-requests-tracking')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      <ChartContent>
                        {getChartComparison('teacher-early-leave-requests-tracking').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <h5 style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666', textAlign: 'center', fontWeight: '600' }}>
                                Current: {analyticsDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                          <BarChart 
                            data={[
                              { name: 'Jan', value: 3 },
                              { name: 'Feb', value: 4 },
                              { name: 'Mar', value: 2 },
                              { name: 'Apr', value: 6 },
                              { name: 'May', value: 3 },
                              { name: 'Jun', value: 5 }
                            ]} 
                            isDarkMode={isDarkMode} 
                          />
                        </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <h5 style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666', textAlign: 'center', fontWeight: '600' }}>
                                Compare: {getChartComparison('teacher-early-leave-requests-tracking').comparisonDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={[
                                    { name: 'Jan', value: 2 },
                                    { name: 'Feb', value: 3 },
                                    { name: 'Mar', value: 1 },
                                    { name: 'Apr', value: 4 },
                                    { name: 'May', value: 2 },
                                    { name: 'Jun', value: 4 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={[
                                { name: 'Jan', value: 3 },
                                { name: 'Feb', value: 4 },
                                { name: 'Mar', value: 2 },
                                { name: 'Apr', value: 6 },
                                { name: 'May', value: 3 },
                                { name: 'Jun', value: 5 }
                              ]} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>

                    {/* Teacher Late Arrival Requests Tracking */}
                    <ChartCard>
                      <ChartHeader>
                        <ChartTitle isRTL={isRTL}>{t('analytics.teacherLateArrivalRequestsTracking')}</ChartTitle>
                        <ChartControls>
                          <ComparisonToggle 
                            $isActive={getChartComparison('teacher-late-arrival-requests-tracking').isActive}
                            onClick={() => toggleChartComparison('teacher-late-arrival-requests-tracking')}
                          >
                            {getChartComparison('teacher-late-arrival-requests-tracking').isActive ? t('comparison.hideComparison') : t('comparison.comparePeriods')}
                          </ComparisonToggle>
                        </ChartControls>
                      </ChartHeader>

                      <ComparisonControls $isVisible={getChartComparison('teacher-late-arrival-requests-tracking').isActive}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
                          <span>{t('comparison.compareWith')}:</span>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <ComparisonPeriodButton
                              onClick={() => toggleChartDatePicker('teacher-late-arrival-requests-tracking')}
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              📅 {getChartComparison('teacher-late-arrival-requests-tracking').comparisonDateRange.label}
                            </ComparisonPeriodButton>
                            {getChartComparison('teacher-late-arrival-requests-tracking').isDatePickerOpen && (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                transform: 'scale(0.75)',
                                transformOrigin: 'top left',
                                zIndex: 10001
                              }}>
                                <AnalyticsDateRangePicker
                                  value={getChartComparison('teacher-late-arrival-requests-tracking').comparisonDateRange}
                                  onChange={(dateRange) => handleChartDateRangeChange('teacher-late-arrival-requests-tracking', dateRange)}
                                  onClose={() => toggleChartDatePicker('teacher-late-arrival-requests-tracking')}
                                />
                              </div>
                            )}
                          </div>
                          <span>{t('comparison.vs')}</span>
                          <span>{t('comparison.current')}: {analyticsDateRange.label}</span>
                        </div>
                      </ComparisonControls>
                      <ChartContent>
                        {getChartComparison('teacher-late-arrival-requests-tracking').isActive ? (
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '20px', 
                            height: '380px',
                            marginTop: '10px'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <h5 style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666', textAlign: 'center', fontWeight: '600' }}>
                                Current: {analyticsDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                          <BarChart 
                            data={[
                              { name: 'Jan', value: 2 },
                              { name: 'Feb', value: 3 },
                              { name: 'Mar', value: 1 },
                              { name: 'Apr', value: 4 },
                              { name: 'May', value: 2 },
                              { name: 'Jun', value: 3 }
                            ]} 
                            isDarkMode={isDarkMode} 
                          />
                        </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              height: '100%',
                              padding: '10px',
                              background: '#fafafa',
                              borderRadius: '8px'
                            }}>
                              <h5 style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666', textAlign: 'center', fontWeight: '600' }}>
                                Compare: {getChartComparison('teacher-late-arrival-requests-tracking').comparisonDateRange.label}
                              </h5>
                              <div style={{ flex: 1, minHeight: 0, padding: '5px' }}>
                                <BarChart 
                                  data={[
                                    { name: 'Jan', value: 1 },
                                    { name: 'Feb', value: 2 },
                                    { name: 'Mar', value: 1 },
                                    { name: 'Apr', value: 3 },
                                    { name: 'May', value: 1 },
                                    { name: 'Jun', value: 2 }
                                  ]} 
                                  isDarkMode={isDarkMode} 
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            height: '380px', 
                            width: '100%', 
                            padding: '15px', 
                            background: '#fafafa', 
                            borderRadius: '8px',
                            marginTop: '10px'
                          }}>
                            <BarChart 
                              data={[
                                { name: 'Jan', value: 2 },
                                { name: 'Feb', value: 3 },
                                { name: 'Mar', value: 1 },
                                { name: 'Apr', value: 4 },
                                { name: 'May', value: 2 },
                                { name: 'Jun', value: 3 }
                              ]} 
                              isDarkMode={isDarkMode} 
                            />
                          </div>
                        )}
                      </ChartContent>
                    </ChartCard>
                  </SectionChartsGrid>
                </CollapsibleSectionComponent>

              </>
            ) : (
              <EmptyState>
                <EmptyIcon>📊</EmptyIcon>
                <h3>No Statistics Available</h3>
                <p>Statistics data is currently unavailable. Please try again later.</p>
              </EmptyState>
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
                    <TableHeaderCell $alignLeft={true} isRTL={isRTL} $isFirstColumn={true}>{t('reports.teacher')}</TableHeaderCell>
                    <TableHeaderCell isRTL={isRTL}>{t('reports.workType')}</TableHeaderCell>
                    <TableHeaderCell isRTL={isRTL}>{t('reports.attends')}</TableHeaderCell>
                    <TableHeaderCell isRTL={isRTL}>{t('reports.authorizedAbsence')}</TableHeaderCell>
                    <TableHeaderCell isRTL={isRTL}>{t('reports.unauthorizedAbsence')}</TableHeaderCell>
                    <TableHeaderCell isRTL={isRTL}>{t('reports.earlyLeave')}</TableHeaderCell>
                    <TableHeaderCell isRTL={isRTL}>{t('reports.lateArrival')}</TableHeaderCell>
                    <TableHeaderCell isRTL={isRTL}>{t('reports.overtime')}</TableHeaderCell>
                    <TableHeaderCell isRTL={isRTL}>{t('reports.totalHours')}</TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>
                <TableBody>
                  {currentReports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell $alignLeft={true} isRTL={isRTL} $isFirstColumn={true}>{report.name}</TableCell>
                      <TableCell isRTL={isRTL}>
                        <WorkTypeBadge $workType={report.workType}>
                          {report.workType}
                        </WorkTypeBadge>
                      </TableCell>
                      <TableCell isRTL={isRTL}>{report.attends}</TableCell>
                      <TableCell isRTL={isRTL}>{report.authorizedAbsence}</TableCell>
                      <TableCell isRTL={isRTL}>{report.unauthorizedAbsence}</TableCell>
                      <TableCell isRTL={isRTL}>{report.earlyLeave}</TableCell>
                      <TableCell isRTL={isRTL}>{report.lateArrival}</TableCell>
                      <TableCell isRTL={isRTL}>{report.overtime}</TableCell>
                      <TableCell isRTL={isRTL}>{report.totalHours}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <PaginationContainer>
              <PaginationInfo>
                <PaginationButton
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </PaginationButton>
                <span>{t('Page')} {currentPage}</span>
                <PaginationButton
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ›
                </PaginationButton>
              </PaginationInfo>
              
              <ExportButtonsContainer>
                <ExportButton onClick={handleExportPDF}>
                  {t('reports.exportPDF')}
                </ExportButton>
                <ExportButton onClick={handleExportExcel}>
                  {t('reports.exportExcel')}
                </ExportButton>
              </ExportButtonsContainer>
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