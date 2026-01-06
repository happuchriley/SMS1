/**
 * Demo Data Service
 * Provides demo/seed data for demonstration purposes
 */

import apiService from './api';

// Entity type constants
const STUDENTS_TYPE = 'students';
const STAFF_TYPE = 'staff';
const CLASSES_TYPE = 'classes';
const SUBJECTS_TYPE = 'subjects';
const BILL_ITEMS_TYPE = 'billItems';
const BILLS_TYPE = 'bills';
const PAYMENTS_TYPE = 'payments';
const RESULTS_TYPE = 'academicResults';
const NEWS_TYPE = 'news';
const DOCUMENTS_TYPE = 'documents';
const COURSES_TYPE = 'courses';
const SCHOOL_INFO_TYPE = 'schoolInfo';
const SYSTEM_SETTINGS_TYPE = 'systemSettings';
const ACADEMIC_SETTINGS_TYPE = 'academicSettings';

interface DemoDataService {
  seedAll(): Promise<void>;
  seedStudents(): Promise<void>;
  seedStaff(): Promise<void>;
  seedClasses(): Promise<void>;
  seedSubjects(): Promise<void>;
  seedBillItems(): Promise<void>;
  seedBills(): Promise<void>;
  seedPayments(): Promise<void>;
  seedResults(): Promise<void>;
  seedNews(): Promise<void>;
  seedDocuments(): Promise<void>;
  seedCourses(): Promise<void>;
  seedSchoolInfo(): Promise<void>;
  seedSystemSettings(): Promise<void>;
  seedAcademicSettings(): Promise<void>;
  clearAll(): Promise<void>;
}

const demoDataService: DemoDataService = {
  /**
   * Seed all demo data
   */
  async seedAll(): Promise<void> {
    try {
      console.log('🌱 Seeding demo data...');
      
      await this.seedSchoolInfo();
      await this.seedSystemSettings();
      await this.seedAcademicSettings();
      await this.seedClasses();
      await this.seedSubjects();
      await this.seedBillItems();
      await this.seedStudents();
      await this.seedStaff();
      await this.seedBills();
      await this.seedPayments();
      await this.seedResults();
      await this.seedNews();
      await this.seedDocuments();
      await this.seedCourses();
      
      console.log('✅ Demo data seeded successfully!');
    } catch (error) {
      console.error('❌ Error seeding demo data:', error);
      throw error;
    }
  },

  /**
   * Seed school information
   */
  async seedSchoolInfo(): Promise<void> {
    const hasData = await apiService.hasData(SCHOOL_INFO_TYPE);
    if (hasData) return;

    const schoolInfo = {
      id: 'school_001',
      name: 'BrainHub Academy',
      address: '123 Education Street, Accra, Ghana',
      phone: '+233 24 123 4567',
      email: 'info@brainhubacademy.edu.gh',
      website: 'www.brainhubacademy.edu.gh',
      logo: '',
      motto: 'Excellence in Education',
      establishedYear: '2015',
      registrationNumber: 'REG/EDU/2015/001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await apiService.saveAll(SCHOOL_INFO_TYPE, [schoolInfo]);
  },

  /**
   * Seed system settings
   */
  async seedSystemSettings(): Promise<void> {
    const hasData = await apiService.hasData(SYSTEM_SETTINGS_TYPE);
    if (hasData) return;

    const settings = {
      id: 'sys_001',
      schoolName: 'BrainHub Academy',
      currency: 'GHS',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      language: 'en',
      theme: 'light',
      enableNotifications: true,
      enableSMS: false,
      enableEmail: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await apiService.saveAll(SYSTEM_SETTINGS_TYPE, [settings]);
  },

  /**
   * Seed academic settings
   */
  async seedAcademicSettings(): Promise<void> {
    const hasData = await apiService.hasData(ACADEMIC_SETTINGS_TYPE);
    if (hasData) return;

    const settings = {
      id: 'acad_001',
      currentAcademicYear: '2024/2025',
      currentTerm: '1st Term',
      terms: ['1st Term', '2nd Term', '3rd Term'],
      gradingSystem: 'percentage',
      passMark: 50,
      maxScore: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await apiService.saveAll(ACADEMIC_SETTINGS_TYPE, [settings]);
  },

  /**
   * Seed classes
   */
  async seedClasses(): Promise<void> {
    const hasData = await apiService.hasData(CLASSES_TYPE);
    if (hasData) return;

    const classes = [
      { id: 'class_001', name: 'Nursery 1', level: 'Nursery', capacity: 25, currentEnrollment: 20 },
      { id: 'class_002', name: 'Nursery 2', level: 'Nursery', capacity: 25, currentEnrollment: 22 },
      { id: 'class_003', name: 'Basic 1', level: 'Primary', capacity: 30, currentEnrollment: 28 },
      { id: 'class_004', name: 'Basic 2', level: 'Primary', capacity: 30, currentEnrollment: 30 },
      { id: 'class_005', name: 'Basic 3', level: 'Primary', capacity: 30, currentEnrollment: 27 },
      { id: 'class_006', name: 'Basic 4', level: 'Primary', capacity: 30, currentEnrollment: 29 },
      { id: 'class_007', name: 'Basic 5', level: 'Primary', capacity: 30, currentEnrollment: 28 },
      { id: 'class_008', name: 'Basic 6', level: 'Primary', capacity: 30, currentEnrollment: 26 },
      { id: 'class_009', name: 'JHS 1', level: 'Junior High', capacity: 35, currentEnrollment: 32 },
      { id: 'class_010', name: 'JHS 2', level: 'Junior High', capacity: 35, currentEnrollment: 33 },
      { id: 'class_011', name: 'JHS 3', level: 'Junior High', capacity: 35, currentEnrollment: 31 }
    ].map(c => ({
      ...c,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    await apiService.saveAll(CLASSES_TYPE, classes);
  },

  /**
   * Seed subjects
   */
  async seedSubjects(): Promise<void> {
    const hasData = await apiService.hasData(SUBJECTS_TYPE);
    if (hasData) return;

    const subjects = [
      { id: 'subj_001', name: 'English Language', code: 'ENG', classes: ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'] },
      { id: 'subj_002', name: 'Mathematics', code: 'MATH', classes: ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'] },
      { id: 'subj_003', name: 'Science', code: 'SCI', classes: ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'] },
      { id: 'subj_004', name: 'Social Studies', code: 'SOC', classes: ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'] },
      { id: 'subj_005', name: 'Religious Studies', code: 'RME', classes: ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'] },
      { id: 'subj_006', name: 'French', code: 'FRE', classes: ['Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'] },
      { id: 'subj_007', name: 'Ghanaian Language', code: 'GHA', classes: ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'] },
      { id: 'subj_008', name: 'ICT', code: 'ICT', classes: ['Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'] },
      { id: 'subj_009', name: 'Creative Arts', code: 'CA', classes: ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6'] },
      { id: 'subj_010', name: 'Physical Education', code: 'PE', classes: ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'] },
      { id: 'subj_011', name: 'Home Economics', code: 'HE', classes: ['JHS 1', 'JHS 2', 'JHS 3'] },
      { id: 'subj_012', name: 'Agricultural Science', code: 'AGR', classes: ['JHS 1', 'JHS 2', 'JHS 3'] },
      { id: 'subj_013', name: 'Basic Design & Technology', code: 'BDT', classes: ['JHS 1', 'JHS 2', 'JHS 3'] }
    ].map(s => ({
      ...s,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    await apiService.saveAll(SUBJECTS_TYPE, subjects);
  },

  /**
   * Seed bill items
   */
  async seedBillItems(): Promise<void> {
    const hasData = await apiService.hasData(BILL_ITEMS_TYPE);
    if (hasData) return;

    const billItems = [
      { id: 'item_001', name: 'Tuition Fee', amount: '500.00', description: 'Termly tuition fee', category: 'Tuition' },
      { id: 'item_002', name: 'Registration Fee', amount: '100.00', description: 'New student registration', category: 'Registration' },
      { id: 'item_003', name: 'Library Fee', amount: '50.00', description: 'Library access fee', category: 'Facilities' },
      { id: 'item_004', name: 'Laboratory Fee', amount: '75.00', description: 'Science laboratory fee', category: 'Facilities' },
      { id: 'item_005', name: 'Sports Fee', amount: '30.00', description: 'Sports and games fee', category: 'Activities' },
      { id: 'item_006', name: 'Development Levy', amount: '200.00', description: 'School development levy', category: 'Development' },
      { id: 'item_007', name: 'PTA Dues', amount: '25.00', description: 'Parent-Teacher Association dues', category: 'Association' },
      { id: 'item_008', name: 'Examination Fee', amount: '40.00', description: 'Term examination fee', category: 'Examination' },
      { id: 'item_009', name: 'Uniform', amount: '150.00', description: 'School uniform', category: 'Uniform' },
      { id: 'item_010', name: 'Textbooks', amount: '120.00', description: 'Required textbooks', category: 'Books' }
    ].map(item => ({
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    await apiService.saveAll(BILL_ITEMS_TYPE, billItems);
  },

  /**
   * Seed students
   */
  async seedStudents(): Promise<void> {
    const hasData = await apiService.hasData(STUDENTS_TYPE);
    if (hasData) return;

    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Mary', 'Robert', 'Patricia', 'William', 'Linda', 'Richard', 'Barbara', 'Joseph', 'Elizabeth', 'Thomas', 'Jennifer', 'Charles', 'Maria'];
    const surnames = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    const classes = ['Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];
    const genders = ['Male', 'Female'];
    const statuses = ['active', 'active', 'active', 'active', 'active', 'inactive'];

    const students = Array.from({ length: 50 }, (_, i) => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const surname = surnames[Math.floor(Math.random() * surnames.length)];
      const studentClass = classes[Math.floor(Math.random() * classes.length)];
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const studentId = `STU${String(i + 1).padStart(3, '0')}`;

      return {
        id: `student_${i + 1}`,
        studentId,
        firstName,
        surname,
        otherNames: i % 3 === 0 ? firstNames[Math.floor(Math.random() * firstNames.length)] : undefined,
        class: studentClass,
        gender,
        dateOfBirth: new Date(2010 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        admissionDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        contact: `+233 24 ${Math.floor(Math.random() * 9000000) + 1000000}`,
        email: `${firstName.toLowerCase()}.${surname.toLowerCase()}@example.com`,
        address: `${Math.floor(Math.random() * 100) + 1} Street, Accra`,
        parentName: `Mr./Mrs. ${surnames[Math.floor(Math.random() * surnames.length)]}`,
        parentContact: `+233 24 ${Math.floor(Math.random() * 9000000) + 1000000}`,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    await apiService.saveAll(STUDENTS_TYPE, students);
  },

  /**
   * Seed staff
   */
  async seedStaff(): Promise<void> {
    const hasData = await apiService.hasData(STAFF_TYPE);
    if (hasData) return;

    const firstNames = ['Kwame', 'Ama', 'Kofi', 'Akosua', 'Yaw', 'Efua', 'Kojo', 'Adwoa', 'Kwabena', 'Abena', 'Fiifi', 'Akua', 'Kweku', 'Aba', 'Kobina', 'Esi'];
    const surnames = ['Mensah', 'Asante', 'Osei', 'Boateng', 'Darko', 'Owusu', 'Amoah', 'Appiah', 'Gyasi', 'Bonsu', 'Tetteh', 'Agyeman', 'Sarpong', 'Adjei', 'Ofori', 'Acheampong'];
    const positions = ['Headmaster', 'Deputy Headmaster', 'Senior Teacher', 'Teacher', 'Administrator', 'Accountant', 'Librarian', 'Nurse', 'Security'];
    const statuses = ['active', 'active', 'active', 'active', 'active', 'inactive'];

    const staff = Array.from({ length: 25 }, (_, i) => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const surname = surnames[Math.floor(Math.random() * surnames.length)];
      const position = positions[Math.floor(Math.random() * positions.length)];
      const department = position === 'Headmaster' || position === 'Deputy Headmaster' ? 'Administration' : 
                        position === 'Accountant' ? 'Finance' :
                        position === 'Librarian' || position === 'Nurse' || position === 'Security' ? 'Support' : 'Academic';
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const staffId = `STAFF${String(i + 1).padStart(3, '0')}`;

      return {
        id: `staff_${i + 1}`,
        staffId,
        firstName,
        surname,
        otherNames: i % 4 === 0 ? firstNames[Math.floor(Math.random() * firstNames.length)] : undefined,
        position,
        department,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        contact: `+233 24 ${Math.floor(Math.random() * 9000000) + 1000000}`,
        email: `${firstName.toLowerCase()}.${surname.toLowerCase()}@brainhubacademy.edu.gh`,
        employmentDate: new Date(2015 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    await apiService.saveAll(STAFF_TYPE, staff);
  },

  /**
   * Seed bills
   */
  async seedBills(): Promise<void> {
    const hasData = await apiService.hasData(BILLS_TYPE);
    if (hasData) return;

    const students = await apiService.getAll(STUDENTS_TYPE);
    const billItems = await apiService.getAll(BILL_ITEMS_TYPE);
    
    if (students.length === 0 || billItems.length === 0) return;

    const academicYears = ['2023/2024', '2024/2025'];
    const terms = ['1st Term', '2nd Term', '3rd Term'];
    const statuses = ['pending', 'pending', 'pending', 'paid', 'partial'];

    const bills = students.slice(0, 30).map((student: any, i: number) => {
      const selectedItems = billItems.slice(0, Math.floor(Math.random() * 5) + 3);
      const total = selectedItems.reduce((sum: number, item: any) => sum + parseFloat(item.amount || 0), 0);
      const paid = statuses[Math.floor(Math.random() * statuses.length)] === 'paid' ? total : 
                   statuses[Math.floor(Math.random() * statuses.length)] === 'partial' ? total * 0.5 : 0;
      const balance = total - paid;
      const status = balance === 0 ? 'paid' : paid > 0 ? 'partial' : 'pending';

      return {
        id: `bill_${i + 1}`,
        studentId: student.studentId || student.id,
        studentIds: undefined,
        academicYear: academicYears[Math.floor(Math.random() * academicYears.length)],
        term: terms[Math.floor(Math.random() * terms.length)],
        billDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        dueDate: new Date(2024, Math.floor(Math.random() * 12) + 1, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        items: selectedItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: 1,
          amount: parseFloat(item.amount || 0)
        })),
        total: total.toString(),
        paid: paid.toString(),
        balance: balance.toString(),
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    await apiService.saveAll(BILLS_TYPE, bills);
  },

  /**
   * Seed payments
   */
  async seedPayments(): Promise<void> {
    const hasData = await apiService.hasData(PAYMENTS_TYPE);
    if (hasData) return;

    const bills = await apiService.getAll(BILLS_TYPE);
    
    if (bills.length === 0) return;

    const paymentMethods = ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'];
    const paidBills = bills.filter((b: any) => b.status === 'paid' || b.status === 'partial');

    const payments = paidBills.slice(0, 20).map((bill: any, i: number) => {
      const amount = parseFloat(bill.paid || bill.total || 0);

      return {
        id: `payment_${i + 1}`,
        studentId: bill.studentId,
        billId: bill.id,
        amount: amount.toString(),
        paymentDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        receiptNumber: `RCP${String(i + 1).padStart(6, '0')}`,
        notes: 'Payment received',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    await apiService.saveAll(PAYMENTS_TYPE, payments);
  },

  /**
   * Seed academic results
   */
  async seedResults(): Promise<void> {
    const hasData = await apiService.hasData(RESULTS_TYPE);
    if (hasData) return;

    const students = await apiService.getAll(STUDENTS_TYPE);
    const subjects = await apiService.getAll(SUBJECTS_TYPE);
    
    if (students.length === 0 || subjects.length === 0) return;

    const academicYears = ['2023/2024', '2024/2025'];
    const terms = ['First Term', 'Second Term', 'Third Term'];

    const results = students.slice(0, 20).flatMap((student: any) => {
      const studentSubjects = subjects.filter((s: any) => 
        s.classes && s.classes.includes(student.class)
      ).slice(0, 5);

      return studentSubjects.map((subject: any) => {
        const score = Math.floor(Math.random() * 40) + 50; // 50-90 range

        return {
          id: `result_${student.id}_${subject.id}_${Date.now()}_${Math.random()}`,
          studentId: student.studentId || student.id,
          studentName: `${student.firstName} ${student.surname}`,
          class: student.class,
          subject: subject.name,
          examType: 'End of Term',
          academicYear: academicYears[Math.floor(Math.random() * academicYears.length)],
          term: terms[Math.floor(Math.random() * terms.length)],
          score: score.toString(),
          grade: score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F',
          remarks: score >= 80 ? 'Excellent' : score >= 70 ? 'Very Good' : score >= 60 ? 'Good' : score >= 50 ? 'Pass' : 'Fail',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });
    });

    await apiService.saveAll(RESULTS_TYPE, results);
  },

  /**
   * Seed news items
   */
  async seedNews(): Promise<void> {
    const hasData = await apiService.hasData(NEWS_TYPE);
    if (hasData) return;

    const newsItems = [
      {
        id: 'news_001',
        title: 'Welcome to the New Academic Year',
        content: 'We are excited to welcome all students and parents to the 2024/2025 academic year. We look forward to a successful year ahead.',
        category: 'Announcement',
        author: 'Headmaster',
        status: 'published',
        publishDate: new Date(2024, 8, 1).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'news_002',
        title: 'Parent-Teacher Association Meeting',
        content: 'The next PTA meeting will be held on the 15th of this month. All parents are encouraged to attend.',
        category: 'Event',
        author: 'PTA Secretary',
        status: 'published',
        publishDate: new Date(2024, 8, 5).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'news_003',
        title: 'Sports Day Announcement',
        content: 'Our annual sports day will be held next month. Students are encouraged to participate in various sporting activities.',
        category: 'Event',
        author: 'Sports Coordinator',
        status: 'published',
        publishDate: new Date(2024, 8, 10).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'news_004',
        title: 'Examination Schedule Released',
        content: 'The mid-term examination schedule has been released. Students should check the notice board for details.',
        category: 'Academic',
        author: 'Academic Coordinator',
        status: 'published',
        publishDate: new Date(2024, 8, 15).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'news_005',
        title: 'Library Opening Hours Extended',
        content: 'The school library will now be open from 7:00 AM to 6:00 PM on weekdays to better serve our students.',
        category: 'Announcement',
        author: 'Librarian',
        status: 'published',
        publishDate: new Date(2024, 8, 20).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    await apiService.saveAll(NEWS_TYPE, newsItems);
  },

  /**
   * Seed documents
   */
  async seedDocuments(): Promise<void> {
    const hasData = await apiService.hasData(DOCUMENTS_TYPE);
    if (hasData) return;

    const documents = [
      {
        id: 'doc_001',
        title: 'School Handbook 2024/2025',
        description: 'Complete school handbook with rules and regulations',
        fileName: 'school_handbook_2024.pdf',
        fileSize: '2.5 MB',
        categoryId: 'cat_001',
        uploadedBy: 'admin',
        isShared: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'doc_002',
        title: 'Academic Calendar',
        description: 'Academic calendar for the 2024/2025 academic year',
        fileName: 'academic_calendar_2024.pdf',
        fileSize: '500 KB',
        categoryId: 'cat_001',
        uploadedBy: 'admin',
        isShared: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'doc_003',
        title: 'Fee Structure',
        description: 'Complete fee structure for all classes',
        fileName: 'fee_structure_2024.pdf',
        fileSize: '1.2 MB',
        categoryId: 'cat_002',
        uploadedBy: 'admin',
        isShared: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    await apiService.saveAll(DOCUMENTS_TYPE, documents);
  },

  /**
   * Seed courses
   */
  async seedCourses(): Promise<void> {
    const hasData = await apiService.hasData(COURSES_TYPE);
    if (hasData) return;

    const courses = [
      {
        id: 'course_001',
        title: 'Introduction to Mathematics',
        code: 'MATH101',
        description: 'Basic mathematics course for beginners',
        instructor: 'Mr. Kofi Mensah',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'course_002',
        title: 'English Language Fundamentals',
        code: 'ENG101',
        description: 'Fundamental English language course',
        instructor: 'Mrs. Ama Asante',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'course_003',
        title: 'Science Basics',
        code: 'SCI101',
        description: 'Introduction to basic science concepts',
        instructor: 'Mr. Yaw Osei',
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    await apiService.saveAll(COURSES_TYPE, courses);
  },

  /**
   * Clear all demo data
   */
  async clearAll(): Promise<void> {
    try {
      console.log('🗑️ Clearing all demo data...');
      await apiService.clearAll();
      console.log('✅ All demo data cleared!');
    } catch (error) {
      console.error('❌ Error clearing demo data:', error);
      throw error;
    }
  }
};

export default demoDataService;

