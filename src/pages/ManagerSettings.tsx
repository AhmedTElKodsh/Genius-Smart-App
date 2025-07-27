import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AddTeacherModal from '../components/AddTeacherModal';
import { useLanguage } from '../contexts/LanguageContext';

// Styled components
const SettingsContainer = styled.div`
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '👑';
    font-size: 24px;
  }
`;

const LogoText = styled.div`
  h1 {
    font-family: 'Poppins', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin: 0;
  }
  
  p {
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    color: #666;
    margin: 0;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$active ? `
    background: #D4AF37;
    color: white;
  ` : `
    background: white;
    color: #666;
    
    &:hover {
      background: #f5f5f5;
    }
  `}
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FormHeader = styled.div`
  margin-bottom: 32px;
  text-align: center;
`;

const FormTitle = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const FormSubtitle = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  color: #666;
  margin: 0;
`;

const Form = styled.form`
  display: grid;
  gap: 24px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const Input = styled.input`
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #D4AF37;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const Select = styled.select`
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  background: white;
  color: #141F25;
  cursor: pointer;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #D4AF37;
  }
  
  option {
    color: #141F25;
    background: #ffffff;
  }
`;

const ImageUploadContainer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  transition: border-color 0.2s ease;
  
  &:hover {
    border-color: #D4AF37;
  }
`;

const ProfileImage = styled.div<{ $imageUrl?: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : '#e0e0e0'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  ${props => !props.$imageUrl && `
    &::before {
      content: '👤';
      font-size: 48px;
      color: #999;
    }
  `}
`;

const ImageUploadButton = styled.button`
  padding: 12px 24px;
  background: #D4AF37;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #B8941F;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const DateOfBirthContainer = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: auto 1fr 1fr 1fr;
  gap: 16px;
  align-items: end;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DateSelect = styled(Select)`
  min-width: 200px;
`;

const SaveButton = styled.button`
  grid-column: 1 / -1;
  justify-self: end;
  padding: 16px 48px;
  background: #D4AF37;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #B8941F;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-top: 16px;
  padding: 12px;
  background: #fee;
  border-radius: 4px;
  border: 1px solid #fcc;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  font-size: 14px;
  margin-top: 16px;
  padding: 12px;
  background: #efe;
  border-radius: 4px;
  border: 1px solid #cfc;
`;

const HelperText = styled.p`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
`;

const NotificationContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const NotificationGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  transition: border-color 0.2s ease;
  
  &:hover {
    border-color: #D4AF37;
  }
`;

const NotificationLabel = styled.span`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const ToggleSwitch = styled.div<{ $active: boolean }>`
  width: 60px;
  height: 30px;
  border-radius: 15px;
  background: ${props => props.$active ? '#D4AF37' : '#e0e0e0'};
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${props => props.$active ? '32px' : '2px'};
    transition: left 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const PasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 500px;
  margin: 0 auto;
`;

const PasswordInput = styled(Input)`
  &:focus {
    border-color: #D4AF37;
  }
`;

const TestButton = styled.button`
  padding: 8px 16px;
  background: #f0f0f0;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e0e0e0;
    color: #333;
  }
`;

const TestSection = styled.div`
  margin-top: 32px;
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
`;

const TestSectionTitle = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
`;

const TestButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

// Interfaces
interface ManagerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  profileImage?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationPreferences {
  allNotifications: boolean;
  earlyArrival: boolean;
  lateArrival: boolean;
  earlyLeaves: boolean;
  lateLeaves: boolean;
  absentsTeachers: boolean;
  dailyReports: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  yearlyReports: boolean;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language, setLanguage, isRTL } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: {
      day: '',
      month: '',
      year: ''
    }
  });
  
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    allNotifications: true,
    earlyArrival: true,
    lateArrival: true,
    earlyLeaves: true,
    lateLeaves: true,
    absentsTeachers: true,
    dailyReports: true,
    weeklyReports: true,
    monthlyReports: true,
    yearlyReports: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load manager profile on component mount
  useEffect(() => {
    loadManagerProfile();
    if (activeTab === 'notifications') {
      loadNotificationPreferences();
    }
  }, [activeTab]);

  const loadManagerProfile = async () => {
    try {
      let token = localStorage.getItem('authToken');
      
      // For demo purposes, create a default token if none exists
      if (!token) {
        token = 'demo-manager-token-12345';
        localStorage.setItem('authToken', token);
      }

      const response = await fetch('http://localhost:5000/api/manager/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const profile = data.data;
        
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          dateOfBirth: profile.dateOfBirth || { day: '', month: '', year: '' }
        });
        
        if (profile.profileImage) {
          setProfileImage(profile.profileImage);
        }
      } else {
        setError('Failed to load profile information');
      }
    } catch (err) {
      setError('Error loading profile information');
    }
  };

  const loadNotificationPreferences = async () => {
    try {
      let token = localStorage.getItem('authToken');
      
      if (!token) {
        token = 'demo-manager-token-12345';
        localStorage.setItem('authToken', token);
      }

      const response = await fetch('http://localhost:5000/api/manager/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data);
      } else {
        setError('Failed to load notification preferences');
      }
    } catch (err) {
      setError('Error loading notification preferences');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('dateOfBirth.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dateOfBirth: {
          ...prev.dateOfBirth,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let token = localStorage.getItem('authToken');
      
      // For demo purposes, create a default token if none exists
      if (!token) {
        token = 'demo-manager-token-12345';
        localStorage.setItem('authToken', token);
      }

      const updateData = {
        ...formData,
        profileImage: profileImage || undefined
      };

      const response = await fetch('http://localhost:5000/api/manager/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        
        // If email was changed, update localStorage
        if (formData.email) {
          // You might want to handle email change specially
          // For now, just show success
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = async (key: keyof NotificationPreferences) => {
    try {
      const updatedNotifications = {
        ...notifications,
        [key]: !notifications[key]
      };

      // If turning off "All Notifications", turn off all others
      if (key === 'allNotifications' && !notifications.allNotifications) {
        Object.keys(updatedNotifications).forEach(k => {
          if (k !== 'allNotifications') {
            updatedNotifications[k as keyof NotificationPreferences] = false;
          }
        });
      }

      // If turning on any specific notification, ensure "All Notifications" is on
      if (key !== 'allNotifications' && !notifications[key]) {
        updatedNotifications.allNotifications = true;
      }

      setNotifications(updatedNotifications);

      // Save to backend
      let token = localStorage.getItem('authToken');
      
      if (!token) {
        token = 'demo-manager-token-12345';
        localStorage.setItem('authToken', token);
      }

      const response = await fetch('http://localhost:5000/api/manager/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNotifications),
      });

      if (response.ok) {
        setSuccess('Notification preferences updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update notification preferences');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Error updating notification preferences');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let token = localStorage.getItem('authToken');
      
      if (!token) {
        token = 'demo-manager-token-12345';
        localStorage.setItem('authToken', token);
      }

      const response = await fetch('http://localhost:5000/api/manager/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async (requestType: string) => {
    try {
      let token = localStorage.getItem('authToken');
      
      if (!token) {
        token = 'demo-manager-token-12345';
        localStorage.setItem('authToken', token);
      }

      const response = await fetch('http://localhost:5000/api/manager/test-notification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestType }),
      });

      if (response.ok) {
        setSuccess(`Test ${requestType} notification sent! Check console for details.`);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError('Failed to send test notification');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Error sending test notification');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Generate day, month, year options
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  // Modal handlers
  const handleAddTeacher = () => {
    setShowAddTeacherModal(true);
  };

  const handleCloseModal = () => {
    setShowAddTeacherModal(false);
  };

  const handleTeacherAdded = () => {
    // Refresh data when a new teacher is added if needed
    console.log('Teacher added successfully');
  };

  return (
    <SettingsContainer>
      <Sidebar onAddTeacher={handleAddTeacher} />
      
      <MainContent $isRTL={isRTL}>
        <Header>
          <HeaderLeft>
            <Logo>
              <LogoIcon />
              <LogoText>
                <h1>Genius Smart</h1>
                <p>Education</p>
              </LogoText>
            </Logo>
          </HeaderLeft>
        </Header>

        <TabContainer>
          <Tab $active={activeTab === 'general'} onClick={() => setActiveTab('general')}>
            {t('settings.general')}
          </Tab>
          <Tab $active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
            {t('settings.security')}
          </Tab>
          <Tab $active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
            {t('settings.notifications')}
          </Tab>
        </TabContainer>

        {activeTab === 'general' && (
          <FormContainer>
            <FormHeader>
              <FormTitle>{t('settings.general.title')}</FormTitle>
              <FormSubtitle>{t('settings.general.subtitle')}</FormSubtitle>
            </FormHeader>
            
            <Form onSubmit={handleSubmit}>
              {/* Profile Image Section */}
              <ImageUploadContainer>
                <ProfileImage $imageUrl={profileImage} />
                <ImageUploadButton type="button" onClick={() => fileInputRef.current?.click()}>
                  {t('settings.general.uploadButton')}
                </ImageUploadButton>
                <HiddenFileInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </ImageUploadContainer>

              {/* Personal Information */}
              <FormRow>
                <FormGroup>
                  <Label htmlFor="firstName" $isRTL={isRTL}>{t('settings.general.firstName')}</Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder={t('settings.general.firstNamePlaceholder')}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="lastName" $isRTL={isRTL}>{t('settings.general.lastName')}</Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder={t('settings.general.lastNamePlaceholder')}
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label htmlFor="email" $isRTL={isRTL}>{t('settings.general.email')}</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('settings.general.emailPlaceholder')}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="phone" $isRTL={isRTL}>{t('settings.general.phone')}</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('settings.general.phonePlaceholder')}
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label htmlFor="address" $isRTL={isRTL}>{t('settings.general.address')}</Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={t('settings.general.addressPlaceholder')}
                  required
                />
              </FormGroup>

              {/* Date of Birth */}
              <DateOfBirthContainer>
                <Label $isRTL={isRTL}>{t('settings.general.dateOfBirth')}</Label>
                <FormGroup>
                  <DateSelect
                    name="dateOfBirth.day"
                    value={formData.dateOfBirth.day}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">{t('addTeacher.day')}</option>
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </DateSelect>
                </FormGroup>
                <FormGroup>
                  <DateSelect
                    name="dateOfBirth.month"
                    value={formData.dateOfBirth.month}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">{t('addTeacher.month')}</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </DateSelect>
                </FormGroup>
                <FormGroup>
                  <DateSelect
                    name="dateOfBirth.year"
                    value={formData.dateOfBirth.year}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">{t('addTeacher.year')}</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </DateSelect>
                </FormGroup>
              </DateOfBirthContainer>

              {/* Language Settings */}
              <FormGroup>
                <Label htmlFor="language" $isRTL={isRTL}>{t('settings.language')}</Label>
                <Select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                >
                  <option value="en">{t('settings.english')}</option>
                  <option value="ar">{t('settings.arabic')}</option>
                </Select>
                <HelperText>{t('settings.languageNote')}</HelperText>
              </FormGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}

              <SaveButton type="submit" disabled={loading}>
                {loading ? t('common.loading') : t('settings.general.save')}
              </SaveButton>
            </Form>
          </FormContainer>
        )}

        {activeTab === 'notifications' && (
          <FormContainer>
            <FormHeader>
              <FormTitle>{t('settings.notifications.title')}</FormTitle>
              <FormSubtitle>{t('settings.notifications.subtitle')}</FormSubtitle>
            </FormHeader>

            <NotificationContainer>
              <NotificationGroup>
                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.allNotifications')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.allNotifications} 
                    onClick={() => handleNotificationChange('allNotifications')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.earlyArrival')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.earlyArrival} 
                    onClick={() => handleNotificationChange('earlyArrival')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.lateArrival')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.lateArrival} 
                    onClick={() => handleNotificationChange('lateArrival')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.earlyLeaves')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.earlyLeaves} 
                    onClick={() => handleNotificationChange('earlyLeaves')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.lateLeaves')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.lateLeaves} 
                    onClick={() => handleNotificationChange('lateLeaves')}
                  />
                </NotificationItem>
              </NotificationGroup>

              <NotificationGroup>
                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.absentsTeachers')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.absentsTeachers} 
                    onClick={() => handleNotificationChange('absentsTeachers')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.dailyReports')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.dailyReports} 
                    onClick={() => handleNotificationChange('dailyReports')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.weeklyReports')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.weeklyReports} 
                    onClick={() => handleNotificationChange('weeklyReports')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.monthlyReports')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.monthlyReports} 
                    onClick={() => handleNotificationChange('monthlyReports')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.yearlyReports')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.yearlyReports} 
                    onClick={() => handleNotificationChange('yearlyReports')}
                  />
                </NotificationItem>
              </NotificationGroup>
            </NotificationContainer>

            <TestSection>
              <TestSectionTitle>{t('settings.notifications.testTitle')}</TestSectionTitle>
              <p style={{ color: '#666', marginBottom: '16px', fontFamily: 'Poppins' }}>
                {t('settings.notifications.testDesc')}
              </p>
              <TestButtonGroup>
                <TestButton onClick={() => handleTestNotification('Early Leave')}>
                  {t('settings.notifications.testEarlyLeave')}
                </TestButton>
                <TestButton onClick={() => handleTestNotification('Absence')}>
                  {t('settings.notifications.testAbsence')}
                </TestButton>
                <TestButton onClick={() => handleTestNotification('Late Arrival')}>
                  {t('settings.notifications.testLateArrival')}
                </TestButton>
              </TestButtonGroup>
            </TestSection>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
          </FormContainer>
        )}

        {activeTab === 'security' && (
          <FormContainer>
            <FormHeader>
              <FormTitle>Change Password</FormTitle>
              <FormSubtitle>Update your account password for enhanced security</FormSubtitle>
            </FormHeader>

            <PasswordForm onSubmit={handlePasswordSubmit}>
              <FormGroup>
                <Label htmlFor="currentPassword" $isRTL={isRTL}>{t('settings.security.currentPassword')}</Label>
                <PasswordInput
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('settings.security.currentPassword')}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="newPassword" $isRTL={isRTL}>{t('settings.security.newPassword')}</Label>
                <PasswordInput
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('settings.security.newPassword')}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="confirmPassword" $isRTL={isRTL}>{t('settings.security.confirmPassword')}</Label>
                <PasswordInput
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('settings.security.confirmPassword')}
                  required
                />
              </FormGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}

              <SaveButton type="submit" disabled={loading}>
                {loading ? 'Changing Password...' : 'Change Password'}
              </SaveButton>
            </PasswordForm>
          </FormContainer>
        )}
      </MainContent>
      
      <AddTeacherModal
        isOpen={showAddTeacherModal}
        onClose={handleCloseModal}
        onSuccess={handleTeacherAdded}
      />
    </SettingsContainer>
  );
};

export default Settings; 