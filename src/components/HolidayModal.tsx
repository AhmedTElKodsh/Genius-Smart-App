import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (holidayData: any) => void;
  holiday?: any;
}

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
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 2px solid #D6B10E;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid #e1e7ec;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px 16px 0 0;
`;

const ModalTitle = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #141F25;
  margin: 0;
`;

const CloseButton = styled.button`
  background: #ffffff;
  border: 2px solid #e1e7ec;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
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
  }
`;

const ModalBody = styled.div`
  padding: 32px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e1e7ec;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #D6B10E;
    box-shadow: 0 0 0 3px rgba(214, 177, 14, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid #e1e7ec;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #D6B10E;
    box-shadow: 0 0 0 3px rgba(214, 177, 14, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const CheckboxContainer = styled.div<{ $isRTL?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #D6B10E;
`;

const CheckboxLabel = styled.label`
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;

const HelperText = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
  font-style: italic;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(212, 175, 55, 0.3);
    }
  ` : `
    background: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
    
    &:hover {
      background: #e8e8e8;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #ffe6e6;
  color: #d63031;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
`;

const HolidayModal: React.FC<HolidayModalProps> = ({ isOpen, onClose, onSave, holiday }) => {
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    date: '',
    description: '',
    descriptionAr: '',
    isRecurring: false,
    category: 'administrative'
  });

  useEffect(() => {
    if (holiday) {
      setFormData({
        name: holiday.name || '',
        nameAr: holiday.nameAr || '',
        date: holiday.date || '',
        description: holiday.description || '',
        descriptionAr: holiday.descriptionAr || '',
        isRecurring: Boolean(holiday.isRecurring),
        category: holiday.category || 'administrative'
      });
    } else {
      setFormData({
        name: '',
        nameAr: '',
        date: '',
        description: '',
        descriptionAr: '',
        isRecurring: false,
        category: 'administrative'
      });
    }
    setError('');
  }, [holiday, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError(t('validation.required'));
      return;
    }
    
    if (!formData.nameAr.trim()) {
      setError('Arabic name is required');
      return;
    }
    
    if (!formData.date) {
      setError('Date is required');
      return;
    }
    
    // Check if date is in the future (optional validation)
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      if (!window.confirm('This date is in the past. Are you sure you want to add it as a holiday?')) {
        return;
      }
    }
    
    setLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to save holiday');
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
      <ModalContent $isRTL={isRTL}>
        <ModalHeader>
          <ModalTitle>
            {holiday ? t('settings.holidays.editHoliday') : t('settings.holidays.addHoliday')}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            ×
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <Form onSubmit={handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <FormGroup>
              <Label $isRTL={isRTL}>{t('settings.holidays.holidayName')}</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('settings.holidays.holidayNamePlaceholder')}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label $isRTL={isRTL}>{t('settings.holidays.holidayNameAr')}</Label>
              <Input
                type="text"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleInputChange}
                placeholder={t('settings.holidays.holidayNameArPlaceholder')}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label $isRTL={isRTL}>{t('settings.holidays.holidayDate')}</Label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label $isRTL={isRTL}>{t('settings.holidays.description')} (English)</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('settings.holidays.descriptionPlaceholder')}
              />
            </FormGroup>
            
            <FormGroup>
              <Label $isRTL={isRTL}>{t('settings.holidays.description')} (Arabic)</Label>
              <TextArea
                name="descriptionAr"
                value={formData.descriptionAr}
                onChange={handleInputChange}
                placeholder="أدخل وصف العطلة بالعربية (اختياري)"
              />
            </FormGroup>
            
            <FormGroup>
              <CheckboxContainer $isRTL={isRTL}>
                <Checkbox
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleInputChange}
                  id="isRecurring"
                />
                <CheckboxLabel htmlFor="isRecurring">
                  {t('settings.holidays.isRecurring')}
                </CheckboxLabel>
              </CheckboxContainer>
              <HelperText>{t('settings.holidays.recurringNote')}</HelperText>
            </FormGroup>
            
            <ButtonGroup>
              <Button type="button" $variant="secondary" onClick={onClose}>
                {t('settings.holidays.cancel')}
              </Button>
              <Button type="submit" $variant="primary" disabled={loading}>
                {loading ? 'Saving...' : t('settings.holidays.save')}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default HolidayModal; 