import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%);
  padding: 0;
  position: relative;
`;

const Header = styled.div`
  padding: 60px 20px 30px 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Greeting = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 5px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
`;

const ProfileImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face') center/cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
`;

const MainContent = styled.div`
  flex: 1;
  background: #f5f5f5;
  border-radius: 25px 25px 0 0;
  min-height: calc(100vh - 150px);
  padding: 0;
  position: relative;
`;

const WorkTimeCard = styled.div`
  background: white;
  margin: 20px;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const WorkTimeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const WorkTimeTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const SendRequestButton = styled.button`
  background: none;
  border: none;
  color: #DAA520;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(218, 165, 32, 0.1);
  }
`;

const TimerDisplay = styled.div`
  text-align: center;
  margin: 30px 0;
`;

const TimeText = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: #333;
  letter-spacing: 2px;
`;

const DateText = styled.div`
  font-size: 16px;
  color: #666;
  margin: 10px 0 30px 0;
`;

const PlayButton = styled.button`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #DAA520 0%, #B8860B 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px auto;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(218, 165, 32, 0.3);
  font-size: 24px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(218, 165, 32, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PlayIcon = styled.div`
  width: 0;
  height: 0;
  border-left: 25px solid white;
  border-top: 15px solid transparent;
  border-bottom: 15px solid transparent;
  margin-left: 8px;
`;

const MotivationText = styled.p`
  text-align: center;
  color: #666;
  font-size: 16px;
  margin: 0;
`;

const SummarySection = styled.div`
  background: white;
  margin: 20px;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const SummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SummaryTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const FilterDropdown = styled.div`
  position: relative;
`;

const DropdownButton = styled.button`
  background: #f0f0f0;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #e8e8e8;
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 150px;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.isOpen ? '8px' : '0'});
  transition: all 0.2s;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }
`;

const SummaryGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SummaryItem = styled.div`
  background: #FFF8DC;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid #DAA520;
`;

const SummaryLabel = styled.span`
  font-size: 15px;
  color: #333;
  font-weight: 500;
`;

const SummaryValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const DatePickerModal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s;
`;

const DatePickerContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin: 20px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const MonthYear = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const NavButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #DAA520;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;

  &:hover {
    background: #B8860B;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 20px;
`;

const DayHeader = styled.div`
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  padding: 8px 4px;
`;

const DayCell = styled.button<{ isSelected?: boolean; isInRange?: boolean; isToday?: boolean }>`
  aspect-ratio: 1;
  border: none;
  background: ${props => 
    props.isSelected ? '#DAA520' : 
    props.isInRange ? 'rgba(218, 165, 32, 0.2)' :
    props.isToday ? '#f0f0f0' : 'transparent'
  };
  color: ${props => props.isSelected ? 'white' : '#333'};
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.isSelected ? '#B8860B' : 'rgba(218, 165, 32, 0.1)'};
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

const DateRangeDisplay = styled.div`
  background: #FFF8DC;
  border: 2px solid #DAA520;
  border-radius: 12px;
  padding: 16px;
  margin: 20px 0;
  text-align: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #DAA520;
  }
`;

const DoneButton = styled.button`
  width: 100%;
  background: #DAA520;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #B8860B;
  }
`;

const BottomNavigation = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #e0e0e0;
  z-index: 100;
`;

const NavItem = styled.button<{ active?: boolean }>`
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: ${props => props.active ? '#DAA520' : '#999'};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(218, 165, 32, 0.1);
  }
`;

const NavIcon = styled.div`
  font-size: 20px;
`;

const NavLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
`;

// Types
interface SummaryData {
  allowedAbsence: number;
  unallowedAbsence: number;
  authorizedAbsence: number;
  unauthorizedAbsence: number;
  overtime: number;
  lateArrival: number;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

const TeacherHome: React.FC = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState('00:00:00');
  const [isRunning, setIsRunning] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('Last month');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [summaryData, setSummaryData] = useState<SummaryData>({
    allowedAbsence: 0,
    unallowedAbsence: 0,
    authorizedAbsence: 0,
    unauthorizedAbsence: 0,
    overtime: 0,
    lateArrival: 0
  });
  const [teacherData, setTeacherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Get current date info
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    weekday: 'long'
  };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  // Load teacher data on mount
  useEffect(() => {
    const storedTeacherData = localStorage.getItem('teacherData');
    if (storedTeacherData) {
      setTeacherData(JSON.parse(storedTeacherData));
    } else {
      navigate('/teacher/signin');
    }
  }, [navigate]);

  // Fetch attendance summary when teacher data or filter period changes
  useEffect(() => {
    if (teacherData) {
      fetchAttendanceSummary();
    }
  }, [teacherData, filterPeriod]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const [hours, minutes, seconds] = prevTime.split(':').map(Number);
          const totalSeconds = hours * 3600 + minutes * 60 + seconds + 1;
          const newHours = Math.floor(totalSeconds / 3600);
          const newMinutes = Math.floor((totalSeconds % 3600) / 60);
          const newSeconds = totalSeconds % 60;
          return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Fetch attendance summary from backend
  const fetchAttendanceSummary = async () => {
    if (!teacherData) return;

    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        period: filterPeriod
      });

      // Add custom date range if it's a custom period
      if (filterPeriod.startsWith('Custom:')) {
        // Extract dates from "Custom: Jan 15 - Jan 25" format
        const dateRangeStr = filterPeriod.replace('Custom: ', '');
        const [startStr, endStr] = dateRangeStr.split(' - ');
        
        // Convert to ISO format (this is a simplified approach)
        const currentYear = new Date().getFullYear();
        const startDate = new Date(`${startStr} ${currentYear}`);
        const endDate = new Date(`${endStr} ${currentYear}`);
        
        queryParams.append('startDate', startDate.toISOString().split('T')[0]);
        queryParams.append('endDate', endDate.toISOString().split('T')[0]);
      }

      const response = await fetch(`/api/attendance/summary/${teacherData.id}?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setSummaryData(data.data);
      }
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (!teacherData) return;

    try {
      setLoading(true);
      const action = isRunning ? 'checkout' : 'checkin';
      
      const response = await fetch(`/api/attendance/checkin/${teacherData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          teacherName: teacherData.name,
          subject: teacherData.subject,
          workType: teacherData.workType || 'Full-time'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsRunning(!isRunning);
        if (action === 'checkout') {
          // Reset timer when checking out
          setTime('00:00:00');
          setIsRunning(false);
          // Refresh summary to show updated data
          await fetchAttendanceSummary();
        }
      } else {
        console.error('Check-in/out failed:', data.message);
        // You could show an error toast here
      }
    } catch (error) {
      console.error('Error with check-in/out:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (period: string) => {
    if (period === 'Custom') {
      setIsDatePickerOpen(true);
    } else {
      setFilterPeriod(period);
      // Here you would fetch data based on the selected period
    }
    setIsDropdownOpen(false);
  };

  const handleDateSelect = (date: Date) => {
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      setDateRange({ start: date, end: null });
    } else {
      if (date >= dateRange.start) {
        setDateRange({ ...dateRange, end: date });
      } else {
        setDateRange({ start: date, end: null });
      }
    }
  };

  const handleDateRangeConfirm = () => {
    if (dateRange.start && dateRange.end) {
      const startStr = dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      setFilterPeriod(`Custom: ${startStr} - ${endStr}`);
      setIsDatePickerOpen(false);
      setDateRange({ start: null, end: null });
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Day headers
    dayHeaders.forEach(day => {
      days.push(<DayHeader key={day}>{day}</DayHeader>);
    });

    // Empty cells for days before month starts
    for (let i = 0; i < startingDay; i++) {
      days.push(<DayCell key={`empty-${i}`} disabled />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = Boolean((dateRange.start && date.toDateString() === dateRange.start.toDateString()) ||
                        (dateRange.end && date.toDateString() === dateRange.end.toDateString()));
      const isInRange = Boolean(dateRange.start && dateRange.end &&
                       date >= dateRange.start && date <= dateRange.end);

      days.push(
        <DayCell
          key={day}
          isSelected={isSelected}
          isInRange={isInRange}
          isToday={isToday}
          onClick={() => handleDateSelect(date)}
        >
          {day}
        </DayCell>
      );
    }

    return days;
  };

  const handleProfileNavigation = () => {
    navigate('/teacher/profile');
  };

  return (
    <Container>
      <Header>
        <HeaderText>
          <Greeting>Hey, {teacherData?.name || 'Teacher'}</Greeting>
          <Subtitle>Mark your attendance!</Subtitle>
        </HeaderText>
        <ProfileImage />
      </Header>

      <MainContent>
        <WorkTimeCard>
          <WorkTimeHeader>
            <WorkTimeTitle>Work Time</WorkTimeTitle>
            <SendRequestButton>Send Request</SendRequestButton>
          </WorkTimeHeader>

          <TimerDisplay>
            <TimeText>{time}</TimeText>
            <DateText>{formattedDate}</DateText>
            <PlayButton onClick={handlePlayPause} disabled={loading}>
              {loading ? '⏳' : <PlayIcon />}
            </PlayButton>
            <MotivationText>
              Check in and get started on your successful day
            </MotivationText>
          </TimerDisplay>
        </WorkTimeCard>

        <SummarySection>
          <SummaryHeader>
            <SummaryTitle>Summary</SummaryTitle>
            <FilterDropdown>
              <DropdownButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {filterPeriod} ▼
              </DropdownButton>
              <DropdownMenu isOpen={isDropdownOpen}>
                <DropdownItem onClick={() => handleFilterChange('This week')}>This week</DropdownItem>
                <DropdownItem onClick={() => handleFilterChange('This month')}>This month</DropdownItem>
                <DropdownItem onClick={() => handleFilterChange('Last week')}>Last week</DropdownItem>
                <DropdownItem onClick={() => handleFilterChange('Last month')}>Last month</DropdownItem>
                <DropdownItem onClick={() => handleFilterChange('Custom')}>Custom</DropdownItem>
              </DropdownMenu>
            </FilterDropdown>
          </SummaryHeader>

          <SummaryGrid>
            <SummaryItem>
              <SummaryLabel>Allowed Absence</SummaryLabel>
              <SummaryValue>{loading ? '⏳' : `${summaryData.allowedAbsence.toString().padStart(2, '0')} Days`}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Unallowed Absence</SummaryLabel>
              <SummaryValue>{loading ? '⏳' : `${summaryData.unallowedAbsence.toString().padStart(2, '0')} Days`}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Authorized Absence</SummaryLabel>
              <SummaryValue>{loading ? '⏳' : `${summaryData.authorizedAbsence.toString().padStart(2, '0')} Days`}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Unauthorized Absence</SummaryLabel>
              <SummaryValue>{loading ? '⏳' : `${summaryData.unauthorizedAbsence.toString().padStart(2, '0')} Days`}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Overtime</SummaryLabel>
              <SummaryValue>{loading ? '⏳' : `${summaryData.overtime.toString().padStart(2, '0')} Days`}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
                              <SummaryLabel>Late Arrival</SummaryLabel>
                <SummaryValue>{loading ? '⏳' : `${summaryData.lateArrival.toString().padStart(2, '0')} Days`}</SummaryValue>
            </SummaryItem>
          </SummaryGrid>
        </SummarySection>

        <div style={{ height: '100px' }} /> {/* Spacer for bottom navigation */}
      </MainContent>

      {/* Date Picker Modal */}
      <DatePickerModal isOpen={isDatePickerOpen}>
        <DatePickerContent>
          <CalendarHeader>
            <NavButton onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
              ‹
            </NavButton>
            <MonthYear>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </MonthYear>
            <NavButton onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
              ›
            </NavButton>
          </CalendarHeader>

          <CalendarGrid>
            {renderCalendar()}
          </CalendarGrid>

          {dateRange.start && dateRange.end && (
            <DateRangeDisplay>
              {dateRange.start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - {dateRange.end.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
            </DateRangeDisplay>
          )}

          <DoneButton 
            onClick={handleDateRangeConfirm}
            disabled={!dateRange.start || !dateRange.end}
            style={{ opacity: (!dateRange.start || !dateRange.end) ? 0.5 : 1 }}
          >
            Done
          </DoneButton>
        </DatePickerContent>
      </DatePickerModal>

      {/* Bottom Navigation */}
      <BottomNavigation>
        <NavItem active>
          <NavIcon>🏠</NavIcon>
          <NavLabel>Home</NavLabel>
        </NavItem>
        <NavItem onClick={() => navigate('/teacher/history')}>
          <NavIcon>📊</NavIcon>
          <NavLabel>History</NavLabel>
        </NavItem>
        <NavItem>
          <NavIcon>🔔</NavIcon>
          <NavLabel>Notifications</NavLabel>
        </NavItem>
        <NavItem onClick={handleProfileNavigation}>
          <NavIcon>👤</NavIcon>
          <NavLabel>Profile</NavLabel>
        </NavItem>
      </BottomNavigation>
    </Container>
  );
};

export default TeacherHome; 