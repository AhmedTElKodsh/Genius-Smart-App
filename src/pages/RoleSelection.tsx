import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  background-color: var(--background-color);

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
    min-height: 200px;
  }
`;

const LogoContainer = styled.div`
  margin-bottom: var(--spacing-xl);
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
  font-weight: var(--title-32-weight);
  line-height: var(--title-32-line-height);
  text-align: center;
  margin-bottom: var(--spacing-md);
  
  @media (max-width: 768px) {
    font-size: 40px;
  }
`;

const SelectionSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  background-color: var(--surface-card);

  @media (max-width: 768px) {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
`;

const SelectionTitle = styled.h2`
  color: var(--secondary-color);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-lg);
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 300px;
`;

const RoleButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: var(--spacing-xl);
  border: 2px solid ${props => props.variant === 'primary' ? 'var(--primary-color)' : 'var(--border-primary)'};
  border-radius: var(--border-radius-xl);
  background-color: ${props => props.variant === 'primary' ? 'var(--primary-color)' : 'var(--surface-card)'};
  color: ${props => props.variant === 'primary' ? 'var(--secondary-color)' : 'var(--secondary-color)'};
  font-family: var(--font-family);
  font-size: var(--paragraph-18-size);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: center;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    background-color: ${props => props.variant === 'primary' ? 'var(--secondary-color)' : 'var(--primary-color)'};
    color: ${props => props.variant === 'primary' ? 'var(--primary-color)' : 'var(--secondary-color)'};
    border-color: var(--primary-color);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-lg);
    font-size: var(--font-size-base);
    min-height: 60px;
  }
`;

const Subtitle = styled.p`
  color: var(--secondary-color);
  font-size: var(--font-size-sm);
  text-align: center;
  margin-top: var(--spacing-lg);
  opacity: 0.7;
  max-width: 280px;
  line-height: 1.4;
`;

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleManagerSelect = () => {
    navigate('/manager/signin');
  };

  const handleTeacherSelect = () => {
    alert('Teacher functionality will be available soon!');
  };

  return (
    <Container>
      <BrandingSection>
        <LogoContainer>
          <Logo src="/light-logo-page.png" alt="Genius Smart Education Logo" />
        </LogoContainer>
        <BrandTitle>Genius Smart</BrandTitle>
      </BrandingSection>
      
      <SelectionSection>
        <SelectionTitle>Select Your Role</SelectionTitle>
        <ButtonContainer>
          <RoleButton variant="primary" onClick={handleManagerSelect}>
            Manager / Admin
          </RoleButton>
          <RoleButton variant="secondary" onClick={handleTeacherSelect}>
            Teacher
          </RoleButton>
        </ButtonContainer>
        <Subtitle>
          Choose your role to access the appropriate features and tools
        </Subtitle>
      </SelectionSection>
    </Container>
  );
};

export default RoleSelection; 