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

const ModalContent = styled.div<{ $isRTL: boolean }>`
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
  direction: ltr; /* Always keep header LTR for consistent branding */
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

const TabContainer = styled.div<{ $isRTL?: boolean }>`
  display: flex;
  gap: 0;
  margin: 0 32px;
  border-bottom: 1px solid #e1e7ec;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const Tab = styled.button<{ $isActive: boolean; $isRTL?: boolean }>`
  padding: 16px 24px;
  background: ${props => props.$isActive ? '#D6B10E' : 'transparent'};
  color: ${props => props.$isActive ? '#ffffff' : '#666'};
  border: none;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: ${props => props.$isActive ? '8px 8px 0 0' : '0'};
  
  &:hover {
    background: ${props => props.$isActive ? '#D6B10E' : '#f5f5f5'};
    color: ${props => props.$isActive ? '#ffffff' : '#141F25'};
  }
`;

const ModalBody = styled.div`
  padding: 40px;
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
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 16px;
  font-weight: 600;
  color: #141F25;
  margin-bottom: 4px;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  display: block;
  width: 100%;
`;

const Input = styled.input<{ $isRTL?: boolean }>`
  padding: 16px 20px;
  border: 2px solid #e1e7ec;
  border-radius: 12px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 16px;
  background: #f8f9fa;
  color: #141F25;
  transition: all 0.3s ease;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  
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
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 16px;
  background: #f8f9fa;
  color: #141F25;
  cursor: pointer;
  transition: all 0.3s ease;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  
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
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 16px;
  font-weight: 600;
  color: #141F25;
  margin-bottom: 12px;
  display: block;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  width: 100%;
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
`;

const EditButton = styled.button`
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

const ActivityContent = styled.div`
  padding: 32px;
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const DateRange = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e1e7ec;
  border-radius: 8px;
  background: #f8f9fa;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #666;
  
  &::before {
    content: '📅';
    margin-right: 4px;
  }
`;

const StatsCards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
`;

const StatsCard = styled.div<{ $isRTL?: boolean }>`
  background: #f4f0dc;
  border-radius: 12px;
  padding: 20px 16px;
  position: relative;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const StatsLabel = styled.div<{ $isRTL?: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  font-weight: 500;
  color: #141F25;
  text-align: center;
  width: 100%;
  margin-bottom: 20px;
`;

const StatsBottomContainer = styled.div<{ $isRTL?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const StatsNumber = styled.div<{ $isRTL?: boolean }>`
  background: #D6B10E;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  order: ${props => props.$isRTL ? '2' : '1'};
`;

const StatsUnit = styled.div<{ $isRTL?: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  color: #666;
  font-weight: 500;
  order: ${props => props.$isRTL ? '1' : '2'};
`;

const AttendanceTable = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e1e7ec;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 80px 100px 100px 120px 120px 100px;
  background: #f8f9fa;
  padding: 16px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #141F25;
  border-bottom: 1px solid #e1e7ec;
`;

const TableHeaderCell = styled.div<{ $isRTL?: boolean }>`
  text-align: center;
  
  &:first-child {
    text-align: ${props => props.$isRTL ? 'right' : 'left'};
  }
`;

const TableBody = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 80px 80px 100px 100px 120px 120px 100px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div<{ $isRTL?: boolean }>`
  text-align: center;
  color: #141F25;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:first-child {
    text-align: ${props => props.$isRTL ? 'right' : 'left'};
    justify-content: ${props => props.$isRTL ? 'flex-end' : 'flex-start'};
  }
  
  &.absent {
    color: #dc3545;
  }
  
  &.active {
    color: #28a745;
  }
  
  &.leave {
    color: #ffc107;
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #f8f9fa;
  border-top: 1px solid #e1e7ec;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e1e7ec;
  background: white;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  font-family: 'Poppins', sans-serif;
  color: #666;
`;

const AuthoritiesContainer = styled.div`
  grid-column: 1 / -1;
  margin-bottom: 24px;
`;

const AuthoritiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 8px;
`;

const AuthorityItem = styled.label<{ $isRTL?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  color: #141F25;
  cursor: pointer;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:hover {
    color: #D6B10E;
  }
`;

const AuthorityCheckbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #D6B10E;
  cursor: pointer;
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

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacher: Teacher | null;
}

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
  employmentDate?: string;
  allowedAbsenceDays?: number;
  authorities?: string[];
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
  subject: string;
  workType: string;
  password: string;
  employmentDate: string;
  allowedAbsenceDays: string;
  authorities: string[];
  systemRole: string;
}

const EditTeacherModal: React.FC<EditTeacherModalProps> = ({ isOpen, onClose, onSuccess, teacher }) => {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'personal' | 'activity'>('personal');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentUserAuthorities, setCurrentUserAuthorities] = useState<string[]>([]);

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
  
  // Activity tab state
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({
    leaves: 0,
    absents: 0, 
    totalHours: 0
  });
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState('');
  const recordsPerPage = 10;
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
    subject: '',
    workType: 'Full-time',
    password: '',
    employmentDate: '',
    allowedAbsenceDays: '',
    authorities: [],
    systemRole: 'EMPLOYEE'
  });

  // Generate day options (1-31)
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);
  
  // Generate month options
  const monthOptions = [
    { value: '01', label: t('months.january') },
    { value: '02', label: t('months.february') },
    { value: '03', label: t('months.march') },
    { value: '04', label: t('months.april') },
    { value: '05', label: t('months.may') },
    { value: '06', label: t('months.june') },
    { value: '07', label: t('months.july') },
    { value: '08', label: t('months.august') },
    { value: '09', label: t('months.september') },
    { value: '10', label: t('months.october') },
    { value: '11', label: t('months.november') },
    { value: '12', label: t('months.december') }
  ];
  
  // Generate year options (current year - 70 to current year - 18)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 53 }, (_, i) => currentYear - 18 - i);

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
      fetchCurrentUserRole();
      if (teacher) {
        populateFormData(teacher);
      }
    }
  }, [isOpen, teacher]);

  // Fetch current user's role to determine permissions
  const fetchCurrentUserRole = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/teachers/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setCurrentUserRole(userData.role || '');
        setCurrentUserAuthorities(userData.authorities || []);
      }
    } catch (error) {
      console.error('Error fetching current user role:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subjects');
      if (response.ok) {
        const subjectsData = await response.json();
        setSubjects(subjectsData.data || subjectsData);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const populateFormData = (teacher: Teacher) => {
    // Parse the name into first and last name
    const nameParts = teacher.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Parse birthdate if available
    let birthDay = '', birthMonth = '', birthYear = '';
    if (teacher.birthdate) {
      const birthDate = new Date(teacher.birthdate);
      birthDay = birthDate.getDate().toString().padStart(2, '0');
      birthMonth = (birthDate.getMonth() + 1).toString().padStart(2, '0');
      birthYear = birthDate.getFullYear().toString();
    }

    setFormData({
      firstName,
      lastName,
      phone: teacher.phone || '',
      email: teacher.email || '',
      address: teacher.address || '',
      birthDay,
      birthMonth,
      birthYear,
      subject: teacher.subject || '',
      workType: teacher.workType || 'Full-time',
      password: '', // Leave empty for security
      employmentDate: teacher.employmentDate || '',
      allowedAbsenceDays: teacher.allowedAbsenceDays?.toString() || '',
      authorities: teacher.authorities || [],
      systemRole: teacher.systemRole || 'EMPLOYEE'
    });
  };

  // Activity tab functions
  const fetchAttendanceData = async () => {
    if (!teacher?.id) return;
    
    setAttendanceLoading(true);
    try {
      // Calculate date range for last 30 days to get more focused data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Fetch attendance data for the teacher with date range
      const response = await fetch(`http://localhost:5000/api/attendance/teacher/${teacher.id}?startDate=${startDateStr}&endDate=${endDateStr}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data.data || []);
        calculateStats(data.data || []);
        
        // Calculate date range
        if (data.data && data.data.length > 0) {
          const firstDate = data.data[data.data.length - 1].date;
          const lastDate = data.data[0].date;
          setDateRange(`${firstDate} - ${lastDate}`);
        } else {
          setDateRange(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    const stats = {
      leaves: 0,
      absents: 0,
      totalHours: 0
    };

    // Filter out weekend records for more accurate counting
    const workDayRecords = data.filter(record => record.attendance !== 'Weekend');

    workDayRecords.forEach(record => {
      // Count allowed absences (Allowed Absence records)
      if (record.attendance === 'Allowed Absence') {
        stats.leaves += 1;
      }
      
      // Count absents (Absent records - only unauthorized absences)
      if (record.attendance === 'Absent') {
        stats.absents += 1;
      }
      
      // Add total hours only for active work days
      if (record.attendance === 'Active' && record.totalHours) {
        stats.totalHours += record.totalHours || 0;
      }
    });

    setAttendanceStats(stats);
  };

  // Update useEffect to fetch attendance data when Activity tab is opened
  useEffect(() => {
    if (isOpen && activeTab === 'activity' && teacher?.id) {
      fetchAttendanceData();
    }
  }, [isOpen, activeTab, teacher?.id]);

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };
      
      // Auto-calculate allowed absence days when employment date changes
      if (field === 'employmentDate' && typeof value === 'string' && value) {
        const calculatedDays = calculateAllowedAbsenceDays(value);
        newFormData.allowedAbsenceDays = calculatedDays.toString();
      }
      
      return newFormData;
    });
    setError('');
  };

  // Get default authorities for a role
  const getDefaultAuthoritiesForRole = (role: string): string[] => {
    switch (role) {
      case 'ADMIN':
        return [
          'Access Manager Portal',
          'Access Teacher Portal',
          'Add new teachers',
          'Edit Existing Teachers',
          'Delete Teachers',
          'Accept and Reject All Requests',
          'Accept and Reject Manager Requests',
          'Download Reports',
          'View All Analytics',
          'Manage User Authorities',
          'View Action Audit Trail',
          'Revoke Manager Actions',
          'Promote/Demote Users',
          'System Administration'
        ];
      case 'MANAGER':
        return [
          'Access Manager Portal',
          'Access Teacher Portal',
          'View Teachers Info',
          'Accept and Reject Employee Requests',
          'Accept and Reject Teachers\' Requests',
          'Download Reports',
          'View Analytics',
          'Submit Own Requests'
        ];
      case 'EMPLOYEE':
      default:
        return [
          'Access Teacher Portal',
          'Submit Requests',
          'View Own Data',
          'Check In/Out'
        ];
    }
  };

  // Handle role change and show notification
  const handleRoleChange = (role: string) => {
    setPendingRole(role);
    setShowRoleNotification(true);
  };

  // Apply role change after notification
  const applyRoleChange = () => {
    // Only update the role, don't change authorities
    // This allows admins to customize authorities after selecting a role
    setFormData(prev => ({
      ...prev,
      systemRole: pendingRole
    }));
    setShowRoleNotification(false);
  };

  const handleAuthorityChange = (authority: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      authorities: checked 
        ? [...prev.authorities, authority]
        : prev.authorities.filter(a => a !== authority)
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError(t('validation.required'));
      return false;
    }
    if (!formData.lastName.trim()) {
      setError(t('validation.required'));
      return false;
    }
    if (!formData.phone.trim()) {
      setError(t('validation.required'));
      return false;
    }
    if (!formData.email.trim()) {
      setError(t('validation.required'));
      return false;
    }
    if (!formData.email.includes('@')) {
      setError(t('validation.email'));
      return false;
    }
    if (!formData.address.trim()) {
      setError(t('validation.required'));
      return false;
    }
    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      setError(t('validation.required'));
      return false;
    }
    if (!formData.subject) {
      setError(t('validation.required'));
      return false;
    }
    // Password is optional for editing - only validate if provided
    if (formData.password.trim() && formData.password.length < 6) {
      const minLength = 6;
      setError(t('validation.minLength').replace('{min}', minLength.toString()));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teacher || !validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const teacherData: any = {
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        subject: formData.subject,
        workType: formData.workType,
        birthdate: `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`,
        employmentDate: formData.employmentDate,
        allowedAbsenceDays: parseInt(formData.allowedAbsenceDays) || 0,
        authorities: formData.authorities,
        role: formData.systemRole
      };

      // Only include password if it's provided
      if (formData.password.trim()) {
        teacherData.password = formData.password;
      }

      const response = await fetch(`http://localhost:5000/api/teachers/${teacher.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(teacherData)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update teacher');
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

  if (!isOpen || !teacher) return null;

  // Check if current user can edit teachers
  const canEdit = currentUserAuthorities.includes('Edit Existing Teachers') || currentUserRole === 'ADMIN';

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
        
        <TabContainer $isRTL={isRTL}>
          <Tab
            $isActive={activeTab === 'personal'}
            onClick={() => setActiveTab('personal')}
            $isRTL={isRTL}
          >
            {t('editTeacher.personalInfo')}
          </Tab>
          <Tab
            $isActive={activeTab === 'activity'}
            onClick={() => setActiveTab('activity')}
            $isRTL={isRTL}
          >
            {t('editTeacher.activity')}
          </Tab>
        </TabContainer>
        
        <ModalBody>
          {activeTab === 'personal' && (
            <form onSubmit={handleSubmit}>
              {!canEdit && (
                <div style={{ 
                  padding: '12px 16px', 
                  backgroundColor: '#fff3cd', 
                  color: '#856404', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  fontFamily: isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif",
                  direction: isRTL ? 'rtl' : 'ltr',
                  textAlign: isRTL ? 'right' : 'left'
                }}>
                  {isRTL 
                    ? 'أنت في وضع العرض فقط. ليس لديك صلاحية تعديل معلومات المعلمين.'
                    : 'You are in view-only mode. You do not have permission to edit teacher information.'}
                </div>
              )}
              <FormGrid>
                <FormField>
                  <Label $isRTL={isRTL}>{t('addTeacher.firstName')}</Label>
                  <Input
                    type="text"
                    placeholder="Ahmed"
                                      value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!canEdit}
                  $isRTL={isRTL}
                  />
                </FormField>
                
                <FormField>
                  <Label $isRTL={isRTL}>{t('addTeacher.lastName')}</Label>
                  <Input
                    type="text"
                    placeholder="Hassan"
                                      value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!canEdit}
                  $isRTL={isRTL}
                  />
                </FormField>
              </FormGrid>

              <FormFieldFull>
                <Label $isRTL={isRTL}>{t('addTeacher.phone')}</Label>
                <Input
                  type="tel"
                  placeholder="01000022230"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!canEdit}
                  $isRTL={isRTL}
                />
              </FormFieldFull>

              <FormFieldFull>
                <Label $isRTL={isRTL}>{t('addTeacher.email')}</Label>
                <Input
                  type="email"
                  placeholder={t('settings.general.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!canEdit}
                  $isRTL={isRTL}
                />
              </FormFieldFull>

              <FormFieldFull>
                <Label $isRTL={isRTL}>{t('addTeacher.address')}</Label>
                <Input
                  type="text"
                  placeholder={t('settings.general.addressPlaceholder')}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!canEdit}
                  $isRTL={isRTL}
                />
              </FormFieldFull>

              <FormFieldFull>
                <Label $isRTL={isRTL}>{t('editTeacher.password')}</Label>
                <Input
                  type="password"
                  placeholder={t('editTeacher.passwordPlaceholder')}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={!canEdit}
                  $isRTL={isRTL}
                />
              </FormFieldFull>

              <DateOfBirthContainer>
                <DateOfBirthLabel $isRTL={isRTL}>{t('addTeacher.dateOfBirth')}</DateOfBirthLabel>
                <DateGrid>
                  <Select
                    value={formData.birthDay}
                    onChange={(e) => handleInputChange('birthDay', e.target.value)}
                    disabled={!canEdit}
                    $isRTL={isRTL}
                  >
                    <option value="">{t('addTeacher.day')}</option>
                    {dayOptions.map(day => (
                      <option key={day} value={day.toString().padStart(2, '0')}>
                        {day.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </Select>
                  
                  <Select
                    value={formData.birthMonth}
                    onChange={(e) => handleInputChange('birthMonth', e.target.value)}
                    disabled={!canEdit}
                    $isRTL={isRTL}
                  >
                    <option value="">{t('addTeacher.month')}</option>
                    {monthOptions.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </Select>
                  
                  <Select
                    value={formData.birthYear}
                    onChange={(e) => handleInputChange('birthYear', e.target.value)}
                    disabled={!canEdit}
                    $isRTL={isRTL}
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

                             <FormGrid>
                 <FormField>
                   <Label $isRTL={isRTL}>{t('addTeacher.subject')}</Label>
                   <Select
                                       value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  disabled={!canEdit}
                  $isRTL={isRTL}
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
                                       value={formData.workType}
                  onChange={(e) => handleInputChange('workType', e.target.value)}
                  disabled={!canEdit}
                  $isRTL={isRTL}
                   >
                     <option value="Full-time">{t('addTeacher.fullTime')}</option>
                     <option value="Part-time">{t('addTeacher.partTime')}</option>
                   </Select>
                 </FormField>
               </FormGrid>

               {/* System Role - Only visible to Admins */}
               {currentUserRole === 'ADMIN' && (
                 <FormGrid>
                   <FormField>
                     <Label $isRTL={isRTL}>{t('addTeacher.systemRole')}</Label>
                     <Select
                       value={formData.systemRole}
                       onChange={(e) => handleRoleChange(e.target.value)}
                       $isRTL={isRTL}
                     >
                       <option value="">{t('addTeacher.selectSystemRole')}</option>
                       <option value="ADMIN">
                         {t('systemRoles.admin')} - {t('systemRoles.adminDescription')}
                       </option>
                       <option value="MANAGER">
                         {t('systemRoles.manager')} - {t('systemRoles.managerDescription')}
                       </option>
                       <option value="EMPLOYEE">
                         {t('systemRoles.employee')} - {t('systemRoles.employeeDescription')}
                       </option>
                     </Select>
                   </FormField>
                 </FormGrid>
               )}

               <FormGrid>
                 <FormField>
                   <Label $isRTL={isRTL}>{t('addTeacher.employmentDate')}</Label>
                   <Input
                     type="date"
                     value={formData.employmentDate}
                     onChange={(e) => handleInputChange('employmentDate', e.target.value)}
                   />
                   <HelperText $isRTL={isRTL}>
                     {t('addTeacher.employmentDateHelper')}
                   </HelperText>
                 </FormField>
                 
                 <FormField>
                   <Label $isRTL={isRTL}>{t('addTeacher.allowedAbsenceDays')}</Label>
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
                 </FormField>
                             </FormGrid>

              {/* Employee Role Selection */}
              <FormFieldFull>
                <Label $isRTL={isRTL}>
                  {isRTL ? 'دور الموظف' : 'Employee Role'}
                </Label>
                <Select
                  value={formData.systemRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  disabled={!canEdit}
                  $isRTL={isRTL}
                >
                  <option value="ADMIN">{isRTL ? 'مدير عام' : 'Admin'}</option>
                  <option value="MANAGER">{isRTL ? 'مدير' : 'Manager'}</option>
                  <option value="EMPLOYEE">{isRTL ? 'موظف' : 'Employee'}</option>
                </Select>
              </FormFieldFull>

              <AuthoritiesContainer>
                <Label $isRTL={isRTL}>{t('addTeacher.authorities')}</Label>
                 <AuthoritiesGrid>
                                     <AuthorityItem $isRTL={isRTL}>
                    <AuthorityCheckbox
                      type="checkbox"
                      checked={formData.authorities.includes('Access Manager Portal')}
                      onChange={(e) => handleAuthorityChange('Access Manager Portal', e.target.checked)}
                      disabled={!canEdit || currentUserRole !== 'ADMIN'}
                    />
                    {isRTL ? 'الوصول إلى بوابة المدير والمتابعات الداخلية' : 'Access to Manager Portal and Internal Tracking'}
                  </AuthorityItem>
                  
                  <AuthorityItem $isRTL={isRTL}>
                    <AuthorityCheckbox
                      type="checkbox"
                      checked={formData.authorities.includes('Add new teachers')}
                      onChange={(e) => handleAuthorityChange('Add new teachers', e.target.checked)}
                      disabled={!canEdit || currentUserRole !== 'ADMIN'}
                    />
                    {isRTL ? 'إضافة معلمين جدد' : 'Add New Teachers'}
                  </AuthorityItem>
                  
                  <AuthorityItem $isRTL={isRTL}>
                    <AuthorityCheckbox
                      type="checkbox"
                      checked={formData.authorities.includes('Edit Existing Teachers')}
                      onChange={(e) => handleAuthorityChange('Edit Existing Teachers', e.target.checked)}
                      disabled={!canEdit || currentUserRole !== 'ADMIN'}
                    />
                    {isRTL ? 'تعديل معلومات المعلمين الحاليين' : 'Edit Existing Teachers Info'}
                  </AuthorityItem>
                  
                  <AuthorityItem $isRTL={isRTL}>
                    <AuthorityCheckbox
                      type="checkbox"
                      checked={formData.authorities.includes('Accept and Reject Teachers\' Requests') || 
                              formData.authorities.includes('Accept and Reject Employee Requests')}
                      onChange={(e) => handleAuthorityChange('Accept and Reject Teachers\' Requests', e.target.checked)}
                      disabled={!canEdit || currentUserRole !== 'ADMIN'}
                    />
                    {isRTL ? 'قبول ورفض طلبات المعلمين' : 'Accept and Reject Teachers\' Requests'}
                  </AuthorityItem>
                  
                  <AuthorityItem $isRTL={isRTL}>
                    <AuthorityCheckbox
                      type="checkbox"
                      checked={formData.authorities.includes('Download Reports')}
                      onChange={(e) => handleAuthorityChange('Download Reports', e.target.checked)}
                      disabled={!canEdit || currentUserRole !== 'ADMIN'}
                    />
                    {isRTL ? 'تحميل التقارير' : 'Download Reports'}
                  </AuthorityItem>
                 </AuthoritiesGrid>
               </AuthoritiesContainer>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              {canEdit && (
                <EditButton type="submit" disabled={loading}>
                  {loading ? t('common.loading') : t('editTeacher.save')}
                </EditButton>
              )}
            </form>
          )}

          {activeTab === 'activity' && (
            <ActivityContent>
              <ActivityHeader>
                <h3 style={{ margin: 0, fontFamily: "'Poppins', sans-serif", fontSize: '20px', fontWeight: '600', color: '#141F25' }}>{t('activity.title')}</h3>
                <DateRange>{dateRange || t('common.loading')}</DateRange>
              </ActivityHeader>

              {attendanceLoading ? (
                <LoadingSpinner>{t('common.loading')}</LoadingSpinner>
              ) : (
                <>
                  <StatsCards>
                    <StatsCard $isRTL={isRTL}>
                      <StatsLabel $isRTL={isRTL}>{t('activity.leaves')}</StatsLabel>
                      <StatsBottomContainer $isRTL={isRTL}>
                        <StatsNumber $isRTL={isRTL}>{attendanceStats.leaves}</StatsNumber>
                        <StatsUnit $isRTL={isRTL}>{t('common.days')}</StatsUnit>
                      </StatsBottomContainer>
                    </StatsCard>
                    
                    <StatsCard $isRTL={isRTL}>
                      <StatsLabel $isRTL={isRTL}>{t('activity.absents')}</StatsLabel>
                      <StatsBottomContainer $isRTL={isRTL}>
                        <StatsNumber $isRTL={isRTL}>{attendanceStats.absents}</StatsNumber>
                        <StatsUnit $isRTL={isRTL}>{t('common.days')}</StatsUnit>
                      </StatsBottomContainer>
                    </StatsCard>
                    
                    <StatsCard $isRTL={isRTL}>
                      <StatsLabel $isRTL={isRTL}>{t('activity.totalHours')}</StatsLabel>
                      <StatsBottomContainer $isRTL={isRTL}>
                        <StatsNumber $isRTL={isRTL}>{attendanceStats.totalHours.toFixed(1)}</StatsNumber>
                        <StatsUnit $isRTL={isRTL}>{t('common.hours')}</StatsUnit>
                      </StatsBottomContainer>
                    </StatsCard>
                  </StatsCards>

                  <AttendanceTable>
                    <TableHeader>
                      <TableHeaderCell $isRTL={isRTL}>{t('activity.date')}</TableHeaderCell>
                      <TableHeaderCell $isRTL={isRTL}>{t('activity.attends')}</TableHeaderCell>
                      <TableHeaderCell $isRTL={isRTL}>{t('activity.checkIn')}</TableHeaderCell>
                      <TableHeaderCell $isRTL={isRTL}>{t('activity.checkOut')}</TableHeaderCell>
                      <TableHeaderCell $isRTL={isRTL}>{t('activity.allowedAbsence')}</TableHeaderCell>
                      <TableHeaderCell $isRTL={isRTL}>{t('activity.authorizedAbsence')}</TableHeaderCell>
                      <TableHeaderCell $isRTL={isRTL}>{t('activity.totalTime')}</TableHeaderCell>
                    </TableHeader>

                    <TableBody>
                      {attendanceData
                        .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                        .map((record, index) => (
                          <TableRow key={record.id || index}>
                            <TableCell $isRTL={isRTL}>{record.date}</TableCell>
                            <TableCell $isRTL={isRTL} className={
                              record.attendance === 'Active' ? 'active' :
                              record.attendance === 'Absent' ? 'absent' : 'leave'
                            }>
                              {record.attendance === 'Active' ? t('activity.active') :
                               record.attendance === 'Absent' ? t('activity.absent') :
                               record.attendance === 'Allowed Absence' ? t('activity.allowedAbsence') :
                               record.attendance}
                            </TableCell>
                            <TableCell $isRTL={isRTL}>{record.checkIn || t('activity.no')}</TableCell>
                            <TableCell $isRTL={isRTL}>{record.checkOut || t('activity.no')}</TableCell>
                            <TableCell $isRTL={isRTL}>{record.permittedLeaves ? t('activity.yes') : t('activity.no')}</TableCell>
                            <TableCell $isRTL={isRTL}>{record.authorizedAbsence ? t('activity.yes') : t('activity.no')}</TableCell>
                            <TableCell $isRTL={isRTL}>
                              {record.totalHours ? `${record.totalHours.toFixed(2)}:00` : t('activity.no')}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>

                    {attendanceData.length > recordsPerPage && (
                      <Pagination>
                        <PageButton
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          &larr;
                        </PageButton>
                        <span style={{ fontFamily: "'Poppins', sans-serif", color: '#666' }}>
                          Page {currentPage}
                        </span>
                        <PageButton
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          disabled={currentPage * recordsPerPage >= attendanceData.length}
                        >
                          &rarr;
                        </PageButton>
                      </Pagination>
                    )}
                  </AttendanceTable>
                </>
              )}
            </ActivityContent>
          )}
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

export default EditTeacherModal; 