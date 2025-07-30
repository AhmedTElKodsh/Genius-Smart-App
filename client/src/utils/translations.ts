export const translations = {
  en: {
    // Requests
    requests: {
      allRequests: 'All Requests',
      absenceRequests: 'Absence Requests',
      earlyLeaveRequests: 'Early Leave Requests',
      lateRequests: 'Late Requests',
      auditTrail: 'Audit Trail',
      noRequests: 'No Requests',
      noRequestsDesc: 'No pending requests at the moment',
      LateArrival: 'Late Arrival',
      EarlyLeave: 'Early Leave',
      Absence: 'Absence'
    },

    // Audit Trail
    audit: {
      requestAuditTrail: 'Request Audit Trail',
      adminOnly: 'Only administrators can view the audit trail',
      totalActions: 'Total Actions',
      approvals: 'Approvals',
      rejections: 'Rejections',
      activeManagers: 'Active Managers',
      actionType: 'Action Type',
      allActions: 'All Actions',
      approved: 'Approved',
      rejected: 'Rejected',
      performedBy: 'Performed By',
      allManagers: 'All Managers',
      startDate: 'Start Date',
      endDate: 'End Date',
      applyFilters: 'Apply Filters',
      noAudits: 'No audit entries found',
      timestamp: 'Timestamp',
      action: 'Action',
      teacher: 'Teacher',
      requestType: 'Request Type',
      role: 'Role',
      reason: 'Reason'
    },

    // Header
      requestAuditTrail: 'Request Audit Trail',
      adminOnly: 'Only administrators can view the audit trail',
      totalActions: 'Total Actions',
      approvals: 'Approvals',
      rejections: 'Rejections',
      activeManagers: 'Active Managers',
      actionType: 'Action Type',
      allActions: 'All Actions',
      approved: 'Approved',
      rejected: 'Rejected',
      performedBy: 'Performed By',
      allManagers: 'All Managers',
      startDate: 'Start Date',
      endDate: 'End Date',
      applyFilters: 'Apply Filters',
      noAudits: 'No audit entries found',
      timestamp: 'Timestamp',
      action: 'Action',
      teacher: 'Teacher',
      requestType: 'Request Type',
      role: 'Role',
      reason: 'Reason'
    },
    // Header
    greeting: (name: string) => `Hey, ${name}`,
    subtitle: "Mark your attendance!",
    
    // Work Time Section
    workTime: "Work Time",
    sendRequest: "Send Request",
    morningTime: "08:00 AM",
    motivationText: "Check in and get started on your successful day",
    
    // Summary Section
    summary: "Summary",
    summaryTitle: "Summary",
      allowedAbsence: "Allowed Absence",
  unallowedAbsence: "Unallowed Absence",
    authorizedAbsence: "Authorized Absence",
    unauthorizedAbsence: "Unauthorized Absence",
    overtime: "Overtime",
    employmentDate: "Employment Date",
    days: "Days",
    
    // Dashboard
    dashboard: {
      todayCheckIns: "Today's Check-ins",
      totalCheckedIn: "Total Checked In",
      stillWorking: "Still Working",
      completedDay: "Completed Day",
      noCheckInsToday: "No check-ins today",
      stillIn: "Still in",
      checkedOut: "Checked out",
      working: "Working",
      
      todayAcceptedRequests: "Today's Accepted Requests",
      noAcceptedRequestsToday: "No accepted requests today",
      
      missingTeachers: "Missing Teachers",
      excellentAttendance: "Excellent Attendance!",
      allTeachersAccountedFor: "All teachers are accounted for today",
      highAbsenceAlert: "High absence alert",
      moderateAbsenceAlert: "Moderate absence concern",
      minimalAbsenceAlert: "Minimal absence noted",
      teachers: "teachers",
      totalMissing: "Total Missing",
      noExcuse: "No Excuse",
      rejectedRequests: "Rejected Requests",
      rejected: "Rejected",
      unexcused: "Unexcused",
      call: "Call",
      
      immediateRequests: "Immediate Requests",
      allClear: "All Clear",
      noImmediateRequests: "No immediate requests",
      upcomingDaysClear: "Upcoming days are clear",
      urgent: "urgent",
      tomorrow: "Tomorrow",
      dayAfterTomorrow: "Day After Tomorrow",
      request: "request",
      requests: "requests",
      approve: "Approve",
      reject: "Reject",
      justNow: "just now",
      ago: "ago"
    },
    
    // Filter Options
    thisWeek: "This week",
    thisMonth: "This month",
    lastWeek: "Last week",
    lastMonth: "Last month",
    custom: "Custom",
    selectFilter: "Select",
    
    // Calendar
    monthNames: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ],
    dayHeaders: ["S", "M", "T", "W", "T", "F", "S"],
    done: "Done",
    
    // Navigation
    home: "Home",
    history: "History",
    notifications: "Notifications",
    profile: "Profile",
    

    
    // Day names
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],


    
    // Date format
    formatDate: (date: Date) => date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      weekday: 'long'
    }),
    
    // Location Detection
    locationDetection: "Location Detection",
    checkingLocation: "Checking your location...",
    locationVerified: "Location is verified",
    locationDenied: "Location access denied",
    locationOutOfRange: "You are outside the school area",
    enableLocation: "Please enable location services",
    locationError: "Unable to get your location",
    recentlyViewed: "Recently viewed",
    
    // Timer Controls
    takeABreak: "Take a Break",
    resume: "Resume",
    checkOut: "Check Out",
    checkIn: "Check In",
    checkOutConfirmation: "Are you sure you want to check out for today?",
    earlyCheckoutWarning: "You have worked less than 8 hours today. Are you sure you want to check out early?",
    yes: "Yes",
    no: "No",
    late: "Late",
    
    // Time Periods
    periods: {
      today: "Today",
      week: "This Week",
      month: "This Month",
      quarter: "This Quarter",
      year: "This Year"
    },
    
    // Request Types
    earlyLeave: "Early Leave",
    lateArrival: "Late Arrival",
    sickLeave: "Sick Leave",
    personal: "Personal",
    travel: "Travel",
    other: "Other",

    oneDay: "One Day",
    multipleDays: "Multiple Days",
    fromDate: "From Date",
    toDate: "To Date",
    date: "Date",
    reasonOptional: "Reason (optional)",
    reason: "Reason",
    submitRequest: "Submit Request",
    requestSubmitted: "Request submitted successfully!",
    requestSubmittedMessage: "Your request has been sent to the manager for review.",
    ok: "OK",
    requestError: "Failed to submit request. Please try again.",
    dateValidationWarning: "Requests must be submitted at least 2 working days in advance. For urgent requests, please contact the manager directly.",
    absenceAdvanceNotice: "Absence requests must be submitted at least 24 hours in advance.",
    sameDayAllowed: "Late Arrival and Early Leave requests can be submitted on the same day.",

    // Employment validation errors
    employmentValidation: {
      notEligibleYet: "Permitted absences are not available until you complete 3 months of employment",
      exceededMonthlyLimit9: "You will exceed your monthly limit of 9 permitted absence days",
      exceededMonthlyLimit12: "You will exceed your monthly limit of 12 permitted absence days", 
      usedAllDays9: "You have already used all your 9 permitted absence days for this month",
      usedAllDays12: "You have already used all your 12 permitted absence days for this month"
    },
    
    // History Page
    myHistory: "My History",
    viewAll: "View All",

    select: "Select",
    
    // Day abbreviations
    dayAbbreviations: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    

                 
    // Review text
    reviewAttendance: "Review your attendance!",

    // Time format
    timeFormat: {
      am: "AM",
      pm: "PM"
    },

    // Teachers section
    'teachers.allTeachers': 'All Teachers',
    'teachers.reports': 'Reports',
    'teachers.analytics': 'Analytics',
    'teachers.noTeachers': 'No Teachers Found',
    'teachers.noTeachersDesc': 'No teachers match your current filters',
    'teachers.allSubjects': 'All Subjects',
    'teachers.subjectFilter': 'Subject Filter',
    'teachers.searchTeachers': 'Search teachers...',
    
    // Analytics KPIs
    'analytics.totalTeachers': 'Total Teachers',
    'analytics.attendanceRate': 'Attendance Rate',
    'analytics.topPerformers': 'Top Performers',
    'analytics.atRisk': 'At Risk',
    'analytics.departments': 'Departments',
    
    // Analytics Charts
    'analytics.performanceDistribution': 'Performance Distribution',
    'analytics.departmentPerformance': 'Department Performance',
    'analytics.weeklyAttendancePatterns': 'Weekly Attendance Patterns',
    'analytics.teacherPerformanceRanking': 'Teacher Performance Ranking',
    'analytics.attendanceCommitmentLevel': 'Attendance Commitment Level',
    'analytics.selectDateRange': 'Select Date Range',
    'analytics.absenceComparison': 'Absence Comparison',
    'analytics.earlyLeavesComparison': 'Early Leaves Comparison',
    'analytics.lateArrivalComparison': 'Late Arrival Comparison',
    'analytics.departmentComparisons': 'Department Comparisons',
    'analytics.departmentRequests': 'Department Requests',
    'analytics.absenceRequests': 'Absence Requests',
    'analytics.earlyLeaveRequests': 'Early Leave Requests',
    'analytics.lateArrivalRequests': 'Late Arrival Requests',
    'analytics.teachersPerformanceComparison': 'Teachers Performance Comparison',
    'analytics.departmentPerformanceTracking': 'Department Performance Tracking',
    
    // Analytics Chart Descriptions
    'analytics.attendanceCommitmentDesc': 'Shows the distribution of teachers by their attendance commitment levels',
    'analytics.departmentPerformanceDesc': 'Compare performance metrics across different departments',
    'analytics.weeklyAttendancePatternsDesc': 'Analyze attendance patterns throughout the week',
    'analytics.absenceComparisonDesc': 'Compare absence rates across different departments',
    'analytics.earlyLeavesComparisonDesc': 'Compare early leave requests across departments',
    'analytics.lateArrivalComparisonDesc': 'Compare late arrival incidents across departments',
    'analytics.departmentComparisonsDesc': 'Compare department performance metrics including absence, early leave, and late arrival rates',
    'analytics.departmentRequestsDesc': 'Analyze request patterns across different departments including approval and rejection rates',
    'analytics.absenceRequestsDesc': 'Track absence request submissions, approvals, and rejections by department',
    'analytics.earlyLeaveRequestsDesc': 'Monitor early leave request patterns and approval rates across departments',
    'analytics.lateArrivalRequestsDesc': 'Analyze late arrival request trends and management decisions by department',
    'analytics.teachersPerformanceComparisonDesc': 'Compare individual teacher performance metrics and attendance patterns',
    'analytics.departmentPerformanceTrackingDesc': 'Track long-term performance trends and improvements across all departments',
    
    // Analytics Table Headers
    'analytics.teacher': 'Teacher',
    'analytics.department': 'Department',
    'analytics.attendanceRateCol': 'Attendance Rate',
    'analytics.punctuality': 'Punctuality',
    'analytics.performance': 'Performance',
    
    // Analytics Chart Labels
    'analytics.attendance': 'Attendance',
    'analytics.punctualityChart': 'Punctuality',
    'analytics.absence': 'Absence',
    'analytics.earlyLeave': 'Early Leave',
    'analytics.lateArrival': 'Late Arrival',
    
    // Comparison Labels
    'comparison.comparePeriods': 'Compare Periods',
    'comparison.hideComparison': 'Hide Comparison',
    'comparison.compare': 'Compare',
    'comparison.compareWith': 'Compare with:',
    'comparison.vs': 'vs',
    'comparison.current': 'Current:',
    
    // Teacher Reports
    'reports.teacher': "Teacher",
    'reports.workType': "Work Type",
    'reports.attends': "Attends",
    'reports.authorizedAbsence': "Authorized Absence",
    'reports.unauthorizedAbsence': "Unauthorized Absence",
    'reports.earlyLeave': "Early Leave",
    'reports.lateArrival': "Late Arrival",
    'reports.overtime': "Overtime",
    'reports.totalHours': "Total Hours",
    'reports.exportPDF': "Export PDF",
    'reports.exportExcel': "Export Excel",
    'reports.dateRange': "Date Range",
    'reports.from': "From",
    'reports.to': "To",
    'reports.showing': "Showing",

    // Performance
    'performance.excellent': 'Excellent',
    'performance.good': 'Good',
    'performance.average': 'Average',
    'performance.poor': 'Poor',

    // Common
    'common.hours': 'Hours',
    'Page': 'Page',
    
    // Common date range options
    'common.today': 'Today',
    'common.thisWeek': 'This Week',
    'common.thisMonth': 'This Month',
    'common.thisQuarter': 'This Quarter',
    'common.thisYear': 'This Year',
    'common.custom': 'Custom',
    'common.done': 'Done',
    
    // Date Picker
    'datePicker.selectEndDate': 'Select End Date',
    'datePicker.selectDateRange': 'Select Date Range',
    
    // Form Labels
    'form.employmentDate': 'Employment Date *',
    'form.allowedAbsenceDays': 'Allowed Absence Days',

    // Subjects
    subjects: {
      subjects: "Subjects",
      subject: "Subject",
      management: "Management",
      quran: "Quran",
      arabic: "Arabic",
      math: "Mathematics",
      english: "English",
      science: "Science",
      art: "Art",
      programming: "Programming",
      socialStudies: "Social Studies",
      fitness: "Fitness",
      scouting: "Scouting",
      nanny: "Nanny"
    },

    // Teacher Information
    teacherInfo: {
      teacherTitle: "Teacher",
      employmentDate: "Employment Date",
      subjects: {
        Math: "Math",
        Science: "Science", 
        English: "English",
        Arabic: "Arabic",
        History: "History",
        Geography: "Geography",
        Physics: "Physics",
        Chemistry: "Chemistry",
        Biology: "Biology",
        Management: "Management",
        "Computer Science": "Computer Science",
        "Physical Education": "Physical Education",
        Art: "Art",
        Music: "Music",
        Quran: "Quran",
        Programming: "Programming",
        "Social studies": "Social Studies",
        Fitness: "Fitness",
        Scouting: "Scouting",
        Nanny: "Nanny"
      },
      workTypes: {
        "Full-time": "Full-time",
        "Part-time": "Part-time",
        Contract: "Contract"
      }
    },

    // Settings
    settings: {
      personalInfoTab: "Personal Info",
      generalTab: "General",
      securityTab: "Security",
      notificationsTab: "Notifications",
      holidaysTab: "Holidays",
      language: "Language",
      english: "English",
      arabic: "العربية",
      languageNote: "Changes will take effect immediately",
      
      personalInfo: {
        title: "Personal Information",
        subtitle: "Manage your personal details and profile information",
        uploadButton: "Upload Profile Picture",
        firstName: "First Name",
        firstNamePlaceholder: "Enter your first name",
        lastName: "Last Name", 
        lastNamePlaceholder: "Enter your last name",
        email: "Email Address",
        emailPlaceholder: "Enter your email address",
        phone: "Phone Number",
        phonePlaceholder: "Enter your phone number",
        address: "Address",
        addressPlaceholder: "Enter your address",
        dateOfBirth: "Date of Birth",
        save: "Save Changes"
      },

      general: {
        title: "General Settings",
        subtitle: "Configure work schedules, weekends, and system preferences",
        weekendDays: "Weekend Days",
        weekendDaysSubtitle: "Select which days are considered weekends (non-working days)",
        nationalHolidays: "National Holidays",
        nationalHolidaysSubtitle: "Select dates that are national holidays for the current year",
        selectWeekendDays: "Select Weekend Days",
        selectedHolidays: "Selected Holidays",
        selectedHolidaysSubtitle: "Review and manage your selected holiday dates",
        removeHoliday: "Remove Holiday",
        clearAllHolidays: "Clear All",
        holidayCount: (count: number) => `${count} holiday${count !== 1 ? 's' : ''} selected`,
        save: "Save Settings",
        saveSuccess: (weekendCount: number, holidayCount: number) => {
          const weekendDays = weekendCount > 0 ? `${weekendCount} weekend day${weekendCount !== 1 ? 's' : ''}` : 'No weekend days';
          const holidays = holidayCount > 0 ? `${holidayCount} holiday${holidayCount !== 1 ? 's' : ''}` : 'no holidays';
          return `✅ Successfully saved! ${weekendDays} configured and ${holidays} selected for the year.`;
        }
      },

      security: {
        title: "Change Password",
        subtitle: "Update your account password for enhanced security",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmPassword: "Confirm Password"
      },

      notifications: {
        title: "Notification Preferences",
        subtitle: "Choose which notifications you'd like to receive",
        allNotifications: "All Notifications",
        earlyArrival: "Early Arrival Notifications",
        lateArrival: "Late Arrival Notifications", 
        earlyLeaves: "Early Leave Notifications",
        lateLeaves: "Late Leave Notifications",
        absentsTeachers: "Absent Teachers Notifications",
        dailyReports: "Daily Reports",
        weeklyReports: "Weekly Reports",
        monthlyReports: "Monthly Reports",
        yearlyReports: "Yearly Reports",
        testTitle: "Test Notifications",
        testDesc: "Send test notifications to verify your settings",
        testEarlyLeave: "Test Early Leave",
        testAbsence: "Test Absence", 
        testLateArrival: "Test Late Arrival"
      },

      holidays: {
        title: "Holiday Management",
        subtitle: "Manage school holidays and special dates",
        upcomingHolidays: "Upcoming Holidays",
        addHoliday: "Add Holiday",
        editHoliday: "Edit",
        deleteHoliday: "Delete",
        confirmDelete: "Are you sure you want to delete this holiday?",
        noHolidays: "No holidays scheduled",
        addFirst: "Add your first holiday to get started",
        holidayName: "Holiday Name (English)",
        holidayNamePlaceholder: "Enter holiday name in English",
        holidayNameAr: "Holiday Name (Arabic)",
        holidayNameArPlaceholder: "Enter holiday name in Arabic",
        holidayDate: "Holiday Date",
        description: "Description",
        descriptionPlaceholder: "Enter description",
        isRecurring: "Recurring Holiday",
        recurringNote: "Recurring annually",
        cancel: "Cancel",
        save: "Save Holiday"
      }
    },

    // Common
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      confirm: "Confirm",
      back: "Back"
    }
  },
  
  ar: {
    // Requests
    requests: {
      allRequests: 'جميع الطلبات',
      absenceRequests: 'طلبات الغياب',
      earlyLeaveRequests: 'طلبات المغادرة المبكرة',
      lateRequests: 'طلبات التأخير',
      auditTrail: 'سجل التدقيق',
      noRequests: 'لا توجد طلبات',
      noRequestsDesc: 'لا توجد طلبات معلقة في الوقت الحالي',
      LateArrival: 'وصول متأخر',
      EarlyLeave: 'مغادرة مبكرة',
      Absence: 'غياب'
    },

    // Audit Trail
    audit: {
      requestAuditTrail: 'سجل تدقيق الطلبات',
      adminOnly: 'يمكن للمسؤولين فقط عرض سجل التدقيق',
      totalActions: 'إجمالي الإجراءات',
      approvals: 'الموافقات',
      rejections: 'الرفض',
      activeManagers: 'المديرون النشطون',
      actionType: 'نوع الإجراء',
      allActions: 'جميع الإجراءات',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      performedBy: 'تم بواسطة',
      allManagers: 'جميع المديرين',
      startDate: 'تاريخ البداية',
      endDate: 'تاريخ النهاية',
      applyFilters: 'تطبيق المرشحات',
      noAudits: 'لم يتم العثور على إدخالات تدقيق',
      timestamp: 'الطابع الزمني',
      action: 'الإجراء',
      teacher: 'المعلم',
      requestType: 'نوع الطلب',
      role: 'الدور',
      reason: 'السبب'
    },
    // Header
    greeting: (name: string) => `مرحباً، أستاذ ${name}`,
    subtitle: "قم بتسجيل حضورك الآن!",
    
    // Work Time Section
    workTime: "وقت العمل",
    sendRequest: "إرسال طلب",
    morningTime: "08:00 صباحاً",
    motivationText: "ابدأ يومك الناجح من خلال تسجيل الحضور",
    
    // Summary Section
    summary: "الملخص",
    summaryTitle: "الملخص",
      allowedAbsence: "الغياب المصرح به",
  unallowedAbsence: "غياب بدون إذن",
    authorizedAbsence: "غياب مصرح به",
    unauthorizedAbsence: "غياب بدون إذن",
    overtime: "العمل الإضافي",

    employmentDate: "تاريخ التعيين",
    days: "أيام",
    
    // Dashboard
    dashboard: {
      todayCheckIns: "تسجيل حضور اليوم",
      totalCheckedIn: "إجمالي الحاضرين",
      stillWorking: "لا يزالون يعملون",
      completedDay: "أنهوا اليوم",
      noCheckInsToday: "لا يوجد تسجيل حضور اليوم",
      stillIn: "لا يزال بالداخل",
      checkedOut: "سجل الانصراف",
      working: "يعمل",
      
      todayAcceptedRequests: "الطلبات المقبولة اليوم",
      noAcceptedRequestsToday: "لا توجد طلبات مقبولة اليوم",
      
      missingTeachers: "المعلمون المتغيبين",
      excellentAttendance: "حضور ممتاز!",
      allTeachersAccountedFor: "جميع المعلمين متواجدون اليوم",
      highAbsenceAlert: "تنبيه غياب مرتفع",
      moderateAbsenceAlert: "قلق غياب متوسط",
      minimalAbsenceAlert: "غياب قليل ملاحظ",
      teachers: "معلمون",
      totalMissing: "إجمالي المتغيبين",
      noExcuse: "بدون عذر",
      rejectedRequests: "طلبات مرفوضة",
      rejected: "مرفوض",
      unexcused: "غير مبرر",
      call: "اتصال",
      
      immediateRequests: "الطلبات العاجلة",
      allClear: "الوضع سليم",
      noImmediateRequests: "لا توجد طلبات عاجلة",
      upcomingDaysClear: "الأيام القادمة خالية",
      urgent: "عاجل",
      tomorrow: "غداً",
      dayAfterTomorrow: "بعد غد",
      request: "طلب",
      requests: "طلبات",
      approve: "موافقة",
      reject: "رفض",
      justNow: "الآن",
      ago: "منذ"
    },
    
    // Filter Options
    thisWeek: "الأسبوع الحالي",
    thisMonth: "الشهر الحالي",
    lastWeek: "الأسبوع الماضي",
    lastMonth: "الشهر الماضي",
    custom: "تحديد مخصص",
    selectFilter: "اختيار",
    
    // Calendar
    monthNames: [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ],
    dayHeaders: ["أ", "ن", "ث", "ر", "خ", "ج", "س"],
    done: "تم",
    
    // Navigation
    home: "الرئيسية",
    history: "السجل",
    notifications: "الإشعارات",
    profile: "الملف الشخصي",
    

    
    // Day names
    dayNames: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],


    
    // Date format
    formatDate: (date: Date) => {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      };
      return date.toLocaleDateString('ar-EG', options);
    },
    
    // Location Detection
    locationDetection: "كشف الموقع",
    checkingLocation: "جاري التحقق من موقعك...",
    locationVerified: "تم التحقق من الموقع",
    locationDenied: "تم رفض الوصول للموقع",
    locationOutOfRange: "أنت خارج منطقة المدرسة",
    enableLocation: "يرجى تفعيل خدمات الموقع",
    locationError: "لا يمكن الحصول على موقعك",
    recentlyViewed: "تم عرضه مؤخراً",
    
    // Timer Controls
    takeABreak: "استرح لفترة",
    resume: "أكمل العمل",
    checkOut: "تسجيل الخروج",
    checkIn: "تسجيل الحضور",
    checkOutConfirmation: "هل أنت متأكد أنك تريد إنهاء اليوم؟",
    earlyCheckoutWarning: "لقد عملت أقل من 8 ساعات اليوم. هل أنت متأكد من أنك تريد الخروج مبكراً؟",
    yes: "نعم",
    no: "لا",
    late: "التأخير",
    
    // Request Types
    earlyLeave: "إذن انصراف مبكر",
    lateArrival: "وصول متأخر", 
    sickLeave: "غياب مرضي",
    personal: "غياب شخصي",
    travel: "غياب سفر",
    other: "غياب آخر",

    oneDay: "يوم واحد",
    multipleDays: "عدة أيام",
    fromDate: "من تاريخ",
    toDate: "إلى تاريخ",
    date: "التاريخ",
    reasonOptional: "السبب (اختياري)",
    reason: "السبب",
    submitRequest: "إرسال الطلب",
    requestSubmitted: "تم إرسال الطلب بنجاح!",
    requestSubmittedMessage: "تم إرسال طلبك للمدير للمراجعة",
    ok: "موافق",
    requestError: "فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.",
    dateValidationWarning: "يجب إرسال الطلبات على الأقل يومين عمل في المستقبل. للطلبات الطارئة، يرجى الاتصال بالمدير مباشرة.",
    absenceAdvanceNotice: "يجب تقديم طلبات الغياب قبل 24 ساعة على الأقل.",
    sameDayAllowed: "يمكن تقديم طلبات التأخير والمغادرة المبكرة في نفس اليوم.",

    // Employment validation errors
    employmentValidation: {
      notEligibleYet: "الإجازات المسموحة غير متاحة حتى تكمل 3 أشهر من التوظيف",
      exceededMonthlyLimit9: "ستتجاوز حدك الشهري المسموح وهو 9 أيام إجازة",
      exceededMonthlyLimit12: "ستتجاوز حدك الشهري المسموح وهو 12 يوم إجازة",
      usedAllDays9: "لقد استخدمت بالفعل جميع أيام الإجازة المسموحة (9 أيام) لهذا الشهر",
      usedAllDays12: "لقد استخدمت بالفعل جميع أيام الإجازة المسموحة (12 يوم) لهذا الشهر"
    },
    
    // History Page
    myHistory: "تاريخي",
    viewAll: "عرض الكل",

    select: "اختيار",
    
    // Day abbreviations
    dayAbbreviations: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    
    // Time Periods
    periods: {
      today: "اليوم",
      week: "هذا الأسبوع",
      month: "هذا الشهر",
      quarter: "هذا الربع",
      year: "هذا العام"
    },

                 
    // Review text
    reviewAttendance: "راجع حضورك الآن!",

    // Time format
    timeFormat: {
      am: "ص",
      pm: "م"
    },

    // Teachers section
    'teachers.allTeachers': 'جميع المعلمين',
    'teachers.reports': 'التقارير',
    'teachers.analytics': 'التحليلات',
    'teachers.noTeachers': 'لم يتم العثور على معلمين',
    'teachers.noTeachersDesc': 'لا يوجد معلمون يطابقون المرشحات المحددة',
    'teachers.allSubjects': 'جميع المواد',
    'teachers.subjectFilter': 'تصفية المواد',
    'teachers.searchTeachers': 'البحث عن المعلمين...',
    
    // Analytics KPIs
    'analytics.totalTeachers': 'إجمالي المعلمين',
    'analytics.attendanceRate': 'معدل الحضور',
    'analytics.topPerformers': 'المتفوقون',
    'analytics.atRisk': 'معرضون للخطر',
    'analytics.departments': 'الأقسام',
    
    // Analytics Charts
    'analytics.performanceDistribution': 'توزيع الأداء',
    'analytics.departmentPerformance': 'أداء الأقسام',
    'analytics.weeklyAttendancePatterns': 'أنماط الحضور الأسبوعية',
    'analytics.teacherPerformanceRanking': 'ترتيب أداء المعلمين',
    'analytics.attendanceCommitmentLevel': 'مستوى الالتزام بالحضور',
    'analytics.selectDateRange': 'اختر نطاق التاريخ',
    'analytics.absenceComparison': 'مقارنة الغياب',
    'analytics.earlyLeavesComparison': 'مقارنة المغادرة المبكرة',
    'analytics.lateArrivalComparison': 'مقارنة الوصول المتأخر',
    'analytics.departmentComparisons': 'مقارنة الأقسام',
    'analytics.departmentRequests': 'طلبات الأقسام',
    'analytics.absenceRequests': 'طلبات الغياب',
    'analytics.earlyLeaveRequests': 'طلبات المغادرة المبكرة',
    'analytics.lateArrivalRequests': 'طلبات الوصول المتأخر',
    'analytics.teachersPerformanceComparison': 'مقارنة أداء المعلمين',
    'analytics.departmentPerformanceTracking': 'تتبع الأداء الطويل المدى',
    
    // Analytics Chart Descriptions
    'analytics.attendanceCommitmentDesc': 'يظهر توزيع المعلمين بناءً على مستويات الالتزام بالحضور',
    'analytics.departmentPerformanceDesc': 'قارن مقاييس الأداء عبر الأقسام المختلفة',
    'analytics.weeklyAttendancePatternsDesc': 'قم بتحليل أنماط الحضور خلال الأسبوع',
    'analytics.absenceComparisonDesc': 'قارن معدلات الغياب عبر الأقسام المختلفة',
    'analytics.earlyLeavesComparisonDesc': 'قارن طلبات المغادرة المبكرة عبر الأقسام',
    'analytics.lateArrivalComparisonDesc': 'قارن حوادث الوصول المتأخر عبر الأقسام',
    'analytics.departmentComparisonsDesc': 'قارن مقاييس أداء الأقسام بما يشمل الغياب والمغادرة المبكرة والوصول المتأخر',
    'analytics.departmentRequestsDesc': 'قم بتحليل أنماط طلبات الأقسام بما يشمل معدلات الموافقة والرفض',
    'analytics.absenceRequestsDesc': 'تتبع إرسال طلبات الغياب والموافقة والرفض بالأقسام',
    'analytics.earlyLeaveRequestsDesc': 'مراقبة أنماط طلبات المغادرة المبكرة ومعدلات الموافقة عبر الأقسام',
    'analytics.lateArrivalRequestsDesc': 'تحليل أنماط الطلبات المتأخرة والقرارات الإدارية بالأقسام',
    'analytics.teachersPerformanceComparisonDesc': 'قارن مقاييس أداء المعلمين الفردية وأنماط الحضور',
    'analytics.departmentPerformanceTrackingDesc': 'تتبع الأداء الطويل المدى والتحسينات عبر جميع الأقسام',
    
    // Analytics Table Headers
    'analytics.teacher': 'المعلم',
    'analytics.department': 'القسم',
    'analytics.attendanceRateCol': 'معدل الحضور',
    'analytics.punctuality': 'الالتزام',
    'analytics.performance': 'الأداء',
    
    // Analytics Chart Labels
    'analytics.attendance': 'الحضور',
    'analytics.punctualityChart': 'الالتزام',
    'analytics.absence': 'الغياب',
    'analytics.earlyLeave': 'المغادرة المبكرة',
    'analytics.lateArrival': 'الوصول المتأخر',
    
    // Comparison Labels
    'comparison.comparePeriods': 'مقارنة الفترات',
    'comparison.hideComparison': 'إخفاء المقارنة',
    'comparison.compare': 'مقارنة',
    'comparison.compareWith': 'مقارنة مع:',
    'comparison.vs': 'مقابل',
    'comparison.current': 'الحالي:',
    
    // Teacher Reports
    'reports.teacher': "المعلم",
    'reports.workType': "نوع العمل",
    'reports.attends': "الحضور",
    'reports.authorizedAbsence': "غياب مصرح به",
    'reports.unauthorizedAbsence': "غياب بدون إذن",
    'reports.earlyLeave': "إذن انصراف مبكر",
    'reports.lateArrival': "وصول متأخر",
    'reports.overtime': "ساعات إضافية",
    'reports.totalHours': "إجمالي الساعات",
    'reports.exportPDF': "تصدير PDF",
    'reports.exportExcel': "تحميل Excel",
    'reports.dateRange': "نطاق التاريخ",
    'reports.from': "من",
    'reports.to': "إلى",
    'reports.showing': "عرض",

    // Performance
    'performance.excellent': 'ممتاز',
    'performance.good': 'جيد',
    'performance.average': 'متوسط',
    'performance.poor': 'ضعيف',

    // Common
    'common.hours': 'ساعات',
    'Page': 'الصفحة',
    
    // Common date range options
    'common.today': 'اليوم',
    'common.thisWeek': 'هذا الأسبوع',
    'common.thisMonth': 'هذا الشهر',
    'common.thisQuarter': 'هذا الربع',
    'common.thisYear': 'هذا العام',
    'common.custom': 'تحديد مخصص',
    'common.done': 'تم',
    
    // Date Picker
    'datePicker.selectEndDate': 'اختر تاريخ النهاية',
    'datePicker.selectDateRange': 'اختر نطاق التاريخ',
    
    // Form Labels
    'form.employmentDate': 'تاريخ التعيين *',
    'form.allowedAbsenceDays': 'أيام الاجازة المتاحة',

    // Subjects
    subjects: {
      subjects: "المواد",
      subject: "المادة",
      management: "الإدارة",
      quran: "القرآن الكريم",
      arabic: "اللغة العربية",
      math: "الرياضيات",
      english: "اللغة الإنجليزية",
      science: "العلوم",
      art: "الفنون",
      programming: "البرمجة",
      socialStudies: "الدراسات الاجتماعية",
      fitness: "اللياقة البدنية",
      scouting: "الكشافة",
      nanny: "رعاية الأطفال"
    },

    // Teacher Information
    teacherInfo: {
      teacherTitle: "المعلم",
      employmentDate: "تاريخ التعيين",
      subjects: {
        Math: "الرياضيات",
        Science: "العلوم",
        English: "اللغة الإنجليزية",
        Arabic: "اللغة العربية",
        History: "التاريخ",
        Geography: "الجغرافيا",
        Physics: "الفيزياء",
        Chemistry: "الكيمياء",
        Biology: "الأحياء",
        Management: "الإدارة",
        "Computer Science": "علوم الحاسوب",
        Art: "الفنون",
        Music: "الموسيقى",
        Quran: "القرآن",
        Programming: "البرمجة",
        "Social studies": "الدراسات الاجتماعية",
        "Social Studies": "الدراسات الاجتماعية",
        Fitness: "اللياقة البدنية",
        Scouting: "الكشافة",
        Nanny: "المربية",
        "General Support": "الدعم العام",
        Childcare: "رعاية الأطفال",
        Canteen: "المقصف",
        Security: "الأمن"
      },
      workTypes: {
        "Full-time": "دوام كامل",
        "Part-time": "دوام جزئي",
        Contract: "عقد"
      }
    },

    // Settings
    settings: {
      personalInfoTab: "معلومات شخصية",
      generalTab: "الإعدادات العامة",
      securityTab: "الأمان",
      notificationsTab: "الإشعارات",
      holidaysTab: "العطل المدرسية",
      language: "اللغة",
      english: "الإنجليزية",
      arabic: "العربية",
      languageNote: "سيظهر التغيير فوراً",
      
      personalInfo: {
        title: "معلومات شخصية",
        subtitle: "إدارة التفاصيل الشخصية ومعلومات الملف الشخصي",
        uploadButton: "رفع صورة الملف الشخصي",
        firstName: "الاسم الأول",
        firstNamePlaceholder: "أدخل اسمك الأول",
        lastName: "الاسم الأخير", 
        lastNamePlaceholder: "أدخل اسمك الأخير",
        email: "البريد الإلكتروني",
        emailPlaceholder: "أدخل عنوان بريدك الإلكتروني",
        phone: "رقم الهاتف",
        phonePlaceholder: "أدخل رقم هاتفك",
        address: "العنوان",
        addressPlaceholder: "أدخل عنوانك",
        dateOfBirth: "تاريخ الميلاد",
        save: "حفظ التغييرات"
      },

      general: {
        title: "الإعدادات العامة",
        subtitle: "تكوين جداول العمل والأسابيع وتفضيلات النظام",
        weekendDays: "أيام الأسبوع",
        weekendDaysSubtitle: "حدد أي أيام يعتبر أسبوعاً (أيام عطلة)",
        nationalHolidays: "العطل الوطنية",
        nationalHolidaysSubtitle: "حدد التواريخ التي تعتبر عطل وطنية للعام الحالي",
        selectWeekendDays: "اختر أيام الأسبوع",

        selectedHolidays: "العطل المحددة",
        selectedHolidaysSubtitle: "مراجعة وإدارة التواريخ العطل المحددة",
        removeHoliday: "إزالة العطلة",
        clearAllHolidays: "مسح الكل",
        holidayCount: (count: number) => `${count} عطلة${count !== 1 ? 'ة' : ''} محددة`,
        save: "حفظ الإعدادات",
        saveSuccess: (weekendCount: number, holidayCount: number) => {
          const weekendDays = weekendCount > 0 ? `${weekendCount} ${weekendCount === 1 ? 'يوم' : weekendCount === 2 ? 'يومين' : 'أيام'} نهاية أسبوع` : 'بدون أيام نهاية أسبوع';
          const holidays = holidayCount > 0 ? `${holidayCount} ${holidayCount === 1 ? 'عطلة' : holidayCount === 2 ? 'عطلتين' : 'عطل'}` : 'بدون عطل';
          return `✅ تم الحفظ بنجاح! تم تكوين ${weekendDays} وتحديد ${holidays} للسنة.`;
        }
      },

      security: {
        title: "تغيير كلمة المرور",
        subtitle: "تحديث كلمة مرور حسابك للأمان المحسن",
        currentPassword: "كلمة المرور الحالية",
        newPassword: "كلمة المرور الجديدة",
        confirmPassword: "تأكيد كلمة المرور"
      },

      notifications: {
        title: "تفضيلات الإشعارات",
        subtitle: "اختر الإشعارات التي ترغب في تلقيها",
        allNotifications: "جميع الإشعارات",
        earlyArrival: "إشعارات الوصول المبكر",
        lateArrival: "إشعارات الوصول المتأخر", 
        earlyLeaves: "إشعارات المغادرة المبكرة",
        lateLeaves: "إشعارات المغادرة المتأخرة",
        absentsTeachers: "إشعارات المعلمين المتغيبين",
        dailyReports: "تقارير يومية",
        weeklyReports: "تقارير أسبوعية",
        monthlyReports: "تقارير شهرية",
        yearlyReports: "تقارير سنوية",
        testTitle: "إشعارات الاختبار",
        testDesc: "إرسال إشعارات الاختبار للتأكد من إعداداتك",
        testEarlyLeave: "اختبار المغادرة المبكرة",
        testAbsence: "اختبار الغياب", 
        testLateArrival: "اختبار الوصول المتأخر"
      },

      holidays: {
        title: "إدارة العطل المدرسية",
        subtitle: "إدارة العطل المدرسية والتواريخ الخاصة",
        upcomingHolidays: "العطل القادمة",
        addHoliday: "إضافة عطلة",
        editHoliday: "تعديل",
        deleteHoliday: "حذف",
        confirmDelete: "هل أنت متأكد من حذف هذه العطلة؟",
        noHolidays: "لا توجد عطل مجدولة",
        addFirst: "أضف أول عطلة لتبدأ",
        holidayName: "اسم العطلة (الإنجليزية)",
        holidayNamePlaceholder: "أدخل اسم العطلة في الإنجليزية",
        holidayNameAr: "اسم العطلة (العربية)",
        holidayNameArPlaceholder: "أدخل اسم العطلة في العربية",
        holidayDate: "تاريخ العطلة",
        description: "الوصف",
        descriptionPlaceholder: "أدخل الوصف",
        isRecurring: "عطلة متكررة",
        recurringNote: "تكرار سنوياً",
        cancel: "إلغاء",
        save: "حفظ العطلة"
      }
    },

    // Common
    common: {
      loading: "جاري التحميل...",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      add: "إضافة",
      confirm: "تأكيد",
      back: "رجوع"
    }
  }
};

export type TranslationKey = keyof typeof translations.en; 