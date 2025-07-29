export const translations = {
  en: {
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
    
    // Analytics Table Headers
    'analytics.teacher': 'Teacher',
    'analytics.department': 'Department',
    'analytics.attendanceRateCol': 'Attendance Rate',
    'analytics.punctuality': 'Punctuality',
    'analytics.performance': 'Performance',
    
    // Analytics Chart Labels
    'analytics.attendance': 'Attendance',
    'analytics.punctualityChart': 'Punctuality',
    
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
    
    // Form Labels
    'form.employmentDate': 'Employment Date *',
    'form.allowedAbsenceDays': 'Allowed Absence Days',

    // Subjects
    subjects: {
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
  },
  
  ar: {
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
    
    // Analytics Table Headers
    'analytics.teacher': 'المعلم',
    'analytics.department': 'القسم',
    'analytics.attendanceRateCol': 'معدل الحضور',
    'analytics.punctuality': 'الالتزام',
    'analytics.performance': 'الأداء',
    
    // Analytics Chart Labels
    'analytics.attendance': 'الحضور',
    'analytics.punctualityChart': 'الالتزام',
    
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
    
    // Form Labels
    'form.employmentDate': 'تاريخ التعيين *',
    'form.allowedAbsenceDays': 'أيام الاجازة المتاحة',

    // Subjects
    subjects: {
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
  }
};

export type TranslationKey = keyof typeof translations.en; 