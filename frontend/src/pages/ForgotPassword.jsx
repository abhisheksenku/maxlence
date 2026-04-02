import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Initialize react-hook-form
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    mode: 'onTouched' // Validates when user leaves the input
  });

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.info('Check your email for instructions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background ambient glow */}
      <div style={styles.glow} />

      <div style={styles.container}>
        {/* Branding & Header */}
        <div className="fade-up" style={styles.header}>
          <div style={styles.logoMark}>◈</div>
          <h1 style={styles.title}>
            {sent ? 'Check your email' : 'Forgot Password?'}
          </h1>
          <p style={styles.subtitle}>
            {sent 
              ? 'We have sent a password recovery link to your inbox.' 
              : "Enter your email and we'll send you a link to get back into your account."}
          </p>
        </div>

        {/* Form Card */}
        <div className="card fade-up fade-up-d1" style={styles.card}>
          {sent ? (
            <div style={styles.successWrapper}>
              <div style={styles.iconSent}>📬</div>
              <p style={styles.successText}>
                If an account with <strong>email provided</strong> exists, 
                you'll receive a password reset link within a few minutes.
              </p>
              <Link to="/login" className="btn btn-primary btn-full">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { 
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                      message: 'Please enter a valid email address' 
                    },
                  })}
                  type="email"
                  placeholder="name@company.com"
                  className={`input-field ${errors.email ? 'error' : ''}`}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="field-error">⚠ {errors.email.message}</p>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full" 
                disabled={loading}
              >
                {loading ? (
                  <><div className="spinner" /> Sending Link...</>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <Link to="/login" style={styles.backLink}>
                ← Back to login
              </Link>
            </form>
          )}
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
    zIndex: 0,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    position: 'relative',
    zIndex: 1,
  },
  header: {
    textAlign: 'center',
    marginBottom: 28,
  },
  logoMark: {
    fontSize: 36,
    color: 'var(--accent)',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    marginBottom: 8,
    fontFamily: 'Syne, sans-serif',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: 15,
    lineHeight: 1.5,
  },
  card: {
    padding: '36px 32px',
  },
  successWrapper: {
    textAlign: 'center',
  },
  iconSent: {
    fontSize: 48,
    marginBottom: 16,
  },
  successText: {
    color: 'var(--text-muted)',
    fontSize: 14,
    lineHeight: 1.7,
    marginBottom: 24,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  backLink: {
    textAlign: 'center',
    fontSize: 14,
    color: 'var(--text-muted)',
    textDecoration: 'none',
    marginTop: 8,
    fontWeight: 500,
    transition: 'color var(--transition)',
  },
};