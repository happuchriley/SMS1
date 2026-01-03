/**
 * Academic Service
 * Handles academic records, results, promotion, and reports
 */
import apiService from './api';

const RESULTS_TYPE = 'academicResults';
const PROMOTIONS_TYPE = 'studentPromotions';
const REMARKS_TYPE = 'endTermRemarks';
const FOOTNOTES_TYPE = 'reportFootnotes';
const COURSE_CLASS_TYPE = 'courseClassAssignments';
const COURSE_STUDENT_TYPE = 'courseStudentAssignments';

const academicService = {
  // Academic Results
  async getAllResults() {
    return await apiService.getAll(RESULTS_TYPE);
  },

  async getResultById(id) {
    return await apiService.getById(RESULTS_TYPE, id);
  },

  async createResult(resultData) {
    if (!resultData.studentId || !resultData.subject || !resultData.examType) {
      throw new Error('Student ID, subject, and exam type are required');
    }
    return await apiService.create(RESULTS_TYPE, resultData);
  },

  async updateResult(id, resultData) {
    return await apiService.update(RESULTS_TYPE, id, resultData);
  },

  async deleteResult(id) {
    return await apiService.delete(RESULTS_TYPE, id);
  },

  async getResultsByStudent(studentId) {
    return await apiService.query(RESULTS_TYPE, result => result.studentId === studentId);
  },

  async getResultsByClass(className, academicYear, term) {
    return await apiService.query(RESULTS_TYPE, result => 
      result.class === className &&
      (!academicYear || result.academicYear === academicYear) &&
      (!term || result.term === term)
    );
  },

  async getResultsBySubject(subject, academicYear, term) {
    return await apiService.query(RESULTS_TYPE, result => 
      result.subject === subject &&
      (!academicYear || result.academicYear === academicYear) &&
      (!term || result.term === term)
    );
  },

  async submitBulkResults(resultsData) {
    const results = [];
    for (const result of resultsData) {
      const created = await this.createResult(result);
      results.push(created);
    }
    return results;
  },

  // Student Promotions
  async getAllPromotions() {
    return await apiService.getAll(PROMOTIONS_TYPE);
  },

  async promoteStudents(promotionData) {
    if (!promotionData.fromClass || !promotionData.toClass) {
      throw new Error('From class and to class are required');
    }
    if (!promotionData.studentIds || promotionData.studentIds.length === 0) {
      throw new Error('At least one student must be selected');
    }

    const promotion = await apiService.create(PROMOTIONS_TYPE, promotionData);
    
    // Update student classes (this would require studentsService integration)
    // For now, we just store the promotion record
    
    return promotion;
  },

  async getPromotionsByAcademicYear(academicYear) {
    return await apiService.query(PROMOTIONS_TYPE, promo => promo.academicYear === academicYear);
  },

  // End of Term Remarks
  async getAllRemarks() {
    return await apiService.getAll(REMARKS_TYPE);
  },

  async createRemark(remarkData) {
    if (!remarkData.studentId) {
      throw new Error('Student ID is required');
    }
    return await apiService.create(REMARKS_TYPE, remarkData);
  },

  async updateRemark(id, remarkData) {
    return await apiService.update(REMARKS_TYPE, id, remarkData);
  },

  async getRemarksByStudent(studentId) {
    return await apiService.query(REMARKS_TYPE, remark => remark.studentId === studentId);
  },

  async getRemarksByClass(className, academicYear, term) {
    return await apiService.query(REMARKS_TYPE, remark => 
      remark.class === className &&
      (!academicYear || remark.academicYear === academicYear) &&
      (!term || remark.term === term)
    );
  },

  async submitBulkRemarks(remarksData) {
    const remarks = [];
    for (const remark of remarksData) {
      const created = await this.createRemark(remark);
      remarks.push(created);
    }
    return remarks;
  },

  // Report Footnotes
  async getAllFootnotes() {
    return await apiService.getAll(FOOTNOTES_TYPE);
  },

  async getFootnoteById(id) {
    return await apiService.getById(FOOTNOTES_TYPE, id);
  },

  async createFootnote(footnoteData) {
    if (!footnoteData.symbol || !footnoteData.text) {
      throw new Error('Symbol and text are required');
    }
    return await apiService.create(FOOTNOTES_TYPE, footnoteData);
  },

  async updateFootnote(id, footnoteData) {
    return await apiService.update(FOOTNOTES_TYPE, id, footnoteData);
  },

  async deleteFootnote(id) {
    return await apiService.delete(FOOTNOTES_TYPE, id);
  },

  // Course-Class Assignments
  async getAllCourseClassAssignments() {
    return await apiService.getAll(COURSE_CLASS_TYPE);
  },

  async assignCourseToClass(assignmentData) {
    if (!assignmentData.className || !assignmentData.courseId) {
      throw new Error('Class name and course ID are required');
    }
    
    // Check if assignment already exists
    const existing = await apiService.findOne(COURSE_CLASS_TYPE, ass => 
      ass.className === assignmentData.className && 
      ass.courseId === assignmentData.courseId &&
      ass.academicYear === assignmentData.academicYear &&
      ass.term === assignmentData.term
    );

    if (existing) {
      throw new Error('Course is already assigned to this class');
    }

    return await apiService.create(COURSE_CLASS_TYPE, assignmentData);
  },

  async getCoursesByClass(className, academicYear, term) {
    return await apiService.query(COURSE_CLASS_TYPE, ass => 
      ass.className === className &&
      (!academicYear || ass.academicYear === academicYear) &&
      (!term || ass.term === term)
    );
  },

  async deleteCourseClassAssignment(id) {
    return await apiService.delete(COURSE_CLASS_TYPE, id);
  },

  // Course-Student Assignments
  async getAllCourseStudentAssignments() {
    return await apiService.getAll(COURSE_STUDENT_TYPE);
  },

  async assignCourseToStudent(assignmentData) {
    if (!assignmentData.studentId || !assignmentData.courseId) {
      throw new Error('Student ID and course ID are required');
    }

    // Check if assignment already exists
    const existing = await apiService.findOne(COURSE_STUDENT_TYPE, ass => 
      ass.studentId === assignmentData.studentId && 
      ass.courseId === assignmentData.courseId &&
      ass.academicYear === assignmentData.academicYear &&
      ass.term === assignmentData.term
    );

    if (existing) {
      throw new Error('Course is already assigned to this student');
    }

    return await apiService.create(COURSE_STUDENT_TYPE, assignmentData);
  },

  async getCoursesByStudent(studentId, academicYear, term) {
    return await apiService.query(COURSE_STUDENT_TYPE, ass => 
      ass.studentId === studentId &&
      (!academicYear || ass.academicYear === academicYear) &&
      (!term || ass.term === term)
    );
  },

  async deleteCourseStudentAssignment(id) {
    return await apiService.delete(COURSE_STUDENT_TYPE, id);
  },

  // Generate Report Data
  async generateStudentReport(studentId, academicYear, term) {
    const results = await this.getResultsByStudent(studentId);
    const remarks = await this.getRemarksByStudent(studentId);
    const courses = await this.getCoursesByStudent(studentId, academicYear, term);

    // Filter by academic year and term
    const filteredResults = results.filter(r => 
      (!academicYear || r.academicYear === academicYear) &&
      (!term || r.term === term)
    );

    const filteredRemarks = remarks.filter(r => 
      (!academicYear || r.academicYear === academicYear) &&
      (!term || r.term === term)
    );

    // Calculate total marks and percentage
    const totalMarks = filteredResults.reduce((sum, r) => sum + (parseFloat(r.score) || 0), 0);
    const maxMarks = filteredResults.length * 100; // Assuming 100 is max per subject
    const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

    return {
      studentId,
      academicYear,
      term,
      courses,
      results: filteredResults,
      remarks: filteredRemarks,
      totalMarks,
      maxMarks,
      percentage: percentage.toFixed(2)
    };
  }
};

export default academicService;

