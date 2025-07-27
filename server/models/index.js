const { v4: uuidv4 } = require('uuid');
const { differenceInYears, parseISO, format } = require('date-fns');

// Request types with Arabic translations
const REQUEST_TYPES = {
  PERMITTED_LEAVES: {
    key: 'PERMITTED_LEAVES',
    english: 'Permitted Leaves',
    arabic: 'إجازات مسموح بها'
  },
  UNPERMITTED_LEAVES: {
    key: 'UNPERMITTED_LEAVES',
    english: 'Unpermitted Leaves',
    arabic: 'إجازات غير مسموح بها'
  },
  AUTHORIZED_ABSENCE: {
    key: 'AUTHORIZED_ABSENCE',
    english: 'Authorized Absence',
    arabic: 'غياب مصرح به'
  },
  UNAUTHORIZED_ABSENCE: {
    key: 'UNAUTHORIZED_ABSENCE',
    english: 'Unauthorized Absence',
    arabic: 'غياب غير مصرح به'
  },
  OVERTIME: {
    key: 'OVERTIME',
    english: 'Overtime',
    arabic: 'العمل الإضافي'
  },
  LATE_IN: {
    key: 'LATE_IN',
    english: 'Late Arrival',
    arabic: 'التأخير'
  }
};

// Department/Subject list
const DEPARTMENTS = [
  'Management',
  'Quran',
  'Arabic',
  'Math',
  'English',
  'Science',
  'Art',
  'Programming',
  'Social studies',
  'Fitness',
  'Scouting',
  'Nanny'
];

// Work types
const WORK_TYPES = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time'
};

// Request status
const REQUEST_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
};

class Teacher {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.department = data.department;
    this.workType = data.workType;
    this.joinDate = data.joinDate;
    this.birthdate = data.birthdate;
    this.email = data.email || this.generateEmail();
    this.phone = data.phone || this.generatePhone();
    this.status = data.status || 'Active';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  get age() {
    return differenceInYears(new Date(), parseISO(this.birthdate));
  }

  generateEmail() {
    const cleanName = this.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanName}@geniussmart.edu`;
  }

  generatePhone() {
    return `+966 5${Math.floor(Math.random() * 90000000 + 10000000)}`;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      department: this.department,
      workType: this.workType,
      joinDate: this.joinDate,
      birthdate: this.birthdate,
      age: this.age,
      email: this.email,
      phone: this.phone,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

class AttendanceRecord {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.teacherId = data.teacherId;
    this.month = data.month;
    this.year = data.year;
    this.totalWorkingDays = data.totalWorkingDays;
    this.attendedDays = data.attendedDays;
    this.permittedLeaves = data.permittedLeaves || 0;
    this.unpermittedLeaves = data.unpermittedLeaves || 0;
    this.authorizedAbsence = data.authorizedAbsence || 0;
    this.unauthorizedAbsence = data.unauthorizedAbsence || 0;
    this.lateHours = data.lateHours || 0;
    this.overtimeHours = data.overtimeHours || 0;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  get attendanceRate() {
    return this.totalWorkingDays > 0 
      ? Math.round((this.attendedDays / this.totalWorkingDays) * 100) 
      : 0;
  }

  get totalHours() {
    const baseHours = this.attendedDays * 8; // 8 hours per day
    return baseHours + this.overtimeHours - this.lateHours;
  }

  get totalAbsences() {
    return this.permittedLeaves + this.unpermittedLeaves + 
           this.authorizedAbsence + this.unauthorizedAbsence;
  }

  toJSON() {
    return {
      id: this.id,
      teacherId: this.teacherId,
      month: this.month,
      year: this.year,
      totalWorkingDays: this.totalWorkingDays,
      attendedDays: this.attendedDays,
      attendanceRate: this.attendanceRate,
      permittedLeaves: this.permittedLeaves,
      unpermittedLeaves: this.unpermittedLeaves,
      authorizedAbsence: this.authorizedAbsence,
      unauthorizedAbsence: this.unauthorizedAbsence,
      lateHours: this.lateHours,
      overtimeHours: this.overtimeHours,
      totalHours: this.totalHours,
      totalAbsences: this.totalAbsences,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

class Request {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.teacherId = data.teacherId;
    this.type = data.type;
    this.date = data.date;
    this.hours = data.hours || null;
    this.days = data.days || null;
    this.reason = data.reason;
    this.status = data.status || REQUEST_STATUS.PENDING;
    this.approvedBy = data.approvedBy || null;
    this.approvedDate = data.approvedDate || null;
    this.rejectionReason = data.rejectionReason || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  approve(managerId, date = new Date().toISOString()) {
    this.status = REQUEST_STATUS.APPROVED;
    this.approvedBy = managerId;
    this.approvedDate = date;
    this.updatedAt = new Date().toISOString();
  }

  reject(managerId, reason, date = new Date().toISOString()) {
    this.status = REQUEST_STATUS.REJECTED;
    this.approvedBy = managerId;
    this.approvedDate = date;
    this.rejectionReason = reason;
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      teacherId: this.teacherId,
      type: this.type,
      date: this.date,
      hours: this.hours,
      days: this.days,
      reason: this.reason,
      status: this.status,
      approvedBy: this.approvedBy,
      approvedDate: this.approvedDate,
      rejectionReason: this.rejectionReason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

class Department {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.arabicName = data.arabicName;
    this.description = data.description;
    this.headOfDepartment = data.headOfDepartment || null;
    this.teacherCount = data.teacherCount || 0;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      arabicName: this.arabicName,
      description: this.description,
      headOfDepartment: this.headOfDepartment,
      teacherCount: this.teacherCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = {
  Teacher,
  AttendanceRecord,
  Request,
  Department,
  REQUEST_TYPES,
  DEPARTMENTS,
  WORK_TYPES,
  REQUEST_STATUS
}; 