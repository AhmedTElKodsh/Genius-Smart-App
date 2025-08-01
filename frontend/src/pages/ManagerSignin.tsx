import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { API_BASE_URL } from '../config/api';

interface SigninFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  background-color: var(--background-color);
  /* Ensure LTR direction for English content */
  direction: ltr;
  text-align: left;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const BrandingSection = styled.div`
  flex: 1;
  background-color: var(--primary-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  position: relative;

  @media (max-width: 768px) {
    flex: none;
    padding: var(--spacing-xl) var(--spacing-lg);
    min-height: 180px;
  }
`;

const LogoContainer = styled.div`
  margin-bottom: var(--spacing-lg);
  text-align: center;
`;

const Logo = styled.img`
  max-width: 320px;
  width: 100%;
  height: auto;
  object-fit: contain;
  
  @media (max-width: 768px) {
    max-width: 200px;
  }
`;

const BrandTitle = styled.h1`
  color: white;
  font-size: 52px;
  font-weight: var(--font-weight-semibold);
  text-align: center;
  margin-bottom: var(--spacing-sm);
  
  @media (max-width: 768px) {
    font-size: 40px;
  }
`;

const BrandSubtitle = styled.p`
  color: white;
  font-size: 18px;
  text-align: center;
  opacity: 0.8;
  max-width: 280px;
  line-height: 1.4;
`;

const FormSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  background-color: var(--surface-card);

  @media (max-width: 768px) {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: var(--secondary-color);
  font-size: var(--font-size-sm);
  cursor: pointer;
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) 0;
  transition: var(--transition-fast);
  
  &:hover {
    color: var(--primary-color);
  }
`;

const Title = styled.h2`
  color: var(--secondary-color);
  font-size: var(--title-32-size);
  font-weight: var(--title-32-weight);
  margin-bottom: var(--spacing-sm);
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  color: var(--secondary-color);
  font-size: var(--font-size-sm);
  text-align: center;
  margin-bottom: var(--spacing-xl);
  opacity: 0.7;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const Label = styled.label`
  color: var(--secondary-color);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid ${props => props.hasError ? '#ef4444' : 'var(--border-primary)'};
  border-radius: var(--border-radius-md);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  background-color: var(--surface-card);
  color: var(--secondary-color);
  transition: var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(214, 177, 14, 0.1);
  }

  &::placeholder {
    color: rgba(20, 31, 37, 0.5);
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--secondary-color);
  cursor: pointer;
  padding: var(--spacing-xs);
  opacity: 0.6;
  transition: var(--transition-fast);

  &:hover {
    opacity: 1;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color);
`;

const CheckboxLabel = styled.label`
  color: var(--secondary-color);
  font-size: var(--font-size-sm);
  cursor: pointer;
`;

const SubmitButton = styled.button<{ isLoading?: boolean }>`
  background-color: var(--primary-color);
  color: var(--secondary-color);
  border: 2px solid var(--primary-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: ${props => props.isLoading ? 'not-allowed' : 'pointer'};
  transition: var(--transition-fast);
  opacity: ${props => props.isLoading ? 0.7 : 1};
  text-align: center;

  &:hover:not(:disabled) {
    background-color: var(--secondary-color);
    color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ForgotPasswordLink = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  cursor: pointer;
  text-align: center;
  width: 100%;
  padding: var(--spacing-sm);
  transition: var(--transition-fast);

  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
`;

const ManagerSignin: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<SigninFormData>();

  const onSubmit = async (data: SigninFormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/manager/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      });

      const result = await response.json();

      if (result.success) {
        // Store auth token and manager info
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('managerInfo', JSON.stringify(result.data.manager));
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        // Show error message
        alert(result.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/manager/reset-password');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Container>
      <BrandingSection>
        <LogoContainer>
          <Logo src="/light-logo-page.png" alt="Genius Smart Education Logo" />
        </LogoContainer>
        <BrandTitle>Genius Smart</BrandTitle>
        <BrandSubtitle>
          Manager Portal
        </BrandSubtitle>
      </BrandingSection>
      
      <FormSection>
        <FormContainer>
          <BackButton onClick={handleBack}>
            ← Back to Role Selection
          </BackButton>
          
          <Title>Manager Sign In</Title>
          <Subtitle>Enter your credentials to access the management panel</Subtitle>
          
          <Form onSubmit={handleSubmit(onSubmit)}>
            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="manager@school.edu"
                hasError={!!errors.email}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <InputContainer>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  hasError={!!errors.password}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </PasswordToggle>
              </InputContainer>
              {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
            </FormGroup>

            <CheckboxContainer>
              <Checkbox
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
              />
              <CheckboxLabel htmlFor="rememberMe">
                Remember me for 30 days
              </CheckboxLabel>
            </CheckboxContainer>

            <SubmitButton type="submit" isLoading={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </SubmitButton>
          </Form>

          <ForgotPasswordLink onClick={handleForgotPassword}>
            Forgot your password?
          </ForgotPasswordLink>
        </FormContainer>
      </FormSection>
    </Container>
  );
};

export default ManagerSignin; 
