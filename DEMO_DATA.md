# Demo Data Service

This application includes a comprehensive demo data seeding service for demonstration purposes.

## Automatic Initialization

Demo data is automatically seeded when the application is first loaded (only if no existing data is found). This ensures that new users see a fully populated application with realistic sample data.

## Manual Control

The demo data service is exposed in the browser console for easy access during development and demonstrations.

### Browser Console Commands

Open your browser's developer console (F12) and use the following commands:

```javascript
// Seed all demo data
window.demoData.seedAll()

// Clear all data
window.demoData.clearAll()

// Seed specific data types
window.demoData.seedStudents()
window.demoData.seedStaff()
window.demoData.seedClasses()
window.demoData.seedSubjects()
window.demoData.seedBillItems()
window.demoData.seedBills()
window.demoData.seedPayments()
window.demoData.seedResults()
window.demoData.seedNews()
window.demoData.seedDocuments()
window.demoData.seedCourses()
window.demoData.seedSchoolInfo()
window.demoData.seedSystemSettings()
window.demoData.seedAcademicSettings()
```

## What Gets Seeded

The demo data service populates the following:

### School Information
- School name, address, contact details
- School motto and registration information

### System Settings
- Currency (GHS)
- Date/time formats
- Notification settings

### Academic Settings
- Current academic year (2024/2025)
- Terms and grading system

### Classes
- 11 classes: Nursery 1-2, Basic 1-6, JHS 1-3
- Each with capacity and enrollment data

### Subjects
- 13 subjects covering all levels
- Subject codes and class assignments

### Bill Items
- 10 bill items (Tuition, Registration, Library, etc.)
- With amounts and categories

### Students
- 50 students with realistic data
- Random distribution across classes
- Contact information and parent details
- Mix of active and inactive statuses

### Staff
- 25 staff members
- Various positions (Headmaster, Teachers, Administrators, etc.)
- Department assignments
- Contact information

### Bills
- 30 bills for various students
- Multiple bill items per bill
- Different statuses (pending, paid, partial)

### Payments
- 20 payment records
- Linked to bills
- Various payment methods

### Academic Results
- Results for 20 students
- Multiple subjects per student
- Scores and grades

### News Items
- 5 news articles
- Various categories (Announcements, Events, Academic)

### Documents
- 3 sample documents
- Shared documents for easy access

### Courses
- 3 e-learning courses
- Published courses ready for enrollment

## Data Characteristics

- **Realistic Data**: All data uses realistic names, dates, and values
- **Relationships**: Data is properly linked (students to classes, bills to students, etc.)
- **Variety**: Mix of statuses, dates, and values for comprehensive testing
- **Ghanaian Context**: Uses Ghanaian names and phone number formats

## Resetting Demo Data

To reset and reseed all demo data:

```javascript
// Clear all data first
window.demoData.clearAll()

// Then seed again
window.demoData.seedAll()
```

## Notes

- Demo data is only seeded if no existing data is found
- Seeding is idempotent - running `seedAll()` multiple times won't duplicate data if it already exists
- Individual seed methods check for existing data before seeding
- All data is stored in browser localStorage

## Development

The demo data service is located at `src/services/demoDataService.ts` and can be extended to add more demo data types or modify existing seed data.

