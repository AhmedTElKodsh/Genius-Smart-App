const fs = require('fs');
const path = require('path');

const subjectsPath = path.join(__dirname, 'data', 'subjects.json');

// Read the file
let content = fs.readFileSync(subjectsPath, 'utf8');

// Replace all instances
content = content.replace(/Department/g, 'Subject');
content = content.replace(/headOfDepartment/g, 'headOfSubject');

// Write back to file
fs.writeFileSync(subjectsPath, content, 'utf8');

console.log('✅ Updated subjects.json - replaced Department with Subject'); 