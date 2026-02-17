import React, { useState, useCallback, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import academicService from '../../services/academicService';
import studentsService from '../../services/studentsService';
import setupService from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';
import { printPage, exportToPDF } from '../../utils/printExport';

interface StudentReport {
  studentId: string;
  studentInfo?: any;
  academicYear?: string;
  term?: string;
  courses: any[];
  results: any[];
  remarks: any[];
  totalMarks: number;
  maxMarks: number;
  percentage: string;
  attendance?: {
    present: number;
    absent: number;
    total: number;
    percentage: number;
  };
  promotionStatus?: {
    promoted: boolean;
    fromClass: string;
    toClass: string;
  } | null;
  position?: {
    rank: number;
    totalStudents: number;
    classPosition?: number;
    totalInClass?: number;
  };
}

interface FormData {
  reportType: 'individual' | 'class';
  studentId: string;
  selectedClasses: string[];
  academicYear: string;
  term: string;
}

const StudentAcademicReport: React.FC = () => {
  const { toast } = useModal();
  const printRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    reportType: 'individual',
    studentId: '',
    selectedClasses: [],
    academicYear: '',
    term: ''
  });

  const academicYears: string[] = ['2023/2024', '2024/2025', '2025/2026'];
  const terms: string[] = ['First Term', 'Second Term', 'Third Term'];

  const loadStudents = useCallback(async () => {
    try {
      const allStudents = await studentsService.getAll();
      setStudents(allStudents);
      
      // Extract unique classes from students
      const uniqueClasses = Array.from(new Set(
        allStudents
          .map(s => s.class)
          .filter((c): c is string => Boolean(c && c.trim() !== ''))
      )).sort();
      setClasses(uniqueClasses);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.showError('Failed to load students');
    }
  }, [toast]);

  const loadSchoolInfo = useCallback(async () => {
    try {
      const info = await setupService.getSchoolInfo();
      setSchoolInfo(info);
    } catch (error) {
      console.error('Error loading school info:', error);
    }
  }, []);

  useEffect(() => {
    loadStudents();
    loadSchoolInfo();
  }, [loadStudents, loadSchoolInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>): void => {
    const { name, value } = e.target;
    
    if (name === 'reportType') {
      setFormData({
        ...formData,
        reportType: value as 'individual' | 'class',
        studentId: '',
        selectedClasses: []
      });
      setReports([]);
    } else if (name === 'selectedClasses') {
      const selectElement = e.target as HTMLSelectElement;
      const selectedOptions = Array.from(selectElement.selectedOptions, option => option.value);
      setFormData({
        ...formData,
        selectedClasses: selectedOptions,
        studentId: ''
      });
      setReports([]);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
      if (name === 'studentId') {
        setReports([]);
      }
    }
  };

  const calculateAttendance = useCallback((studentId: string, academicYear: string, term: string) => {
    // Mock attendance calculation - in a real app, this would come from an attendance service
    // Assuming 60 school days per term
    const totalDays = 60;
    const present = Math.floor(Math.random() * 10) + 50; // 50-60 days present
    const absent = totalDays - present;
    const percentage = (present / totalDays) * 100;
    
    return {
      present,
      absent,
      total: totalDays,
      percentage: Math.round(percentage)
    };
  }, []);

  const handleGenerateReport = async (): Promise<void> => {
    if (!formData.academicYear || !formData.term) {
      toast.showError('Please select academic year and term');
      return;
    }

    if (formData.reportType === 'individual') {
      if (!formData.studentId) {
        toast.showError('Please select a student');
        return;
      }
    } else {
      if (formData.selectedClasses.length === 0) {
        toast.showError('Please select at least one class');
        return;
      }
    }

    setLoading(true);
    try {
      if (formData.reportType === 'individual') {
        // Generate report for individual student
        const student = await studentsService.getById(formData.studentId);
        const generatedReport = await academicService.generateStudentReport(
          formData.studentId,
          formData.academicYear,
          formData.term
        );
        const attendance = calculateAttendance(formData.studentId, formData.academicYear, formData.term);

        // Check promotion status for third term
        let promotionStatus = null;
        if (formData.term === 'Third Term') {
          try {
            const promotions = await academicService.getPromotionsByAcademicYear(formData.academicYear);
            const studentPromotion = promotions.find((p: any) => 
              p.studentIds && p.studentIds.includes(formData.studentId)
            );
            if (studentPromotion) {
              promotionStatus = {
                promoted: true,
                fromClass: studentPromotion.fromClass,
                toClass: studentPromotion.toClass
              };
            } else {
              // Check if student passed (percentage >= 50) to determine promotion eligibility
              const percentage = parseFloat(generatedReport.percentage);
              promotionStatus = {
                promoted: percentage >= 50,
                fromClass: student.class || 'N/A',
                toClass: percentage >= 50 ? 'Next Class' : 'Repeat'
              };
            }
          } catch (error) {
            console.error('Error checking promotion status:', error);
          }
        }

        // Calculate position for individual reports - show class position
        let position = undefined;
        try {
          const classStudents = await studentsService.getByClass(student.class || '');
          const classReports: StudentReport[] = [];
          
          for (const classStudent of classStudents) {
            try {
              const classReport = await academicService.generateStudentReport(
                classStudent.id,
                formData.academicYear,
                formData.term
              );
              classReports.push({
                ...classReport,
                studentInfo: classStudent
              });
            } catch (error) {
              // Skip students with errors
            }
          }
          
          // Sort by percentage (descending)
          classReports.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
          const studentRank = classReports.findIndex(r => r.studentId === formData.studentId) + 1;
          
          if (studentRank > 0) {
            position = {
              rank: studentRank,
              totalStudents: classReports.length,
              classPosition: studentRank,
              totalInClass: classReports.length
            };
          }
        } catch (error) {
          console.error('Error calculating class position:', error);
        }

        setReports([{
          ...generatedReport,
          studentInfo: student,
          attendance,
          promotionStatus,
          position
        }]);
      } else {
        // Generate reports for all students in selected classes
        const allReports: StudentReport[] = [];
        const allClassStudents: any[] = [];
        
        // Collect all students from selected classes
        for (const className of formData.selectedClasses) {
          const classStudents = await studentsService.getByClass(className);
          allClassStudents.push(...classStudents.map(s => ({ ...s, className })));
        }
        
        // Generate reports for all students
        for (const student of allClassStudents) {
          try {
            const generatedReport = await academicService.generateStudentReport(
              student.id,
              formData.academicYear,
              formData.term
            );
            const attendance = calculateAttendance(student.id, formData.academicYear, formData.term);
            
            // Check promotion status for third term
            let promotionStatus = null;
            if (formData.term === 'Third Term') {
              try {
                const promotions = await academicService.getPromotionsByAcademicYear(formData.academicYear);
                const studentPromotion = promotions.find((p: any) => 
                  p.studentIds && p.studentIds.includes(student.id)
                );
                if (studentPromotion) {
                  promotionStatus = {
                    promoted: true,
                    fromClass: studentPromotion.fromClass,
                    toClass: studentPromotion.toClass
                  };
                } else {
                  const percentage = parseFloat(generatedReport.percentage);
                  promotionStatus = {
                    promoted: percentage >= 50,
                    fromClass: student.class || 'N/A',
                    toClass: percentage >= 50 ? 'Next Class' : 'Repeat'
                  };
                }
              } catch (error) {
                console.error(`Error checking promotion for student ${student.id}:`, error);
              }
            }
            
            allReports.push({
              ...generatedReport,
              studentInfo: student,
              attendance,
              promotionStatus
            });
          } catch (error) {
            console.error(`Error generating report for student ${student.id}:`, error);
          }
        }

        // Calculate positions
        // Sort by percentage (descending)
        allReports.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
        
        // Assign overall positions
        allReports.forEach((report, index) => {
          report.position = {
            rank: index + 1,
            totalStudents: allReports.length
          };
        });

        // Calculate class positions for each class
        const classGroups: { [key: string]: StudentReport[] } = {};
        allReports.forEach(report => {
          const className = report.studentInfo?.class || 'Unknown';
          if (!classGroups[className]) {
            classGroups[className] = [];
          }
          classGroups[className].push(report);
        });

        // Sort each class by percentage and assign class positions
        Object.keys(classGroups).forEach(className => {
          const classReports = classGroups[className];
          classReports.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
          classReports.forEach((report, index) => {
            if (report.position) {
              report.position.classPosition = index + 1;
              report.position.totalInClass = classReports.length;
            }
          });
        });

        setReports(allReports);
        toast.showSuccess(`Generated ${allReports.length} report(s) successfully`);
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.showError(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (): void => {
    if (!printRef.current) return;
    const title = reports.length === 1 
      ? `Academic Report - ${reports[0].studentInfo ? `${reports[0].studentInfo.firstName} ${reports[0].studentInfo.surname}` : 'Student'}`
      : `Academic Reports - ${reports.length} Students`;
    
    printPage(printRef.current, {
      title,
      styles: `
        @media print {
          .no-print { display: none; }
          body { font-size: 11pt; background: white; }
          .report-card { 
            background: white; 
            position: relative;
            page-break-after: always;
          }
          .report-background {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0.05;
            z-index: 0;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }
          .report-content {
            position: relative;
            z-index: 1;
          }
          .report-header { 
            text-align: center; 
            margin-bottom: 20px;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 15px;
          }
          .report-title { 
            font-size: 24pt; 
            font-weight: bold; 
            margin-bottom: 10px;
            color: #1e40af;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0;
          }
          th, td { 
            border: 1px solid #333; 
            padding: 8px; 
            text-align: left; 
            font-size: 10pt;
          }
          th { 
            background-color: #1e40af; 
            color: white;
            font-weight: bold; 
            text-align: center;
          }
          .school-logo {
            max-width: 120px;
            max-height: 120px;
            margin: 0 auto 10px;
          }
        }
      `
    });
  };

  const handleExportPDF = (): void => {
    if (!printRef.current) return;
    const filename = reports.length === 1
      ? `academic-report-${reports[0].studentId}-${new Date().toISOString().split('T')[0]}.pdf`
      : `academic-reports-${formData.selectedClasses.join('-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    exportToPDF(printRef.current, filename);
  };

  const getGrade = (percentage: number): string => {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const getGradeColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const renderReport = (report: StudentReport, index: number) => {
    const studentInfo = report.studentInfo;
    if (!studentInfo) return null;

    return (
      <div 
        key={index}
        className="report-card bg-white rounded-lg shadow-lg border-4 print-content relative mb-6 overflow-hidden"
        style={{
          minHeight: '11in',
          width: '8.5in',
          maxWidth: '100%',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderColor: schoolInfo?.primaryColor || '#1e40af'
        }}
      >
        {/* Background Logo Watermark */}
        {(schoolInfo?.schoolLogoUrl || schoolInfo?.schoolLogo) && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${schoolInfo.schoolLogoUrl || schoolInfo.schoolLogo})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.03,
              zIndex: 0
            }}
          ></div>
        )}

        {/* Report Content */}
        <div className="report-content relative z-10 p-8">
          {/* School Header with Logo */}
          <div 
            className="report-header text-center mb-8 pb-6 border-b-4"
            style={{
              borderColor: schoolInfo?.primaryColor || '#1e40af'
            }}
          >
            {/* Logo at the top */}
            {(schoolInfo?.schoolLogoUrl || schoolInfo?.schoolLogo) && (
              <div className="mb-4">
                <img 
                  src={schoolInfo.schoolLogoUrl || schoolInfo.schoolLogo} 
                  alt="School Logo" 
                  className="school-logo mx-auto max-w-[120px] max-h-[120px] object-contain"
                />
              </div>
            )}
            
            {/* School Name */}
            <div className="mb-3">
              <h1 
                className="report-title text-2xl sm:text-3xl font-bold mb-1 uppercase tracking-wide"
                style={{
                  color: schoolInfo?.primaryColor || '#1e40af'
                }}
              >
                {schoolInfo?.schoolName || schoolInfo?.name || 'School Name'}
              </h1>
              {schoolInfo?.address && (
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  {schoolInfo.address}
                  {schoolInfo.phone && ` | Tel: ${schoolInfo.phone}`}
                </p>
              )}
            </div>
            
            {schoolInfo?.motto && (
              <p className="text-sm text-gray-700 italic mb-3 font-medium">{schoolInfo.motto}</p>
            )}
            
            <div className="mt-4 pt-4 border-t-2" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 uppercase tracking-wider">ACADEMIC REPORT CARD</h2>
              <div className="text-sm text-gray-700 font-semibold">
                <span>Academic Year: {formData.academicYear}</span>
                <span className="mx-2">|</span>
                <span>Term: {formData.term}</span>
              </div>
            </div>
          </div>

          {/* Student Information Section */}
          <div className="mb-6 p-5 border-2 rounded-lg" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af', backgroundColor: schoolInfo?.primaryColor ? `${schoolInfo.primaryColor}05` : '#f9fafb' }}>
            <h3 
              className="text-lg font-bold text-gray-900 mb-4 border-b-2 pb-2 uppercase tracking-wide"
              style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}
            >
              STUDENT INFORMATION
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Student ID:</span>
                <span className="ml-2 text-gray-900">{studentInfo.studentId || studentInfo.id}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Name:</span>
                <span className="ml-2 text-gray-900">
                  {studentInfo.firstName} {studentInfo.surname} {studentInfo.otherNames || ''}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Class:</span>
                <span className="ml-2 text-gray-900">{studentInfo.class || 'N/A'}</span>
              </div>
              {report.position && (
                <>
                  {report.position.classPosition && (
                    <div>
                      <span className="font-semibold text-gray-700">Position in Class:</span>
                      <span className="ml-2 text-gray-900 font-bold" style={{ color: schoolInfo?.primaryColor || '#1e40af' }}>
                        {report.position.classPosition}
                        {report.position.totalInClass && ` out of ${report.position.totalInClass}`}
                      </span>
                    </div>
                  )}
                  {formData.reportType === 'class' && report.position.rank && (
                    <div>
                      <span className="font-semibold text-gray-700">Overall Position:</span>
                      <span className="ml-2 text-gray-900 font-bold" style={{ color: schoolInfo?.primaryColor || '#1e40af' }}>
                        {report.position.rank}
                        {report.position.totalStudents && ` out of ${report.position.totalStudents}`}
                      </span>
                    </div>
                  )}
                </>
              )}
              {studentInfo.gender && (
                <div>
                  <span className="font-semibold text-gray-700">Gender:</span>
                  <span className="ml-2 text-gray-900">{studentInfo.gender}</span>
                </div>
              )}
              {studentInfo.dateOfBirth && (
                <div>
                  <span className="font-semibold text-gray-700">Date of Birth:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(studentInfo.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              )}
              {studentInfo.parentName && (
                <div className="sm:col-span-2">
                  <span className="font-semibold text-gray-700">Parent/Guardian:</span>
                  <span className="ml-2 text-gray-900">{studentInfo.parentName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Attendance Section */}
          {report.attendance && (
            <div 
              className="mb-6 p-5 border-2 rounded-lg"
              style={{
                backgroundColor: schoolInfo?.secondaryColor ? `${schoolInfo.secondaryColor}10` : '#eff6ff',
                borderColor: schoolInfo?.secondaryColor || '#3b82f6'
              }}
            >
              <h3 
                className="text-lg font-bold text-gray-900 mb-4 border-b-2 pb-2 uppercase tracking-wide"
                style={{
                  borderColor: schoolInfo?.secondaryColor || '#3b82f6'
                }}
              >
                ATTENDANCE RECORD
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Days Present</div>
                  <div className="text-2xl font-bold text-green-600">{report.attendance.present}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Days Absent</div>
                  <div className="text-2xl font-bold text-red-600">{report.attendance.absent}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Total Days</div>
                  <div className="text-2xl font-bold text-gray-900">{report.attendance.total}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Attendance %</div>
                  <div className={`text-2xl font-bold ${report.attendance.percentage >= 80 ? 'text-green-600' : report.attendance.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {report.attendance.percentage}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Academic Results Section */}
          <div className="mb-6">
            <h3 
              className="text-lg font-bold text-gray-900 mb-4 border-b-2 pb-3 uppercase tracking-wide"
              style={{
                borderColor: schoolInfo?.primaryColor || '#1e40af'
              }}
            >
              ACADEMIC PERFORMANCE
            </h3>
            {report.results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>
                  <thead>
                    <tr style={{ backgroundColor: schoolInfo?.primaryColor || '#1e40af', color: '#ffffff' }}>
                      <th className="border-2 px-3 py-2 text-left text-sm font-bold" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>S/N</th>
                      <th className="border-2 px-3 py-2 text-left text-sm font-bold" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>SUBJECT</th>
                      <th className="border-2 px-3 py-2 text-center text-sm font-bold" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>SCORE</th>
                      <th className="border-2 px-3 py-2 text-center text-sm font-bold" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>GRADE</th>
                      <th className="border-2 px-3 py-2 text-center text-sm font-bold" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>REMARK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.results.map((result: any, idx: number) => {
                      const percentage = parseFloat(result.score) || 0;
                      const grade = getGrade(percentage);
                      return (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border-2 px-3 py-2 text-sm text-center font-medium text-gray-900" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>{idx + 1}</td>
                          <td className="border-2 px-3 py-2 text-sm font-medium text-gray-900" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>{result.subject || 'N/A'}</td>
                          <td className="border-2 px-3 py-2 text-sm text-center font-bold text-gray-900" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>{result.score || 0}</td>
                          <td className={`border-2 px-3 py-2 text-sm text-center font-bold ${getGradeColor(percentage)}`} style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>
                            {grade}
                          </td>
                          <td className="border-2 px-3 py-2 text-sm text-center text-gray-700" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>
                            {percentage >= 80 ? 'Excellent' : percentage >= 70 ? 'Very Good' : percentage >= 60 ? 'Good' : percentage >= 50 ? 'Fair' : 'Poor'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: schoolInfo?.secondaryColor ? `${schoolInfo.secondaryColor}20` : '#dbeafe', fontWeight: 'bold' }}>
                      <td colSpan={2} className="border-2 px-3 py-2 text-sm text-gray-900" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>TOTAL / AVERAGE</td>
                      <td className="border-2 px-3 py-2 text-sm text-center text-gray-900" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>
                        {report.totalMarks.toFixed(2)} / {report.maxMarks.toFixed(2)}
                      </td>
                      <td className={`border-2 px-3 py-2 text-sm text-center font-bold ${getGradeColor(parseFloat(report.percentage))}`} style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>
                        {getGrade(parseFloat(report.percentage))}
                      </td>
                      <td className="border-2 px-3 py-2 text-sm text-center text-gray-900" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>
                        {parseFloat(report.percentage).toFixed(2)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 border-2 border-gray-300 rounded">No results found for this term.</p>
            )}
          </div>

          {/* Performance Summary */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              className="p-5 border-2 rounded-lg text-center shadow-sm"
              style={{
                backgroundColor: schoolInfo?.primaryColor ? `${schoolInfo.primaryColor}08` : '#eff6ff',
                borderColor: schoolInfo?.primaryColor || '#1e40af'
              }}
            >
              <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total Marks</div>
              <div className="text-3xl font-bold mb-1" style={{ color: schoolInfo?.primaryColor || '#1e40af' }}>{report.totalMarks.toFixed(2)}</div>
              <div className="text-xs text-gray-500">out of {report.maxMarks.toFixed(2)}</div>
            </div>
            <div 
              className="p-5 border-2 rounded-lg text-center shadow-sm"
              style={{
                backgroundColor: schoolInfo?.secondaryColor ? `${schoolInfo.secondaryColor}08` : '#f0fdf4',
                borderColor: schoolInfo?.secondaryColor || '#3b82f6'
              }}
            >
              <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Percentage</div>
              <div className={`text-3xl font-bold mb-1 ${getGradeColor(parseFloat(report.percentage))}`}>
                {report.percentage}%
              </div>
              <div className="text-xs text-gray-500">Overall Performance</div>
            </div>
            <div 
              className="p-5 border-2 rounded-lg text-center shadow-sm"
              style={{
                backgroundColor: schoolInfo?.primaryColor ? `${schoolInfo.primaryColor}12` : '#faf5ff',
                borderColor: schoolInfo?.primaryColor || '#1e40af'
              }}
            >
              <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Grade</div>
              <div className={`text-3xl font-bold mb-1 ${getGradeColor(parseFloat(report.percentage))}`}>
                {getGrade(parseFloat(report.percentage))}
              </div>
              <div className={`text-xs font-semibold ${parseFloat(report.percentage) >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(report.percentage) >= 50 ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>

          {/* Promotion Status (Third Term Only) */}
          {formData.term === 'Third Term' && report.promotionStatus && (
            <div className={`mb-6 p-5 border-2 rounded-lg ${report.promotionStatus.promoted ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
              <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 pb-2 uppercase tracking-wide">
                PROMOTION STATUS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Current Class:</span>
                  <span className="ml-2 text-gray-900 font-bold">{report.promotionStatus.fromClass}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className={`ml-2 font-bold ${report.promotionStatus.promoted ? 'text-green-600' : 'text-red-600'}`}>
                    {report.promotionStatus.promoted ? 'PROMOTED' : 'NOT PROMOTED'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Next Class:</span>
                  <span className="ml-2 text-gray-900 font-bold">{report.promotionStatus.toClass}</span>
                </div>
              </div>
            </div>
          )}

          {/* Remarks Section */}
          <div className="mb-6 p-5 border-2 rounded-lg" style={{ borderColor: schoolInfo?.secondaryColor || '#fbbf24', backgroundColor: schoolInfo?.secondaryColor ? `${schoolInfo.secondaryColor}10` : '#fef3c7' }}>
            <h3 
              className="text-lg font-bold text-gray-900 mb-3 border-b-2 pb-2 uppercase tracking-wide"
              style={{ borderColor: schoolInfo?.secondaryColor || '#fbbf24' }}
            >
              END OF TERM REMARKS
            </h3>
            {report.remarks.length > 0 ? (
              <div className="space-y-3">
                {report.remarks.map((remark: any, idx: number) => (
                  <div key={idx} className="text-sm text-gray-800 bg-white p-3 rounded border-l-4" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>
                    <p className="mb-1">
                      <span className="font-semibold">Class Teacher:</span> {remark.remark || remark.comment || 'No remark provided'}
                    </p>
                    {remark.teacherName && (
                      <p className="text-xs text-gray-600 italic mt-1">- {remark.teacherName}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 italic">No remarks available for this term.</p>
            )}
          </div>

          {/* Footer with Signatures */}
          <div className="mt-10 pt-6 border-t-2" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm mb-4">
              <div className="text-center">
                <div className="border-t-2 mt-16 pt-3" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>
                  <p className="font-bold text-gray-900 uppercase tracking-wide">Class Teacher</p>
                  <p className="text-xs text-gray-600 mt-2">Signature & Date</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 mt-16 pt-3" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>
                  <p className="font-bold text-gray-900 uppercase tracking-wide">Head of School</p>
                  <p className="text-xs text-gray-600 mt-2">Signature & Date</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 mt-16 pt-3" style={{ borderColor: schoolInfo?.primaryColor || '#1e40af' }}>
                  <p className="font-bold text-gray-900 uppercase tracking-wide">Parent/Guardian</p>
                  <p className="text-xs text-gray-600 mt-2">Signature & Date</p>
                </div>
              </div>
            </div>
            {schoolInfo?.registrationNumber && (
              <div className="mt-6 text-center text-xs text-gray-600 font-medium">
                Registration No: {schoolInfo.registrationNumber}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Student Academic Report</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Reports & Assessment</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Student Academic Report</span>
            </div>
          </div>
        </div>
      </div>

      {/* Report Generation Form */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Generate Report</h2>
        
        {/* Report Type Selection */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-900 text-sm">
            Report Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="reportType"
                value="individual"
                checked={formData.reportType === 'individual'}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Individual Student</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="reportType"
                value="class"
                checked={formData.reportType === 'class'}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Class/Classes</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {formData.reportType === 'individual' ? (
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Student <span className="text-red-500">*</span>
              </label>
              <div className="relative select-dropdown-wrapper">
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.studentId || student.id} - {student.firstName} {student.surname}
                    </option>
                  ))}
                </select>
                <div className="select-dropdown-arrow">
                  <div className="select-dropdown-arrow-icon">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="sm:col-span-3">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Select Class(es) <span className="text-red-500">*</span>
              </label>
              <select
                name="selectedClasses"
                multiple
                value={formData.selectedClasses}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[120px]"
                size={Math.min(classes.length, 8)}
              >
                {classes.map(className => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl (Windows) or Cmd (Mac) to select multiple classes</p>
            </div>
          )}

          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <div className="relative select-dropdown-wrapper">
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                required
                className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <div className="select-dropdown-arrow">
                <div className="select-dropdown-arrow-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">
              Term <span className="text-red-500">*</span>
            </label>
            <div className="relative select-dropdown-wrapper">
              <select
                name="term"
                value={formData.term}
                onChange={handleChange}
                required
                className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
              >
                <option value="">Select Term</option>
                {terms.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
              <div className="select-dropdown-arrow">
                <div className="select-dropdown-arrow-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleGenerateReport}
            disabled={loading || !formData.academicYear || !formData.term || (formData.reportType === 'individual' && !formData.studentId) || (formData.reportType === 'class' && formData.selectedClasses.length === 0)}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center"
          >
            <i className="fas fa-file-alt mr-2"></i>
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Reports Display */}
      {reports.length > 0 && (
        <div ref={printRef}>
          {reports.map((report, index) => renderReport(report, index))}
          
          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-200 no-print bg-white rounded-lg p-4 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                {reports.length} report(s) generated
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300"
                >
                  <i className="fas fa-download mr-2"></i>Export PDF
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <i className="fas fa-print mr-2"></i>Print {reports.length > 1 ? 'Reports' : 'Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StudentAcademicReport;
