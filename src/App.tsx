import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AddStudent from "./pages/students/AddStudent";
import StudentsListAll from "./pages/students/StudentsListAll";
import StudentsListActive from "./pages/students/StudentsListActive";
import StudentsListInactive from "./pages/students/StudentsListInactive";
import FreshStudents from "./pages/students/FreshStudents";
import ClassList from "./pages/students/ClassList";
import ParentsList from "./pages/students/ParentsList";
import StudentsMenu from "./pages/students/StudentsMenu";
import AddStaff from "./pages/staff/AddStaff";
import StaffListAll from "./pages/staff/StaffListAll";
import StaffListActive from "./pages/staff/StaffListActive";
import StaffListNew from "./pages/staff/StaffListNew";
import StaffListInactive from "./pages/staff/StaffListInactive";
import StaffRestriction from "./pages/staff/StaffRestriction";
import SetupSalaryStructure from "./pages/staff/SetupSalaryStructure";
import PayReports from "./pages/staff/PayReports";
import StaffMenu from "./pages/staff/StaffMenu";
import Profile from "./pages/Profile";
// Reports & Assessment
import ReportsMenu from "./pages/reports/ReportsMenu";
import PopulateCourseClass from "./pages/reports/PopulateCourseClass";
import PopulateCourseStudent from "./pages/reports/PopulateCourseStudent";
import EnterAcademicResult from "./pages/reports/EnterAcademicResult";
import StudentPromotion from "./pages/reports/StudentPromotion";
import EndTermRemark from "./pages/reports/EndTermRemark";
import ReportsFootnote from "./pages/reports/ReportsFootnote";
import PrintGroupReport from "./pages/reports/PrintGroupReport";
import StudentAcademicReport from "./pages/reports/StudentAcademicReport";
// Billing
import BillingMenu from "./pages/billing/BillingMenu";
import CreateSingleBill from "./pages/billing/CreateSingleBill";
import CreateGroupBill from "./pages/billing/CreateGroupBill";
import ScholarshipList from "./pages/billing/ScholarshipList";
import BillingDebtorsReport from "./pages/billing/DebtorsReport";
import BillingCreditorsReport from "./pages/billing/CreditorsReport";
import PrintGroupBill from "./pages/billing/PrintGroupBill";
import PrintGroupStatement from "./pages/billing/PrintGroupStatement";
// Fee Collection
import FeeCollectionMenu from "./pages/fee-collection/FeeCollectionMenu";
import RecordSingle from "./pages/fee-collection/RecordSingle";
import RecordAll from "./pages/fee-collection/RecordAll";
import ManageOtherFees from "./pages/fee-collection/ManageOtherFees";
import RecordOtherFee from "./pages/fee-collection/RecordOtherFee";
import ReceiveOtherFee from "./pages/fee-collection/ReceiveOtherFee";
import FeeCollectionDebtorsReport from "./pages/fee-collection/DebtorsReport";
import FeeCollectionCreditorsReport from "./pages/fee-collection/CreditorsReport";
import FeeCollectionPrintGroupBill from "./pages/fee-collection/PrintGroupBill";
import FeeCollectionPrintGroupStatement from "./pages/fee-collection/PrintGroupStatement";
// Payroll
import PayrollMenu from "./pages/payroll/PayrollMenu";
import PayrollOverview from "./pages/payroll/PayrollOverview";
import GeneratePayslip from "./pages/payroll/GeneratePayslip";
import PayrollSchedule from "./pages/payroll/PayrollSchedule";
import BankSchedule from "./pages/payroll/BankSchedule";
import TaxReports from "./pages/payroll/TaxReports";
import SalaryAdvances from "./pages/payroll/SalaryAdvances";
// Finance Entries
import FinanceMenu from "./pages/finance/FinanceMenu";
import DebtorEntry from "./pages/finance/DebtorEntry";
import CreditorEntry from "./pages/finance/CreditorEntry";
import IncomeEntry from "./pages/finance/IncomeEntry";
import ExpenseEntry from "./pages/finance/ExpenseEntry";
import GeneralJournal from "./pages/finance/GeneralJournal";
import GeneralLedger from "./pages/finance/GeneralLedger";
import FixedAsset from "./pages/finance/FixedAsset";
// Financial Reports
import FinancialReportsMenu from "./pages/financial-reports/FinancialReportsMenu";
import FeeCollectionReport from "./pages/financial-reports/FeeCollectionReport";
import OtherFeeAll from "./pages/financial-reports/OtherFeeAll";
import OtherFeeRange from "./pages/financial-reports/OtherFeeRange";
import ExpenditureReport from "./pages/financial-reports/ExpenditureReport";
import FinancialReportsDebtorsReport from "./pages/financial-reports/DebtorsReport";
import FinancialReportsCreditorsReport from "./pages/financial-reports/CreditorsReport";
import GenerateLedger from "./pages/financial-reports/GenerateLedger";
import TrialBalance from "./pages/financial-reports/TrialBalance";
import IncomeStatement from "./pages/financial-reports/IncomeStatement";
import ChartOfAccounts from "./pages/financial-reports/ChartOfAccounts";
// SMS/Email Reminders
import RemindersMenu from "./pages/reminders/RemindersMenu";
import BillReminder from "./pages/reminders/BillReminder";
import PaymentNotification from "./pages/reminders/PaymentNotification";
import ApplicationDetails from "./pages/reminders/ApplicationDetails";
import EventReminder from "./pages/reminders/EventReminder";
import StaffReminder from "./pages/reminders/StaffReminder";
// News/Notice
import NewsMenu from "./pages/news/NewsMenu";
import AddNews from "./pages/news/AddNews";
import NewsPage from "./pages/news/NewsPage";
import AcademicCalendar from "./pages/news/AcademicCalendar";
// TLMs
import TLMsMenu from "./pages/tlms/TLMsMenu";
import TLMsLibrary from "./pages/tlms/TLMsLibrary";
import UploadTLMs from "./pages/tlms/UploadTLMs";
import TLMsCategories from "./pages/tlms/TLMsCategories";
import DownloadTlm from "./pages/tlms/DownloadTlm";
import MyMaterials from "./pages/tlms/MyMaterials";
import ManageTlm from "./pages/tlms/ManageTlm";
import ViewTlm from "./pages/tlms/ViewTlm";
// E-Learning
import ELearningMenu from "./pages/elearning/ELearningMenu";
import Courses from "./pages/elearning/Courses";
import ManageCourses from "./pages/elearning/ManageCourses";
import CreateCourse from "./pages/elearning/CreateCourse";
import Assignments from "./pages/elearning/Assignments";
import CreateAssignment from "./pages/elearning/CreateAssignment";
import Quizzes from "./pages/elearning/Quizzes";
import QuizHome from "./pages/elearning/QuizHome";
import CreateQuiz from "./pages/elearning/CreateQuiz";
import TakeQuiz from "./pages/elearning/TakeQuiz";
import QuizResults from "./pages/elearning/QuizResults";
import StudentProgress from "./pages/elearning/StudentProgress";
import ViewCourses from "./pages/elearning/ViewCourses";
import MyCourses from "./pages/elearning/MyCourses";
// School Setup
import SetupMenu from "./pages/setup/SetupMenu";
import SchoolDetails from "./pages/setup/SchoolDetails";
// Documents
import DocumentsMenu from "./pages/documents/DocumentsMenu";
import MyUploads from "./pages/documents/MyUploads";
import SharedDocuments from "./pages/documents/SharedDocuments";
import DocumentCategories from "./pages/documents/DocumentCategories";
import RecentDocuments from "./pages/documents/RecentDocuments";
import UploadDocument from "./pages/documents/UploadDocument";
import MyDocuments from "./pages/documents/MyDocuments";
import DownloadHistory from "./pages/documents/DownloadHistory";
// School Setup additional pages
import ItemSetup from "./pages/setup/ItemSetup";
import SetupClassList from "./pages/setup/ClassList";
import SubjectCourse from "./pages/setup/SubjectCourse";
import BillItem from "./pages/setup/BillItem";
import SystemSettings from "./pages/setup/SystemSettings";
import AcademicSettings from "./pages/setup/AcademicSettings";
import ManageSubjects from "./pages/setup/ManageSubjects";
import ManageClasses from "./pages/setup/ManageClasses";
import PrivateRoute from "./components/PrivateRoute";
import { ModalProvider } from "./components/ModalProvider";

const App: React.FC = () => {
  return (
    <ModalProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher-dashboard"
          element={
            <PrivateRoute>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <PrivateRoute>
              <StudentDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/students/add"
          element={
            <PrivateRoute>
              <AddStudent />
            </PrivateRoute>
          }
        />
        <Route
          path="/students/all"
          element={
            <PrivateRoute>
              <StudentsListAll />
            </PrivateRoute>
          }
        />
        <Route
          path="/students/active"
          element={
            <PrivateRoute>
              <StudentsListActive />
            </PrivateRoute>
          }
        />
        <Route
          path="/students/inactive"
          element={
            <PrivateRoute>
              <StudentsListInactive />
            </PrivateRoute>
          }
        />
        <Route
          path="/students/fresh"
          element={
            <PrivateRoute>
              <FreshStudents />
            </PrivateRoute>
          }
        />
        <Route
          path="/students/classes"
          element={
            <PrivateRoute>
              <ClassList />
            </PrivateRoute>
          }
        />
        <Route
          path="/students/parents"
          element={
            <PrivateRoute>
              <ParentsList />
            </PrivateRoute>
          }
        />
        <Route
          path="/students/menu"
          element={
            <PrivateRoute>
              <StudentsMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/add"
          element={
            <PrivateRoute>
              <AddStaff />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/all"
          element={
            <PrivateRoute>
              <StaffListAll />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/active"
          element={
            <PrivateRoute>
              <StaffListActive />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/new"
          element={
            <PrivateRoute>
              <StaffListNew />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/inactive"
          element={
            <PrivateRoute>
              <StaffListInactive />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/restriction"
          element={
            <PrivateRoute>
              <StaffRestriction />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/salary-structure"
          element={
            <PrivateRoute>
              <SetupSalaryStructure />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/pay-reports"
          element={
            <PrivateRoute>
              <PayReports />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/menu"
          element={
            <PrivateRoute>
              <StaffMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        {/* Reports & Assessment */}
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <ReportsMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/populate-course-class"
          element={
            <PrivateRoute>
              <PopulateCourseClass />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/populate-course-student"
          element={
            <PrivateRoute>
              <PopulateCourseStudent />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/enter-academic-result"
          element={
            <PrivateRoute>
              <EnterAcademicResult />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/student-promotion"
          element={
            <PrivateRoute>
              <StudentPromotion />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/end-term-remark"
          element={
            <PrivateRoute>
              <EndTermRemark />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/footnote"
          element={
            <PrivateRoute>
              <ReportsFootnote />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/student-academic-report"
          element={
            <PrivateRoute>
              <StudentAcademicReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/print-group-report"
          element={
            <PrivateRoute>
              <PrintGroupReport />
            </PrivateRoute>
          }
        />
        {/* Billing */}
        <Route
          path="/billing"
          element={
            <PrivateRoute>
              <BillingMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/billing/create-single"
          element={
            <PrivateRoute>
              <CreateSingleBill />
            </PrivateRoute>
          }
        />
        <Route
          path="/billing/create-group"
          element={
            <PrivateRoute>
              <CreateGroupBill />
            </PrivateRoute>
          }
        />
        <Route
          path="/billing/scholarship-list"
          element={
            <PrivateRoute>
              <ScholarshipList />
            </PrivateRoute>
          }
        />
        <Route
          path="/billing/debtors-report"
          element={
            <PrivateRoute>
              <BillingDebtorsReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/billing/creditors-report"
          element={
            <PrivateRoute>
              <BillingCreditorsReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/billing/print-group-bill"
          element={
            <PrivateRoute>
              <PrintGroupBill />
            </PrivateRoute>
          }
        />
        <Route
          path="/billing/print-group-statement"
          element={
            <PrivateRoute>
              <PrintGroupStatement />
            </PrivateRoute>
          }
        />
        {/* Fee Collection */}
        <Route
          path="/fee-collection"
          element={
            <PrivateRoute>
              <FeeCollectionMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/fee-collection/record-single"
          element={
            <PrivateRoute>
              <RecordSingle />
            </PrivateRoute>
          }
        />
        <Route
          path="/fee-collection/record-all"
          element={
            <PrivateRoute>
              <RecordAll />
            </PrivateRoute>
          }
        />
        <Route
          path="/fee-collection/manage-other-fees"
          element={
            <PrivateRoute>
              <ManageOtherFees />
            </PrivateRoute>
          }
        />
        <Route
          path="/fee-collection/record-other-fee"
          element={
            <PrivateRoute>
              <RecordOtherFee />
            </PrivateRoute>
          }
        />
        <Route
          path="/fee-collection/receive-other-fee"
          element={
            <PrivateRoute>
              <ReceiveOtherFee />
            </PrivateRoute>
          }
        />
        <Route
          path="/fee-collection/debtors-report"
          element={
            <PrivateRoute>
              <FeeCollectionDebtorsReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/fee-collection/creditors-report"
          element={
            <PrivateRoute>
              <FeeCollectionCreditorsReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/fee-collection/print-group-bill"
          element={
            <PrivateRoute>
              <FeeCollectionPrintGroupBill />
            </PrivateRoute>
          }
        />
        <Route
          path="/fee-collection/print-group-statement"
          element={
            <PrivateRoute>
              <FeeCollectionPrintGroupStatement />
            </PrivateRoute>
          }
        />
        {/* Payroll */}
        <Route
          path="/payroll"
          element={
            <PrivateRoute>
              <PayrollMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/payroll/overview"
          element={
            <PrivateRoute>
              <PayrollOverview />
            </PrivateRoute>
          }
        />
        <Route
          path="/payroll/generate-payslip"
          element={
            <PrivateRoute>
              <GeneratePayslip />
            </PrivateRoute>
          }
        />
        <Route
          path="/payroll/schedule"
          element={
            <PrivateRoute>
              <PayrollSchedule />
            </PrivateRoute>
          }
        />
        <Route
          path="/payroll/bank-schedule"
          element={
            <PrivateRoute>
              <BankSchedule />
            </PrivateRoute>
          }
        />
        <Route
          path="/payroll/tax-reports"
          element={
            <PrivateRoute>
              <TaxReports />
            </PrivateRoute>
          }
        />
        <Route
          path="/payroll/advances"
          element={
            <PrivateRoute>
              <SalaryAdvances />
            </PrivateRoute>
          }
        />
        {/* Finance Entries */}
        <Route
          path="/finance"
          element={
            <PrivateRoute>
              <FinanceMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/finance/debtor-entry"
          element={
            <PrivateRoute>
              <DebtorEntry />
            </PrivateRoute>
          }
        />
        <Route
          path="/finance/creditor-entry"
          element={
            <PrivateRoute>
              <CreditorEntry />
            </PrivateRoute>
          }
        />
        <Route
          path="/finance/income-entry"
          element={
            <PrivateRoute>
              <IncomeEntry />
            </PrivateRoute>
          }
        />
        <Route
          path="/finance/expense-entry"
          element={
            <PrivateRoute>
              <ExpenseEntry />
            </PrivateRoute>
          }
        />
        <Route
          path="/finance/general-journal"
          element={
            <PrivateRoute>
              <GeneralJournal />
            </PrivateRoute>
          }
        />
        <Route
          path="/finance/general-ledger"
          element={
            <PrivateRoute>
              <GeneralLedger />
            </PrivateRoute>
          }
        />
        <Route
          path="/finance/fixed-asset"
          element={
            <PrivateRoute>
              <FixedAsset />
            </PrivateRoute>
          }
        />
        {/* Financial Reports */}
        <Route
          path="/financial-reports"
          element={
            <PrivateRoute>
              <FinancialReportsMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/financial-reports/fee-collection"
          element={
            <PrivateRoute>
              <FeeCollectionReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/financial-reports/other-fee-all"
          element={
            <PrivateRoute>
              <OtherFeeAll />
            </PrivateRoute>
          }
        />
        <Route
          path="/financial-reports/other-fee-range"
          element={
            <PrivateRoute>
              <OtherFeeRange />
            </PrivateRoute>
          }
        />
        <Route
          path="/financial-reports/expenditure"
          element={
            <PrivateRoute>
              <ExpenditureReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/financial-reports/debtors"
          element={
            <PrivateRoute>
              <FinancialReportsDebtorsReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/financial-reports/creditors"
          element={
            <PrivateRoute>
              <FinancialReportsCreditorsReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/financial-reports/generate-ledger"
          element={
            <PrivateRoute>
              <GenerateLedger />
            </PrivateRoute>
          }
        />
        <Route
          path="/financial-reports/trial-balance"
          element={
            <PrivateRoute>
              <TrialBalance />
            </PrivateRoute>
          }
        />
        <Route
          path="/financial-reports/income-statement"
          element={
            <PrivateRoute>
              <IncomeStatement />
            </PrivateRoute>
          }
        />
        <Route
          path="/financial-reports/chart-of-accounts"
          element={
            <PrivateRoute>
              <ChartOfAccounts />
            </PrivateRoute>
          }
        />
        {/* SMS/Email Reminders */}
        <Route
          path="/reminders"
          element={
            <PrivateRoute>
              <RemindersMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/reminders/bill-reminder"
          element={
            <PrivateRoute>
              <BillReminder />
            </PrivateRoute>
          }
        />
        <Route
          path="/reminders/payment-notification"
          element={
            <PrivateRoute>
              <PaymentNotification />
            </PrivateRoute>
          }
        />
        <Route
          path="/reminders/application-details"
          element={
            <PrivateRoute>
              <ApplicationDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/reminders/event-reminder"
          element={
            <PrivateRoute>
              <EventReminder />
            </PrivateRoute>
          }
        />
        <Route
          path="/reminders/staff-reminder"
          element={
            <PrivateRoute>
              <StaffReminder />
            </PrivateRoute>
          }
        />
        {/* News/Notice */}
        <Route
          path="/news"
          element={
            <PrivateRoute>
              <NewsMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/news/add"
          element={
            <PrivateRoute>
              <AddNews />
            </PrivateRoute>
          }
        />
        <Route
          path="/news/page"
          element={
            <PrivateRoute>
              <NewsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/news/academic-calendar"
          element={
            <PrivateRoute>
              <AcademicCalendar />
            </PrivateRoute>
          }
        />
        {/* TLMs */}
        <Route
          path="/tlms"
          element={
            <PrivateRoute>
              <TLMsMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/tlms/library"
          element={
            <PrivateRoute>
              <TLMsLibrary />
            </PrivateRoute>
          }
        />
        <Route
          path="/tlms/upload"
          element={
            <PrivateRoute>
              <UploadTLMs />
            </PrivateRoute>
          }
        />
        <Route
          path="/tlms/categories"
          element={
            <PrivateRoute>
              <TLMsCategories />
            </PrivateRoute>
          }
        />
        <Route
          path="/tlms/my-materials"
          element={
            <PrivateRoute>
              <MyMaterials />
            </PrivateRoute>
          }
        />
        <Route
          path="/tlms/manage"
          element={
            <PrivateRoute>
              <ManageTlm />
            </PrivateRoute>
          }
        />
        <Route
          path="/tlms/view/:id"
          element={
            <PrivateRoute>
              <ViewTlm />
            </PrivateRoute>
          }
        />
        <Route
          path="/tlms/download"
          element={
            <PrivateRoute>
              <DownloadTlm />
            </PrivateRoute>
          }
        />
        {/* E-Learning */}
        <Route
          path="/elearning"
          element={
            <PrivateRoute>
              <ELearningMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/courses"
          element={
            <PrivateRoute>
              <Courses />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/manage"
          element={
            <PrivateRoute>
              <ManageCourses />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/create"
          element={
            <PrivateRoute>
              <CreateCourse />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/view/:id"
          element={
            <PrivateRoute>
              <ViewCourses />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/my-courses"
          element={
            <PrivateRoute>
              <MyCourses />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/assignments"
          element={
            <PrivateRoute>
              <Assignments />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/assignments/create"
          element={
            <PrivateRoute>
              <CreateAssignment />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/assignments/view/:id"
          element={
            <PrivateRoute>
              <Assignments />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/quizzes"
          element={
            <PrivateRoute>
              <QuizHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/quizzes/manage"
          element={
            <PrivateRoute>
              <Quizzes />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/quizzes/take/:id"
          element={
            <PrivateRoute>
              <TakeQuiz />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/quizzes/results/:id"
          element={
            <PrivateRoute>
              <QuizResults />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/quizzes/create"
          element={
            <PrivateRoute>
              <CreateQuiz />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/quizzes/view/:id"
          element={
            <PrivateRoute>
              <Quizzes />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/progress"
          element={
            <PrivateRoute>
              <StudentProgress />
            </PrivateRoute>
          }
        />
        <Route
          path="/elearning/progress/:studentId/:courseId"
          element={
            <PrivateRoute>
              <StudentProgress />
            </PrivateRoute>
          }
        />
        {/* School Setup */}
        <Route
          path="/setup"
          element={
            <PrivateRoute>
              <SetupMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/setup/school-details"
          element={
            <PrivateRoute>
              <SchoolDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/setup/item-setup"
          element={
            <PrivateRoute>
              <ItemSetup />
            </PrivateRoute>
          }
        />
        <Route
          path="/setup/class-list"
          element={
            <PrivateRoute>
              <SetupClassList />
            </PrivateRoute>
          }
        />
        <Route
          path="/setup/subject-course"
          element={
            <PrivateRoute>
              <SubjectCourse />
            </PrivateRoute>
          }
        />
        <Route
          path="/setup/bill-item"
          element={
            <PrivateRoute>
              <BillItem />
            </PrivateRoute>
          }
        />
        <Route
          path="/setup/system-settings"
          element={
            <PrivateRoute>
              <SystemSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/setup/academic-settings"
          element={
            <PrivateRoute>
              <AcademicSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="/setup/manage-subjects"
          element={
            <PrivateRoute>
              <ManageSubjects />
            </PrivateRoute>
          }
        />
        <Route
          path="/setup/manage-classes"
          element={
            <PrivateRoute>
              <ManageClasses />
            </PrivateRoute>
          }
        />
        {/* Documents */}
        <Route
          path="/documents"
          element={
            <PrivateRoute>
              <DocumentsMenu />
            </PrivateRoute>
          }
        />
        <Route
          path="/documents/my-uploads"
          element={
            <PrivateRoute>
              <MyUploads />
            </PrivateRoute>
          }
        />
        <Route
          path="/documents/shared"
          element={
            <PrivateRoute>
              <SharedDocuments />
            </PrivateRoute>
          }
        />
        <Route
          path="/documents/categories"
          element={
            <PrivateRoute>
              <DocumentCategories />
            </PrivateRoute>
          }
        />
        <Route
          path="/documents/recent"
          element={
            <PrivateRoute>
              <RecentDocuments />
            </PrivateRoute>
          }
        />
        <Route
          path="/documents/upload"
          element={
            <PrivateRoute>
              <UploadDocument />
            </PrivateRoute>
          }
        />
        <Route
          path="/documents/my-documents"
          element={
            <PrivateRoute>
              <MyDocuments />
            </PrivateRoute>
          }
        />
        <Route
          path="/documents/download-history"
          element={
            <PrivateRoute>
              <DownloadHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </ModalProvider>
  );
};

export default App;

