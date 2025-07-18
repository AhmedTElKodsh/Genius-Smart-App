import styled from 'styled-components';

// Breakpoints
const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
};

// Media query helpers
export const media = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (min-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
  mobileLandscape: `@media (max-height: 600px) and (orientation: landscape)`,
};

// Responsive Container Components
export const ResponsiveContainer = styled.div`
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #E6D693 0%, #D6B10E 100%);
  
  ${media.mobile} {
    flex-direction: column;
    min-height: 100vh;
  }
  
  ${media.mobileLandscape} {
    min-height: 100vh;
    overflow-y: auto;
  }
`;

export const LeftSection = styled.div`
  flex: 1;
  background-color: #D6B10E;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  
  ${media.mobile} {
    flex: 0 0 auto;
    min-height: 30vh;
    padding: 1rem;
  }
  
  ${media.mobileLandscape} {
    min-height: 25vh;
    padding: 0.5rem;
  }
`;

export const RightSection = styled.div`
  flex: 1;
  background-color: #F3F1E4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  border-radius: 5px 0 0 5px;
  margin: 2rem 0 2rem 2rem;
  
  ${media.mobile} {
    flex: 1;
    margin: 0;
    border-radius: 0;
    padding: 1.5rem 1rem;
    min-height: 70vh;
  }
  
  ${media.mobileLandscape} {
    padding: 1rem;
    min-height: 75vh;
  }
`;

export const Logo = styled.div`
  width: 432px;
  height: 155px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  
  ${media.mobile} {
    width: 280px;
    height: 100px;
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  ${media.mobileLandscape} {
    width: 200px;
    height: 60px;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
`;

export const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  
  ${media.mobile} {
    max-width: 100%;
    padding: 0;
  }
`;

export const FormTitle = styled.h1`
  color: #333;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
  
  ${media.mobile} {
    font-size: 1.5rem;
  }
  
  ${media.mobileLandscape} {
    font-size: 1.3rem;
    margin-bottom: 0.25rem;
  }
`;

export const FormSubtitle = styled.p`
  color: #666;
  font-size: 1rem;
  margin-bottom: 2rem;
  text-align: center;
  opacity: 0.8;
  line-height: 1.5;
  
  ${media.mobile} {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
  
  ${media.mobileLandscape} {
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }
`;

export const BackButton = styled.button`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.5rem;
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #f0f0f0;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  ${media.mobile} {
    top: 0.5rem;
    left: 0.5rem;
    font-size: 1.2rem;
    padding: 0.75rem;
  }
`;

// Form-specific responsive components
export const ResponsiveForm = styled.form`
  width: 100%;
`;

export const ResponsiveFormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  ${media.mobile} {
    margin-bottom: 1.25rem;
  }
  
  ${media.mobileLandscape} {
    margin-bottom: 1rem;
  }
`;

export const ResponsiveInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.hasError ? '#dc3545' : '#E7E7E7'};
  border-radius: 5px;
  font-size: 1rem;
  background-color: #E7E7E7;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  min-height: 44px;
  
  &:focus {
    outline: none;
    border-color: #D6B10E;
    box-shadow: 0 0 0 2px rgba(214, 177, 14, 0.2);
    background-color: white;
  }
  
  &::placeholder {
    color: #999;
    opacity: 0.7;
  }
  
  ${media.mobile} {
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 1rem 0.75rem;
  }
`;

export const ResponsiveButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  min-height: 44px;
  
  ${props => props.variant === 'secondary' ? `
    background-color: transparent;
    color: #D6B10E;
    border: 1px solid #D6B10E;
    
    &:hover {
      background-color: #D6B10E;
      color: white;
      transform: translateY(-1px);
    }
  ` : `
    background-color: #D6B10E;
    color: white;
    
    &:hover {
      background-color: #c4a00d;
      transform: translateY(-1px);
    }
  `}
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${media.mobile} {
    padding: 1rem;
    font-size: 1.1rem;
  }
  
  ${media.mobileLandscape} {
    padding: 0.75rem;
    font-size: 1rem;
  }
`;

export const ResponsiveLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
  font-size: 0.9rem;
  
  ${media.mobile} {
    font-size: 1rem;
  }
`;

export const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  
  ${media.mobile} {
    font-size: 0.9rem;
  }
`;

export const SuccessMessage = styled.div`
  color: #28a745;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  
  ${media.mobile} {
    font-size: 0.9rem;
  }
`; 