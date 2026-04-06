import { lazy, Suspense } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import ProtectedRoleRoute from "./routes/ProtectedRoleRoute";

const HomePage = lazy(() => import("../features/home/pages/HomePage"));
const PatientLoginPage = lazy(() => import("../features/patient/pages/PatientLoginPage"));
const PatientSignupPage = lazy(() => import("../features/patient/pages/PatientSignupPage"));
const PatientVitalsPage = lazy(() => import("../features/patient/pages/PatientVitalsPage"));
const PatientDashboardPage = lazy(() => import("../features/patient/pages/PatientDashboardPage"));
const AdminDashboardPage = lazy(() => import("../features/admin/pages/AdminDashboardPage"));
const DoctorLoginPage = lazy(() => import("../features/doctor/pages/DoctorLoginPage"));
const DoctorDashboardPage = lazy(() => import("../features/doctor/pages/DoctorDashboardPage"));
const AdminLoginPage = lazy(() => import("../features/admin/pages/AdminLoginPage"));
const AdminSignupPage = lazy(() => import("../features/admin/pages/AdminSignupPage"));

function App() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem" }}>Loading page...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/patient-login" element={<PatientLoginPage />} />
        <Route path="/patient-signup" element={<PatientSignupPage />} />
        <Route path="/patient-vitals" element={<PatientVitalsPage />} />
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoleRoute requiredRole="patient" redirectTo="/patient-login">
              <PatientDashboardPage />
            </ProtectedRoleRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin-login" replace />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin-signup" element={<AdminSignupPage />} />
        <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoleRoute requiredRole="admin" redirectTo="/admin-login">
              <AdminDashboardPage />
            </ProtectedRoleRoute>
          }
        />
        <Route path="/doctor-portal" element={<Navigate to="/doctor-login" replace />} />
        <Route path="/doctor-login" element={<DoctorLoginPage />} />
        <Route path="/doctor-signup" element={<Navigate to="/doctor-login" replace />} />
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoleRoute requiredRole="doctor" redirectTo="/doctor-login">
              <DoctorDashboardPage />
            </ProtectedRoleRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
