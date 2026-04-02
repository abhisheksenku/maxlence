import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Redirect to the page they were trying to access, or dashboard
  const from = location.state?.from?.pathname || '/';

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({ mode: 'onTouched' });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Welcome back to NexusLink!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Visual background element */}
      <div style={styles.glow} />

      <div style={styles.container}>
        {/* Branding Section */}
        <div className="fade-up" style={styles.header}>
          <div style={styles.logoMark}>◈</div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to your NexusLink account</p>
        </div>

        {/* Login Card */}
        <div className="card fade-up fade-up-d1" style={styles.card}>
          <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
            
            {/* Email Input */}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { 
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                    message: 'Invalid email address' 
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

            {/* Password Input */}
            <div className="input-group">
              <div style={styles.passHeader}>
                <label className="input-label">Password</label>
                <Link to="/forgot-password" style={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input-field ${errors.password ? 'error' : ''}`}
                  style={{ paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  style={styles.eyeBtn}
                  tabIndex="-1"
                >
                  {showPass ? '●' : '○'}
                </button>
              </div>
              {errors.password && (
                <p className="field-error">⚠ {errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary btn-full" 
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? (
                <><div className="spinner" /> Authenticating...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Registration Prompt */}
          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.switchLink}>Create one</Link>
          </p>
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
    top: '10%',
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
  title: { 
    fontSize: 32, 
    fontWeight: 800, 
    letterSpacing: '-0.03em', 
    color: 'var(--text)', 
    marginBottom: 8,
    fontFamily: 'Syne, sans-serif'
  },
  subtitle: { color: 'var(--text-muted)', fontSize: 15 },
  card: { padding: '36px 32px' },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  passHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  forgotLink: {
    fontSize: 12,
    color: 'var(--accent)',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'color var(--transition)',
  },
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
  switchText: { 
    textAlign: 'center', 
    fontSize: 14, 
    color: 'var(--text-muted)', 
    marginTop: 24 
  },
  switchLink: { 
    color: 'var(--accent)', 
    fontWeight: 700, 
    textDecoration: 'none' 
  },
};