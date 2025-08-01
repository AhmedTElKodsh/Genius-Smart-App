import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const ClerkSignUp: React.FC = () => {
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
            {language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
          </h1>
          <p className={`mt-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {language === 'ar'
              ? 'انضم لنظام إدارة الحضور الذكي'
              : 'Join our Smart Attendance Management System'
            }
          </p>
        </div>

        {/* Clerk Sign Up Component with Password Support */}
        <div className="flex justify-center">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
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
                // Password field styling
                formFieldAction: 'text-[#D4AF37] hover:text-[#B8941F] text-sm',
                // Strategy selection styling
                alternativeMethodsBlockButton: `${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`,
                // Error handling
                formFieldErrorText: 'text-red-500 text-sm',
                alert: `${theme === 'dark' ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'}`,
                // Success states
                alertSuccess: `${theme === 'dark' ? 'bg-green-900 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-700'}`,
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
            // Support both authentication methods
            supportEmail={true}
            supportEmailCode={true}
            supportPassword={true}
          />
        </div>

        {/* Account Creation Notice */}
        <div className={`mt-6 p-4 rounded-lg ${
          theme === 'dark'
            ? 'bg-yellow-900 border border-yellow-700'
            : 'bg-yellow-50 border border-yellow-200'
        } shadow-md`}>
          <div className="flex items-start">
            <span className="text-yellow-500 mr-2 mt-0.5">⚠️</span>
            <div>
              <h3 className={`text-sm font-semibold mb-1 ${
                theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'
              }`}>
                {language === 'ar' ? 'ملاحظة مهمة:' : 'Important Notice:'}
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'
              }`}>
                {language === 'ar'
                  ? 'يتطلب إنشاء الحساب موافقة من الإدارة. ستحصل على إشعار عند تفعيل حسابك.'
                  : 'Account creation requires admin approval. You will be notified when your account is activated.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Authentication Options Info */}
        <div className={`mt-4 p-4 rounded-lg ${
          theme === 'dark'
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200'
        } shadow-md`}>
          <h3 className={`text-sm font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {language === 'ar' ? 'خيارات التسجيل:' : 'Registration Options:'}
          </h3>
          <div className="space-y-2 text-sm">
            <div className={`flex items-center ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full mr-2"></span>
              {language === 'ar' ? 'تحقق فوري من البريد الإلكتروني' : 'Instant email verification'}
            </div>
            <div className={`flex items-center ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full mr-2"></span>
              {language === 'ar' ? 'كلمة مرور قوية (اختياري)' : 'Strong password (optional)'}
            </div>
            <div className={`flex items-center ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <span className="w-2 h-2 bg-[#D4AF37] rounded-full mr-2"></span>
              {language === 'ar' ? 'استرداد كلمة المرور المدمج' : 'Built-in password recovery'}
            </div>
          </div>
        </div>

        {/* Password Requirements Info */}
        <div className={`mt-4 p-3 rounded-lg ${
          theme === 'dark'
            ? 'bg-blue-900 border border-blue-700'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start">
            <span className="text-blue-500 mr-2 mt-0.5">🔒</span>
            <div>
              <h4 className={`text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
              }`}>
                {language === 'ar' ? 'متطلبات كلمة المرور:' : 'Password Requirements:'}
              </h4>
              <ul className={`text-xs space-y-1 ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
              }`}>
                <li>• {language === 'ar' ? '8 أحرف على الأقل' : 'Minimum 8 characters'}</li>
                <li>• {language === 'ar' ? 'أحرف كبيرة وصغيرة' : 'Upper and lowercase letters'}</li>
                <li>• {language === 'ar' ? 'رقم واحد على الأقل' : 'At least one number'}</li>
                <li>• {language === 'ar' ? 'رموز خاصة (اختياري)' : 'Special characters (optional)'}</li>
              </ul>
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

export default ClerkSignUp; 
