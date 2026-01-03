/**
 * E-Learning Service
 * Handles courses, assignments, quizzes, and student progress
 */
import apiService from './api';

const COURSES_TYPE = 'courses';
const ASSIGNMENTS_TYPE = 'assignments';
const QUIZZES_TYPE = 'quizzes';
const STUDENT_PROGRESS_TYPE = 'studentProgress';
const ENROLLMENTS_TYPE = 'enrollments';

const elearningService = {
  // Courses Operations
  async getAllCourses() {
    return await apiService.getAll(COURSES_TYPE);
  },

  async getCourseById(id) {
    return await apiService.getById(COURSES_TYPE, id);
  },

  async createCourse(courseData) {
    if (!courseData.title || !courseData.code) {
      throw new Error('Course title and code are required');
    }

    if (!courseData.status) {
      courseData.status = 'draft';
    }

    return await apiService.create(COURSES_TYPE, courseData);
  },

  async updateCourse(id, courseData) {
    return await apiService.update(COURSES_TYPE, id, courseData);
  },

  async deleteCourse(id) {
    return await apiService.delete(COURSES_TYPE, id);
  },

  async searchCourses(searchTerm) {
    const term = searchTerm.toLowerCase();
    return await apiService.query(COURSES_TYPE, course => 
      course.title.toLowerCase().includes(term) ||
      course.code.toLowerCase().includes(term) ||
      (course.description && course.description.toLowerCase().includes(term))
    );
  },

  async getPublishedCourses() {
    return await apiService.query(COURSES_TYPE, course => course.status === 'published');
  },

  async toggleCourseStatus(id) {
    const course = await this.getCourseById(id);
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    return await this.updateCourse(id, { status: newStatus });
  },

  // Enrollments
  async enrollStudent(courseId, studentId) {
    const existing = await apiService.findOne(ENROLLMENTS_TYPE, e => 
      e.courseId === courseId && e.studentId === studentId
    );

    if (existing) {
      throw new Error('Student is already enrolled in this course');
    }

    return await apiService.create(ENROLLMENTS_TYPE, {
      courseId,
      studentId,
      enrolledAt: new Date().toISOString(),
      status: 'active'
    });
  },

  async getEnrollmentsByCourse(courseId) {
    return await apiService.query(ENROLLMENTS_TYPE, e => e.courseId === courseId);
  },

  async getEnrollmentsByStudent(studentId) {
    return await apiService.query(ENROLLMENTS_TYPE, e => e.studentId === studentId);
  },

  // Assignments Operations
  async getAllAssignments() {
    return await apiService.getAll(ASSIGNMENTS_TYPE);
  },

  async getAssignmentById(id) {
    return await apiService.getById(ASSIGNMENTS_TYPE, id);
  },

  async createAssignment(assignmentData) {
    if (!assignmentData.title || !assignmentData.courseId) {
      throw new Error('Assignment title and course ID are required');
    }
    return await apiService.create(ASSIGNMENTS_TYPE, assignmentData);
  },

  async updateAssignment(id, assignmentData) {
    return await apiService.update(ASSIGNMENTS_TYPE, id, assignmentData);
  },

  async deleteAssignment(id) {
    return await apiService.delete(ASSIGNMENTS_TYPE, id);
  },

  async getAssignmentsByCourse(courseId) {
    return await apiService.query(ASSIGNMENTS_TYPE, a => a.courseId === courseId);
  },

  async getAssignmentsByStudent(studentId) {
    return await apiService.query(ASSIGNMENTS_TYPE, a => a.studentId === studentId);
  },

  // Quizzes Operations
  async getAllQuizzes() {
    return await apiService.getAll(QUIZZES_TYPE);
  },

  async getQuizById(id) {
    return await apiService.getById(QUIZZES_TYPE, id);
  },

  async createQuiz(quizData) {
    if (!quizData.title || !quizData.courseId) {
      throw new Error('Quiz title and course ID are required');
    }
    return await apiService.create(QUIZZES_TYPE, quizData);
  },

  async updateQuiz(id, quizData) {
    return await apiService.update(QUIZZES_TYPE, id, quizData);
  },

  async deleteQuiz(id) {
    return await apiService.delete(QUIZZES_TYPE, id);
  },

  async getQuizzesByCourse(courseId) {
    return await apiService.query(QUIZZES_TYPE, q => q.courseId === courseId);
  },

  // Student Progress
  async getAllProgress() {
    return await apiService.getAll(STUDENT_PROGRESS_TYPE);
  },

  async getProgressById(id) {
    return await apiService.getById(STUDENT_PROGRESS_TYPE, id);
  },

  async createProgress(progressData) {
    if (!progressData.studentId || !progressData.courseId) {
      throw new Error('Student ID and course ID are required');
    }
    return await apiService.create(STUDENT_PROGRESS_TYPE, progressData);
  },

  async updateProgress(id, progressData) {
    return await apiService.update(STUDENT_PROGRESS_TYPE, id, progressData);
  },

  async getProgressByStudent(studentId) {
    return await apiService.query(STUDENT_PROGRESS_TYPE, p => p.studentId === studentId);
  },

  async getProgressByCourse(courseId) {
    return await apiService.query(STUDENT_PROGRESS_TYPE, p => p.courseId === courseId);
  },

  async calculateProgress(studentId, courseId) {
    const enrollments = await this.getEnrollmentsByStudent(studentId);
    const enrollment = enrollments.find(e => e.courseId === courseId);
    
    if (!enrollment) {
      return { completion: 0, assignmentsCompleted: 0, totalAssignments: 0 };
    }

    const assignments = await this.getAssignmentsByCourse(courseId);
    const progress = await apiService.query(STUDENT_PROGRESS_TYPE, p => 
      p.studentId === studentId && p.courseId === courseId
    );

    const completedAssignments = assignments.filter(a => 
      progress.some(p => p.assignmentId === a.id && p.completed)
    );

    const completion = assignments.length > 0 
      ? (completedAssignments.length / assignments.length) * 100 
      : 0;

    return {
      completion: completion.toFixed(2),
      assignmentsCompleted: completedAssignments.length,
      totalAssignments: assignments.length,
      lastActivity: progress.length > 0 ? progress[progress.length - 1].updatedAt : null
    };
  }
};

export default elearningService;

