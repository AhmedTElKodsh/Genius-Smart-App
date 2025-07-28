import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { startOfMonth, format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Sidebar from '../components/Sidebar';
import DateRangePicker, { DateRange } from '../components/DateRangePicker';
import AddTeacherModal from '../components/AddTeacherModal';
import EditTeacherModal from '../components/EditTeacherModal';
import AnalyticsCard from '../components/AnalyticsCard';
import RequestTypeDetailModal from '../components/RequestTypeDetailModal';
import { useLanguage } from '../contexts/LanguageContext';

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
  min-height: 300px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #141F25;
  margin: 0;
`;

const ChartControls = styled.div`
  display: flex;
  gap: 8px;
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

const ChartContent = styled.div`
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  border: 2px dashed #e1e7ec;
  border-radius: 8px;
`;

const FullWidthChart = styled.div`
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const TableSection = styled.div`
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  padding: 24px;
`;

const TableTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #141F25;
  margin: 0 0 20px 0;
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

const StatsTableHeaderCell = styled.th<{ $alignLeft?: boolean }>`
  padding: 12px 16px;
  text-align: ${props => props.$alignLeft ? 'left' : 'center'};
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

const StatsTableCell = styled.td<{ $alignLeft?: boolean }>`
  padding: 12px 16px;
  font-size: 14px;
  color: #141F25;
  border-right: 1px solid #f1f3f4;
  text-align: ${props => props.$alignLeft ? 'left' : 'center'};
  
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

const DonutChart = styled.div`
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
  weeklyPatterns: Record<string, any>;
  attendanceSummary: any;
  requestSummary: any;
}

const Teachers: React.FC = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
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
  const [statisticsPeriod, setStatisticsPeriod] = useState<string>('month');
  const [selectedMetric, setSelectedMetric] = useState<string>('attendanceRate');
  const [chartType, setChartType] = useState<string>('bar');

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
      
      const [performanceRes, departmentRes, weeklyRes, summaryRes, requestRes] = await Promise.all([
        fetch(`http://localhost:5000/api/analytics/employees/performance-segments?period=${statisticsPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:5000/api/analytics/departments/comparison?period=${statisticsPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:5000/api/analytics/attendance/weekly-patterns?period=${statisticsPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:5000/api/analytics/attendance/summary?period=${statisticsPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`http://localhost:5000/api/analytics/requests/summary?period=${statisticsPeriod}`, {
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

  // Fetch teachers and subjects data on component mount
  useEffect(() => {
    fetchData();
    
    // Auto-refresh data every 30 seconds to keep it synchronized
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing teachers data...');
      fetchData();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Fetch statistics when tab or period changes
  useEffect(() => {
    if (activeTab === 'statistics') {
      fetchStatisticsData();
    }
  }, [activeTab, statisticsPeriod]);

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
  const handleStatisticsPeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatisticsPeriod(e.target.value);
  };

  // Chart metric change handler
  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric);
  };

  // Chart type change handler
  const handleChartTypeChange = (type: string) => {
    setChartType(type);
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
      const subjectText = selectedSubject || 'All Subjects';
      doc.text(`Subject: ${subjectText}`, 14, yPosition);
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
              {t('teachers.statistics')} / الإحصائيات
            </Tab>
          </TabContainer>
          
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
            
            {(activeTab === 'reports' || activeTab === 'statistics') && (
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
              <h2>{t('teachers.statistics')} / الإحصائيات</h2>
              <StatisticsFilters>
                <FilterSelect value={statisticsPeriod} onChange={handleStatisticsPeriodChange}>
                  <option value="today">Today / اليوم</option>
                  <option value="week">This Week / هذا الأسبوع</option>
                  <option value="month">This Month / هذا الشهر</option>
                  <option value="quarter">This Quarter / هذا الربع</option>
                  <option value="year">This Year / هذا العام</option>
                </FilterSelect>
              </StatisticsFilters>
            </StatisticsHeader>

            {statisticsLoading ? (
              <LoadingContainer>Loading statistics...</LoadingContainer>
            ) : statisticsData ? (
              <>
                {/* KPI Cards */}
                <KPICardsGrid>
                  <KPICard>
                    <KPIValue>{teachers.length}</KPIValue>
                    <KPILabel>Total Teachers / إجمالي المعلمين</KPILabel>
                  </KPICard>
                  <KPICard>
                    <KPIValue>{statisticsData.attendanceSummary.attendanceRate}</KPIValue>
                    <KPILabel>Attendance Rate / معدل الحضور</KPILabel>
                    <KPITrend $isPositive={true}>+2.3%</KPITrend>
                  </KPICard>
                  <KPICard>
                    <KPIValue>{statisticsData.performanceSegments.excellent.length}</KPIValue>
                    <KPILabel>Top Performers / المتفوقون</KPILabel>
                  </KPICard>
                  <KPICard>
                    <KPIValue>{statisticsData.performanceSegments.atRisk.length}</KPIValue>
                    <KPILabel>At Risk / معرضون للخطر</KPILabel>
                  </KPICard>
                  <KPICard>
                    <KPIValue>{statisticsData.departmentComparison.length}</KPIValue>
                    <KPILabel>Departments / الأقسام</KPILabel>
                  </KPICard>
                </KPICardsGrid>

                {/* Charts Grid */}
                <ChartsGrid>
                  {/* Performance Distribution Chart */}
                  <ChartCard>
                    <ChartHeader>
                      <ChartTitle>Performance Distribution / توزيع الأداء</ChartTitle>
                    </ChartHeader>
                    <ChartContent>
                      <div style={{ textAlign: 'center' }}>
                        <DonutChart />
                        <DonutLegend>
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
                    </ChartContent>
                  </ChartCard>

                  {/* Department Comparison Chart */}
                  <ChartCard>
                    <ChartHeader>
                      <ChartTitle>Department Performance / أداء الأقسام</ChartTitle>
                      <ChartControls>
                        <ChartToggle 
                          $isActive={selectedMetric === 'attendanceRate'} 
                          onClick={() => handleMetricChange('attendanceRate')}
                        >
                          Attendance / الحضور
                        </ChartToggle>
                        <ChartToggle 
                          $isActive={selectedMetric === 'punctualityScore'} 
                          onClick={() => handleMetricChange('punctualityScore')}
                        >
                          Punctuality / الالتزام
                        </ChartToggle>
                      </ChartControls>
                    </ChartHeader>
                    <ChartContent>
                      <div style={{ textAlign: 'center', color: '#666' }}>
                        📊 Department comparison chart will be rendered here
                        <br />
                        Showing {selectedMetric} for all departments
                      </div>
                    </ChartContent>
                  </ChartCard>
                </ChartsGrid>

                {/* Weekly Patterns Full Width */}
                <FullWidthChart>
                  <ChartHeader>
                    <ChartTitle>Weekly Attendance Patterns / أنماط الحضور الأسبوعية</ChartTitle>
                    <ChartControls>
                      <ChartToggle 
                        $isActive={chartType === 'line'} 
                        onClick={() => handleChartTypeChange('line')}
                      >
                        Line Chart
                      </ChartToggle>
                      <ChartToggle 
                        $isActive={chartType === 'bar'} 
                        onClick={() => handleChartTypeChange('bar')}
                      >
                        Bar Chart
                      </ChartToggle>
                      <ChartToggle 
                        $isActive={chartType === 'heatmap'} 
                        onClick={() => handleChartTypeChange('heatmap')}
                      >
                        Heatmap
                      </ChartToggle>
                    </ChartControls>
                  </ChartHeader>
                  <ChartContent>
                    <div style={{ textAlign: 'center', color: '#666' }}>
                      📈 Weekly patterns {chartType} chart will be rendered here
                      <br />
                      Best day: {Object.keys(statisticsData.weeklyPatterns)[0] || 'N/A'}
                    </div>
                  </ChartContent>
                </FullWidthChart>

                {/* Teacher Ranking Table */}
                <TableSection>
                  <TableTitle>Teacher Performance Ranking / ترتيب أداء المعلمين</TableTitle>
                  <StatsTable>
                    <StatsTableHeader>
                      <StatsTableHeaderRow>
                        <StatsTableHeaderCell $alignLeft={true}>Teacher / المعلم</StatsTableHeaderCell>
                        <StatsTableHeaderCell>Department / القسم</StatsTableHeaderCell>
                        <StatsTableHeaderCell>Attendance Rate / معدل الحضور</StatsTableHeaderCell>
                        <StatsTableHeaderCell>Punctuality / الالتزام</StatsTableHeaderCell>
                        <StatsTableHeaderCell>Performance / الأداء</StatsTableHeaderCell>
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
                              <StatsTableCell $alignLeft={true}>{teacher.name}</StatsTableCell>
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
                          {report.workType}
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
    </TeachersContainer>
  );
};

export default Teachers; 