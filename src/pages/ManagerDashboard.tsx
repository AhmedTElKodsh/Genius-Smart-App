import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { startOfMonth, format } from 'date-fns';
import Sidebar from '../components/Sidebar';
import DateRangePicker, { DateRange } from '../components/DateRangePicker';
import SubjectDropdown, { Subject } from '../components/SubjectDropdown';
import TodayCheckInChart from '../components/TodayCheckInChart';
import TodayAbsencesChart from '../components/TodayAbsencesChart';
import ImmediateRequestsChart from '../components/ImmediateRequestsChart';
import AddTeacherModal from '../components/AddTeacherModal';
import ServerStatus from '../components/ServerStatus';
import { useLanguage } from '../contexts/LanguageContext';

const DashboardContainer = styled.div`
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
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 300px;
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

const TopChartsContainer = styled.div`
  display: flex;
  width: 95%;
  margin: 0 auto 24px auto;
  max-width: 1400px;
  
  > * {
    flex: 1;
  }
`;

const BottomChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-family: 'Poppins', sans-serif;
  color: #666;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-family: 'Poppins', sans-serif;
  color: #dc3545;
`;

// API interfaces
interface DashboardData {
  ageDistribution: {
    under24: number;
    between24And32: number;
    above32: number;
    total: number;
  };
  weeklyAttendance: {
    day: string;
    onTime: number;
    late: number;
    absent: number;
  }[];
}

interface SubjectData {
  id: string;
  name: string;
  arabicName: string;
}

// New chart data interfaces
interface TodayCheckInData {
  date: string;
  total: number;
  checkedInOnly: number;
  checkedInAndOut: number;
  teachers: Array<{
    teacherId: string;
    name: string;
    subject: string;
    checkIn: string;
    checkOut: string | null;
    totalHours: number;
    attendance: string;
    workType: string;
  }>;
}

interface TodayAbsencesData {
  totalAbsent: number;
  authorizedAbsence: number;
  unauthorizedNoRequest: number;
  unauthorizedRejected: number;
  absentTeachers: Array<{
    id: string;
    name: string;
    subject: string;
    absenceType: 'authorized' | 'unauthorized-no-request' | 'unauthorized-rejected';
    reason?: string;
    requestDate?: string;
    duration?: string;
    email?: string;
    phone?: string;
  }>;
  date: string;
}

interface ImmediateRequestsData {
  tomorrow: {
    date: string;
    count: number;
    requests: Array<{
      id: string;
      teacherName: string;
      subject: string;
      requestType: string;
      reason: string;
      duration: string;
      submittedAt: string;
      urgency: string;
      targetDate: string;
    }>;
  };
  dayAfterTomorrow: {
    date: string;
    count: number;
    requests: Array<{
      id: string;
      teacherName: string;
      subject: string;
      requestType: string;
      reason: string;
      duration: string;
      submittedAt: string;
      urgency: string;
      targetDate: string;
    }>;
  };
  total: number;
  allRequests: any[];
}

const Dashboard: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
    label: 'This Month'
  });
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  
  // New chart data states
  const [todayCheckInData, setTodayCheckInData] = useState<TodayCheckInData | null>(null);
  const [todayAbsencesData, setTodayAbsencesData] = useState<TodayAbsencesData | null>(null);
  const [immediateRequestsData, setImmediateRequestsData] = useState<ImmediateRequestsData | null>(null);
  
  // Loading states for individual charts
    const [chartsLoading, setChartsLoading] = useState({
    checkIns: true,
    absences: true,
    immediateRequests: true
  });

  const [chartsErrors, setChartsErrors] = useState({
    checkIns: null as string | null,
    absences: null as string | null,
    immediateRequests: null as string | null
  });

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

  // Fetch subjects for the subject dropdown
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/subjects');
        if (!response.ok) throw new Error('Failed to fetch subjects');
        
        const result = await response.json();
        const subjectsData: SubjectData[] = result.data || result;
        const subjectOptions: Subject[] = subjectsData.map(subj => ({
          value: subj.name,
          label: translateSubject(subj.name), // Use translated name for display
          arabicName: subj.arabicName
        }));
        
        setSubjects(subjectOptions);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        
        // Use mock subjects data if server is down
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          const mockSubjects: Subject[] = [
            { value: 'mathematics', label: 'Mathematics', arabicName: 'رياضيات' },
            { value: 'science', label: 'Science', arabicName: 'علوم' },
            { value: 'english', label: 'English', arabicName: 'لغة إنجليزية' },
            { value: 'arabic', label: 'Arabic', arabicName: 'لغة عربية' },
            { value: 'history', label: 'History', arabicName: 'تاريخ' },
            { value: 'geography', label: 'Geography', arabicName: 'جغرافيا' },
          ];
          setSubjects(mockSubjects);
        }
      }
    };

    fetchSubjects();
  }, [t]); // Add 't' dependency to re-run when language changes

  // Fetch dashboard data based on filters
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching dashboard data...');
        // Build query parameters
        const params = new URLSearchParams();
        if (selectedSubject) {
          params.append('subject', selectedSubject);
        }
        params.append('startDate', format(dateRange.startDate, 'yyyy-MM-dd'));
        params.append('endDate', format(dateRange.endDate, 'yyyy-MM-dd'));

        const url = `http://localhost:5000/api/dashboard/overview?${params.toString()}`;
        console.log('Fetching from URL:', url);

        // Fetch dashboard overview with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const dashboardResponse = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        console.log('Dashboard response status:', dashboardResponse.status);
        
        if (!dashboardResponse.ok) {
          const errorText = await dashboardResponse.text();
          console.error('Dashboard API error:', errorText);
          throw new Error(`Failed to fetch dashboard data: ${dashboardResponse.status}`);
        }
        
        const dashboardOverview = await dashboardResponse.json();
        console.log('Dashboard data received:', dashboardOverview);

        // Transform the data to match our component interface
        const transformedData: DashboardData = {
          ageDistribution: {
            under24: dashboardOverview.ageDistribution?.under24 || 0,
            between24And32: dashboardOverview.ageDistribution?.between24And32 || 0,
            above32: dashboardOverview.ageDistribution?.above32 || 0,
            total: dashboardOverview.totalTeachers || 0,
          },
          weeklyAttendance: dashboardOverview.weeklyAttendance || [
            { day: 'Sun', onTime: 0, late: 0, absent: 0 },
            { day: 'Mon', onTime: 0, late: 0, absent: 0 },
            { day: 'Tue', onTime: 0, late: 0, absent: 0 },
            { day: 'Wed', onTime: 0, late: 0, absent: 0 },
            { day: 'Thu', onTime: 0, late: 0, absent: 0 },
          ]
        };

        setDashboardData(transformedData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        
        // Check if it's a connection error
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          setError('Unable to connect to server. Using demo data.');
          
          // Use realistic mock data
          const mockData: DashboardData = {
            ageDistribution: {
              under24: 12,
              between24And32: 25,
              above32: 18,
              total: 55,
            },
            weeklyAttendance: [
              { day: 'Sun', onTime: 42, late: 8, absent: 5 },
              { day: 'Mon', onTime: 45, late: 6, absent: 4 },
              { day: 'Tue', onTime: 43, late: 7, absent: 5 },
              { day: 'Wed', onTime: 44, late: 5, absent: 6 },
              { day: 'Thu', onTime: 46, late: 4, absent: 5 },
            ]
          };
          
          setDashboardData(mockData);
        } else {
          setError('Failed to load dashboard data. Please try again.');
          
          // Empty fallback data for other errors
          const fallbackData: DashboardData = {
            ageDistribution: {
              under24: 0,
              between24And32: 0,
              above32: 0,
              total: 0,
            },
            weeklyAttendance: [
              { day: 'Sun', onTime: 0, late: 0, absent: 0 },
              { day: 'Mon', onTime: 0, late: 0, absent: 0 },
              { day: 'Tue', onTime: 0, late: 0, absent: 0 },
              { day: 'Wed', onTime: 0, late: 0, absent: 0 },
              { day: 'Thu', onTime: 0, late: 0, absent: 0 },
            ]
          };
          
          setDashboardData(fallbackData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedSubject, dateRange]);

  // Fetch new chart data with filters
  useEffect(() => {
    const fetchNewChartsData = async () => {
      console.log('Fetching new charts data with filters...');
      
      // Reset loading states
      setChartsLoading({
        checkIns: true,
        absences: true,
        immediateRequests: true
      });
      
      try {
        // Build query parameters for filtering
        const params = new URLSearchParams();
        if (selectedSubject) {
          params.append('subject', selectedSubject);
        }
        params.append('startDate', format(dateRange.startDate, 'yyyy-MM-dd'));
        params.append('endDate', format(dateRange.endDate, 'yyyy-MM-dd'));
        
        const queryString = params.toString();
        
        // Fetch all chart data in parallel with filters
        const [checkInsResponse, absencesResponse, immediateRequestsResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/dashboard/today-checkins?${queryString}`),
          fetch(`http://localhost:5000/api/dashboard/today-absences?${queryString}`),
          fetch(`http://localhost:5000/api/dashboard/immediate-requests?${queryString}`)
        ]);

        // Check-ins data
        if (checkInsResponse.ok) {
          const checkInsResult = await checkInsResponse.json();
          setTodayCheckInData(checkInsResult.data);
          setChartsErrors(prev => ({ ...prev, checkIns: null }));
        } else {
          throw new Error('Failed to fetch check-ins data');
        }

        // Absences data (now includes all absence types)
        if (absencesResponse.ok) {
          const absencesResult = await absencesResponse.json();
          const absencesData = absencesResult.data;
          
          // Transform the response to match our component interface
          const transformedAbsencesData: TodayAbsencesData = {
            totalAbsent: absencesData.totalAbsent || 0,
            authorizedAbsence: absencesData.authorizedAbsence || 0,
            unauthorizedNoRequest: absencesData.unauthorizedNoRequest || 0,
            unauthorizedRejected: absencesData.unauthorizedRejected || 0,
            absentTeachers: absencesData.absentTeachers || [],
            date: absencesData.dateRange || new Date().toLocaleDateString()
          };
          
          setTodayAbsencesData(transformedAbsencesData);
          setChartsErrors(prev => ({ ...prev, absences: null }));
        } else {
          throw new Error('Failed to fetch absences data');
        }

        // Immediate requests data
        if (immediateRequestsResponse.ok) {
          const immediateRequestsResult = await immediateRequestsResponse.json();
          setImmediateRequestsData(immediateRequestsResult.data);
          setChartsErrors(prev => ({ ...prev, immediateRequests: null }));
        } else {
          throw new Error('Failed to fetch immediate requests data');
        }

        console.log('All new charts data loaded successfully');

      } catch (err) {
        console.error('Error fetching new charts data:', err);
        
        // Use mock data if server is down
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          // Mock check-ins data with proper structure
          const mockCheckInData: TodayCheckInData = {
            total: 45,
            onTime: 38,
            late: 7,
            checkedOut: 5,
            teachers: [
              {
                id: '6',
                name: 'علي حسين',
                subject: 'Quran',
                checkInTime: '07:45 AM',
                checkOutTime: null,
                status: 'on-time',
                workType: 'Full-time'
              },
              {
                id: '7',
                name: 'نور الدين',
                subject: 'Art',
                checkInTime: '08:10 AM',
                checkOutTime: null,
                status: 'late',
                workType: 'Full-time'
              },
              {
                id: '8',
                name: 'ليلى عبدالله',
                subject: 'Social studies',
                checkInTime: '07:30 AM',
                checkOutTime: '03:00 PM',
                status: 'checked-out',
                workType: 'Full-time'
              },
              {
                id: '9',
                name: 'كريم سالم',
                subject: 'Fitness',
                checkInTime: '07:55 AM',
                checkOutTime: null,
                status: 'on-time',
                workType: 'Part-time'
              },
              {
                id: '10',
                name: 'مريم أحمد',
                subject: 'History',
                checkInTime: '08:05 AM',
                checkOutTime: null,
                status: 'late',
                workType: 'Full-time'
              }
            ]
          };
          setTodayCheckInData(mockCheckInData);
          
          // Mock absences data with proper structure
          const mockAbsencesData: TodayAbsencesData = {
            totalAbsent: 5,
            authorizedAbsence: 2,
            unauthorizedNoRequest: 2,
            unauthorizedRejected: 1,
            absentTeachers: [
              {
                id: '1',
                name: 'أحمد محمد',
                subject: 'Math',
                absenceType: 'authorized',
                checkInTime: null,
                workType: 'Full-time'
              },
              {
                id: '2',
                name: 'فاطمة علي',
                subject: 'Arabic',
                absenceType: 'unauthorized-no-request',
                checkInTime: null,
                workType: 'Full-time'
              },
              {
                id: '3',
                name: 'محمد حسن',
                subject: 'Science',
                absenceType: 'authorized',
                checkInTime: null,
                workType: 'Full-time'
              },
              {
                id: '4',
                name: 'سارة أحمد',
                subject: 'English',
                absenceType: 'unauthorized-no-request',
                checkInTime: null,
                workType: 'Full-time'
              },
              {
                id: '5',
                name: 'عمر خالد',
                subject: 'Programming',
                absenceType: 'unauthorized-rejected',
                checkInTime: null,
                workType: 'Full-time'
              }
            ],
            date: format(new Date(), 'dd/MM/yyyy')
          };
          setTodayAbsencesData(mockAbsencesData);
          
          // Mock immediate requests data
          setImmediateRequestsData({
            total: 3,
            pending: 2,
            approved: 1,
            urgent: 1
          });
          
          setChartsErrors(prev => ({
            checkIns: null,
            absences: null,
            immediateRequests: null
          }));
        } else {
          setChartsErrors(prev => ({
            checkIns: 'Failed to load check-ins data',
            absences: 'Failed to load absences data',
            immediateRequests: 'Failed to load immediate requests data'
          }));
        }
      } finally {
        setChartsLoading({
          checkIns: false,
          absences: false,
          immediateRequests: false
        });
      }
    };

    fetchNewChartsData();
  }, [selectedSubject, dateRange]); // Re-fetch when filters change

  const handleAddTeacher = () => {
    setShowAddTeacherModal(true);
  };

  const handleCloseModal = () => {
    setShowAddTeacherModal(false);
  };

  const handleTeacherAdded = () => {
    // Refresh dashboard data when a new teacher is added
    setLoading(true);
    setError(null);
    // The useEffect will automatically trigger and refresh the data
  };

  if (loading) {
    return (
      <DashboardContainer>
        <Sidebar onAddTeacher={handleAddTeacher} />
        <MainContent $isRTL={isRTL}>
          <LoadingContainer>
            {t('common.loading')}
          </LoadingContainer>
        </MainContent>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <Sidebar onAddTeacher={handleAddTeacher} />
        <MainContent $isRTL={isRTL}>
          <ErrorContainer>
            {error}
          </ErrorContainer>
        </MainContent>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Sidebar onAddTeacher={handleAddTeacher} />
      <MainContent $isRTL={isRTL}>
        <Header>
          <SearchContainer>
            <SearchWrapper>
              <SearchIcon>🔍</SearchIcon>
              <SearchInput
                type="text"
                placeholder={t('teachers.searchTeachers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchWrapper>
          </SearchContainer>
          
          <HeaderControls>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
            
            <SubjectDropdown
              subjects={subjects}
              selectedSubject={selectedSubject}
              onSubjectChange={setSelectedSubject}
              placeholder={t('teachers.allSubjects')}
            />
          </HeaderControls>
        </Header>

        {dashboardData && (
          <>
            <TopChartsContainer>
              <TodayAbsencesChart 
                data={todayAbsencesData} 
                loading={chartsLoading.absences}
                error={chartsErrors.absences}
              />
            </TopChartsContainer>

            <BottomChartsContainer>
              <TodayCheckInChart 
                data={todayCheckInData} 
                loading={chartsLoading.checkIns}
                error={chartsErrors.checkIns}
              />
              <ImmediateRequestsChart 
                data={immediateRequestsData} 
                loading={chartsLoading.immediateRequests}
                error={chartsErrors.immediateRequests}
              />
            </BottomChartsContainer>
          </>
        )}
      </MainContent>
      
      <AddTeacherModal
        isOpen={showAddTeacherModal}
        onClose={handleCloseModal}
        onSuccess={handleTeacherAdded}
      />
      <ServerStatus />
    </DashboardContainer>
  );
};

export default Dashboard; 