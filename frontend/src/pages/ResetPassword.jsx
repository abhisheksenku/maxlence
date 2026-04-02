import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  // Extract token from URL: /reset-password?token=xxxx
  const token = searchParams.get('token');

  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors } 
  } = useForm({ mode: 'onChange' });

  const password = watch('password');

  const onSubmit = async ({ password, confirmPassword }) => {
    if (!token) {
      toast.error('Missing reset token');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({ token, password, confirmPassword });
      toast.success('Password reset successfully! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // If no token is present in the URL, show an error state immediately
  if (!token) {
    return (
      <div style={styles.errorWrapper}>
        <div className="card" style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.title}>Invalid Link</h2>
          <p style={styles.subtitle}>
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/forgot-password" className="btn btn-primary" style={{ marginTop: 16 }}>
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Background Glow */}
      <div style={styles.glow} />

      <div style={styles.container}>
        <div className="fade-up" style={styles.header}>
          <div style={styles.logoMark}>◈</div>
          <h1 style={styles.title}>Set New Password</h1>
          <p style={styles.subtitle}>Secure your NexusLink account with a new password.</p>
        </div>

        <div className="card fade-up fade-up-d1" style={styles.card}>
          <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
            
            {/* New Password Field */}
            <div className="input-group">
              <label className="input-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters' },
                    pattern: { 
                      value: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
                      message: 'Must include uppercase, lowercase, and a number' 
                    },
                  })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className={`input-field ${errors.password ? 'error' : ''}`}
                  style={{ paddingRight: 44 }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  style={styles.eyeBtn}
                >
                  {showPass ? '●' : '○'}
                </button>
              </div>
              {errors.password && <p className="field-error">⚠ {errors.password.message}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="input-group">
              <label className="input-label">Confirm New Password</label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === password || 'Passwords do not match',
                })}
                type={showPass ? 'text' : 'password'}
                placeholder="Repeat your new password"
                className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
              />
              {errors.confirmPassword && (
                <p className="field-error">⚠ {errors.confirmPassword.message}</p>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full" 
              disabled={loading}
            >
              {loading ? (
                <><div className="spinner" /> Updating...</>
              ) : (
                'Update Password'
              )}
            </button>

            <Link to="/login" style={styles.backLink}>
              ← Return to login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- Styles ---

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 400,
    height: 400,
    background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: { width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 },
  header: { textAlign: 'center', marginBottom: 28 },
  logoMark: { fontSize: 36, color: 'var(--accent)', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8, fontFamily: 'Syne, sans-serif' },
  subtitle: { color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.5 },
  card: { padding: '36px 32px' },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-dim)',
    fontSize: 14,
    padding: 4,
  },
  backLink: {
    textAlign: 'center',
    fontSize: 14,
    color: 'var(--text-muted)',
    textDecoration: 'none',
    marginTop: 8,
    fontWeight: 500,
  },
  errorWrapper: { 
    minHeight: '80vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  errorCard: { textAlign: 'center', padding: 48, maxWidth: 400 },
  errorIcon: { fontSize: 40, marginBottom: 16 },
};