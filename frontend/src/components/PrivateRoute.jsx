import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PrivateRoute Component
 * @param {boolean} requireAdmin - If true, checks if user has 'admin' role
 * @param {React.ReactNode} children - The component to render if authorized
 */
const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // 1. Loading State
  // Prevents flickering or accidental redirects while AuthContext 
  // is checking for the accessToken in localStorage.
  if (loading) {
    return (
      <div style={styles.loaderWrapper}>
        <div style={styles.loaderContent}>
          <div className="spinner" style={styles.spinner} />
          <p style={styles.loadingText}>Authenticating...</p>
        </div>
      </div>
    );
  }

  // 2. Authentication Gate
  // If not logged in, redirect to login page but save the current 
  // location so we can send them back after they sign in.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Authorization Gate (RBAC)
  // If the route requires admin but the user is just a standard 'user',
  // kick them back to the dashboard.
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4. Authorized Access
  return children;
};

// --- Styles ---

const styles = {
  loaderWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
  },
  loaderContent: {
    textAlign: 'center',
  },
  spinner: {
    width: 40,
    height: 40,
    borderWidth: 3,
    margin: '0 auto 20px',
    borderTopColor: 'var(--accent)', // Uses your primary accent color
  },
  loadingText: {
    color: 'var(--text-muted)',
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
};

export default PrivateRoute;