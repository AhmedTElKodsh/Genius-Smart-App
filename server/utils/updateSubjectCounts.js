const fs = require('fs');
const path = require('path');

// Read data files
const teachersPath = path.join(__dirname, '..', 'data', 'teachers.json');
const subjectsPath = path.join(__dirname, '..', 'data', 'subjects.json');

const teachers = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
const subjects = JSON.parse(fs.readFileSync(subjectsPath, 'utf8'));

// Count teachers per subject
const subjectCounts = {};
teachers.forEach(teacher => {
  const subject = teacher.subject;
  if (subjectCounts[subject]) {
    subjectCounts[subject]++;
  } else {
    subjectCounts[subject] = 1;
  }
});

console.log('Teacher counts per subject:');
console.log(subjectCounts);

// Update subjects with correct teacher counts
const updatedSubjects = subjects.map(subject => ({
  ...subject,
  teacherCount: subjectCounts[subject.name] || 0
}));

// Add any new subjects that don't exist yet
Object.keys(subjectCounts).forEach(subjectName => {
  const exists = subjects.find(s => s.name === subjectName);
  if (!exists) {
    const { v4: uuidv4 } = require('uuid');
    updatedSubjects.push({
      id: uuidv4(),
      name: subjectName,
      arabicName: `${subjectName} - عربي`,
      description: `${subjectName} Department - Excellence in ${subjectName.toLowerCase()} education`,
      headOfDepartment: null,
      teacherCount: subjectCounts[subjectName],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
});

// Save updated subjects
fs.writeFileSync(subjectsPath, JSON.stringify(updatedSubjects, null, 2));

console.log('✅ Subject counts updated successfully!');
console.log(`📊 Updated ${updatedSubjects.length} subjects`); 