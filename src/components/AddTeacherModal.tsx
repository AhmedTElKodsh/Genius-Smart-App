import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div<{ $isRTL?: boolean }>`
  background: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 2px solid #D6B10E;
  z-index: 1001;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 40px 24px;
  border-bottom: 1px solid #e1e7ec;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px 16px 0 0;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  direction: ltr; /* Always LTR for logo and title */
`;

const LogoImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: contain;
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
`;

const BrandTitle = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #141F25;
  margin: 0;
  line-height: 1.2;
`;

const CloseButton = styled.button`
  background: #ffffff;
  border: 2px solid #e1e7ec;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f8f9fa;
    border-color: #D6B10E;
    color: #D6B10E;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ModalBody = styled.div<{ $isRTL?: boolean }>`
  padding: 40px;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const FormTitle = styled.h2<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #141F25;
  margin: 0 0 12px 0;
  text-align: center;
`;

const FormSubtitle = styled.p<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  color: #666;
  margin: 0 0 40px 0;
  text-align: center;
  line-height: 1.5;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormFieldFull = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
`;

const Label = styled.label<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #141F25;
  margin-bottom: 4px;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const Input = styled.input<{ $isRTL?: boolean }>`
  padding: 16px 20px;
  border: 2px solid #e1e7ec;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  background: #f8f9fa;
  color: #141F25;
  transition: all 0.3s ease;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &::placeholder {
    color: #999;
    font-weight: 400;
  }
  
  &:focus {
    outline: none;
    border-color: #D6B10E;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(214, 177, 14, 0.1);
  }
  
  &:hover {
    border-color: #D6B10E;
  }
`;

const Select = styled.select<{ $isRTL?: boolean }>`
  padding: 16px 20px;
  border: 2px solid #e1e7ec;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  background: #f8f9fa;
  color: #141F25;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:focus {
    outline: none;
    border-color: #D6B10E;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(214, 177, 14, 0.1);
  }
  
  &:hover {
    border-color: #D6B10E;
  }
  
  option {
    color: #141F25;
    background: #ffffff;
    padding: 8px;
  }
`;

const DateOfBirthContainer = styled.div`
  grid-column: 1 / -1;
  margin-bottom: 24px;
`;

const DateOfBirthLabel = styled.label<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #141F25;
  margin-bottom: 12px;
  display: block;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
`;

const SaveButton = styled.button`
  width: 240px;
  margin: 40px auto 0;
  display: block;
  padding: 16px 32px;
  background: linear-gradient(135deg, #D6B10E 0%, #B8941F 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(214, 177, 14, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #B8941F 0%, #D6B10E 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(214, 177, 14, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 12px 16px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  margin: 16px 0;
  text-align: center;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const HelperText = styled.p<{ $isRTL?: boolean }>`
  font-size: 12px;
  color: #666;
  margin: 4px 0 0 0;
  font-style: italic;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  line-height: 1.4;
`;

const AuthoritySection = styled.div<{ $isRTL?: boolean }>`
  margin: 24px 0;
  padding: 20px;
  border: 1px solid #e1e7ec;
  border-radius: 8px;
  background: #ffffff;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const AuthorityTitle = styled.h3<{ $isRTL?: boolean }>`
  margin: 0 0 16px 0;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const AuthorityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AuthorityItem = styled.div<{ $isRTL?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-direction: ${props => props.$isRTL ? 'row-reverse' : 'row'};
`;

const AuthorityCheckbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #d4a015;
  cursor: pointer;
`;

const AuthorityLabel = styled.label<{ $isRTL?: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  color: #34495e;
  cursor: pointer;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  flex: 1;
`;

const RoleNotificationModal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  align-items: center;
  justify-content: center;
`;

const RoleNotificationContent = styled.div<{ $isRTL: boolean }>`
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const RoleNotificationTitle = styled.h3<{ $isRTL: boolean }>`
  margin: 0 0 16px 0;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const RoleNotificationMessage = styled.p<{ $isRTL: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 16px;
  line-height: 1.6;
  color: #34495e;
  margin-bottom: 16px;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const AuthoritiesList = styled.ul<{ $isRTL: boolean }>`
  margin: 16px 0;
  padding: ${props => props.$isRTL ? '0 20px 0 0' : '0 0 0 20px'};
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const AuthorityListItem = styled.li<{ $isRTL: boolean }>`
  font-size: 14px;
  color: #34495e;
  margin-bottom: 8px;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const NotificationButton = styled.button`
  background: #d4a015;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: block;
  margin: 20px auto 0;
  
  &:hover {
    background: #b8901d;
  }
`;

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  managerAuthorities?: {
    canManageAuthorities?: boolean;
    [key: string]: any;
  };
}

interface Subject {
  id: string;
  name: string;
  count: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  employmentDate: string;
  allowedAbsenceDays: string;
  subject: string;
  workType: string;
  password: string;
  systemRole: string;
  authorities: {
    canAccessPortal: boolean;
    canAddTeachers: boolean;
    canEditTeachers: boolean;
    canManageRequests: boolean;
    canDownloadReports: boolean;
    canManageAuthorities: boolean;
  };
}

const AddTeacherModal: React.FC<AddTeacherModalProps> = ({ isOpen, onClose, onSuccess, managerAuthorities }) => {
  const { language, isRTL, t } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [showRoleNotification, setShowRoleNotification] = useState(false);
  const [pendingRole, setPendingRole] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    employmentDate: '',
    allowedAbsenceDays: '',
    subject: '',
    workType: 'Full-time',
    password: '',
    systemRole: 'EMPLOYEE',
    authorities: {
      canAccessPortal: false,
      canAddTeachers: false,
      canEditTeachers: false,
      canManageRequests: false,
      canDownloadReports: false,
      canManageAuthorities: false
    }
  });

  // Generate day options (1-31)
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Generate month options
  const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  
  // Generate year options (current year - 70 to current year - 18)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 53 }, (_, i) => currentYear - 18 - i);

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
      fetchCurrentUserRole();
    }
  }, [isOpen]);

  // Return early if modal is not open - MUST be after all hooks
  if (!isOpen) return null;

  // Function to translate subject names for display
  const translateSubject = (subject: string): string => {
    if (!t) return subject;
    
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

  // Calculate allowed absence days based on employment date
  const calculateAllowedAbsenceDays = (employmentDate: string): number => {
    if (!employmentDate) return 0;
    
    const employment = new Date(employmentDate);
    const today = new Date();
    const monthsDiff = (today.getFullYear() - employment.getFullYear()) * 12 + (today.getMonth() - employment.getMonth());
    
    if (monthsDiff < 3) {
      return 0; // Newly hired teachers (< 3 months) = No Allowed Absence Days
    } else if (monthsDiff < 24) {
      return 9; // Teachers (> 3 months < 2 Years) = 9 days per Year
    } else {
      return 12; // Teachers (> 2 Years) = 12 Days per year
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subjects');
      if (response.ok) {
        const subjectsData = await response.json();
        setSubjects(subjectsData.data || []); // Fix: Extract data array from response
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchCurrentUserRole = async () => {
    try {
      const managerInfo = localStorage.getItem('managerInfo');
      if (managerInfo) {
        const manager = JSON.parse(managerInfo);
        setCurrentUserRole(manager.role || '');
      }
    } catch (error) {
      console.error('Error getting current user role:', error);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };
      
      // Auto-calculate allowed absence days when employment date changes
      if (field === 'employmentDate' && value) {
        const calculatedDays = calculateAllowedAbsenceDays(value);
        newFormData.allowedAbsenceDays = calculatedDays.toString();
      }
      
      return newFormData;
    });
    setError('');
  };

  // Get default authorities for a role (as boolean object for form)
  const getDefaultAuthoritiesForRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          canAccessPortal: true,
          canAddTeachers: true,
          canEditTeachers: true,
          canManageRequests: true,
          canDownloadReports: true,
          canManageAuthorities: true
        };
      case 'MANAGER':
        return {
          canAccessPortal: true,
          canAddTeachers: false,
          canEditTeachers: false,
          canManageRequests: true,
          canDownloadReports: true,
          canManageAuthorities: false
        };
      case 'EMPLOYEE':
      default:
        return {
          canAccessPortal: false,
          canAddTeachers: false,
          canEditTeachers: false,
          canManageRequests: false,
          canDownloadReports: false,
          canManageAuthorities: false
        };
    }
  };

  const handleRoleChange = (role: string) => {
    setPendingRole(role);
    setShowRoleNotification(true);
  };

  const applyRoleChange = () => {
    // Only update the role, don't change authorities
    // This allows admins to customize authorities after selecting a role
    setFormData(prev => ({
      ...prev,
      systemRole: pendingRole
    }));
    setShowRoleNotification(false);
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      setError('Complete date of birth is required');
      return false;
    }
    if (!formData.employmentDate.trim()) {
      setError('Employment date is required');
      return false;
    }
    if (formData.allowedAbsenceDays && (isNaN(Number(formData.allowedAbsenceDays)) || Number(formData.allowedAbsenceDays) < 0)) {
      setError('Allowed absence days must be a valid positive number');
      return false;
    }
    if (!formData.subject) {
      setError('Subject is required');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert authorities object to array of strings
      const authoritiesArray = [];
      if (formData.authorities.canAccessPortal) {
        authoritiesArray.push('Access Manager Portal');
        authoritiesArray.push('Access Teacher Portal');
      }
      if (formData.authorities.canAddTeachers) {
        authoritiesArray.push('Add new teachers');
      }
      if (formData.authorities.canEditTeachers) {
        authoritiesArray.push('Edit Existing Teachers');
      }
      if (formData.authorities.canManageRequests) {
        authoritiesArray.push('Accept and Reject Teachers\' Requests');
      }
      if (formData.authorities.canDownloadReports) {
        authoritiesArray.push('Download Reports');
      }

      const teacherData = {
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        subject: formData.subject,
        workType: formData.workType,
        password: formData.password,
        birthdate: `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`,
        employmentDate: formData.employmentDate,
        allowedAbsenceDays: parseInt(formData.allowedAbsenceDays) || 0,
        systemRole: formData.systemRole,
        authorities: authoritiesArray
      };

      const response = await fetch('http://localhost:5000/api/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(teacherData)
      });

      if (response.ok) {
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          address: '',
          birthDay: '',
          birthMonth: '',
          birthYear: '',
          employmentDate: '',
          allowedAbsenceDays: '',
          subject: '',
          workType: 'Full-time',
          password: '',
          systemRole: 'EMPLOYEE',
          authorities: {
            canAccessPortal: false,
            canAddTeachers: false,
            canEditTeachers: false,
            canManageRequests: false,
            canDownloadReports: false,
            canManageAuthorities: false
          }
        });
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add teacher');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <ModalOverlay onClick={handleOverlayClick}>
        <ModalContent $isRTL={isRTL}>
        <ModalHeader>
          <Logo>
            <LogoImage src="/logo-page.png" alt="Genius Smart Education" />
            <BrandText>
              <BrandTitle>Genius Smart Education</BrandTitle>
            </BrandText>
          </Logo>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalBody $isRTL={isRTL}>
          <FormTitle $isRTL={isRTL}>{t('addTeacher.title')}</FormTitle>
          <FormSubtitle $isRTL={isRTL}>{t('addTeacher.subtitle')}</FormSubtitle>
          
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormField>
                <Label $isRTL={isRTL}>{t('addTeacher.firstName')}</Label>
                <Input
                  $isRTL={isRTL}
                  type="text"
                  placeholder={isRTL ? "أحمد" : "Ahmed"}
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </FormField>
              
              <FormField>
                <Label $isRTL={isRTL}>{t('addTeacher.lastName')}</Label>
                <Input
                  $isRTL={isRTL}
                  type="text"
                  placeholder={isRTL ? "حسن" : "Hassan"}
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </FormField>
            </FormGrid>

            <FormFieldFull>
              <Label $isRTL={isRTL}>{t('addTeacher.phone')}</Label>
              <Input
                $isRTL={isRTL}
                type="tel"
                placeholder="01000022230"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </FormFieldFull>

            <FormFieldFull>
              <Label $isRTL={isRTL}>{t('addTeacher.email')}</Label>
              <Input
                $isRTL={isRTL}
                type="email"
                placeholder={isRTL ? "البريد الإلكتروني" : "Email Address"}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </FormFieldFull>

            <FormFieldFull>
              <Label $isRTL={isRTL}>{t('addTeacher.address')}</Label>
              <Input
                $isRTL={isRTL}
                type="text"
                placeholder={isRTL ? "القاهرة الجديدة، القاهرة" : "New Cairo, Cairo"}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </FormFieldFull>

            <FormFieldFull>
              <Label $isRTL={isRTL}>{t('addTeacher.password')}</Label>
              <Input
                $isRTL={isRTL}
                type="password"
                placeholder={isRTL ? "أدخل كلمة المرور لحساب المعلم" : "Enter password for teacher account"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
            </FormFieldFull>

            <DateOfBirthContainer>
              <DateOfBirthLabel $isRTL={isRTL}>{t('addTeacher.dateOfBirth')}</DateOfBirthLabel>
              <DateGrid>
                <Select
                  $isRTL={isRTL}
                  value={formData.birthDay}
                  onChange={(e) => handleInputChange('birthDay', e.target.value)}
                >
                  <option value="">{t('addTeacher.day')}</option>
                  {dayOptions.map(day => (
                    <option key={day} value={day.toString().padStart(2, '0')}>
                      {day.toString().padStart(2, '0')}
                    </option>
                  ))}
                </Select>
                
                <Select
                  $isRTL={isRTL}
                  value={formData.birthMonth}
                  onChange={(e) => handleInputChange('birthMonth', e.target.value)}
                >
                  <option value="">{t('addTeacher.month')}</option>
                  {monthOptions.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </Select>
                
                <Select
                  $isRTL={isRTL}
                  value={formData.birthYear}
                  onChange={(e) => handleInputChange('birthYear', e.target.value)}
                >
                  <option value="">{t('addTeacher.year')}</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </Select>
              </DateGrid>
            </DateOfBirthContainer>

            <FormFieldFull>
              <Label>{t('addTeacher.employmentDate')}</Label>
              <Input
                type="date"
                value={formData.employmentDate}
                onChange={(e) => handleInputChange('employmentDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              <HelperText $isRTL={isRTL}>
                {t('addTeacher.employmentDateHelper')}
              </HelperText>
            </FormFieldFull>

            <FormFieldFull>
              <Label>{t('addTeacher.allowedAbsenceDays')}</Label>
              <Input
                type="number"
                min="0"
                max="365"
                placeholder="30"
                value={formData.allowedAbsenceDays}
                onChange={(e) => handleInputChange('allowedAbsenceDays', e.target.value)}
              />
              <HelperText $isRTL={isRTL}>
                {t('addTeacher.allowedAbsenceDaysHelper')}
              </HelperText>
            </FormFieldFull>

            {/* Employee Role Selection */}
            <FormFieldFull>
              <Label $isRTL={isRTL}>
                {isRTL ? 'دور الموظف' : 'Employee Role'}
              </Label>
              <Select
                value={formData.systemRole}
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                <option value="ADMIN">{isRTL ? 'مدير عام' : 'Admin'}</option>
                <option value="MANAGER">{isRTL ? 'مدير' : 'Manager'}</option>
                <option value="EMPLOYEE">{isRTL ? 'موظف' : 'Employee'}</option>
              </Select>
            </FormFieldFull>

            <AuthoritySection $isRTL={isRTL}>
              <AuthorityTitle $isRTL={isRTL}>
                {isRTL ? 'الصلاحيات' : 'Authorities'}
              </AuthorityTitle>
              <AuthorityGrid>
                <AuthorityItem $isRTL={isRTL}>
                  <AuthorityCheckbox
                    type="checkbox"
                    id="canAccessPortal"
                    checked={formData.authorities.canAccessPortal}
                    onChange={(e) => handleInputChange('authorities', {
                      ...formData.authorities,
                      canAccessPortal: e.target.checked
                    })}
                  />
                  <AuthorityLabel htmlFor="canAccessPortal" $isRTL={isRTL}>
                    {isRTL ? 'الوصول إلى بوابة المدير والمتابعات الداخلية' : 'Access to Manager Portal and Internal Tracking'}
                  </AuthorityLabel>
                </AuthorityItem>

                <AuthorityItem $isRTL={isRTL}>
                  <AuthorityCheckbox
                    type="checkbox"
                    id="canAddTeachers"
                    checked={formData.authorities.canAddTeachers}
                    onChange={(e) => handleInputChange('authorities', {
                      ...formData.authorities,
                      canAddTeachers: e.target.checked
                    })}
                  />
                  <AuthorityLabel htmlFor="canAddTeachers" $isRTL={isRTL}>
                    {isRTL ? 'إضافة معلمين جدد' : 'Add New Teachers'}
                  </AuthorityLabel>
                </AuthorityItem>

                <AuthorityItem $isRTL={isRTL}>
                  <AuthorityCheckbox
                    type="checkbox"
                    id="canEditTeachers"
                    checked={formData.authorities.canEditTeachers}
                    onChange={(e) => handleInputChange('authorities', {
                      ...formData.authorities,
                      canEditTeachers: e.target.checked
                    })}
                  />
                  <AuthorityLabel htmlFor="canEditTeachers" $isRTL={isRTL}>
                    {isRTL ? 'تعديل معلومات المعلمين الحاليين' : 'Edit Existing Teachers Info'}
                  </AuthorityLabel>
                </AuthorityItem>

                <AuthorityItem $isRTL={isRTL}>
                  <AuthorityCheckbox
                    type="checkbox"
                    id="canManageRequests"
                    checked={formData.authorities.canManageRequests}
                    onChange={(e) => handleInputChange('authorities', {
                      ...formData.authorities,
                      canManageRequests: e.target.checked
                    })}
                  />
                  <AuthorityLabel htmlFor="canManageRequests" $isRTL={isRTL}>
                    {isRTL ? 'قبول ورفض طلبات المعلمين' : 'Accept and Reject Teachers\' Requests'}
                  </AuthorityLabel>
                </AuthorityItem>

                <AuthorityItem $isRTL={isRTL}>
                  <AuthorityCheckbox
                    type="checkbox"
                    id="canDownloadReports"
                    checked={formData.authorities.canDownloadReports}
                    onChange={(e) => handleInputChange('authorities', {
                      ...formData.authorities,
                      canDownloadReports: e.target.checked
                    })}
                  />
                  <AuthorityLabel htmlFor="canDownloadReports" $isRTL={isRTL}>
                    {isRTL ? 'تحميل التقارير' : 'Download Reports'}
                  </AuthorityLabel>
                </AuthorityItem>
              </AuthorityGrid>
            </AuthoritySection>

            <FormGrid>
              <FormField>
                <Label $isRTL={isRTL}>{t('addTeacher.subject')}</Label>
                <Select
                  $isRTL={isRTL}
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                >
                  <option value="">{t('addTeacher.selectSubject')}</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.name}>
                      {translateSubject(subject.name)}
                    </option>
                  ))}
                </Select>
              </FormField>
              
              <FormField>
                <Label $isRTL={isRTL}>{t('addTeacher.roleType')}</Label>
                <Select
                  $isRTL={isRTL}
                  value={formData.workType}
                  onChange={(e) => handleInputChange('workType', e.target.value)}
                >
                  <option value="Full-time">{t('addTeacher.fullTime')}</option>
                  <option value="Part-time">{t('addTeacher.partTime')}</option>
                </Select>
              </FormField>
            </FormGrid>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <SaveButton type="submit" disabled={loading}>
              {loading ? t('common.loading') : t('addTeacher.save')}
            </SaveButton>
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
    
    {/* Role Notification Modal */}
    <RoleNotificationModal isOpen={showRoleNotification} onClick={(e) => {
      if (e.target === e.currentTarget) {
        applyRoleChange();
      }
    }}>
      <RoleNotificationContent $isRTL={isRTL}>
        <RoleNotificationTitle $isRTL={isRTL}>
          {isRTL ? 'تنبيه تغيير الصلاحيات' : 'Role Permissions Notification'}
        </RoleNotificationTitle>
        
        <RoleNotificationMessage $isRTL={isRTL}>
          {isRTL 
            ? `بتحديد دور "${pendingRole === 'ADMIN' ? 'مدير عام' : pendingRole === 'MANAGER' ? 'مدير' : 'موظف'}" لهذا الموظف، سيحصل على الصلاحيات التالية:`
            : `By selecting the role "${pendingRole}" for this employee, they will be granted the following authorities:`}
        </RoleNotificationMessage>
        
        <AuthoritiesList $isRTL={isRTL}>
          {pendingRole === 'ADMIN' && (
            <>
              <AuthorityListItem $isRTL={isRTL}>{isRTL ? 'الوصول إلى جميع الصفحات والإعدادات' : 'Access to all pages and settings'}</AuthorityListItem>
              <AuthorityListItem $isRTL={isRTL}>{isRTL ? 'إضافة وتعديل وحذف المعلمين' : 'Add, edit and delete teachers'}</AuthorityListItem>
              <AuthorityListItem $isRTL={isRTL}>{isRTL ? 'إدارة صلاحيات المستخدمين' : 'Manage user authorities'}</AuthorityListItem>
              <AuthorityListItem $isRTL={isRTL}>{isRTL ? 'قبول ورفض جميع الطلبات' : 'Accept and reject all requests'}</AuthorityListItem>
              <AuthorityListItem $isRTL={isRTL}>{isRTL ? 'عرض جميع التحليلات والتقارير' : 'View all analytics and reports'}</AuthorityListItem>
            </>
          )}
          {pendingRole === 'MANAGER' && (
            <>
              <AuthorityListItem $isRTL={isRTL}>{isRTL ? 'الوصول إلى بوابة المدير والمتابعات الداخلية' : 'Access to Manager Portal and Internal Tracking'}</AuthorityListItem>
              <AuthorityListItem $isRTL={isRTL}>{isRTL ? 'عرض معلومات المعلمين' : 'View Teachers Info'}</AuthorityListItem>
              <AuthorityListItem $isRTL={isRTL}>{isRTL ? 'قبول ورفض طلبات المعلمين' : 'Accept and Reject Teachers\' Requests'}</AuthorityListItem>
              <AuthorityListItem $isRTL={isRTL}>{isRTL ? 'تحميل التقارير' : 'Download Reports'}</AuthorityListItem>
              <AuthorityListItem $isRTL={isRTL}>{isRTL ? 'عرض التحليلات' : 'View Analytics'}</AuthorityListItem>
            </>
          )}
          {pendingRole === 'EMPLOYEE' && (
            <>
              <AuthorityListItem $isRTL={isRTL}>{isRTL ? 'الوصول إلى بوابة المعلم فقط' : 'Access to Teacher Portal only'}</AuthorityListItem>
              <AuthorityListItem $isRTL={isRTL}>{isRTL ? 'تقديم الطلبات' : 'Submit Requests'}</AuthorityListItem>
              <AuthorityListItem $isRTL={isRTL}>{isRTL ? 'عرض البيانات الشخصية' : 'View Own Data'}</AuthorityListItem>
              <AuthorityListItem $isRTL={isRTL}>{isRTL ? 'تسجيل الدخول والخروج' : 'Check In/Out'}</AuthorityListItem>
            </>
          )}
        </AuthoritiesList>
        
        <RoleNotificationMessage $isRTL={isRTL}>
          {isRTL 
            ? 'يمكنك التحكم في صلاحيات محددة داخل الدور باستخدام مربعات الاختيار أدناه.'
            : 'You can control specific authorities within the role using the checkboxes below.'}
        </RoleNotificationMessage>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
          <NotificationButton 
            onClick={() => {
              // Apply role with default authorities
              const defaultAuthorities = getDefaultAuthoritiesForRole(pendingRole);
              setFormData(prev => ({
                ...prev,
                systemRole: pendingRole,
                authorities: defaultAuthorities
              }));
              setShowRoleNotification(false);
            }}
            style={{ backgroundColor: '#2196F3' }}
          >
            {isRTL ? 'تطبيق الصلاحيات الافتراضية' : 'Apply Default Authorities'}
          </NotificationButton>
          
          <NotificationButton 
            onClick={applyRoleChange}
            style={{ backgroundColor: '#4CAF50' }}
          >
            {isRTL ? 'الاحتفاظ بالصلاحيات المخصصة' : 'Keep Custom Authorities'}
          </NotificationButton>
        </div>
      </RoleNotificationContent>
    </RoleNotificationModal>
    </>
  );
};

export default AddTeacherModal; 