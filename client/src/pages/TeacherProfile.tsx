import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';


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

const Subtitle = styled.p<{ isRTL: boolean; isDarkMode: boolean }>`
  font-size: 16px;
  opacity: 0.9;
  margin: 5px 0 0 0;
  color: ${props => props.isDarkMode ? '#ccc' : 'white'};
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

const ProfileCard = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: ${props => props.isDarkMode 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'
  };
  border: ${props => props.isDarkMode ? '1px solid #333' : 'none'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const ProfileImageSection = styled.div<{ isRTL: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'}; /* RTL: image on right, info on left. LTR: image on left, info on right */
`;

const ProfileImageContainer = styled.div<{ isRTL: boolean }>`
  position: relative;
  margin-right: ${props => props.isRTL ? '0' : '20px'}; /* LTR: 20px margin to the right */
  margin-left: ${props => props.isRTL ? '20px' : '0'}; /* RTL: 20px margin to the left */
`;

const ProfileImage = styled.div<{ profileImageUrl?: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.profileImageUrl 
    ? `url('${props.profileImageUrl}') center/cover`
    : `url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face') center/cover`
  };
  border: 4px solid #DAA520;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ProfileImageIcon = styled.div<{ isDarkMode: boolean }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: ${props => props.isDarkMode ? '#DAA520' : '#DAA520'};
  border: 3px solid ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: white;
  font-weight: bold;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.isDarkMode ? '#B8860B' : '#B8860B'};
    transform: scale(1.1);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ProfileInfo = styled.div<{ isRTL: boolean }>`
  flex: 1;
  text-align: ${props => props.isRTL ? 'right' : 'left'}; /* RTL: right-aligned for Arabic names, LTR: left-aligned */
`;

const TeacherName = styled.h2<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const TeacherSubject = styled.p<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#DAA520' : '#DAA520'};
  font-size: 16px;
  margin: 0 0 4px 0;
  font-weight: 500;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const TeacherWorkType = styled.p<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#cccccc' : '#666666'};
  font-size: 14px;
  margin: 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const SectionTitle = styled.h3<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #DAA520;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const InfoGrid = styled.div<{ isRTL: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const InfoItem = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  display: flex;
  flex-direction: column;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
`;

const InfoLabel = styled.label<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#cccccc' : '#666666'};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const InfoInput = styled.input<{ isDarkMode: boolean; isEditing: boolean }>`
  background: ${props => props.isEditing 
    ? (props.isDarkMode ? '#333' : '#fff') 
    : (props.isDarkMode ? '#1a1a1a' : '#f5f5f5')
  };
  border: ${props => props.isEditing 
    ? `2px solid #DAA520` 
    : `1px solid ${props.isDarkMode ? '#333' : '#e0e0e0'}`
  };
  border-radius: 8px;
  padding: 12px;
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 16px;
  font-family: inherit;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #DAA520;
    box-shadow: 0 0 0 3px rgba(218, 165, 32, 0.1);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const EditButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#DAA520' : '#DAA520'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  
  &:hover {
    background: ${props => props.isDarkMode ? '#B8860B' : '#B8860B'};
    transform: translateY(-1px);
  }
`;

const SaveButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: ${props => props.isRTL ? '0' : '12px'};
  margin-left: ${props => props.isRTL ? '12px' : '0'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  
  &:hover {
    background: #218838;
    transform: translateY(-1px);
  }
`;

const CancelButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: transparent;
  color: ${props => props.isDarkMode ? '#cccccc' : '#666666'};
  border: 2px solid ${props => props.isDarkMode ? '#cccccc' : '#666666'};
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  
  &:hover {
    background: ${props => props.isDarkMode ? '#cccccc' : '#666666'};
    color: ${props => props.isDarkMode ? '#1a1a1a' : 'white'};
  }
`;

const LogoutButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: auto;
  max-width: 200px;
  margin: 0 auto;
  display: block;
  text-align: center;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  
  &:hover {
    background: #c82333;
    transform: translateY(-1px);
  }
`;

const LogoutContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
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

const SettingsCard = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: ${props => props.isDarkMode 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'
  };
  border: ${props => props.isDarkMode ? '1px solid #333' : 'none'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const SettingsTitle = styled.h3<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const RadioGroup = styled.div<{ isRTL: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RadioOption = styled.div<{ isRTL: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};
  cursor: pointer;
  padding: 8px 0;
`;

const RadioLabel = styled.span<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 16px;
  font-weight: 500;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const RadioButton = styled.div<{ isSelected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid #DAA520;
  background: ${props => props.isSelected ? '#DAA520' : 'transparent'};
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
    opacity: ${props => props.isSelected ? 1 : 0};
    transition: opacity 0.2s ease;
  }
`;

// Types
interface TeacherProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  subject: string;
  workType: string;
  joinDate: string;
  address?: string;
  profileImageUrl?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const TeacherProfile: React.FC = () => {
  const navigate = useNavigate();
  const { language, isRTL, setLanguage } = useLanguage();
  const { isDarkMode, setTheme } = useTheme();
  const t = translations[language];

  const [teacherData, setTeacherData] = useState<TeacherProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load teacher data on mount
  useEffect(() => {
    const storedTeacherData = localStorage.getItem('teacherData');
    if (storedTeacherData) {
      try {
        const teacherInfo = JSON.parse(storedTeacherData);
        setTeacherData(teacherInfo);
        setEditedData(teacherInfo);
      } catch (error) {
        console.error('Error parsing teacher data:', error);
        navigate('/teacher/signin');
      }
    } else {
      navigate('/teacher/signin');
    }

    // Load notification preference
    const storedNotifications = localStorage.getItem('notificationsEnabled');
    if (storedNotifications) {
      try {
        setNotificationsEnabled(JSON.parse(storedNotifications));
      } catch (error) {
        console.error('Error parsing notification preference:', error);
      }
    }
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
    // Clear password fields when starting edit
    if (editedData) {
      setEditedData({
        ...editedData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(teacherData);
  };

  const handleSave = async () => {
    if (!editedData || !teacherData) return;

    // Validate password fields if they are provided
    if (editedData.newPassword || editedData.confirmPassword || editedData.currentPassword) {
      if (!editedData.currentPassword) {
        alert(isRTL ? 'يرجى إدخال كلمة المرور الحالية' : 'Please enter your current password');
        return;
      }
      if (!editedData.newPassword) {
        alert(isRTL ? 'يرجى إدخال كلمة المرور الجديدة' : 'Please enter a new password');
        return;
      }
      if (!editedData.confirmPassword) {
        alert(isRTL ? 'يرجى تأكيد كلمة المرور الجديدة' : 'Please confirm your new password');
        return;
      }
      if (editedData.newPassword !== editedData.confirmPassword) {
        alert(isRTL ? 'كلمة المرور الجديدة وتأكيدها غير متطابقين' : 'New password and confirmation do not match');
        return;
      }
      if (editedData.newPassword.length < 6) {
        alert(isRTL ? 'يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل' : 'New password must be at least 6 characters long');
        return;
      }
    }

    try {
      setLoading(true);
      
      // Prepare data for server update
      const updateData = {
        firstName: editedData.firstName,
        lastName: editedData.lastName,
        email: editedData.email,
        phone: editedData.phone,
        address: editedData.address,
        ...(editedData.newPassword && {
          currentPassword: editedData.currentPassword,
          newPassword: editedData.newPassword
        })
      };
      
      // Update server
      const response = await fetch(`http://localhost:5000/api/teachers/profile/${teacherData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedTeacher = await response.json();
        
        // Update localStorage with the response data (excluding password fields)
        const updatedTeacherData = {
          ...teacherData,
          firstName: editedData.firstName,
          lastName: editedData.lastName,
          email: editedData.email,
          phone: editedData.phone,
          address: editedData.address,
          name: `${editedData.firstName} ${editedData.lastName}` // Update full name
        };
        
        localStorage.setItem('teacherData', JSON.stringify(updatedTeacherData));
        setTeacherData(updatedTeacherData);
        setIsEditing(false);
        
        // Clear password fields from editedData
        setEditedData({
          ...updatedTeacherData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        alert(isRTL ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.message || (isRTL ? 'فشل في تحديث الملف الشخصي' : 'Failed to update profile'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(isRTL ? 'حدث خطأ أثناء تحديث الملف الشخصي' : 'An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TeacherProfile, value: string) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: value
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacherData');
    navigate('/');
  };

  const handleNavigation = (route: string) => {
    switch (route) {
      case 'home':
        navigate('/teacher/home-advanced');
        break;
      case 'history':
        navigate('/teacher/history');
        break;
      case 'notifications':
        navigate('/teacher/notifications');
        break;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (editedData) {
          setEditedData({
            ...editedData,
            profileImageUrl: imageUrl
          });
        }
        if (teacherData) {
          setTeacherData({
            ...teacherData,
            profileImageUrl: imageUrl
          });
          localStorage.setItem('teacherData', JSON.stringify({
            ...teacherData,
            profileImageUrl: imageUrl
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLanguageChange = (newLanguage: 'en' | 'ar') => {
    setLanguage(newLanguage);
  };

  const handleThemeChange = (isDark: boolean) => {
    setTheme(isDark ? 'dark' : 'light');
  };

  const handleNotificationToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    // Here you would also save to localStorage or send to server
    localStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
  };

  // Helper function to get translated subject name
  const getTranslatedSubject = (subject: string) => {
    if (isRTL && t.teacherInfo?.subjects) {
      return t.teacherInfo.subjects[subject as keyof typeof t.teacherInfo.subjects] || subject;
    }
    return subject;
  };

  // Helper function to get translated work type
  const getTranslatedWorkType = (workType: string) => {
    if (isRTL && t.teacherInfo?.workTypes) {
      return t.teacherInfo.workTypes[workType as keyof typeof t.teacherInfo.workTypes] || workType;
    }
    return workType;
  };

  if (!teacherData) {
    return (
      <Container isDarkMode={isDarkMode}>
        <MainContent isDarkMode={isDarkMode}>
          <div style={{ textAlign: 'center', padding: '40px', color: isDarkMode ? '#ccc' : '#666' }}>
            {isRTL ? 'جارٍ التحميل...' : 'Loading...'}
          </div>
        </MainContent>
      </Container>
    );
  }

  return (
    <Container isDarkMode={isDarkMode}>
      <Header isDarkMode={isDarkMode} isRTL={isRTL}>
        <HeaderText isRTL={isRTL}>
          <PageTitle isRTL={isRTL}>
            {isRTL ? `مرحباً، ${teacherData.name}` : `Hey, ${teacherData.name}`}
          </PageTitle>
          <Subtitle isRTL={isRTL} isDarkMode={isDarkMode}>
            {isRTL ? 'راجع ملفك الشخصي!' : 'Review your Profile!'}
          </Subtitle>
        </HeaderText>
      </Header>

      <MainContent isDarkMode={isDarkMode}>
        <ProfileCard isDarkMode={isDarkMode} isRTL={isRTL}>
                               <ProfileImageSection isRTL={isRTL}>
            <ProfileImageContainer isRTL={isRTL}>
              <ProfileImage 
                profileImageUrl={teacherData.profileImageUrl}
                onClick={() => document.getElementById('profileImageInput')?.click()}
              />
              <ProfileImageIcon 
                isDarkMode={isDarkMode}
                onClick={() => document.getElementById('profileImageInput')?.click()}
              >
                +
              </ProfileImageIcon>
              <HiddenFileInput
                id="profileImageInput"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </ProfileImageContainer>
            <ProfileInfo isRTL={isRTL}>
              <TeacherName isDarkMode={isDarkMode} isRTL={isRTL}>
                {teacherData.name}
              </TeacherName>
              <TeacherSubject isDarkMode={isDarkMode} isRTL={isRTL}>
                {getTranslatedSubject(teacherData.subject)}
              </TeacherSubject>
              <TeacherWorkType isDarkMode={isDarkMode} isRTL={isRTL}>
                {getTranslatedWorkType(teacherData.workType)}
              </TeacherWorkType>
            </ProfileInfo>
          </ProfileImageSection>

          <SectionTitle isDarkMode={isDarkMode} isRTL={isRTL}>
            {isRTL ? 'تفاصيل الملف الشخصي' : 'Profile Details'}
          </SectionTitle>

          {isEditing ? (
            <>
              <InfoGrid isRTL={isRTL}>
                <InfoItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <InfoLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                    {isRTL ? 'الاسم الأول' : 'First Name'}
                  </InfoLabel>
                  <InfoInput
                    isDarkMode={isDarkMode}
                    isEditing={isEditing}
                    value={editedData?.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </InfoItem>

                <InfoItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <InfoLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                    {isRTL ? 'اسم العائلة' : 'Last Name'}
                  </InfoLabel>
                  <InfoInput
                    isDarkMode={isDarkMode}
                    isEditing={isEditing}
                    value={editedData?.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </InfoItem>

                <InfoItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <InfoLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                    {isRTL ? 'البريد الإلكتروني' : 'Email'}
                  </InfoLabel>
                  <InfoInput
                    isDarkMode={isDarkMode}
                    isEditing={isEditing}
                    type="email"
                    value={editedData?.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </InfoItem>

                <InfoItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <InfoLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                    {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                  </InfoLabel>
                  <InfoInput
                    isDarkMode={isDarkMode}
                    isEditing={isEditing}
                    type="tel"
                    value={editedData?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </InfoItem>

                <InfoItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <InfoLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                    {isRTL ? 'كلمة المرور الحالية' : 'Current Password'}
                  </InfoLabel>
                  <InfoInput
                    isDarkMode={isDarkMode}
                    isEditing={isEditing}
                    type="password"
                    value={editedData?.currentPassword || ''}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder={isRTL ? 'اتركه فارغاً إذا لم ترد تغيير كلمة المرور' : 'Leave empty if not changing password'}
                  />
                </InfoItem>

                <InfoItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <InfoLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                    {isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
                  </InfoLabel>
                  <InfoInput
                    isDarkMode={isDarkMode}
                    isEditing={isEditing}
                    type="password"
                    value={editedData?.newPassword || ''}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder={isRTL ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                  />
                </InfoItem>

                <InfoItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <InfoLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                    {isRTL ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                  </InfoLabel>
                  <InfoInput
                    isDarkMode={isDarkMode}
                    isEditing={isEditing}
                    type="password"
                    value={editedData?.confirmPassword || ''}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder={isRTL ? 'أعد إدخال كلمة المرور الجديدة' : 'Re-enter new password'}
                  />
                </InfoItem>

                <InfoItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <InfoLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                    {isRTL ? 'العنوان' : 'Address'}
                  </InfoLabel>
                  <InfoInput
                    isDarkMode={isDarkMode}
                    isEditing={isEditing}
                    value={editedData?.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </InfoItem>
              </InfoGrid>

              <div>
                <SaveButton isDarkMode={isDarkMode} isRTL={isRTL} onClick={handleSave} disabled={loading}>
                  {loading ? (isRTL ? 'جارٍ الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
                </SaveButton>
                <CancelButton isDarkMode={isDarkMode} isRTL={isRTL} onClick={handleCancel}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </CancelButton>
              </div>
            </>
          ) : (
            <>
              <InfoGrid isRTL={isRTL}>
                <InfoItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <InfoLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                    {isRTL ? 'البريد الإلكتروني' : 'Email'}
                  </InfoLabel>
                  <InfoInput
                    isDarkMode={isDarkMode}
                    isEditing={false}
                    value={teacherData.email}
                    disabled
                  />
                </InfoItem>

                <InfoItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <InfoLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                    {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                  </InfoLabel>
                  <InfoInput
                    isDarkMode={isDarkMode}
                    isEditing={false}
                    value={teacherData.phone}
                    disabled
                  />
                </InfoItem>

                <InfoItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <InfoLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                    {isRTL ? 'تاريخ الانضمام' : 'Join Date'}
                  </InfoLabel>
                  <InfoInput
                    isDarkMode={isDarkMode}
                    isEditing={false}
                    value={new Date(teacherData.joinDate).toLocaleDateString()}
                    disabled
                  />
                </InfoItem>

                <InfoItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <InfoLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                    {isRTL ? 'العنوان' : 'Address'}
                  </InfoLabel>
                  <InfoInput
                    isDarkMode={isDarkMode}
                    isEditing={false}
                    value={teacherData.address || (isRTL ? 'غير محدد' : 'Not specified')}
                    disabled
                  />
                </InfoItem>
              </InfoGrid>

              <EditButton isDarkMode={isDarkMode} isRTL={isRTL} onClick={handleEdit}>
                {isRTL ? 'تعديل الملف الشخصي' : 'Edit Profile'}
              </EditButton>
            </>
          )}
        </ProfileCard>

        {/* Language Settings */}
        <SettingsCard isDarkMode={isDarkMode} isRTL={isRTL}>
          <SettingsTitle isDarkMode={isDarkMode} isRTL={isRTL}>
            {isRTL ? 'اللغة' : 'Language'}
          </SettingsTitle>
          <RadioGroup isRTL={isRTL}>
            <RadioOption 
              isRTL={isRTL} 
              onClick={() => handleLanguageChange('en')}
            >
              <RadioLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                English
              </RadioLabel>
              <RadioButton isSelected={language === 'en'} />
            </RadioOption>
            <RadioOption 
              isRTL={isRTL} 
              onClick={() => handleLanguageChange('ar')}
            >
              <RadioLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                Arabic
              </RadioLabel>
              <RadioButton isSelected={language === 'ar'} />
            </RadioOption>
          </RadioGroup>
        </SettingsCard>

        {/* Theme Settings */}
        <SettingsCard isDarkMode={isDarkMode} isRTL={isRTL}>
          <SettingsTitle isDarkMode={isDarkMode} isRTL={isRTL}>
            {isRTL ? 'وضع المظهر' : 'Theme Mode'}
          </SettingsTitle>
          <RadioGroup isRTL={isRTL}>
            <RadioOption 
              isRTL={isRTL} 
              onClick={() => handleThemeChange(false)}
            >
              <RadioLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                {isRTL ? 'فاتح' : 'Light'}
              </RadioLabel>
              <RadioButton isSelected={!isDarkMode} />
            </RadioOption>
            <RadioOption 
              isRTL={isRTL} 
              onClick={() => handleThemeChange(true)}
            >
              <RadioLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                {isRTL ? 'داكن' : 'Dark'}
              </RadioLabel>
              <RadioButton isSelected={isDarkMode} />
            </RadioOption>
          </RadioGroup>
        </SettingsCard>

        {/* Notifications Settings */}
        <SettingsCard isDarkMode={isDarkMode} isRTL={isRTL}>
          <SettingsTitle isDarkMode={isDarkMode} isRTL={isRTL}>
            {isRTL ? 'الإشعارات' : 'Notifications'}
          </SettingsTitle>
          <RadioGroup isRTL={isRTL}>
            <RadioOption 
              isRTL={isRTL} 
              onClick={() => handleNotificationToggle(true)}
            >
              <RadioLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                {isRTL ? 'مفعّل' : 'On'}
              </RadioLabel>
              <RadioButton isSelected={notificationsEnabled} />
            </RadioOption>
            <RadioOption 
              isRTL={isRTL} 
              onClick={() => handleNotificationToggle(false)}
            >
              <RadioLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                {isRTL ? 'مُعطّل' : 'Off'}
              </RadioLabel>
              <RadioButton isSelected={!notificationsEnabled} />
            </RadioOption>
          </RadioGroup>
        </SettingsCard>

        {/* Logout Section */}
        <ProfileCard isDarkMode={isDarkMode} isRTL={isRTL}>
          <LogoutContainer>
            <LogoutButton isDarkMode={isDarkMode} isRTL={isRTL} onClick={handleLogout}>
              {isRTL ? 'تسجيل الخروج' : 'Log Out'}
            </LogoutButton>
          </LogoutContainer>
        </ProfileCard>

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
        <NavItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleNavigation('notifications')}>
          <NavIcon>🔔</NavIcon>
          <NavLabel>{t.notifications}</NavLabel>
        </NavItem>
        <NavItem active isDarkMode={isDarkMode} isRTL={isRTL}>
          <NavIcon>👤</NavIcon>
          <NavLabel>{t.profile}</NavLabel>
        </NavItem>
      </BottomNavigation>
    </Container>
  );
};

export default TeacherProfile; 