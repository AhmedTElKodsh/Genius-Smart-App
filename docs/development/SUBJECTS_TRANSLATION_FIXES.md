# Subjects Translation Fixes for Arabic Version

## Date: December 2024

## Overview
Fixed all instances where "Subjects" and related terms were hardcoded in English to ensure proper Arabic translation ("المواد") is displayed when viewing the application in Arabic mode.

## Changes Made

### 1. Added Translation Keys

#### In `src/utils/translations.ts`:
```typescript
// English
subjects: {
  subjects: "Subjects",  // Added
  subject: "Subject",
  // ...
}

// Arabic
subjects: {
  subjects: "المواد",    // Added
  subject: "المادة",
  // ...
}

// Also added:
'teachers.subjectFilter': 'Subject Filter' // English
'teachers.subjectFilter': 'تصفية المواد'  // Arabic
```

### 2. Fixed SubjectDropdown Component

#### In `src/components/SubjectDropdown.tsx`:
- Added language context import
- Replaced hardcoded `placeholder = "All Subjects"` with dynamic translation
- Now uses `t('teachers.allSubjects')` which translates to:
  - English: "All Subjects"
  - Arabic: "جميع المواد"

### 3. Fixed ManagerTeachers Page

#### In `src/pages/ManagerTeachers.tsx`:
- Fixed PDF export text:
  ```typescript
  // Before:
  const subjectText = selectedSubject || 'All Subjects';
  doc.text(`Subject: ${subjectText}`, 14, yPosition);
  
  // After:
  const subjectText = selectedSubject || t('teachers.allSubjects');
  doc.text(`${t('subjects.subject')}: ${subjectText}`, 14, yPosition);
  ```

- Fixed Excel export:
  ```typescript
  // Before:
  { Field: 'Subject Filter', Value: selectedSubject || 'All Subjects' }
  
  // After:
  { Field: t('teachers.subjectFilter'), Value: selectedSubject || t('teachers.allSubjects') }
  ```

### 4. Fixed AddTeacherModal Component

#### In `src/components/AddTeacherModal.tsx`:
- Fixed dropdown placeholder:
  ```typescript
  // Before:
  <option value="">Select Subject</option>
  
  // After:
  <option value="">{translations?.['addTeacher.selectSubject'] || 'Select Subject'}</option>
  ```

## Arabic Translations Now Applied

When viewing in Arabic mode, users will see:
- "المواد" instead of "Subjects"
- "المادة" instead of "Subject"
- "جميع المواد" instead of "All Subjects"
- "اختر المادة" instead of "Select Subject"
- "تصفية المواد" instead of "Subject Filter"

## Areas Affected

1. **Subject Dropdown Component** - Used throughout the application for filtering
2. **Manager Teachers Page** - Subject filter dropdown and export functions
3. **Add/Edit Teacher Modals** - Subject selection dropdowns
4. **PDF/Excel Exports** - Subject-related labels in generated files

## Testing

To verify the changes:
1. Switch to Arabic language
2. Check the subject dropdown - should show "جميع المواد" as placeholder
3. Open Add/Edit Teacher modal - should show "اختر المادة" in subject dropdown
4. Export PDF/Excel from Teachers page - should have Arabic labels for subject-related fields
5. All subject-related text should be in Arabic, properly aligned RTL 