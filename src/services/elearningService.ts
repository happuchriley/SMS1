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

interface CourseData {
  title: string;
  code: string;
  status?: string;
  description?: string;
  [key: string]: any;
}

interface AssignmentData {
  title: string;
  courseId: string;
  studentId?: string;
  [key: string]: any;
}

interface QuizData {
  title: string;
  courseId: string;
  [key: string]: any;
}

interface ProgressData {
  studentId: string;
  courseId: string;
  assignmentId?: string;
  completed?: boolean;
  updatedAt?: string;
  [key: string]: any;
}

interface EnrollmentData {
  courseId: string;
  studentId: string;
  enrolledAt: string;
  status: string;
  [key: string]: any;
}

interface ProgressCalculation {
  completion: string;
  assignmentsCompleted: number;
  totalAssignments: number;
  lastActivity: string | null;
}

const elearningService = {
  // Courses Operations
  async getAllCourses(): Promise<(CourseData & { id: string })[]> {
    return await apiService.getAll<CourseData & { id: string }>(COURSES_TYPE);
  },

  async getCourseById(id: string): Promise<CourseData & { id: string }> {
    return await apiService.getById<CourseData & { id: string }>(COURSES_TYPE, id);
  },

  async createCourse(courseData: CourseData): Promise<CourseData & { id: string }> {
    if (!courseData.title || !courseData.code) {
      throw new Error('Course title and code are required');
    }

    if (!courseData.status) {
      courseData.status = 'draft';
    }

    return await apiService.create<CourseData & { id: string }>(COURSES_TYPE, courseData);
  },

  async updateCourse(id: string, courseData: Partial<CourseData>): Promise<CourseData & { id: string }> {
    return await apiService.update<CourseData & { id: string }>(COURSES_TYPE, id, courseData);
  },

  async deleteCourse(id: string): Promise<void> {
    await apiService.delete(COURSES_TYPE, id);
  },

  async searchCourses(searchTerm: string): Promise<(CourseData & { id: string })[]> {
    const term = searchTerm.toLowerCase();
    return await apiService.query<CourseData & { id: string }>(COURSES_TYPE, (course: CourseData & { id: string }) => 
      (course.title ? course.title.toLowerCase().includes(term) : false) ||
      (course.code ? course.code.toLowerCase().includes(term) : false) ||
      (course.description ? course.description.toLowerCase().includes(term) : false)
    );
  },

  async getPublishedCourses(): Promise<(CourseData & { id: string })[]> {
    return await apiService.query<CourseData & { id: string }>(COURSES_TYPE, (course: CourseData & { id: string }) => course.status === 'published');
  },

  async toggleCourseStatus(id: string): Promise<CourseData & { id: string }> {
    const course = await this.getCourseById(id);
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    return await this.updateCourse(id, { status: newStatus });
  },

  // Enrollments
  async enrollStudent(courseId: string, studentId: string): Promise<EnrollmentData & { id: string }> {
    const existing = await apiService.findOne<EnrollmentData & { id: string }>(ENROLLMENTS_TYPE, (e: EnrollmentData & { id: string }) => 
      e.courseId === courseId && e.studentId === studentId
    );

    if (existing) {
      throw new Error('Student is already enrolled in this course');
    }

    return await apiService.create<EnrollmentData & { id: string }>(ENROLLMENTS_TYPE, {
      courseId,
      studentId,
      enrolledAt: new Date().toISOString(),
      status: 'active'
    });
  },

  async getEnrollmentsByCourse(courseId: string): Promise<(EnrollmentData & { id: string })[]> {
    return await apiService.query<EnrollmentData & { id: string }>(ENROLLMENTS_TYPE, (e: EnrollmentData & { id: string }) => e.courseId === courseId);
  },

  async getEnrollmentsByStudent(studentId: string): Promise<(EnrollmentData & { id: string })[]> {
    return await apiService.query<EnrollmentData & { id: string }>(ENROLLMENTS_TYPE, (e: EnrollmentData & { id: string }) => e.studentId === studentId);
  },

  // Assignments Operations
  async getAllAssignments(): Promise<(AssignmentData & { id: string })[]> {
    return await apiService.getAll<AssignmentData & { id: string }>(ASSIGNMENTS_TYPE);
  },

  async getAssignmentById(id: string): Promise<AssignmentData & { id: string }> {
    return await apiService.getById<AssignmentData & { id: string }>(ASSIGNMENTS_TYPE, id);
  },

  async createAssignment(assignmentData: AssignmentData): Promise<AssignmentData & { id: string }> {
    if (!assignmentData.title || !assignmentData.courseId) {
      throw new Error('Assignment title and course ID are required');
    }
    return await apiService.create<AssignmentData & { id: string }>(ASSIGNMENTS_TYPE, assignmentData);
  },

  async updateAssignment(id: string, assignmentData: Partial<AssignmentData>): Promise<AssignmentData & { id: string }> {
    return await apiService.update<AssignmentData & { id: string }>(ASSIGNMENTS_TYPE, id, assignmentData);
  },

  async deleteAssignment(id: string): Promise<void> {
    await apiService.delete(ASSIGNMENTS_TYPE, id);
  },

  async getAssignmentsByCourse(courseId: string): Promise<(AssignmentData & { id: string })[]> {
    return await apiService.query<AssignmentData & { id: string }>(ASSIGNMENTS_TYPE, (a: AssignmentData & { id: string }) => a.courseId === courseId);
  },

  async getAssignmentsByStudent(studentId: string): Promise<(AssignmentData & { id: string })[]> {
    return await apiService.query<AssignmentData & { id: string }>(ASSIGNMENTS_TYPE, (a: AssignmentData & { id: string }) => a.studentId === studentId);
  },

  // Quizzes Operations
  async getAllQuizzes(): Promise<(QuizData & { id: string })[]> {
    return await apiService.getAll<QuizData & { id: string }>(QUIZZES_TYPE);
  },

  async getQuizById(id: string): Promise<QuizData & { id: string }> {
    return await apiService.getById<QuizData & { id: string }>(QUIZZES_TYPE, id);
  },

  async createQuiz(quizData: QuizData): Promise<QuizData & { id: string }> {
    if (!quizData.title || !quizData.courseId) {
      throw new Error('Quiz title and course ID are required');
    }
    return await apiService.create<QuizData & { id: string }>(QUIZZES_TYPE, quizData);
  },

  async updateQuiz(id: string, quizData: Partial<QuizData>): Promise<QuizData & { id: string }> {
    return await apiService.update<QuizData & { id: string }>(QUIZZES_TYPE, id, quizData);
  },

  async deleteQuiz(id: string): Promise<void> {
    await apiService.delete(QUIZZES_TYPE, id);
  },

  async getQuizzesByCourse(courseId: string): Promise<(QuizData & { id: string })[]> {
    return await apiService.query<QuizData & { id: string }>(QUIZZES_TYPE, (q: QuizData & { id: string }) => q.courseId === courseId);
  },

  // Student Progress
  async getAllProgress(): Promise<(ProgressData & { id: string })[]> {
    return await apiService.getAll<ProgressData & { id: string }>(STUDENT_PROGRESS_TYPE);
  },

  async getProgressById(id: string): Promise<ProgressData & { id: string }> {
    return await apiService.getById<ProgressData & { id: string }>(STUDENT_PROGRESS_TYPE, id);
  },

  async createProgress(progressData: ProgressData): Promise<ProgressData & { id: string }> {
    if (!progressData.studentId || !progressData.courseId) {
      throw new Error('Student ID and course ID are required');
    }
    return await apiService.create<ProgressData & { id: string }>(STUDENT_PROGRESS_TYPE, progressData);
  },

  async updateProgress(id: string, progressData: Partial<ProgressData>): Promise<ProgressData & { id: string }> {
    return await apiService.update<ProgressData & { id: string }>(STUDENT_PROGRESS_TYPE, id, progressData);
  },

  async getProgressByStudent(studentId: string): Promise<(ProgressData & { id: string })[]> {
    return await apiService.query<ProgressData & { id: string }>(STUDENT_PROGRESS_TYPE, (p: ProgressData & { id: string }) => p.studentId === studentId);
  },

  async getProgressByCourse(courseId: string): Promise<(ProgressData & { id: string })[]> {
    return await apiService.query<ProgressData & { id: string }>(STUDENT_PROGRESS_TYPE, (p: ProgressData & { id: string }) => p.courseId === courseId);
  },

  async calculateProgress(studentId: string, courseId: string): Promise<ProgressCalculation> {
    const enrollments = await this.getEnrollmentsByStudent(studentId);
    const enrollment = enrollments.find((e: EnrollmentData & { id: string }) => e.courseId === courseId);
    
    if (!enrollment) {
      return { completion: '0', assignmentsCompleted: 0, totalAssignments: 0, lastActivity: null };
    }

    const assignments = await this.getAssignmentsByCourse(courseId);
    const progress = await apiService.query<ProgressData & { id: string }>(STUDENT_PROGRESS_TYPE, (p: ProgressData & { id: string }) => 
      p.studentId === studentId && p.courseId === courseId
    );

    const completedAssignments = assignments.filter((a: AssignmentData & { id: string }) => 
      progress.some((p: ProgressData & { id: string }) => p.assignmentId === a.id && p.completed)
    );

    const completion = assignments.length > 0 
      ? (completedAssignments.length / assignments.length) * 100 
      : 0;

    return {
      completion: completion.toFixed(2),
      assignmentsCompleted: completedAssignments.length,
      totalAssignments: assignments.length,
      lastActivity: progress.length > 0 ? (progress[progress.length - 1].updatedAt || null) : null
    };
  }
};

export default elearningService;

