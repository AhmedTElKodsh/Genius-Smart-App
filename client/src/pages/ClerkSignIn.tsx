import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const ClerkSignIn: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/logo-page.png"
              alt="Genius Smart Education"
              className="h-16 w-auto"
            />
          </div>
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </h1>
          <p className={`mt-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {language === 'ar'
              ? 'نظام إدارة الحضور الذكي'
              : 'Smart Attendance Management System'
            }
          </p>
        </div>

        {/* Clerk Sign In Component with Password Support */}
        <div className="flex justify-center">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: `${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-xl`,
                headerTitle: `${theme === 'dark' ? 'text-white' : 'text-gray-900'}`,
                headerSubtitle: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`,
                formButtonPrimary: 'bg-[#D4AF37] hover:bg-[#B8941F] text-white font-medium',
                formButtonSecondary: 'border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white',
                formFieldInput: `${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`,
                formFieldLabel: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`,
                identityPreviewText: `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`,
                dividerLine: `${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`,
                dividerText: `${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`,
                footerActionLink: 'text-[#D4AF37] hover:text-[#B8941F] font-medium',
                // Password reset specific styling
                formButtonReset: 'text-[#D4AF37] hover:text-[#B8941F] font-medium underline',
                formFieldAction: 'text-[#D4AF37] hover:text-[#B8941F] text-sm',
                // Strategy selection styling
                alternativeMethodsBlockButton: `${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`,
                // Error handling
                formFieldErrorText: 'text-red-500 text-sm',
                alert: `${theme === 'dark' ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'}`,
              },
              variables: {
                colorPrimary: '#D4AF37',
                colorSuccess: '#10B981',
                colorDanger: '#EF4444',
                colorWarning: '#F59E0B',
                colorNeutral: theme === 'dark' ? '#6B7280' : '#9CA3AF',
                colorBackground: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                colorInputBackground: theme === 'dark' ? '#374151' : '#FFFFFF',
                colorText: theme === 'dark' ? '#F9FAFB' : '#111827',
                colorTextSecondary: theme === 'dark' ? '#D1D5DB' : '#6B7280',
              }
            }}
            // Enable password reset
            showPasswordField={true}
            // Support both authentication methods
            supportEmail={true}
            supportEmailCode={true}
            supportPassword={true}
          />
        </div>

        {/* Authentication Options Info */}
        <div className={`mt-6 p-4 rounded-lg ${
          theme === 'dark'
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200'
        } shadow-md`}>
          <h3 className={`text-sm font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {language === 'ar' ? 'خيارات تسجيل الدخول:' : 'Sign-In Options:'}
          </h3>
          <div className="space-y-2 text-sm">
            <div className={`flex items-center ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full mr-2"></span>
              {language === 'ar' ? 'رمز التحقق عبر البريد الإلكتروني (بدون كلمة مرور)' : 'Email verification code (passwordless)'}
            </div>
            <div className={`flex items-center ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full mr-2"></span>
              {language === 'ar' ? 'البريد الإلكتروني وكلمة المرور (مع استرداد كلمة المرور)' : 'Email & password (with password reset)'}
            </div>
          </div>
        </div>

        {/* Additional Support Info */}
        <div className={`mt-4 p-3 rounded-lg ${
          theme === 'dark'
            ? 'bg-blue-900 border border-blue-700'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start">
            <span className="text-blue-500 mr-2 mt-0.5">ℹ️</span>
            <div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
              }`}>
                {language === 'ar'
                  ? 'للمساعدة الفنية، تواصل مع إدارة تقنية المعلومات بالمدرسة'
                  : 'For technical support, contact school IT administration'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Role Selection Info */}
        <div className={`mt-4 p-4 rounded-lg ${
          theme === 'dark'
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200'
        } shadow-md`}>
          <h3 className={`text-sm font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {language === 'ar' ? 'أنواع الحسابات:' : 'Account Types:'}
          </h3>
          <div className="space-y-2 text-sm">
            <div className={`flex items-center ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full mr-2"></span>
              {language === 'ar' ? 'المعلمون: تتبع الحضور والطلبات' : 'Teachers: Track attendance & requests'}
            </div>
            <div className={`flex items-center ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full mr-2"></span>
              {language === 'ar' ? 'المدراء: إدارة شاملة للنظام' : 'Managers: Full system management'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            © 2025 Genius Smart Education. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClerkSignIn; 