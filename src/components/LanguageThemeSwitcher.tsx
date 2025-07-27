import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const SwitcherContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const SwitcherButton = styled.button<{ active?: boolean; isDarkMode?: boolean }>`
  background: ${props => props.active ? '#DAA520' : (props.isDarkMode ? '#333' : '#f0f0f0')};
  color: ${props => props.active ? 'white' : (props.isDarkMode ? '#ccc' : '#666')};
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;

  &:hover {
    background: ${props => props.active ? '#B8860B' : '#DAA520'};
    color: white;
  }
`;

const LanguageThemeSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme, isDarkMode } = useTheme();

  return (
    <SwitcherContainer>
      <SwitcherButton
        active={language === 'en'}
        isDarkMode={isDarkMode}
        onClick={() => setLanguage('en')}
      >
        EN
      </SwitcherButton>
      <SwitcherButton
        active={language === 'ar'}
        isDarkMode={isDarkMode}
        onClick={() => setLanguage('ar')}
      >
        ع
      </SwitcherButton>
      <SwitcherButton
        active={theme === 'light'}
        isDarkMode={isDarkMode}
        onClick={() => setTheme('light')}
      >
        ☀️
      </SwitcherButton>
      <SwitcherButton
        active={theme === 'dark'}
        isDarkMode={isDarkMode}
        onClick={() => setTheme('dark')}
      >
        🌙
      </SwitcherButton>
    </SwitcherContainer>
  );
};

export default LanguageThemeSwitcher; 