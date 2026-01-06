# How to Generate a Demo Academic Report

## Step 1: Ensure Demo Data is Loaded

The application automatically seeds demo data on first load. If you need to reseed:

1. Open browser console (F12)
2. Run: `window.demoData.seedResults()`

## Step 2: Navigate to Student Academic Report

1. Login to the application (if not already logged in)
2. Go to: **Reports & Assessment** → **Student Academic Report**
   - Or navigate directly to: `http://localhost:3000/reports/student-academic-report`

## Step 3: Generate Report

1. **Select Student**: Choose any student from the dropdown
2. **Select Academic Year**: Choose `2024/2025` (or `2023/2024`)
3. **Select Term**: Choose `First Term`, `Second Term`, or `Third Term`
4. Click **"Generate Report"** button

## Step 4: View the Report

The report will display:
- Student information
- Subject-by-subject results with grades
- Total marks and percentage
- Overall grade (A, B, C, D, or F)
- End of term remarks (if available)

## Step 5: Print or Export

- Click **"Export PDF"** to download as PDF
- Click **"Print Report"** to print the report

## For Group Reports

1. Navigate to: **Reports & Assessment** → **Print Group Report**
2. Select:
   - Academic Year: `2024/2025`
   - Term: `First Term` (or any term)
   - Class: Select a class (e.g., Basic 1)
   - Report Type: All Students (or filter by Passed/Failed/Excellent)
3. Select students (or click "Select All")
4. Click **"Print Reports"**, **"Export CSV"**, or **"Export PDF"**

## Demo Data Information

The demo data includes:
- 50 students across various classes
- Academic results for 20 students
- Results for multiple subjects per student
- Results for different terms and academic years
- Scores ranging from 50-90

