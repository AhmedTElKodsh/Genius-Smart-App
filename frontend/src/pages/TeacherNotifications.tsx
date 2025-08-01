import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import { API_BASE_URL } from '../config/api';

// Styled Components
const Container = styled.div<{ isDarkMode: boolean }>`
  min-height: 100vh;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)'
  };
  padding: 0;
  position: relative;
`;

const Header = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  padding: 60px 20px 30px 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const HeaderText = styled.div<{ isRTL: boolean }>`
  flex: 1;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
`;

const PageTitle = styled.h1<{ isRTL: boolean }>`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const MainContent = styled.div<{ isDarkMode: boolean }>`
  flex: 1;
  background: ${props => props.isDarkMode ? '#1a1a1a' : '#f5f5f5'};
  border-radius: 25px 25px 0 0;
  min-height: calc(100vh - 150px);
  padding: 20px;
  position: relative;
`;

const SectionTitle = styled.h2<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#cccccc' : '#666666'};
  font-size: 18px;
  font-weight: 600;
  margin: 30px 0 15px 0;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};

  &:first-child {
    margin-top: 0;
  }
`;

const NotificationCard = styled.div<{ isDarkMode: boolean; isRTL: boolean; type: string }>`
  background: ${props => {
    if (props.type === 'warning') return props.isDarkMode ? '#3d2a1a' : '#F5F5DC';
    if (props.type === 'success') return props.isDarkMode ? '#1a3d1a' : '#E8F5E8';
    if (props.type === 'info') return props.isDarkMode ? '#1a2a3d' : '#E8F0FF';
    return props.isDarkMode ? '#2a2a2a' : '#F5F5DC';
  }};
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  border: ${props => props.isDarkMode ? '1px solid #333' : 'none'};
  box-shadow: ${props => props.isDarkMode 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'
  };
`;

const NotificationIcon = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.isDarkMode ? '#2d3748' : '#2d3748'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-${props => props.isRTL ? 'left' : 'right'}: 16px;
  position: relative;
  flex-shrink: 0;
`;

const IconImage = styled.div`
  width: 30px;
  height: 30px;
  background: #DAA520;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
`;

const NotificationContent = styled.div<{ isRTL: boolean }>`
  flex: 1;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
`;

const NotificationText = styled.p<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  line-height: 1.4;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const BottomNavigation = styled.div<{ isDarkMode: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  border-top: ${props => props.isDarkMode ? '1px solid #333' : '1px solid #e0e0e0'};
  display: flex;
  justify-content: space-around;
  padding: 12px 0 8px 0;
  z-index: 100;
`;

const NavItem = styled.div<{ active?: boolean; isDarkMode: boolean; isRTL: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  background: ${props => props.active ? (props.isDarkMode ? '#333' : '#f0f0f0') : 'transparent'};
  color: ${props => props.active ? '#DAA520' : (props.isDarkMode ? '#cccccc' : '#666666')};
  transition: all 0.2s;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};

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

const EmptyState = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.isDarkMode ? '#cccccc' : '#666666'};
  font-size: 16px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

// Types
interface Notification {
  id: string;
  type: 'warning' | 'success' | 'info' | 'error';
  message: string;
  date: string;
  category: 'request' | 'attendance' | 'performance';
  isRead: boolean;
}

interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  lastWeek: Notification[];
  lastMonth: Notification[];
}

const TeacherNotifications: React.FC = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { isDarkMode } = useTheme();
  const t = translations[language];

  const [notifications, setNotifications] = useState<GroupedNotifications>({
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: []
  });
  const [loading, setLoading] = useState(false);
  const [teacherData, setTeacherData] = useState<any>(null);

  // Load teacher data on mount
  useEffect(() => {
    const storedTeacherData = localStorage.getItem('teacherData');
    if (storedTeacherData) {
      try {
        const teacherInfo = JSON.parse(storedTeacherData);
        setTeacherData(teacherInfo);
      } catch (error) {
        console.error('Error parsing teacher data:', error);
        navigate('/teacher/signin');
      }
    } else {
      navigate('/teacher/signin');
    }
  }, [navigate]);

  // Fetch notifications when teacher data is available or language changes
  useEffect(() => {
    if (teacherData) {
      fetchNotifications();
    }
  }, [teacherData, language]);

  const fetchNotifications = async () => {
    if (!teacherData) return;

    try {
      setLoading(true);
      
      const langParam = language === 'ar' ? '?lang=ar' : '';
      
      // Fetch request status notifications
      const requestResponse = await fetch(`${API_BASE_URL}/requests/teacher/${teacherData.id}${langParam}`);
      const requestData = await requestResponse.json();

      // Fetch attendance notifications  
      const attendanceResponse = await fetch(`${API_BASE_URL}/attendance/notifications/${teacherData.id}${langParam}`);
      const attendanceData = await attendanceResponse.json();

      // Combine and group notifications
      const allNotifications = [
        ...(requestData.success ? requestData.data : []),
        ...(attendanceData.success ? attendanceData.data : [])
      ];

      groupNotificationsByTime(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupNotificationsByTime = (notifications: Notification[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    const grouped: GroupedNotifications = {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: []
    };

    notifications.forEach(notification => {
      const notificationDate = new Date(notification.date);
      const notificationDay = new Date(notificationDate.getFullYear(), notificationDate.getMonth(), notificationDate.getDate());
      
      if (notificationDay.getTime() === today.getTime()) {
        grouped.today.push(notification);
      } else if (notificationDay.getTime() === yesterday.getTime()) {
        grouped.yesterday.push(notification);
      } else if (notificationDay >= lastWeek && notificationDay < yesterday) {
        grouped.lastWeek.push(notification);
      } else if (notificationDay >= lastMonth && notificationDay < lastWeek) {
        grouped.lastMonth.push(notification);
      }
    });

    // Sort notifications within each group by date (newest first)
    Object.keys(grouped).forEach(key => {
      grouped[key as keyof GroupedNotifications].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    setNotifications(grouped);
  };

  const getNotificationIcon = (notification: Notification) => {
    // Check the category and type to show more specific icons
    if (notification.category === 'request') {
      return notification.type === 'success' ? '✓' : '✕';
    } else if (notification.category === 'attendance') {
      if (notification.message.includes('late') || notification.message.includes('تأخر')) {
        return '⏰';
      } else if (notification.message.includes('absence') || notification.message.includes('غياب')) {
        return '❌';
      } else if (notification.message.includes('early') || notification.message.includes('مبكر')) {
        return '⬅️';
      }
      return '📅';
    } else if (notification.category === 'performance') {
      return '📊';
    }
    
    // Fallback to type-based icons
    switch (notification.type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      case 'info':
      default:
        return 'ⓘ';
    }
  };

  const handleNavigation = (route: string) => {
    switch (route) {
      case 'home':
        navigate('/teacher/home-advanced');
        break;
      case 'history':
        navigate('/teacher/history');
        break;
      case 'profile':
        navigate('/teacher/profile');
        break;
    }
  };

  const renderNotificationSection = (title: string, notifications: Notification[]) => {
    if (notifications.length === 0) return null;

    return (
      <>
        <SectionTitle isDarkMode={isDarkMode} isRTL={isRTL}>
          {title}
        </SectionTitle>
        {notifications.map(notification => (
          <NotificationCard
            key={notification.id}
            isDarkMode={isDarkMode}
            isRTL={isRTL}
            type={notification.type}
          >
            <NotificationIcon isDarkMode={isDarkMode} isRTL={isRTL}>
              <IconImage>
                {getNotificationIcon(notification)}
              </IconImage>
            </NotificationIcon>
            <NotificationContent isRTL={isRTL}>
              <NotificationText isDarkMode={isDarkMode} isRTL={isRTL}>
                {notification.message}
              </NotificationText>
            </NotificationContent>
          </NotificationCard>
        ))}
      </>
    );
  };

  const hasAnyNotifications = notifications.today.length > 0 ||
                            notifications.yesterday.length > 0 ||
                            notifications.lastWeek.length > 0 ||
                            notifications.lastMonth.length > 0;

  return (
    <Container isDarkMode={isDarkMode}>
      <Header isDarkMode={isDarkMode} isRTL={isRTL}>
        <HeaderText isRTL={isRTL}>
          <PageTitle isRTL={isRTL}>
            {t.notifications || (isRTL ? 'الإشعارات' : 'Notification')}
          </PageTitle>
        </HeaderText>
      </Header>

      <MainContent isDarkMode={isDarkMode}>
        {loading ? (
          <EmptyState isDarkMode={isDarkMode} isRTL={isRTL}>
            {isRTL ? 'جارٍ التحميل...' : 'Loading...'}
          </EmptyState>
        ) : !hasAnyNotifications ? (
          <EmptyState isDarkMode={isDarkMode} isRTL={isRTL}>
            {isRTL ? 'لا توجد إشعارات' : 'No notifications'}
          </EmptyState>
        ) : (
          <>
            {renderNotificationSection(
              isRTL ? 'اليوم' : 'Today', 
              notifications.today
            )}
            {renderNotificationSection(
              isRTL ? 'الأمس' : 'Yesterday', 
              notifications.yesterday
            )}
            {renderNotificationSection(
              isRTL ? 'الأسبوع الماضي' : 'Last Week', 
              notifications.lastWeek
            )}
            {renderNotificationSection(
              isRTL ? 'الشهر الماضي' : 'Last Month', 
              notifications.lastMonth
            )}
          </>
        )}

        <div style={{ height: '100px' }} />
      </MainContent>

      {/* Bottom Navigation */}
      <BottomNavigation isDarkMode={isDarkMode}>
        <NavItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleNavigation('home')}>
          <NavIcon>🏠</NavIcon>
          <NavLabel>{t.home}</NavLabel>
        </NavItem>
        <NavItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleNavigation('history')}>
          <NavIcon>📊</NavIcon>
          <NavLabel>{t.history}</NavLabel>
        </NavItem>
        <NavItem active isDarkMode={isDarkMode} isRTL={isRTL}>
          <NavIcon>🔔</NavIcon>
          <NavLabel>{t.notifications}</NavLabel>
        </NavItem>
        <NavItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleNavigation('profile')}>
          <NavIcon>👤</NavIcon>
          <NavLabel>{t.profile}</NavLabel>
        </NavItem>
      </BottomNavigation>
    </Container>
  );
};

export default TeacherNotifications; 
