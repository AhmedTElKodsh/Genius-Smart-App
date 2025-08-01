const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const subjectsFilePath = path.join(__dirname, '..', 'data', 'subjects.json');
const teachersFilePath = path.join(__dirname, '..', 'data', 'teachers.json');

// Helper function to read subjects data
const readSubjectsData = () => {
  try {
    return JSON.parse(fs.readFileSync(subjectsFilePath, 'utf8'));
  } catch (error) {
    return [];
  }
};

// Helper function to read teachers data
const readTeachersData = () => {
  try {
    return JSON.parse(fs.readFileSync(teachersFilePath, 'utf8'));
  } catch (error) {
    return [];
  }
};

// GET /api/subjects - Get all subjects
router.get('/', (req, res) => {
  try {
    const subjects = readSubjectsData();
    const teachers = readTeachersData();
    
    // Add current teacher count to each subject
    const subjectsWithStats = subjects.map(subject => {
      const subjectTeachers = teachers.filter(t => t.subject === subject.name);
      return {
        ...subject,
        teacherCount: subjectTeachers.length,
        activeTeachers: subjectTeachers.filter(t => t.status === 'Active').length
      };
    });
    
    res.json({
      success: true,
      data: subjectsWithStats,
      total: subjectsWithStats.length,
      message: 'Subjects retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve subjects',
      details: error.message
    });
  }
});

// GET /api/subjects/:id - Get specific subject
router.get('/:id', (req, res) => {
  try {
    const subjects = readSubjectsData();
    const teachers = readTeachersData();
    const subjectId = req.params.id;
    
    const subject = subjects.find(d => d.id === subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }
    
    // Get subject statistics
    const subjectTeachers = teachers.filter(t => t.subject === subject.name);
    const stats = {
      totalTeachers: subjectTeachers.length,
      activeTeachers: subjectTeachers.filter(t => t.status === 'Active').length,
      fullTimeTeachers: subjectTeachers.filter(t => t.workType === 'Full-time').length,
      partTimeTeachers: subjectTeachers.filter(t => t.workType === 'Part-time').length,
      averageAge: subjectTeachers.length > 0 ? 
        Math.round(subjectTeachers.reduce((sum, t) => sum + (t.age || 0), 0) / subjectTeachers.length) : 0
    };
    
    res.json({
      success: true,
      data: {
        ...subject,
        ...stats,
        teachers: subjectTeachers
      },
      message: 'Subject details retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve subject details',
      details: error.message
    });
  }
});

// GET /api/subjects/stats/summary - Get subjects summary statistics
router.get('/stats/summary', (req, res) => {
  try {
    const subjects = readSubjectsData();
    const teachers = readTeachersData();
    
    const summary = {
      totalSubjects: subjects.length,
      totalTeachers: teachers.length,
      averageTeachersPerSubject: subjects.length > 0 ? 
        Math.round(teachers.length / subjects.length * 10) / 10 : 0,
      subjectDistribution: subjects.map(subject => {
        const subjectTeachers = teachers.filter(t => t.subject === subject.name);
        return {
          subject: subject.name,
          arabicName: subject.arabicName,
          teacherCount: subjectTeachers.length,
          percentage: teachers.length > 0 ? 
            Math.round((subjectTeachers.length / teachers.length) * 100) : 0
        };
      }).sort((a, b) => b.teacherCount - a.teacherCount)
    };
    
    res.json({
      success: true,
      data: summary,
      message: 'Subject statistics retrieved successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve subject statistics',
      details: error.message
    });
  }
});

module.exports = router; 