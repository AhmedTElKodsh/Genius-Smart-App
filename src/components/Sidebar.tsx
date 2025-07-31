import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const SidebarContainer = styled.div<{ $isRTL: boolean }>`
  width: 240px;
  height: 100vh;
  background: #ffffff;
  border-right: ${props => props.$isRTL ? 'none' : '1px solid #e1e7ec'};
  border-left: ${props => props.$isRTL ? '1px solid #e1e7ec' : 'none'};
  display: flex;
  flex-direction: column;
  position: fixed;
  left: ${props => props.$isRTL ? 'auto' : '0'};
  right: ${props => props.$isRTL ? '0' : 'auto'};
  top: 0;
  z-index: 100;
`;

const LogoSection = styled.div`
  padding: 32px 20px;
  border-bottom: 1px solid #e1e7ec;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoImage = styled.img`
  width: 150px;
  height: 120px;
  object-fit: contain;
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 20px 0;
`;

const NavItem = styled.button<{ $isActive?: boolean; $isRTL: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: ${props => props.$isActive ? '#D6B10E' : 'transparent'};
  color: ${props => props.$isActive ? '#ffffff' : '#666'};
  border: none;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 16px;
  font-weight: 500;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  cursor: pointer;
  transition: all 0.2s ease;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:hover {
    background: ${props => props.$isActive ? '#D6B10E' : '#f5f5f5'};
    color: ${props => props.$isActive ? '#ffffff' : '#141F25'};
  }
  
  .icon {
    font-size: 20px;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    order: ${props => props.$isRTL ? '2' : '0'};
  }
`;

const AddTeacherButton = styled.button<{ $isRTL: boolean }>`
  margin: 20px;
  padding: 12px 16px;
  background: #D6B10E;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:hover {
    background: #c4a00d;
    transform: translateY(-1px);
  }
`;

const LogoutButton = styled.button<{ $isRTL: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  margin: 20px 20px 20px 20px;
  background: transparent;
  color: #dc3545;
  border: none;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 16px;
  font-weight: 500;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  cursor: pointer;
  transition: all 0.2s ease;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:hover {
    background: #fee;
  }
  
  .icon {
    font-size: 20px;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    order: ${props => props.$isRTL ? '2' : '0'};
  }
`;

interface SidebarProps {
  onAddTeacher?: () => void;
  canAddTeachers?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddTeacher, canAddTeachers = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isRTL } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Clear any stored auth data
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    // Navigate back to role selection
    navigate('/');
  };

  return (
    <SidebarContainer $isRTL={isRTL}>
      <LogoSection>
        <LogoImage src="/logo-page.png" alt={t('brand.education')} />
      </LogoSection>

      <Navigation>
        <NavItem 
          $isActive={isActive('/dashboard')} 
          $isRTL={isRTL}
          onClick={() => handleNavigation('/dashboard')}
        >
          <span className="icon">📊</span>
          {t('nav.dashboard')}
        </NavItem>
        
        <NavItem 
          $isActive={isActive('/teachers')} 
          $isRTL={isRTL}
          onClick={() => handleNavigation('/teachers')}
        >
          <span className="icon">👥</span>
          {t('nav.teachers')}
        </NavItem>
        
        <NavItem 
          $isActive={isActive('/requests')} 
          $isRTL={isRTL}
          onClick={() => handleNavigation('/requests')}
        >
          <span className="icon">📄</span>
          {t('nav.requests')}
        </NavItem>
        
        <NavItem 
          $isActive={isActive('/settings')} 
          $isRTL={isRTL}
          onClick={() => handleNavigation('/settings')}
        >
          <span className="icon">⚙️</span>
          {t('nav.settings')}
        </NavItem>
      </Navigation>

      {canAddTeachers && (
        <AddTeacherButton $isRTL={isRTL} onClick={onAddTeacher}>
          {t('nav.addTeacher')}
        </AddTeacherButton>
      )}

      <LogoutButton $isRTL={isRTL} onClick={handleLogout}>
        <span className="icon">🚪</span>
        {t('nav.logout')}
      </LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar; 