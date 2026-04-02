import React, { lazy, Suspense } from "react"; // 1. Added lazy and Suspense
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Styles
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

// Context & Components
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";

// ─── 2. Changed Static Imports to Lazy Imports ───────────────
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Users = lazy(() => import("./pages/Users"));
const Profile = lazy(() => import("./pages/Profile"));
const UserDetail = lazy(() => import("./pages/UserDetail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

// ─── 3. Simple Loading Spinner for Fallback ──────────────────
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
    }}
  >
    <div className="spinner" />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <div className="app-container">
          {/* ─── 4. Wrap Routes in Suspense ────────────────────── */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <Users />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users/:id"
                element={
                  <PrivateRoute>
                    <UserDetail />
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

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>

        <ToastContainer position="top-right" autoClose={3500} theme="dark" />
      </BrowserRouter>
    </AuthProvider>
  );
}
