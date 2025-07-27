import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

interface LanguageProviderProps {
  children: ReactNode;
}

// English translations
const enTranslations = {
  // Common
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.add': 'Add',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.export': 'Export',
  'common.accept': 'Accept',
  'common.reject': 'Reject',
  'common.close': 'Close',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.all': 'All',
  'common.today': 'Today',
  'common.thisWeek': 'This Week',
  'common.thisMonth': 'This Month',
  'common.delayed': 'Delayed',
  'common.name': 'Name',
  'common.email': 'Email',
  'common.phone': 'Phone',
  'common.address': 'Address',
  'common.subject': 'Subject',
  'common.workType': 'Work Type',
  'common.status': 'Status',
  'common.date': 'Date',
  'common.reason': 'Reason',
  'common.duration': 'Duration',
  'common.type': 'Type',
  'common.days': 'Days',
  'common.hours': 'Hours',
  'common.custom': 'Custom',
  'common.done': 'Done',

  // Date Picker
  'datePicker.selectDateRange': 'Select date range',
  'datePicker.selectEndDate': 'Select end date',
  'datePicker.dayHeaders': ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

  // Navigation/Sidebar
  'nav.dashboard': 'Dashboard',
  'nav.teachers': 'Teachers',
  'nav.requests': 'Requests',
  'nav.settings': 'Settings',
  'nav.logout': 'Log out',
  'nav.addTeacher': 'Add a New Teacher +',

  // Dashboard
  'dashboard.title': 'Dashboard Overview',
  'dashboard.totalTeachers': 'Total Teachers',
  'dashboard.activeTeachers': 'Active Teachers',
  'dashboard.pendingRequests': 'Pending Requests',
  'dashboard.monthlyAttendance': 'Monthly Attendance',
  'dashboard.recentActivity': 'Recent Activity',
  'dashboard.quickStats': 'Quick Statistics',
  'dashboard.overtime': 'Overtime',
  'dashboard.averageTeachersAges': 'Avg. Teachers Ages',
  'dashboard.todayAbsences': 'Today Absences',
  'dashboard.allMissing': 'All Missing',
  'dashboard.authorizedAbsence': 'Authorized Absence',
  'dashboard.unauthorizedNoRequest': 'Unauthorized Absence - No Request',
  'dashboard.unauthorizedRejected': 'Unauthorized Absence - Request Rejected',
  'dashboard.contact': 'Contact',

  // Teachers Page
  'teachers.title': 'Teachers Management',
  'teachers.allTeachers': 'All Teachers',
  'teachers.reports': 'Reports',
  'teachers.searchTeachers': 'Search teachers...',
  'teachers.filterBySubject': 'Filter by Subject',
  'teachers.allSubjects': 'All Subjects',
  'teachers.addTeacher': 'Add New Teacher',
  'teachers.editTeacher': 'Edit Teacher',
  'teachers.teacherDetails': 'Teacher Details',
  'teachers.personalInfo': 'Personal Info',
  'teachers.activity': 'Activity',
  'teachers.workType.fullTime': 'Full-time',
  'teachers.workType.partTime': 'Part-time',
  'teachers.status.active': 'Active',
  'teachers.status.inactive': 'Inactive',
  'teachers.noTeachers': 'No teachers found',
  'teachers.noTeachersDesc': 'No teachers match your current filters.',

  // Teachers Reports
  'reports.teacher': 'Teacher',
  'reports.workType': 'Work Type',
  'reports.attends': 'Attends',
  'reports.allowedAbsence': 'Allowed Absence',
  'reports.unallowedAbsence': 'Unallowed Absence',
  'reports.authorizedAbsence': 'Authorized Absence',
  'reports.unauthorizedAbsence': 'Unauthorized Absence',
  'reports.lateArrival': 'Late Arrival',
  'reports.earlyLeave': 'Early Leave',
  'reports.overtime': 'Overtime',
  'reports.totalHours': 'Total Hours',
  'reports.showing': 'Showing',
  'reports.exportPDF': 'Export PDF',
  'reports.exportExcel': 'Export Excel',
  'reports.dateRange': 'Date Range',
  'reports.from': 'From',
  'reports.to': 'To',

  // Add Teacher Modal
  'addTeacher.title': 'Add a New Teacher',
  'addTeacher.subtitle': 'Add a new teacher to your team and manage operations seamlessly',
  'addTeacher.firstName': 'First Name',
  'addTeacher.lastName': 'Last Name',
  'addTeacher.phone': 'Teacher\'s Phone',
  'addTeacher.email': 'Teacher\'s Email',
  'addTeacher.address': 'Teacher\'s Address',
  'addTeacher.password': 'Teacher\'s Password',
  'addTeacher.dateOfBirth': 'Date of Birth',
  'addTeacher.day': 'Day',
  'addTeacher.month': 'Month',
  'addTeacher.year': 'Year',
  'addTeacher.subject': 'Teacher\'s Subject',
  'addTeacher.selectSubject': 'Select Subject',
  'addTeacher.roleType': 'Work Type',
  'addTeacher.fullTime': 'Full-time',
  'addTeacher.partTime': 'Part-time',
  'addTeacher.employmentDate': 'Employment Date',
  'addTeacher.allowedAbsenceDays': 'Allowed Absence Days',
  'addTeacher.authorities': 'Authorities',
  'addTeacher.selectAuthorities': 'Select Authorities',
  'authorities.none': 'None',
  'authorities.managerPortal': 'Access Manager Portal and inside pages',
  'authorities.addTeachers': 'Add new teachers',
  'authorities.editTeachers': 'Edit Existing Teachers\' info',
  'authorities.manageRequests': 'Accept and Reject Teachers\' Requests',
  'authorities.downloadReports': 'Download Reports',
  'addTeacher.save': 'Save',
  'addTeacher.success': 'Teacher added successfully',
  'addTeacher.error': 'Failed to add teacher',

  // Edit Teacher Modal
  'editTeacher.title': 'Edit Teacher Information',
  'editTeacher.personalInfo': 'Personal Info',
  'editTeacher.activity': 'Activity',
  'editTeacher.password': 'Teacher\'s Password (Leave empty to keep current password)',
  'editTeacher.passwordPlaceholder': 'Enter new password to change',
  'editTeacher.save': 'Edit',
  'editTeacher.success': 'Teacher updated successfully',
  'editTeacher.error': 'Failed to update teacher',

  // Activity Tab
  'activity.title': 'Activity',
  'activity.leaves': 'Leaves',
  'activity.absents': 'Absents',
  'activity.totalHours': 'Total Hours',
  'activity.date': 'Date',
  'activity.attends': 'Attends',
  'activity.checkIn': 'Check In',
  'activity.checkOut': 'Check Out',
  'activity.allowedAbsence': 'Allowed Absence',
  'activity.authorizedAbsence': 'Authorized Absence',
  'activity.totalTime': 'Total time',
  'activity.active': 'Active',
  'activity.absent': 'Absent',
  'activity.yes': 'Yes',
  'activity.no': '--',

  // Requests Page
  'requests.title': 'Requests Management',
  'requests.allRequests': 'All Requests',
  'requests.absenceRequests': 'Absence requests',
  'requests.earlyLeaveRequests': 'Early Leave Requests',
  'requests.lateRequests': 'Late requests',
  'requests.appliedDuration': 'Applied Duration',
  'requests.requestType': 'Request Type',
  'requests.accept': 'Accept',
  'requests.reject': 'Reject',
  'requests.noRequests': 'No {type} requests found',
  'requests.noRequestsDesc': 'There are currently no pending requests to review.',
  'requests.reasonTitle': 'Request Details',
  'requests.reason': 'Reason',

  // Request Types
  'requestTypes.absence': 'Absence',
  'requestTypes.authorizedAbsence': 'Authorized Absence',
  'requestTypes.earlyLeave': 'Early Leave',
  'requestTypes.lateArrival': 'Late Arrival',

  // Settings Page
  'settings.title': 'Settings',
  'settings.general': 'General',
  'settings.notifications': 'Notifications',
  'settings.security': 'Security',
  'settings.language': 'Language',
  'settings.selectLanguage': 'Select Language',
  'settings.english': 'English',
  'settings.arabic': 'العربية',
  'settings.languageNote': 'Change the interface language',

  // General Settings
  'settings.general.title': 'General Information',
  'settings.general.subtitle': 'Manage your account details and preferences',
  'settings.general.profileImage': 'Profile Image',
  'settings.general.uploadImage': 'Upload Image',
  'settings.general.uploadButton': 'Upload Profile Picture',
  'settings.general.firstName': 'First Name',
  'settings.general.firstNamePlaceholder': 'Enter your first name',
  'settings.general.lastName': 'Last Name',
  'settings.general.lastNamePlaceholder': 'Enter your last name',
  'settings.general.email': 'Email Address',
  'settings.general.emailPlaceholder': 'Enter your email address',
  'settings.general.phone': 'Phone Number',
  'settings.general.phonePlaceholder': 'Enter your phone number',
  'settings.general.address': 'Address',
  'settings.general.addressPlaceholder': 'Enter your address',
  'settings.general.dateOfBirth': 'Date of Birth',
  'settings.general.save': 'Save Changes',

  // Notifications Settings
  'settings.notifications.title': 'Notification Preferences',
  'settings.notifications.subtitle': 'Configure your notification preferences',
  'settings.notifications.emailNotifications': 'Email Notifications',
  'settings.notifications.requestNotifications': 'New Request Notifications',
  'settings.notifications.requestDesc': 'Receive email notifications for new teacher requests',
  'settings.notifications.save': 'Save Settings',
  'settings.notifications.allNotifications': 'All Notifications',
  'settings.notifications.earlyArrival': 'Early Arrival',
  'settings.notifications.lateArrival': 'Late Arrival',
  'settings.notifications.earlyLeaves': 'Early Leaves',
  'settings.notifications.lateLeaves': 'Late Leaves',
  'settings.notifications.absentsTeachers': 'Absents Teachers',
  'settings.notifications.dailyReports': 'Daily Reports',
  'settings.notifications.weeklyReports': 'Weekly Reports',
  'settings.notifications.monthlyReports': 'Monthly Reports',
  'settings.notifications.yearlyReports': 'Yearly Reports',
  'settings.notifications.testTitle': 'Test Notifications',
  'settings.notifications.testDesc': 'Send test notifications to verify email delivery:',
  'settings.notifications.testEarlyLeave': 'Test Early Leave',
  'settings.notifications.testAbsence': 'Test Absence',
  'settings.notifications.testLateArrival': 'Test Late Arrival',

  // Security Settings
  'settings.security.title': 'Security Settings',
  'settings.security.changePassword': 'Change Password',
  'settings.security.currentPassword': 'Current Password',
  'settings.security.newPassword': 'New Password',
  'settings.security.confirmPassword': 'Confirm New Password',
  'settings.security.updatePassword': 'Update Password',

  // Authentication
  'auth.signIn': 'Manager Sign In',
  'auth.signInSubtitle': 'Enter your credentials to access the management panel',
  'auth.emailAddress': 'Email Address',
  'auth.password': 'Password',
  'auth.rememberMe': 'Remember me for 30 days',
  'auth.signInButton': 'Sign In',
  'auth.signingIn': 'Signing In...',
  'auth.forgotPassword': 'Forgot your password?',
  'auth.backToRoleSelection': '← Back to Role Selection',
  'auth.invalidCredentials': 'Invalid email or password',
  'auth.loginFailed': 'Login failed. Please check your connection and try again.',

  // Brand
  'brand.title': 'Genius Smart',
  'brand.subtitle': 'Manager Portal',
  'brand.education': 'Genius Smart Education',

  // Validation Messages
  'validation.required': 'This field is required',
  'validation.email': 'Please enter a valid email address',
  'validation.minLength': 'Must be at least {min} characters',
  'validation.passwordMismatch': 'Passwords do not match',

  // Time periods
  'time.today': 'Today',
  'time.thisWeek': 'This Week', 
  'time.thisMonth': 'This Month',
  'time.delayed': 'Delayed',

  // Months
  'months.january': 'January',
  'months.february': 'February',
  'months.march': 'March',
  'months.april': 'April',
  'months.may': 'May',
  'months.june': 'June',
  'months.july': 'July',
  'months.august': 'August',
  'months.september': 'September',
  'months.october': 'October',
  'months.november': 'November',
  'months.december': 'December',

  // Subjects
  'subjects.management': 'Management',
  'subjects.quran': 'Quran',
  'subjects.arabic': 'Arabic',
  'subjects.math': 'Math',
  'subjects.english': 'English',
  'subjects.science': 'Science',
  'subjects.art': 'Art',
  'subjects.programming': 'Programming',
  'subjects.socialStudies': 'Social studies',
  'subjects.fitness': 'Fitness',
  'subjects.scouting': 'Scouting',
  'subjects.nanny': 'Nanny',

  // Teacher Info
  'teacherInfo.employmentDate': 'Employment Date',

  // Authority Management
  'authorities.title': 'Management Authorities',
  'authorities.canAccessPortal': 'Access Manager Portal',
  'authorities.canAddTeachers': 'Add New Teachers',
  'authorities.canEditTeachers': 'Edit Teachers Info',
  'authorities.canManageRequests': 'Accept and Reject Requests',
  'authorities.canDownloadReports': 'Download Reports',
  'authorities.canManageAuthorities': 'Manage Authorities (Admin Only)',
};

// Arabic translations
const arTranslations = {
  // Common
  'common.loading': 'جاري التحميل...',
  'common.error': 'خطأ',
  'common.success': 'نجح',
  'common.cancel': 'إلغاء',
  'common.save': 'حفظ',
  'common.edit': 'تعديل',
  'common.delete': 'حذف',
  'common.add': 'إضافة',
  'common.search': 'بحث',
  'common.filter': 'تصفية',
  'common.export': 'تصدير',
  'common.accept': 'قبول',
  'common.reject': 'رفض',
  'common.close': 'إغلاق',
  'common.back': 'العودة',
  'common.next': 'التالي',
  'common.previous': 'السابق',
  'common.all': 'الكل',
  'common.today': 'اليوم',
  'common.thisWeek': 'هذا الأسبوع',
  'common.thisMonth': 'هذا الشهر',
  'common.delayed': 'متأخر',
  'common.name': 'الاسم',
  'common.email': 'البريد الإلكتروني',
  'common.phone': 'الهاتف',
  'common.address': 'العنوان',
  'common.subject': 'المادة',
  'common.workType': 'نوع العمل',
  'common.status': 'الحالة',
  'common.date': 'التاريخ',
  'common.reason': 'السبب',
  'common.duration': 'المدة',
  'common.type': 'النوع',
  'common.days': 'أيام',
  'common.hours': 'ساعات',
  'common.custom': 'مخصص',
  'common.done': 'تم',

  // Date Picker
  'datePicker.selectDateRange': 'اختر نطاق التاريخ',
  'datePicker.selectEndDate': 'اختر تاريخ النهاية',
  'datePicker.dayHeaders': ['أ', 'إ', 'ث', 'أ', 'خ', 'ج', 'س'],

  // Navigation/Sidebar
  'nav.dashboard': 'لوحة التحكم',
  'nav.teachers': 'المعلمين',
  'nav.requests': 'الطلبات',
  'nav.settings': 'الإعدادات',
  'nav.logout': 'تسجيل الخروج',
  'nav.addTeacher': 'إضافة معلم جديد +',

  // Dashboard
  'dashboard.title': 'نظرة عامة على لوحة التحكم',
  'dashboard.totalTeachers': 'إجمالي المعلمين',
  'dashboard.activeTeachers': 'المعلمين النشطين',
  'dashboard.pendingRequests': 'الطلبات المعلقة',
  'dashboard.monthlyAttendance': 'الحضور الشهري',
  'dashboard.recentActivity': 'النشاط الحديث',
  'dashboard.quickStats': 'إحصائيات سريعة',
  'dashboard.overtime': 'الإضافي',
  'dashboard.averageTeachersAges': 'متوسط أعمار المعلمين',
  'dashboard.todayAbsences': 'غياب اليوم',
  'dashboard.allMissing': 'إجمالي الغياب',
  'dashboard.authorizedAbsence': 'غياب مصرح به',
  'dashboard.unauthorizedNoRequest': 'غياب بدون إذن - بدون طلب',
  'dashboard.unauthorizedRejected': 'غياب بدون إذن - طلب مرفوض',
  'dashboard.contact': 'تواصل',

  // Teachers Page
  'teachers.title': 'إدارة المعلمين',
  'teachers.allTeachers': 'جميع المعلمين',
  'teachers.reports': 'التقارير',
  'teachers.searchTeachers': 'البحث عن المعلمين...',
  'teachers.filterBySubject': 'تصفية حسب المادة',
  'teachers.allSubjects': 'جميع المواد',
  'teachers.addTeacher': 'إضافة معلم جديد',
  'teachers.editTeacher': 'تعديل المعلم',
  'teachers.teacherDetails': 'تفاصيل المعلم',
  'teachers.personalInfo': 'المعلومات الشخصية',
  'teachers.activity': 'النشاط',
  'teachers.workType.fullTime': 'دوام كامل',
  'teachers.workType.partTime': 'دوام جزئي',
  'teachers.status.active': 'نشط',
  'teachers.status.inactive': 'غير نشط',
  'teachers.noTeachers': 'لم يتم العثور على معلمين',
  'teachers.noTeachersDesc': 'لا يوجد معلمين يطابقون التصفية الحالية.',

  // Teachers Reports
  'reports.teacher': 'المعلم',
  'reports.workType': 'نوع العمل',
  'reports.attends': 'الحضور',
  'reports.allowedAbsence': 'الغياب المصرح به',
  'reports.unallowedAbsence': 'غياب بدون إذن',
  'reports.authorizedAbsence': 'الغياب المصرح به',
  'reports.unauthorizedAbsence': 'الغياب غير المصرح به',
  'reports.lateArrival': 'وصول متأخر',
  'reports.earlyLeave': 'المغادرة المبكرة',
  'reports.overtime': 'الساعات الإضافية',
  'reports.totalHours': 'إجمالي ساعات العمل',
  'reports.showing': 'عرض',
  'reports.exportPDF': 'تصدير PDF',
  'reports.exportExcel': 'تصدير Excel',
  'reports.dateRange': 'نطاق التاريخ',
  'reports.from': 'من',
  'reports.to': 'إلى',

  // Add Teacher Modal
  'addTeacher.title': 'إضافة معلم جديد',
  'addTeacher.subtitle': 'أضف معلماً جديداً إلى فريقك وأدر العمليات بسلاسة',
  'addTeacher.firstName': 'الاسم الأول',
  'addTeacher.lastName': 'الاسم الأخير',
  'addTeacher.phone': 'هاتف المعلم',
  'addTeacher.email': 'بريد المعلم الإلكتروني',
  'addTeacher.address': 'عنوان المعلم',
  'addTeacher.password': 'كلمة مرور المعلم',
  'addTeacher.dateOfBirth': 'تاريخ الميلاد',
  'addTeacher.day': 'اليوم',
  'addTeacher.month': 'الشهر',
  'addTeacher.year': 'السنة',
  'addTeacher.subject': 'مادة المعلم',
  'addTeacher.selectSubject': 'اختر المادة',
  'addTeacher.roleType': 'نوع الدوام',
  'addTeacher.fullTime': 'دوام كامل',
  'addTeacher.partTime': 'دوام جزئي',
  'addTeacher.employmentDate': 'تاريخ التعيين',
  'addTeacher.allowedAbsenceDays': 'أيام الاجازة المتاحة',
  'addTeacher.authorities': 'الصلاحيات',
  'addTeacher.selectAuthorities': 'اختر الصلاحيات',
  'authorities.none': 'لا توجد صلاحيات',
  'authorities.managerPortal': 'الوصول إلى بوابة المدير والصفحات الداخلية',
  'authorities.addTeachers': 'إضافة معلمين جدد',
  'authorities.editTeachers': 'تعديل معلومات المعلمين الحاليين',
  'authorities.manageRequests': 'قبول ورفض طلبات المعلمين',
  'authorities.downloadReports': 'تحميل التقارير',
  'addTeacher.save': 'حفظ',
  'addTeacher.success': 'تم إضافة المعلم بنجاح',
  'addTeacher.error': 'فشل في إضافة المعلم',

  // Edit Teacher Modal
  'editTeacher.title': 'تعديل معلومات المعلم',
  'editTeacher.personalInfo': 'المعلومات الشخصية',
  'editTeacher.activity': 'النشاط',
  'editTeacher.password': 'كلمة مرور المعلم (اتركها فارغة للاحتفاظ بكلمة المرور الحالية)',
  'editTeacher.passwordPlaceholder': 'أدخل كلمة مرور جديدة للتغيير',
  'editTeacher.save': 'تعديل',
  'editTeacher.success': 'تم تحديث المعلم بنجاح',
  'editTeacher.error': 'فشل في تحديث المعلم',

  // Activity Tab
  'activity.title': 'النشاط',
  'activity.leaves': 'الإجازات',
  'activity.absents': 'الغياب',
  'activity.totalHours': 'إجمالي ساعات العمل',
  'activity.date': 'التاريخ',
  'activity.attends': 'الحضور',
  'activity.checkIn': 'تسجيل الدخول',
  'activity.checkOut': 'تسجيل الخروج',
  'activity.allowedAbsence': 'الغياب المصرح به',
  'activity.authorizedAbsence': 'الغياب المصرح به',
  'activity.totalTime': 'إجمالي الوقت',
  'activity.active': 'نشط',
  'activity.absent': 'غائب',
  'activity.yes': 'نعم',
  'activity.no': '--',

  // Requests Page
  'requests.title': 'إدارة الطلبات',
  'requests.allRequests': 'جميع الطلبات',
  'requests.absenceRequests': 'طلبات الغياب',
  'requests.earlyLeaveRequests': 'طلبات إنصراف مبكر',
  'requests.lateRequests': 'طلبات وصول متأخر',
  'requests.appliedDuration': 'المدة المطلوبة',
  'requests.requestType': 'نوع الطلب',
  'requests.accept': 'قبول',
  'requests.reject': 'رفض',
  'requests.noRequests': 'لم يتم العثور على طلبات {type}',
  'requests.noRequestsDesc': 'لا توجد حالياً طلبات معلقة للمراجعة.',
  'requests.reasonTitle': 'تفاصيل الطلب',
  'requests.reason': 'السبب',

  // Request Types
  'requestTypes.absence': 'غياب',
  'requestTypes.authorizedAbsence': 'غياب مصرح به',
  'requestTypes.earlyLeave': 'مغادرة مبكرة',
  'requestTypes.lateArrival': 'وصول متأخر',

  // Settings Page
  'settings.title': 'الإعدادات',
  'settings.general': 'عام',
  'settings.notifications': 'الإشعارات',
  'settings.security': 'الأمان',
  'settings.language': 'اللغة',
  'settings.selectLanguage': 'اختر اللغة',
  'settings.english': 'English',
  'settings.arabic': 'العربية',
  'settings.languageNote': 'تغيير لغة الواجهة',

  // General Settings
  'settings.general.title': 'المعلومات العامة',
  'settings.general.subtitle': 'إدارة تفاصيل حسابك وتفضيلاتك',
  'settings.general.profileImage': 'صورة الملف الشخصي',
  'settings.general.uploadImage': 'رفع صورة',
  'settings.general.uploadButton': 'رفع صورة الملف الشخصي',
  'settings.general.firstName': 'الاسم الأول',
  'settings.general.firstNamePlaceholder': 'أدخل الاسم الأول',
  'settings.general.lastName': 'الاسم الأخير',
  'settings.general.lastNamePlaceholder': 'أدخل الاسم الأخير',
  'settings.general.email': 'عنوان البريد الإلكتروني',
  'settings.general.emailPlaceholder': 'أدخل عنوان البريد الإلكتروني',
  'settings.general.phone': 'رقم الهاتف',
  'settings.general.phonePlaceholder': 'أدخل رقم الهاتف',
  'settings.general.address': 'العنوان',
  'settings.general.addressPlaceholder': 'أدخل العنوان',
  'settings.general.dateOfBirth': 'تاريخ الميلاد',
  'settings.general.save': 'حفظ التغييرات',

  // Notifications Settings
  'settings.notifications.title': 'تفضيلات الإشعارات',
  'settings.notifications.subtitle': 'تكوين تفضيلات الإشعارات الخاصة بك',
  'settings.notifications.emailNotifications': 'إشعارات البريد الإلكتروني',
  'settings.notifications.requestNotifications': 'إشعارات الطلبات الجديدة',
  'settings.notifications.requestDesc': 'تلقي إشعارات بريد إلكتروني للطلبات الجديدة من المعلمين',
  'settings.notifications.save': 'حفظ الإعدادات',
  'settings.notifications.allNotifications': 'جميع الإشعارات',
  'settings.notifications.earlyArrival': 'الوصول المبكر',
  'settings.notifications.lateArrival': 'وصول متأخر',
  'settings.notifications.earlyLeaves': 'المغادرة المبكرة',
  'settings.notifications.lateLeaves': 'المغادرة المتأخرة',
  'settings.notifications.absentsTeachers': 'المعلمين الغائبين',
  'settings.notifications.dailyReports': 'التقارير اليومية',
  'settings.notifications.weeklyReports': 'التقارير الأسبوعية',
  'settings.notifications.monthlyReports': 'التقارير الشهرية',
  'settings.notifications.yearlyReports': 'التقارير السنوية',
  'settings.notifications.testTitle': 'اختبار الإشعارات',
  'settings.notifications.testDesc': 'إرسال إشعارات تجريبية للتحقق من تسليم البريد الإلكتروني:',
  'settings.notifications.testEarlyLeave': 'اختبار المغادرة المبكرة',
  'settings.notifications.testAbsence': 'اختبار الغياب',
  'settings.notifications.testLateArrival': 'اختبار وصول متأخر',

  // Security Settings
  'settings.security.title': 'إعدادات الأمان',
  'settings.security.changePassword': 'تغيير كلمة المرور',
  'settings.security.currentPassword': 'كلمة المرور الحالية',
  'settings.security.newPassword': 'كلمة المرور الجديدة',
  'settings.security.confirmPassword': 'تأكيد كلمة المرور الجديدة',
  'settings.security.updatePassword': 'تحديث كلمة المرور',

  // Authentication
  'auth.signIn': 'تسجيل دخول المدير',
  'auth.signInSubtitle': 'أدخل بياناتك للوصول إلى لوحة الإدارة',
  'auth.emailAddress': 'عنوان البريد الإلكتروني',
  'auth.password': 'كلمة المرور',
  'auth.rememberMe': 'تذكرني لمدة 30 يوماً',
  'auth.signInButton': 'تسجيل الدخول',
  'auth.signingIn': 'جاري تسجيل الدخول...',
  'auth.forgotPassword': 'نسيت كلمة المرور؟',
  'auth.backToRoleSelection': '← العودة إلى اختيار الدور',
  'auth.invalidCredentials': 'بريد إلكتروني أو كلمة مرور غير صحيحة',
  'auth.loginFailed': 'فشل تسجيل الدخول. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',

  // Brand
  'brand.title': 'جينيوس سمارت',
  'brand.subtitle': 'بوابة المدير',
  'brand.education': 'جينيوس سمارت للتعليم',

  // Validation Messages
  'validation.required': 'هذا الحقل مطلوب',
  'validation.email': 'يرجى إدخال عنوان بريد إلكتروني صحيح',
  'validation.minLength': 'يجب أن يكون على الأقل {min} أحرف',
  'validation.passwordMismatch': 'كلمات المرور غير متطابقة',

  // Time periods
  'time.today': 'اليوم',
  'time.thisWeek': 'هذا الأسبوع',
  'time.thisMonth': 'هذا الشهر',
  'time.delayed': 'متأخر',

  // Months
  'months.january': 'يناير',
  'months.february': 'فبراير',
  'months.march': 'مارس',
  'months.april': 'أبريل',
  'months.may': 'مايو',
  'months.june': 'يونيو',
  'months.july': 'يوليو',
  'months.august': 'أغسطس',
  'months.september': 'سبتمبر',
  'months.october': 'أكتوبر',
  'months.november': 'نوفمبر',
  'months.december': 'ديسمبر',

  // Subjects
  'subjects.management': 'الإدارة',
  'subjects.quran': 'القرآن',
  'subjects.arabic': 'اللغة العربية',
  'subjects.math': 'الرياضيات',
  'subjects.english': 'اللغة الإنجليزية',
  'subjects.science': 'العلوم',
  'subjects.art': 'الفنون',
  'subjects.programming': 'البرمجة',
  'subjects.socialStudies': 'الدراسات الاجتماعية',
  'subjects.fitness': 'التربية الرياضية',
  'subjects.scouting': 'البحث العلمي',
  'subjects.nanny': 'الدادات',

  // Teacher Info
  'teacherInfo.employmentDate': 'تاريخ التعيين',

  // Authority Management
  'authorities.title': 'صلاحيات المدير',
  'authorities.canAccessPortal': 'الوصول إلى بوابة المدير',
  'authorities.canAddTeachers': 'إضافة مدرسين جدد',
  'authorities.canEditTeachers': 'تعديل معلومات المدرسين',
  'authorities.canManageRequests': 'قبول ورفض الطلبات',
  'authorities.canDownloadReports': 'تحميل التقارير',
  'authorities.canManageAuthorities': 'إدارة الصلاحيات (للمدير فقط)',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Get language from localStorage or default to Arabic
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('managerLanguage') as Language;
    return savedLanguage || 'ar';
  });

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('managerLanguage', language);
    
    // Update document direction and language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Update CSS custom properties for text alignment
    document.documentElement.style.setProperty(
      '--text-align-start', 
      language === 'ar' ? 'right' : 'left'
    );
    document.documentElement.style.setProperty(
      '--text-align-end', 
      language === 'ar' ? 'left' : 'right'
    );
  }, [language]);

  const translations = language === 'ar' ? arTranslations : enTranslations;

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[key as keyof typeof translations] || key;
    
    // Handle parameter substitution
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return translation;
  };

  const isRTL = language === 'ar';

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext; 