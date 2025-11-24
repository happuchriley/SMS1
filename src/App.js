import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
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
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
