import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Avatar from '../components/Avatar';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);

  // Fetching high-level stats for Admins
  useEffect(() => {
    if (isAdmin) {
      userAPI.getUsers({ page: 1, limit: 1 })
        .then(({ data }) => {
          // data.pagination contains the 'total' count from our backend
          if (data?.pagination) {
            setStats(data.pagination);
          }
        })
        .catch((err) => console.error("Failed to load admin stats", err));
    }
  }, [isAdmin]);

  // Dynamic greeting based on user's local time
  const timeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        
        {/* ─── Hero Section ────────────────────── */}
        <div className="fade-up" style={styles.hero}>
          <Avatar user={user} size={68} />
          <div style={styles.heroText}>
            <h1 style={styles.greeting}>
              {timeOfDay()}, {user?.firstName || 'User'} 👋
            </h1>
            <p style={styles.sub}>
              {isAdmin ? 'You have administrative privileges.' : 'Welcome to your NexusLink dashboard.'}{' '}
              <span style={styles.lastLogin}>
                Last login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Just now'}
              </span>
            </p>
          </div>
        </div>

        {/* ─── Information Grid ─────────────────── */}
        <div style={styles.grid}>
          
          {/* Status Card */}
          <div className="card fade-up fade-up-d1" style={styles.infoCard}>
            <div style={{ ...styles.cardIcon, color: 'var(--success)' }}>◉</div>
            <div>
              <p style={styles.cardLabel}>Account Status</p>
              <p style={styles.cardValue}>
                {user?.isVerified
                  ? <span style={{ color: 'var(--success)' }}>✓ Verified</span>
                  : <span style={{ color: 'var(--warning)' }}>⚠ Unverified</span>}
              </p>
            </div>
          </div>

          {/* Role Card */}
          <div className="card fade-up fade-up-d2" style={styles.infoCard}>
            <div style={{ ...styles.cardIcon, color: 'var(--accent)' }}>◎</div>
            <div>
              <p style={styles.cardLabel}>System Role</p>
              <p style={styles.cardValue}>
                <span className={`badge badge-${user?.role || 'user'}`}>
                  {user?.role || 'User'}
                </span>
              </p>
            </div>
          </div>

          {/* Tenure Card */}
          <div className="card fade-up fade-up-d3" style={styles.infoCard}>
            <div style={{ ...styles.cardIcon, color: 'var(--text-muted)' }}>⊞</div>
            <div>
              <p style={styles.cardLabel}>Member Since</p>
              <p style={styles.cardValue}>
                {user?.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
                  : 'Recent'}
              </p>
            </div>
          </div>

          {/* Admin Stats Card (Conditional) */}
          {isAdmin && stats && (
            <div className="card fade-up fade-up-d4" style={styles.adminCard}>
              <div style={{ ...styles.cardIcon, color: 'var(--accent-bright)' }}>◈</div>
              <div>
                <p style={styles.cardLabel}>Platform Users</p>
                <p style={styles.adminValue}>
                  {stats.total}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── Quick Actions ────────────────────── */}
        <div className="card fade-up fade-up-d3" style={styles.actionsCard}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actions}>
            
            <Link to="/profile" style={styles.action}>
              <span style={styles.actionIcon}>👤</span>
              <div>
                <p style={styles.actionTitle}>Update Profile</p>
                <p style={styles.actionDesc}>Manage your public identity and photo</p>
              </div>
            </Link>

            <Link to="/users" style={styles.action}>
              <span style={styles.actionIcon}>🔍</span>
              <div>
                <p style={styles.actionTitle}>Explore Directory</p>
                <p style={styles.actionDesc}>Search and view other professional profiles</p>
              </div>
            </Link>

            {isAdmin && (
              <Link to="/users" style={{ ...styles.action, borderColor: 'var(--accent-dim)' }}>
                <span style={{ ...styles.actionIcon, color: 'var(--accent)' }}>⚙</span>
                <div>
                  <p style={styles.actionTitle}>Admin Console</p>
                  <p style={styles.actionDesc}>User moderation and permission control</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Component Styles ---

const styles = {
  page: { padding: '40px 24px', minHeight: '100vh' },
  inner: { maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 },
  hero: {
    display: 'flex', alignItems: 'center', gap: 24,
    padding: '32px', background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)',
  },
  heroText: { flex: 1 },
  greeting: { fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 },
  sub: { color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5 },
  lastLogin: { color: 'var(--text-dim)', display: 'block', marginTop: 4, fontSize: 12 },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
    gap: 16 
  },
  infoCard: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 16, 
    padding: '20px 24px',
    transition: 'transform var(--transition)'
  },
  adminCard: {
    display: 'flex', 
    alignItems: 'center', 
    gap: 16, 
    padding: '20px 24px',
    borderColor: 'var(--accent)', 
    background: 'var(--accent-dim)',
  },
  cardIcon: { fontSize: 24, flexShrink: 0 },
  cardLabel: { 
    fontSize: 10, 
    color: 'var(--text-dim)', 
    textTransform: 'uppercase', 
    letterSpacing: '0.06em', 
    marginBottom: 4 
  },
  cardValue: { fontSize: 15, fontWeight: 600, color: 'var(--text)' },
  adminValue: { 
    color: 'var(--accent-bright)', 
    fontSize: 22, 
    fontWeight: 700,
    lineHeight: 1 
  },
  actionsCard: { padding: '28px 32px' },
  sectionTitle: { fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 20 },
  actions: { display: 'flex', flexDirection: 'column', gap: 12 },
  action: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '16px 20px', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    textDecoration: 'none', transition: 'all var(--transition)',
    cursor: 'pointer',
    background: 'var(--surface2)',
  },
  actionIcon: { fontSize: 20, flexShrink: 0 },
  actionTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 },
  actionDesc: { fontSize: 12, color: 'var(--text-muted)' },
};