import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarContainer = styled.div`
  width: 240px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e1e7ec;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
`;

const LogoSection = styled.div`
  padding: 24px 20px;
  border-bottom: 1px solid #e1e7ec;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
`;



const Navigation = styled.nav`
  flex: 1;
  padding: 20px 0;
`;

const NavItem = styled.button<{ $isActive?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: ${props => props.$isActive ? '#D6B10E' : 'transparent'};
  color: ${props => props.$isActive ? '#ffffff' : '#666'};
  border: none;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  
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
  }
`;

const AddTeacherButton = styled.button`
  margin: 20px;
  padding: 12px 16px;
  background: #D6B10E;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #c4a00d;
    transform: translateY(-1px);
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  margin: 20px 20px 20px 20px;
  background: transparent;
  color: #dc3545;
  border: none;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #fee;
  }
  
  .icon {
    font-size: 20px;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

interface SidebarProps {
  onAddTeacher?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddTeacher }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
    <SidebarContainer>
      <LogoSection>
        <LogoImage src="/logo-page.png" alt="Genius Smart Education" />
      </LogoSection>

      <Navigation>
        <NavItem 
          $isActive={isActive('/dashboard')} 
          onClick={() => handleNavigation('/dashboard')}
        >
          <span className="icon">📊</span>
          Dashboard
        </NavItem>
        
        <NavItem 
          $isActive={isActive('/teachers')} 
          onClick={() => handleNavigation('/teachers')}
        >
          <span className="icon">👥</span>
          Teachers
        </NavItem>
        
        <NavItem 
          $isActive={isActive('/requests')} 
          onClick={() => handleNavigation('/requests')}
        >
          <span className="icon">📄</span>
          Requests
        </NavItem>
        
        <NavItem 
          $isActive={isActive('/settings')} 
          onClick={() => handleNavigation('/settings')}
        >
          <span className="icon">⚙️</span>
          Settings
        </NavItem>
      </Navigation>

      <AddTeacherButton onClick={onAddTeacher}>
        Add a New Teacher +
      </AddTeacherButton>

      <LogoutButton onClick={handleLogout}>
        <span className="icon">🚪</span>
        Log out
      </LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar; 