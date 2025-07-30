import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

type ResetStep = 'email' | 'otp' | 'password' | 'success';

interface EmailFormData {
  email: string;
}

interface OtpFormData {
  otp: string;
}

interface PasswordFormData {
  password: string;
  confirmPassword: string;
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
  color: var(--secondary-color);
  font-size: 52px;
  font-weight: var(--font-weight-semibold);
  text-align: center;
  margin-bottom: var(--spacing-sm);
  
  @media (max-width: 768px) {
    font-size: 40px;
  }
`;

const BrandSubtitle = styled.p`
  color: var(--secondary-color);
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

const ProgressIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-xl);
`;

const ProgressStep = styled.div<{ isActive: boolean; isCompleted: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin: 0 var(--spacing-sm);
  position: relative;
  
  background-color: ${props => 
    props.isCompleted ? 'var(--primary-color)' : 
    props.isActive ? 'var(--primary-color)' : 'var(--border-primary)'};
  
  color: ${props => 
    props.isCompleted || props.isActive ? 'var(--secondary-color)' : 'rgba(20, 31, 37, 0.5)'};
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    width: var(--spacing-lg);
    height: 2px;
    background-color: ${props => props.isCompleted ? 'var(--primary-color)' : 'var(--border-primary)'};
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
  line-height: 1.5;
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
  text-align: ${props => props.type === 'text' && props.maxLength === 6 ? 'center' : 'left'};
  letter-spacing: ${props => props.type === 'text' && props.maxLength === 6 ? '0.5em' : 'normal'};
  font-size: ${props => props.type === 'text' && props.maxLength === 6 ? '1.2em' : 'var(--font-size-base)'};

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(214, 177, 14, 0.1);
  }

  &::placeholder {
    color: rgba(20, 31, 37, 0.5);
  }
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

const TimerDisplay = styled.div`
  text-align: center;
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-top: var(--spacing-sm);
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  cursor: pointer;
  text-align: center;
  width: 100%;
  padding: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  transition: var(--transition-fast);

  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }

  &:disabled {
    color: rgba(20, 31, 37, 0.5);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-xl);
  font-size: 2rem;
  color: var(--secondary-color);
`;

const SuccessMessage = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-xl);
`;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  const emailForm = useForm<EmailFormData>();
  const otpForm = useForm<OtpFormData>();
  const passwordForm = useForm<PasswordFormData>();

  // Timer for OTP expiration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentStep === 'otp' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setCanResend(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [currentStep, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    setEmail(data.email);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep('otp');
      setTimeLeft(300);
      setCanResend(false);
    }, 1500);
  };

  const handleOtpSubmit = async (data: OtpFormData) => {
    setIsLoading(true);
    
    // Demo: Accept "123456" as valid OTP
    setTimeout(() => {
      setIsLoading(false);
      if (data.otp === '123456') {
        setCurrentStep('password');
      } else {
        otpForm.setError('otp', { message: 'Invalid OTP. Use 123456 for demo.' });
      }
    }, 1000);
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep('success');
    }, 1500);
  };

  const handleResendOtp = () => {
    setTimeLeft(300);
    setCanResend(false);
    // Simulate API call for resending OTP
  };

  const handleBack = () => {
    if (currentStep === 'email') {
      navigate('/manager/signin');
    } else if (currentStep === 'otp') {
      setCurrentStep('email');
    } else if (currentStep === 'password') {
      setCurrentStep('otp');
    }
  };

  const handleGoToSignin = () => {
    navigate('/manager/signin');
  };

  const getStepNumber = (step: ResetStep): number => {
    switch (step) {
      case 'email': return 1;
      case 'otp': return 2;
      case 'password': return 3;
      case 'success': return 3;
      default: return 1;
    }
  };

  const currentStepNumber = getStepNumber(currentStep);

  return (
    <Container>
      <BrandingSection>
        <LogoContainer>
          <Logo src="/light-logo-page.png" alt="Genius Smart Education Logo" />
        </LogoContainer>
        <BrandTitle>Genius Smart</BrandTitle>
        <BrandSubtitle>
          Password Recovery
        </BrandSubtitle>
      </BrandingSection>
      
      <FormSection>
        <FormContainer>
          {currentStep !== 'success' && (
            <BackButton onClick={handleBack}>
              ← {currentStep === 'email' ? 'Back to Sign In' : 'Back'}
            </BackButton>
          )}
          
          {currentStep !== 'success' && (
            <ProgressIndicator>
              {[1, 2, 3].map(step => (
                <ProgressStep
                  key={step}
                  isActive={step === currentStepNumber}
                  isCompleted={step < currentStepNumber}
                >
                  {step}
                </ProgressStep>
              ))}
            </ProgressIndicator>
          )}

          {currentStep === 'email' && (
            <>
              <Title>Reset Password</Title>
              <Subtitle>
                Enter your email address and we'll send you a verification code to reset your password.
              </Subtitle>
              
              <Form onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
                <FormGroup>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="manager@school.edu"
                    hasError={!!emailForm.formState.errors.email}
                    {...emailForm.register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {emailForm.formState.errors.email && (
                    <ErrorMessage>{emailForm.formState.errors.email.message}</ErrorMessage>
                  )}
                </FormGroup>

                <SubmitButton type="submit" isLoading={isLoading}>
                  {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                </SubmitButton>
              </Form>
            </>
          )}

          {currentStep === 'otp' && (
            <>
              <Title>Enter Verification Code</Title>
              <Subtitle>
                We've sent a 6-digit verification code to {email}. 
                Enter the code below to continue.
              </Subtitle>
              
              <Form onSubmit={otpForm.handleSubmit(handleOtpSubmit)}>
                <FormGroup>
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    hasError={!!otpForm.formState.errors.otp}
                    {...otpForm.register('otp', {
                      required: 'Verification code is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'Please enter a 6-digit code'
                      }
                    })}
                  />
                  {otpForm.formState.errors.otp && (
                    <ErrorMessage>{otpForm.formState.errors.otp.message}</ErrorMessage>
                  )}
                </FormGroup>

                {timeLeft > 0 && (
                  <TimerDisplay>
                    Code expires in: {formatTime(timeLeft)}
                  </TimerDisplay>
                )}

                <SubmitButton type="submit" isLoading={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </SubmitButton>

                <ResendButton
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend}
                >
                  {canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
                </ResendButton>
              </Form>
            </>
          )}

          {currentStep === 'password' && (
            <>
              <Title>Create New Password</Title>
              <Subtitle>
                Your identity has been verified. Please create a new secure password for your account.
              </Subtitle>
              
              <Form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
                <FormGroup>
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    hasError={!!passwordForm.formState.errors.password}
                    {...passwordForm.register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must contain uppercase, lowercase and number'
                      }
                    })}
                  />
                  {passwordForm.formState.errors.password && (
                    <ErrorMessage>{passwordForm.formState.errors.password.message}</ErrorMessage>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    hasError={!!passwordForm.formState.errors.confirmPassword}
                    {...passwordForm.register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => {
                        const password = passwordForm.watch('password');
                        return value === password || 'Passwords do not match';
                      }
                    })}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <ErrorMessage>{passwordForm.formState.errors.confirmPassword.message}</ErrorMessage>
                  )}
                </FormGroup>

                <SubmitButton type="submit" isLoading={isLoading}>
                  {isLoading ? 'Updating Password...' : 'Update Password'}
                </SubmitButton>
              </Form>
            </>
          )}

          {currentStep === 'success' && (
            <>
              <SuccessIcon>✓</SuccessIcon>
              <SuccessMessage>
                <Title>Password Reset Successful!</Title>
                <Subtitle>
                  Your password has been successfully updated. You can now sign in with your new password.
                </Subtitle>
              </SuccessMessage>
              
              <SubmitButton onClick={handleGoToSignin}>
                Go to Sign In
              </SubmitButton>
            </>
          )}
        </FormContainer>
      </FormSection>
    </Container>
  );
};

export default ResetPassword; 