import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher';

const Container = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  min-height: 100vh;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)'
  };
  padding: 20px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  font-family: ${props => props.isRTL ? 'Tajawal, Cairo, sans-serif' : 'system-ui, sans-serif'};
`;

const Header = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  text-align: center;
  color: ${props => props.isDarkMode ? '#f0f0f0' : 'white'};
  margin-bottom: 40px;
  padding-top: 60px;
`;

const Title = styled.h1<{ isRTL: boolean }>`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const Subtitle = styled.p<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 18px;
  opacity: 0.9;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const DemoSection = styled.div<{ isDarkMode: boolean }>`
  background: ${props => props.isDarkMode ? '#1e1e1e' : 'white'};
  border-radius: 20px;
  padding: 30px;
  margin: 20px auto;
  max-width: 600px;
  box-shadow: ${props => props.isDarkMode 
    ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
    : '0 4px 20px rgba(0, 0, 0, 0.1)'
  };
  border: ${props => props.isDarkMode ? '1px solid #333' : 'none'};
`;

const DemoTitle = styled.h2<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  margin-bottom: 20px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const FeatureList = styled.ul<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#ccc' : '#666'};
  line-height: 1.8;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  padding-${props => props.isRTL ? 'right' : 'left'}: 20px;
`;

const TestButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: #DAA520;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin: 10px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};

  &:hover {
    background: #B8860B;
    transform: translateY(-2px);
  }
`;

const InstructionBox = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#FFF8DC'};
  border: 2px solid #DAA520;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const TeacherDemo: React.FC = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { isDarkMode } = useTheme();

  const content = {
    en: {
      title: "Teacher Home Demo",
      subtitle: "Test Arabic Language & Dark Theme Support",
      demoTitle: "Features to Test:",
      features: [
        "🔄 Language switching (EN ↔ Arabic)",
        "🌙 Dark/Light theme toggle",
        "📱 Mobile-first responsive design",
        "🕒 Timer with Arabic numerals support",
        "📊 Summary cards with proper RTL layout",
        "📅 Calendar with Arabic month names",
        "⚡ Real-time attendance tracking"
      ],
      instructions: "Use the buttons in the top-right corner to switch between languages and themes. Then test the teacher home page to see how it adapts to Arabic text and dark mode.",
      testButton: "Test Teacher Home",
      loginButton: "Go to Teacher Login"
    },
    ar: {
      title: "تجربة الصفحة الرئيسية للمعلم",
      subtitle: "اختبار دعم اللغة العربية والوضع الداكن",
      demoTitle: "الميزات للاختبار:",
      features: [
        "🔄 تبديل اللغة (إنجليزي ↔ عربي)",
        "🌙 تبديل الوضع الداكن/الفاتح",
        "📱 تصميم متجاوب للهواتف المحمولة",
        "🕒 مؤقت مع دعم الأرقام العربية",
        "📊 بطاقات الملخص مع تخطيط صحيح من اليمين لليسار",
        "📅 تقويم بأسماء الأشهر العربية",
        "⚡ تتبع الحضور في الوقت الفعلي"
      ],
      instructions: "استخدم الأزرار في الزاوية اليمنى العلوية للتبديل بين اللغات والمواضيع. ثم اختبر الصفحة الرئيسية للمعلم لترى كيف تتكيف مع النص العربي والوضع الداكن.",
      testButton: "اختبار الصفحة الرئيسية للمعلم",
      loginButton: "الذهاب إلى تسجيل دخول المعلم"
    }
  };

  const t = content[language];

  return (
    <Container isDarkMode={isDarkMode} isRTL={isRTL}>
      <LanguageThemeSwitcher />
      
      <Header isDarkMode={isDarkMode} isRTL={isRTL}>
        <Title isRTL={isRTL}>{t.title}</Title>
        <Subtitle isDarkMode={isDarkMode} isRTL={isRTL}>{t.subtitle}</Subtitle>
      </Header>

      <DemoSection isDarkMode={isDarkMode}>
        <DemoTitle isDarkMode={isDarkMode} isRTL={isRTL}>{t.demoTitle}</DemoTitle>
        <FeatureList isDarkMode={isDarkMode} isRTL={isRTL}>
          {t.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </FeatureList>
      </DemoSection>

      <DemoSection isDarkMode={isDarkMode}>
        <InstructionBox isDarkMode={isDarkMode} isRTL={isRTL}>
          {t.instructions}
        </InstructionBox>
        
        <div style={{ textAlign: 'center' }}>
          <TestButton
            isDarkMode={isDarkMode}
            isRTL={isRTL}
            onClick={() => navigate('/teacher/home-advanced')}
          >
            {t.testButton}
          </TestButton>
          
          <TestButton
            isDarkMode={isDarkMode}
            isRTL={isRTL}
            onClick={() => navigate('/teacher/signin')}
          >
            {t.loginButton}
          </TestButton>
        </div>
      </DemoSection>
    </Container>
  );
};

export default TeacherDemo; 
