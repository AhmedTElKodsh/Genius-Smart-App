import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { API_BASE_URL } from '../config/api';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #D4AF37 0%, #F5DD59 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  position: relative;
  /* Ensure LTR direction for English content */
  direction: ltr;
  text-align: left;

  @media (min-width: 768px) {
    flex-direction: row;
    padding: var(--spacing-2xl);
  }
`;

const BrandingSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;

  @media (max-width: 768px) {
    min-height: 200px;
    padding: var(--spacing-lg);
  }
`;

const Logo = styled.img`
  max-width: 280px;
  width: 80%;
  height: auto;
  object-fit: contain;
  margin-bottom: var(--spacing-lg);
  
  @media (max-width: 768px) {
    max-width: 200px;
    width: 60%;
  }
`;

const BrandTitle = styled.h1`
  color: white;
  font-size: 48px;
  font-weight: var(--title-32-weight);
  line-height: var(--title-32-line-height);
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const BrandSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-lg);
  margin-top: var(--spacing-sm);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-base);
  }
`;

const ResetSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);

  @media (max-width: 768px) {
    width: 100%;
    padding: var(--spacing-lg);
  }
`;

const ResetCard = styled.div`
  background: white;
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-2xl);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
  position: relative;

  @media (max-width: 768px) {
    padding: var(--spacing-xl);
    border-radius: var(--border-radius-xl);
    max-width: 100%;
  }
`;

const CardTitle = styled.h2`
  color: var(--secondary-color);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  text-align: center;
  margin-bottom: var(--spacing-lg);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-xl);
  }
`;

const CardSubtitle = styled.p`
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
  margin-bottom: var(--spacing-xl);
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const Label = styled.label`
  color: var(--secondary-color);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
`;

const Input = styled.input`
  padding: var(--spacing-lg);
  border: 2px solid var(--border-primary);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  transition: var(--transition-fast);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  }
  
  &::placeholder {
    color: var(--text-muted);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }
`;

const PasswordStrength = styled.div<{ strength: number }>`
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  margin-top: var(--spacing-sm);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.strength * 25}%;
    background: ${props => 
      props.strength <= 1 ? '#ff4444' :
      props.strength <= 2 ? '#ff8800' :
      props.strength <= 3 ? '#ffaa00' :
      '#00aa00'
    };
    transition: all 0.3s ease;
  }
`;

const PasswordHint = styled.div`
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-top: var(--spacing-xs);
  line-height: 1.4;
`;

const ResetButton = styled.button`
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-fast);
  margin-top: var(--spacing-lg);
  
  &:hover:not(:disabled) {
    background: #B8941F;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  }
  
  &:disabled {
    background: var(--text-muted);
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: var(--spacing-lg);
  left: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: var(--border-radius-full);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
  color: white;
  font-size: 20px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
    top: var(--spacing-md);
    left: var(--spacing-md);
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  text-align: center;
  margin-bottom: var(--spacing-lg);
`;

const SuccessMessage = styled.div`
  background: #efe;
  color: #363;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  text-align: center;
  margin-bottom: var(--spacing-lg);
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: var(--spacing-sm);
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface TeacherResetPasswordProps {}

const TeacherResetPassword: React.FC<TeacherResetPasswordProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Check if we have proper verification state
  useEffect(() => {
    if (!location.state?.verified || !location.state?.email) {
      navigate('/teacher/signin');
    }
  }, [location.state, navigate]);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');

    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validatePasswords = (): boolean => {
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validatePasswords()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/teacher/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: location.state?.email,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password reset successfully! You can now sign in with your new password.');
        setTimeout(() => {
          navigate('/teacher/signin');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/teacher/signin');
  };

  const getPasswordStrengthText = (): string => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  return (
    <Container>
      <BackButton onClick={handleBack}>
        ←
      </BackButton>
      
      <BrandingSection>
        <Logo src="/light-logo-page.png" alt="Genius Smart Education Logo" />
        <BrandTitle>Genius Smart</BrandTitle>
        <BrandSubtitle>Education</BrandSubtitle>
      </BrandingSection>
      
      <ResetSection>
        <ResetCard>
          <CardTitle>Reset Password</CardTitle>
          <CardSubtitle>
            Enter your new password to complete the reset process
          </CardSubtitle>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          <Form onSubmit={handleResetPassword}>
            <InputGroup>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                required
              />
              <PasswordStrength strength={passwordStrength} />
              <PasswordHint>
                Password strength: {getPasswordStrengthText()}
                <br />
                Use at least 8 characters with mix of letters, numbers & symbols
              </PasswordHint>
            </InputGroup>
            
            <InputGroup>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                required
              />
            </InputGroup>
            
            <ResetButton type="submit" disabled={loading || passwordStrength < 2}>
              <ButtonContent>
                {loading && <LoadingSpinner />}
                {loading ? 'Resetting...' : 'Reset Password'}
              </ButtonContent>
            </ResetButton>
          </Form>
        </ResetCard>
      </ResetSection>
    </Container>
  );
};

export default TeacherResetPassword; 
