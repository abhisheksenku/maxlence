import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

export default function UserDetail() {
  const { id } = useParams();
  const { isAdmin, user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await userAPI.getUserById(id);
        setUser(data.data.user);
      } catch (err) {
        toast.error('User not found or access denied');
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${user.firstName}? This action is permanent.`)) return;
    
    setActionLoading(true);
    try {
      await userAPI.deleteUser(id);
      toast.success('Account successfully removed');
      navigate('/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete operation failed');
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setActionLoading(true);
    try {
      const { data } = await userAPI.toggleStatus(id);
      setUser((prev) => ({ ...prev, isActive: !prev.isActive }));
      toast.success(data.message);
    } catch (err) {
      toast.error('Failed to update account status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerStage}>
        <div className="spinner" style={styles.largeSpinner} />
      </div>
    );
  }

  if (!user) return null;

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ─── Navigation ─────────────────────── */}
        <Link to="/users" className="fade-up" style={styles.backLink}>
          ← Back to Directory
        </Link>

        {/* ─── Profile Header Card ────────────── */}
        <div className="card fade-up fade-up-d1" style={styles.profileCard}>
          <div style={styles.headerLayout}>
            <Avatar user={user} size={100} />
            
            <div style={styles.mainInfo}>
              <div style={styles.titleRow}>
                <h1 style={styles.name}>{user.firstName} {user.lastName}</h1>
                <div style={styles.badgeGroup}>
                  <span className={`badge badge-${user.role}`}>{user.role}</span>
                  <span className={`badge ${user.isActive ? 'badge-active' : 'badge-inactive'}`}>
                    {user.isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>
              </div>
              <p style={styles.email}>{user.email}</p>
              <p style={styles.verification}>
                {user.isVerified
                  ? <span style={{ color: 'var(--success)' }}>✓ Identity Verified</span>
                  : <span style={{ color: 'var(--warning)' }}>○ Pending Verification</span>}
              </p>
            </div>

            {/* ─── Action Sidebar (Admin/Self) ───── */}
            {(isAdmin || isOwnProfile) && (
              <div style={styles.actionColumn}>
                {isOwnProfile ? (
                  <Link to="/profile" className="btn btn-primary btn-sm">
                    Edit My Profile
                  </Link>
                ) : (
                  <>
                    <button
                      className={`btn btn-sm ${user.isActive ? 'btn-ghost' : 'btn-success'}`}
                      onClick={handleToggleStatus}
                      disabled={actionLoading}
                    >
                      {user.isActive ? 'Suspend User' : 'Activate User'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleDelete}
                      disabled={actionLoading}
                    >
                      Delete Account
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Detailed Information Card ──────── */}
        <div className="card fade-up fade-up-d2">
          <h2 style={styles.sectionTitle}>Account Overview</h2>
          <div style={styles.detailsGrid}>
            {[
              { label: 'System ID', value: `#${user.id}`, mono: true },
              { label: 'Role', value: user.role.toUpperCase() },
              { label: 'Email Address', value: user.email },
              { label: 'Status', value: user.isActive ? 'Operational' : 'Inactive' },
              { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' }) },
              { label: 'Last Activity', value: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'None recorded' },
            ].map((item) => (
              <div key={item.label} style={styles.detailItem}>
                <p style={styles.label}>{item.label}</p>
                <p style={{ ...styles.value, fontFamily: item.mono ? 'monospace' : 'inherit' }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Styles ---

const styles = {
  page: { padding: '40px 24px', minHeight: '100vh' },
  container: { maxWidth: 750, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 },
  centerStage: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  largeSpinner: { width: 48, height: 48, borderWidth: 4, borderTopColor: 'var(--accent)' },
  backLink: { 
    fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', 
    display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8,
    transition: 'color var(--transition)' 
  },
  profileCard: { padding: '40px' },
  headerLayout: { display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' },
  mainInfo: { flex: 2, minWidth: 250 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 },
  name: { fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'Syne, sans-serif' },
  badgeGroup: { display: 'flex', gap: 8 },
  email: { color: 'var(--text-muted)', fontSize: 16, marginBottom: 8 },
  verification: { fontSize: 12, fontWeight: 500 },
  actionColumn: { flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 160 },
  sectionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 24, letterSpacing: '-0.01em' },
  detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' },
  detailItem: { borderBottom: '1px solid var(--border)', paddingBottom: 12 },
  label: { fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 },
  value: { fontSize: 15, color: 'var(--text)', fontWeight: 500 },
};