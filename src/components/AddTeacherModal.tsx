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

const ModalContent = styled.div`
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

const ModalBody = styled.div`
  padding: 40px;
`;

const FormTitle = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #141F25;
  margin: 0 0 12px 0;
  text-align: center;
`;

const FormSubtitle = styled.p`
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

const Label = styled.label`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #141F25;
  margin-bottom: 4px;
`;

const Input = styled.input`
  padding: 16px 20px;
  border: 2px solid #e1e7ec;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  background: #f8f9fa;
  color: #141F25;
  transition: all 0.3s ease;
  
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

const Select = styled.select`
  padding: 16px 20px;
  border: 2px solid #e1e7ec;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  background: #f8f9fa;
  color: #141F25;
  cursor: pointer;
  transition: all 0.3s ease;
  
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

const DateOfBirthLabel = styled.label`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #141F25;
  margin-bottom: 12px;
  display: block;
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

const AuthoritySection = styled.div`
  margin: 24px 0;
  padding: 20px;
  border: 2px solid #e1e7ec;
  border-radius: 12px;
  background: #f8f9fa;
`;

const AuthorityTitle = styled.h3`
  margin: 0 0 16px 0;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
`;

const AuthorityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const AuthorityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AuthorityCheckbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #d4a015;
`;

const AuthorityLabel = styled.label`
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #34495e;
  cursor: pointer;
  flex: 1;
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
  const { language, translations } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    }
  }, [isOpen]);

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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
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
        authorities: formData.authorities
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
          subject: '',
          workType: 'Full-time',
          password: '',
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

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <Logo>
            <LogoImage src="/logo-page.png" alt="Genius Smart Education" />
            <BrandText>
              <BrandTitle>Genius Smart Education</BrandTitle>
            </BrandText>
          </Logo>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <FormTitle>Add a New Teacher</FormTitle>
          <FormSubtitle>Add a new teacher to your team and manage operations seamlessly</FormSubtitle>
          
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <FormField>
                <Label>First Name</Label>
                <Input
                  type="text"
                  placeholder="Ahmed"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </FormField>
              
              <FormField>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  placeholder="Hassan"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </FormField>
            </FormGrid>

            <FormFieldFull>
              <Label>Teacher's Phone</Label>
              <Input
                type="tel"
                placeholder="01000022230"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </FormFieldFull>

            <FormFieldFull>
              <Label>Teacher's Email</Label>
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </FormFieldFull>

            <FormFieldFull>
              <Label>Teacher's Address</Label>
              <Input
                type="text"
                placeholder="New Cairo, Cairo"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </FormFieldFull>

            <FormFieldFull>
              <Label>Teacher's Password</Label>
              <Input
                type="password"
                placeholder="Enter password for teacher account"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
            </FormFieldFull>

            <DateOfBirthContainer>
              <DateOfBirthLabel>Date of Birth</DateOfBirthLabel>
              <DateGrid>
                <Select
                  value={formData.birthDay}
                  onChange={(e) => handleInputChange('birthDay', e.target.value)}
                >
                  <option value="">Day</option>
                  {dayOptions.map(day => (
                    <option key={day} value={day.toString().padStart(2, '0')}>
                      {day.toString().padStart(2, '0')}
                    </option>
                  ))}
                </Select>
                
                <Select
                  value={formData.birthMonth}
                  onChange={(e) => handleInputChange('birthMonth', e.target.value)}
                >
                  <option value="">Month</option>
                  {monthOptions.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </Select>
                
                <Select
                  value={formData.birthYear}
                  onChange={(e) => handleInputChange('birthYear', e.target.value)}
                >
                  <option value="">Year</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </Select>
              </DateGrid>
            </DateOfBirthContainer>

            <FormFieldFull>
              <Label>Employment Date * / تاريخ التعيين *</Label>
              <Input
                type="date"
                value={formData.employmentDate}
                onChange={(e) => handleInputChange('employmentDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </FormFieldFull>

            <FormFieldFull>
              <Label>Allowed Absence Days / أيام الاجازة المتاحة</Label>
              <Input
                type="number"
                min="0"
                max="365"
                placeholder="30"
                value={formData.allowedAbsenceDays}
                onChange={(e) => handleInputChange('allowedAbsenceDays', e.target.value)}
              />
            </FormFieldFull>

            {managerAuthorities?.canManageAuthorities && (
              <AuthoritySection>
                <AuthorityTitle>
                  {t('authorities.title')}
                </AuthorityTitle>
                <AuthorityGrid>
                  <AuthorityItem>
                    <AuthorityCheckbox
                      type="checkbox"
                      id="canAccessPortal"
                      checked={formData.authorities.canAccessPortal}
                      onChange={(e) => handleInputChange('authorities', {
                        ...formData.authorities,
                        canAccessPortal: e.target.checked
                      })}
                    />
                    <AuthorityLabel htmlFor="canAccessPortal">
                      {language === 'ar' ? 'الوصول إلى بوابة المدير' : 'Access Manager Portal'}
                    </AuthorityLabel>
                  </AuthorityItem>

                  <AuthorityItem>
                    <AuthorityCheckbox
                      type="checkbox"
                      id="canAddTeachers"
                      checked={formData.authorities.canAddTeachers}
                      onChange={(e) => handleInputChange('authorities', {
                        ...formData.authorities,
                        canAddTeachers: e.target.checked
                      })}
                    />
                    <AuthorityLabel htmlFor="canAddTeachers">
                      {language === 'ar' ? 'إضافة مدرسين جدد' : 'Add New Teachers'}
                    </AuthorityLabel>
                  </AuthorityItem>

                  <AuthorityItem>
                    <AuthorityCheckbox
                      type="checkbox"
                      id="canEditTeachers"
                      checked={formData.authorities.canEditTeachers}
                      onChange={(e) => handleInputChange('authorities', {
                        ...formData.authorities,
                        canEditTeachers: e.target.checked
                      })}
                    />
                    <AuthorityLabel htmlFor="canEditTeachers">
                      {language === 'ar' ? 'تعديل معلومات المدرسين' : 'Edit Teachers Info'}
                    </AuthorityLabel>
                  </AuthorityItem>

                  <AuthorityItem>
                    <AuthorityCheckbox
                      type="checkbox"
                      id="canManageRequests"
                      checked={formData.authorities.canManageRequests}
                      onChange={(e) => handleInputChange('authorities', {
                        ...formData.authorities,
                        canManageRequests: e.target.checked
                      })}
                    />
                    <AuthorityLabel htmlFor="canManageRequests">
                      {language === 'ar' ? 'قبول ورفض الطلبات' : 'Accept and Reject Requests'}
                    </AuthorityLabel>
                  </AuthorityItem>

                  <AuthorityItem>
                    <AuthorityCheckbox
                      type="checkbox"
                      id="canDownloadReports"
                      checked={formData.authorities.canDownloadReports}
                      onChange={(e) => handleInputChange('authorities', {
                        ...formData.authorities,
                        canDownloadReports: e.target.checked
                      })}
                    />
                    <AuthorityLabel htmlFor="canDownloadReports">
                      {language === 'ar' ? 'تحميل التقارير' : 'Download Reports'}
                    </AuthorityLabel>
                  </AuthorityItem>

                  <AuthorityItem>
                    <AuthorityCheckbox
                      type="checkbox"
                      id="canManageAuthorities"
                      checked={formData.authorities.canManageAuthorities}
                      onChange={(e) => handleInputChange('authorities', {
                        ...formData.authorities,
                        canManageAuthorities: e.target.checked
                      })}
                    />
                    <AuthorityLabel htmlFor="canManageAuthorities">
                      {language === 'ar' ? 'إدارة الصلاحيات (للمدير فقط)' : 'Manage Authorities (Admin Only)'}
                    </AuthorityLabel>
                  </AuthorityItem>
                </AuthorityGrid>
              </AuthoritySection>
            )}

            <FormGrid>
              <FormField>
                <Label>Teacher's Subject</Label>
                <Select
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              
              <FormField>
                <Label>Role's Type</Label>
                <Select
                  value={formData.workType}
                  onChange={(e) => handleInputChange('workType', e.target.value)}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </Select>
              </FormField>
            </FormGrid>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <SaveButton type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </SaveButton>
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddTeacherModal; 