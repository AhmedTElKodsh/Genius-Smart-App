import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  @media (max-width: 768px) {
    padding: var(--spacing-md);
    justify-content: flex-start;
  }

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
    min-height: 280px;
    padding: var(--spacing-xl) var(--spacing-lg);
    justify-content: center;
  }
`;

const Logo = styled.img`
  max-width: 280px;
  width: 80%;
  height: auto;
  object-fit: contain;
  margin-bottom: var(--spacing-lg);
  
  @media (max-width: 768px) {
    max-width: 580px;
    width: 80%;
    margin-bottom: var(--spacing-xl);
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
    font-size: 50px;
    margin-bottom: var(--spacing-sm);
  }
`;

const BrandSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--font-size-lg);
  margin-top: var(--spacing-sm);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-xl);
  }
`;

const SignInSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);

  @media (max-width: 768px) {
    width: 100%;
    padding: var(--spacing-lg) var(--spacing-md);
    justify-content: flex-start;
  }
`;

const SignInCard = styled.div`
  background: white;
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-2xl);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
  position: relative;
  direction: ltr;
  text-align: left;

  * {
    direction: ltr;
    text-align: inherit;
  }

  input, textarea, select {
    direction: ltr !important;
    text-align: left !important;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-2xl) var(--spacing-xl);
    border-radius: var(--border-radius-2xl);
    max-width: 450px;
    min-height: 420px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

const CardTitle = styled.h2`
  color: var(--secondary-color);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  text-align: center;
  margin-bottom: var(--spacing-lg);
  direction: ltr;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-2xl);
    margin-bottom: var(--spacing-xl);
  }
`;

const CardSubtitle = styled.p`
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
  margin-bottom: var(--spacing-xl);
  line-height: 1.5;
  direction: ltr;

  @media (max-width: 768px) {
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-xl);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  direction: ltr;

  @media (max-width: 768px) {
    gap: var(--spacing-xl);
    flex: 1;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  direction: ltr;
  text-align: left;
`;

const Label = styled.label`
  color: var(--secondary-color);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  direction: ltr;
  text-align: left;

  @media (max-width: 768px) {
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-xs);
  }
`;

const Input = styled.input`
  padding: var(--spacing-lg);
  border: 2px solid var(--border-primary);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  transition: var(--transition-fast);
  direction: ltr;
  text-align: left;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  }

  &::placeholder {
    text-align: left;
    direction: ltr;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-lg) var(--spacing-md);
    font-size: var(--font-size-lg);
    border-radius: var(--border-radius-xl);
  }
`;



const SignInButton = styled.button`
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
  direction: ltr;
  text-align: center;
  
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
    padding: var(--spacing-lg);
    font-size: var(--font-size-lg);
    margin-top: var(--spacing-xl);
  }
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  margin: var(--spacing-xl) 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-primary);
  }
  
  span {
    padding: 0 var(--spacing-lg);
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }
`;

const ForgotPasswordLink = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  margin-top: var(--spacing-md);
  align-self: center;
  direction: ltr;
  text-align: center;
  
  &:hover {
    color: #B8941F;
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

interface TeacherSigninProps {}

const TeacherSignin: React.FC<TeacherSigninProps> = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'signin' | 'otp'>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    resetEmail: ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/teacher/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('teacherToken', data.data.token);
        localStorage.setItem('teacherData', JSON.stringify(data.data.teacher));
        navigate('/teacher/home-advanced'); // Navigate to advanced version for testing
      } else {
        setError(data.message || 'Sign in failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setAuthMode('otp');
    setError('');
    setSuccess('');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/teacher/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.resetEmail,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('OTP sent successfully! Check your email.');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/teacher/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.resetEmail,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('OTP verified! You can now reset your password.');
        // Navigate to password reset page or show password reset form
        navigate('/teacher/reset-password', { 
          state: { 
            email: formData.resetEmail,
            verified: true 
          } 
        });
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (authMode === 'otp') {
      setAuthMode('signin');
      setError('');
      setSuccess('');
      setOtpCode('');
    } else {
      navigate('/');
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
      
      <SignInSection>
        <SignInCard>
          {authMode === 'signin' ? (
            <>
              <CardTitle>Teacher Sign In</CardTitle>
              <CardSubtitle>
                Enter your credentials provided by the school administration
              </CardSubtitle>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}
              
              <Form onSubmit={handleSignIn}>
                <InputGroup>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@school.edu"
                    required
                  />
                </InputGroup>
                
                <InputGroup>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                  />
                </InputGroup>
                
                <SignInButton type="submit" disabled={loading}>
                  <ButtonContent>
                    {loading && <LoadingSpinner />}
                    {loading ? 'Signing In...' : 'Sign In'}
                  </ButtonContent>
                </SignInButton>
                
                <ForgotPasswordLink type="button" onClick={handleForgotPassword}>
                  Forgot your password?
                </ForgotPasswordLink>
              </Form>
            </>
          ) : (
            <>
              <CardTitle>Reset Password</CardTitle>
              <CardSubtitle>
                Enter your email address to receive the OTP code
              </CardSubtitle>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}
              
              <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  border: '2px solid var(--border-primary)', 
                  borderRadius: 'var(--border-radius-lg)', 
                  margin: '0 auto var(--spacing-lg)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '36px' 
                }}>
                  📧
                </div>
                <p style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: 'var(--font-size-sm)', 
                  margin: 0 
                }}>
                  You'll receive a 4 digit code in your email
                </p>
              </div>
              
              <Form onSubmit={success ? handleVerifyOTP : handleSendOTP}>
                {!success ? (
                  <InputGroup>
                    <Label htmlFor="resetEmail">Email Address</Label>
                    <Input
                      id="resetEmail"
                      name="resetEmail"
                      type="email"
                      value={formData.resetEmail}
                      onChange={handleInputChange}
                      placeholder="your.email@school.edu"
                      required
                    />
                  </InputGroup>
                ) : (
                  <InputGroup>
                    <Label htmlFor="otp">Enter OTP Code</Label>
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="1234"
                      maxLength={4}
                      required
                    />
                  </InputGroup>
                )}
                
                <SignInButton type="submit" disabled={loading}>
                  <ButtonContent>
                    {loading && <LoadingSpinner />}
                    {loading ? 'Processing...' : (success ? 'Verify OTP' : 'Send OTP')}
                  </ButtonContent>
                </SignInButton>
              </Form>
            </>
          )}
        </SignInCard>
      </SignInSection>
    </Container>
  );
};

export default TeacherSignin; 
