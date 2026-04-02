import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Initialize form with validation mode on touched for better UX
  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors } 
  } = useForm({ mode: 'onTouched' });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);
      
      // If a user selected a profile image, add it to the multipart form
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      await authAPI.register(formData);
      
      toast.success('Registration successful! Please verify your email.');
      navigate('/login');
    } catch (err) {
      // Handle array of errors from express-validator (backend)
      const backendErrors = err.response?.data?.errors;
      if (backendErrors?.length) {
        backendErrors.forEach((e) => toast.error(e.msg || e.message));
      } else {
        toast.error(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.container}>
        
        {/* ─── Header ─────────────────────────── */}
        <div className="fade-up" style={styles.header}>
          <div style={styles.logoMark}>◈</div>
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.subtitle}>Join the NexusLink community today</p>
        </div>

        {/* ─── Form Card ──────────────────────── */}
        <div className="card fade-up fade-up-d1">
          <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
            
            {/* Image Upload Component */}
            <ImageUpload
              onChange={setProfileImage}
              label="Profile Photo (optional)"
            />

            {/* Name Row */}
            <div style={styles.row}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">First Name</label>
                <input
                  {...register('firstName', {
                    required: 'Required',
                    minLength: { value: 2, message: 'Too short' },
                    maxLength: { value: 50, message: 'Too long' },
                  })}
                  placeholder="John"
                  className={`input-field ${errors.firstName ? 'error' : ''}`}
                />
                {errors.firstName && <p className="field-error">⚠ {errors.firstName.message}</p>}
              </div>

              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Last Name</label>
                <input
                  {...register('lastName', {
                    required: 'Required',
                    minLength: { value: 2, message: 'Too short' },
                  })}
                  placeholder="Doe"
                  className={`input-field ${errors.lastName ? 'error' : ''}`}
                />
                {errors.lastName && <p className="field-error">⚠ {errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email Field */}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { 
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                    message: 'Invalid email format' 
                  },
                })}
                type="email"
                placeholder="you@example.com"
                className={`input-field ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <p className="field-error">⚠ {errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                    pattern: {
                      value: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Need uppercase, lowercase & number',
                    },
                  })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input-field ${errors.password ? 'error' : ''}`}
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  {showPass ? '●' : '○'}
                </button>
              </div>
              {errors.password && <p className="field-error">⚠ {errors.password.message}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (val) => val === password || 'Passwords do not match',
                  })}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                  {showConfirm ? '●' : '○'}
                </button>
              </div>
              {errors.confirmPassword && <p className="field-error">⚠ {errors.confirmPassword.message}</p>}
            </div>

            {/* Visual Password Strength Indicator */}
            {password && <PasswordStrength password={password} />}

            <button 
              type="submit" 
              className="btn btn-primary btn-full" 
              disabled={loading} 
              style={{ marginTop: 8 }}
            >
              {loading ? <><div className="spinner" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          {/* Login Switch */}
          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Visual helper for password complexity
 */
function PasswordStrength({ password }) {
  const checks = [
    { label: 'Min 8 chars', ok: password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['var(--danger)', 'var(--danger)', 'var(--warning)', 'var(--warning)', 'var(--success)'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '4px 0' }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < score ? colors[score] : 'var(--border)',
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
        {checks.map(({ label, ok }) => (
          <span key={label} style={{ fontSize: 11, color: ok ? 'var(--success)' : 'var(--text-dim)', fontWeight: ok ? 600 : 400 }}>
            {ok ? '✓' : '○'} {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// --- Component Styles ---

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '40px 20px', position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
    width: 500, height: 500,
    background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: { width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 },
  header: { textAlign: 'center', marginBottom: 28 },
  logoMark: { fontSize: 36, color: 'var(--accent)', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8, fontFamily: 'Syne, sans-serif' },
  subtitle: { color: 'var(--text-muted)', fontSize: 15 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  row: { display: 'flex', gap: 16 },
  eyeBtn: {
    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-dim)', fontSize: 14, padding: 4,
  },
  switchText: { textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 24 },
  switchLink: { color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' },
};