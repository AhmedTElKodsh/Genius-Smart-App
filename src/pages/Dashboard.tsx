import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { startOfMonth, format } from 'date-fns';
import Sidebar from '../components/Sidebar';
import AnalyticsCard from '../components/AnalyticsCard';
import DateRangePicker, { DateRange } from '../components/DateRangePicker';
import SubjectDropdown, { Subject } from '../components/SubjectDropdown';
import AgeDistributionChart from '../components/AgeDistributionChart';
import AttendanceChart from '../components/AttendanceChart';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #E7E7E7;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 240px;
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

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
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
  analytics: {
    permitted_leaves: number;
    unpermitted_leaves: number;
    authorized_absence: number;
    unauthorized_absence: number;
    overtime: number;
    late_arrival: number;
  };
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

interface Department {
  id: string;
  name: string;
  arabicName: string;
}

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
    label: 'This Month'
  });
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [departments, setDepartments] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch departments for the subject dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/departments');
        if (!response.ok) throw new Error('Failed to fetch departments');
        
        const departmentsData: Department[] = await response.json();
        const subjectOptions: Subject[] = departmentsData.map(dept => ({
          value: dept.name,
          label: dept.name,
          arabicName: dept.arabicName
        }));
        
        setDepartments(subjectOptions);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch dashboard data based on filters
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (selectedSubject) {
          params.append('department', selectedSubject);
        }
        params.append('startDate', format(dateRange.startDate, 'yyyy-MM-dd'));
        params.append('endDate', format(dateRange.endDate, 'yyyy-MM-dd'));

        // Fetch dashboard overview
        const dashboardResponse = await fetch(`http://localhost:5000/api/dashboard/overview?${params.toString()}`);
        if (!dashboardResponse.ok) throw new Error('Failed to fetch dashboard data');
        
        const dashboardOverview = await dashboardResponse.json();

        // Transform the data to match our component interface
        const transformedData: DashboardData = {
          analytics: {
            permitted_leaves: dashboardOverview.requestStats.permittedLeaves || 0,
            unpermitted_leaves: dashboardOverview.requestStats.unpermittedLeaves || 0,
            authorized_absence: dashboardOverview.requestStats.authorizedAbsence || 0,
            unauthorized_absence: dashboardOverview.requestStats.unauthorizedAbsence || 0,
            overtime: dashboardOverview.requestStats.overtime || 0,
            late_arrival: dashboardOverview.requestStats.lateIn || 0,
          },
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
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedSubject, dateRange]);

  const handleAddTeacher = () => {
    // TODO: Implement add teacher modal/page
    console.log('Add teacher clicked');
  };

  if (loading) {
    return (
      <DashboardContainer>
        <Sidebar onAddTeacher={handleAddTeacher} />
        <MainContent>
          <LoadingContainer>
            Loading dashboard data...
          </LoadingContainer>
        </MainContent>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <Sidebar onAddTeacher={handleAddTeacher} />
        <MainContent>
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
      <MainContent>
        <Header>
          <SearchContainer>
            <SearchWrapper>
              <SearchIcon>🔍</SearchIcon>
              <SearchInput
                type="text"
                placeholder="Ahmed Mohamed"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchWrapper>
          </SearchContainer>
          
          <HeaderControls>
            <SubjectDropdown
              subjects={departments}
              selectedSubject={selectedSubject}
              onSubjectChange={setSelectedSubject}
              placeholder="Subjects"
            />
            
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
          </HeaderControls>
        </Header>

        {dashboardData && (
          <>
            <AnalyticsGrid>
              <AnalyticsCard
                title="Permitted Leaves"
                count={dashboardData.analytics.permitted_leaves}
              />
              <AnalyticsCard
                title="Authorized Absence"
                count={dashboardData.analytics.authorized_absence}
              />
              <AnalyticsCard
                title="Overtime"
                count={dashboardData.analytics.overtime}
              />
              <AnalyticsCard
                title="Unpermitted Leaves"
                count={dashboardData.analytics.unpermitted_leaves}
              />
              <AnalyticsCard
                title="Unauthorized Absence"
                count={dashboardData.analytics.unauthorized_absence}
              />
              <AnalyticsCard
                title="Late Arrival"
                count={dashboardData.analytics.late_arrival}
              />
            </AnalyticsGrid>

            <ChartsContainer>
              <AgeDistributionChart data={dashboardData.ageDistribution} />
              <AttendanceChart data={dashboardData.weeklyAttendance} />
            </ChartsContainer>
          </>
        )}
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard; 