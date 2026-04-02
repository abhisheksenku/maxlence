import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Avatar from './Avatar';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: '⬡' },
  { to: '/users', label: 'Users', icon: '◎' },
];

export default function Navbar() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
      navigate('/login');
      setMenuOpen(false);
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* ─── Brand Logo ────────────────────── */}
        <Link to="/" style={styles.logo} onClick={() => setMobileOpen(false)}>
          <span style={styles.logoMark}>◈</span>
          <span style={styles.logoText}>NexusLink</span>
        </Link>

        {/* ─── Desktop Links ─────────────────── */}
        <div style={styles.links}>
          {NAV_LINKS.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link 
                key={to} 
                to={to} 
                style={{ ...styles.link, ...(active ? styles.linkActive : {}) }}
              >
                <span style={{ fontSize: 14 }}>{icon}</span>
                {label}
                {active && <span style={styles.activePill} />}
              </Link>
            );
          })}
        </div>

        {/* ─── Right Section (Profile & Admin) ── */}
        <div style={styles.right}>
          {isAdmin && <span style={styles.adminChip}>Admin</span>}

          <div style={{ position: 'relative' }}>
            {/* The Account Trigger Button - Styled in Violet */}
            <button 
              style={{
                ...styles.avatarBtn,
                background: menuOpen ? 'var(--accent-dim)' : 'transparent',
              }} 
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Avatar user={user} size={24} />
              <span style={styles.accountLabel}>Account</span>
              <span style={styles.chevron}>{menuOpen ? '▲' : '▼'}</span>
            </button>

            {menuOpen && (
              <>
                {/* FIXED: Global backdrop to close menu on outside click */}
                <div style={styles.menuBackdrop} onClick={() => setMenuOpen(false)} />
                
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    <p style={styles.dropdownName}>{user?.firstName} {user?.lastName}</p>
                    <p style={styles.dropdownEmail}>{user?.email}</p>
                  </div>
                  
                  <div style={styles.dropdownDivider} />
                  
                  <Link to="/profile" style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                    ◉ My Profile
                  </Link>

                  {isAdmin && (
                    <Link to="/users" style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                      ◎ Manage Users
                    </Link>
                  )}

                  <div style={styles.dropdownDivider} />
                  
                  <button 
                    style={{ ...styles.dropdownItem, ...styles.logoutItem }} 
                    onClick={handleLogout}
                  >
                    ⊗ Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Hamburger (Mobile) */}
          <button style={styles.hamburger} onClick={() => setMobileOpen(!mobileOpen)}>
            <span style={styles.burgerLine} />
            <span style={styles.burgerLine} />
            <span style={styles.burgerLine} />
          </button>
        </div>
      </div>

      {/* ─── Mobile Menu ─────────────────────── */}
      {mobileOpen && (
        <div style={styles.mobileMenu}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} style={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              {label}
            </Link>
          ))}
          <Link to="/profile" style={styles.mobileLink} onClick={() => setMobileOpen(false)}>
            Profile
          </Link>
          <button style={styles.mobileLogout} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}

// --- Component Styles ---

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(10,11,15,0.85)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border)',
  },
  inner: {
    maxWidth: 1200, margin: '0 auto',
    padding: '0 24px', height: 60,
    display: 'flex', alignItems: 'center', gap: 32,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  logoMark: { fontSize: 22, color: 'var(--accent)' },
  logoText: {
    fontFamily: 'Syne, sans-serif', fontWeight: 800,
    fontSize: 18, color: 'var(--text)', letterSpacing: '-0.02em',
  },
  links: { display: 'flex', gap: 4, flex: 1 },
  link: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 8,
    fontSize: 14, fontWeight: 500, color: 'var(--text-muted)',
    textDecoration: 'none', position: 'relative',
    transition: 'all 0.2s',
  },
  linkActive: { color: 'var(--text)', background: 'var(--surface2)' },
  activePill: {
    position: 'absolute', bottom: -1, left: '50%',
    transform: 'translateX(-50%)', width: 20, height: 2,
    background: 'var(--accent)', borderRadius: 2,
  },
  right: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 },
  adminChip: {
    padding: '3px 10px', borderRadius: 100,
    background: 'var(--accent-dim)', color: 'var(--accent-bright)',
    fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
  },
  
  // ─── Account Button (Violet Theme) ───
  avatarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '6px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--accent)', // Violet Border
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    boxShadow: '0 0 0 0 var(--accent-glow)',
  },
  accountLabel: { 
    fontSize: 13, 
    fontWeight: 700, 
    color: 'var(--accent-bright)', // Violet Text
    letterSpacing: '0.02em' 
  },
  chevron: { fontSize: 9, color: 'var(--accent-bright)' },

  // ─── Dropdown & Backdrop Logic ───
  menuBackdrop: { 
    position: 'fixed', 
    inset: 0, 
    zIndex: 998, // Below dropdown
    background: 'transparent' 
  },
  dropdown: {
    position: 'absolute', 
    top: 'calc(100% + 12px)', 
    right: 0,
    width: 220, 
    background: 'var(--surface)',
    border: '1px solid var(--border)', 
    borderRadius: 12,
    boxShadow: 'var(--shadow-lg)', 
    overflow: 'hidden',
    animation: 'fadeUp 0.2s ease',
    zIndex: 999, // On top of everything
  },
  dropdownHeader: { padding: '14px 16px' },
  dropdownName: { fontWeight: 600, fontSize: 14, color: 'var(--text)' },
  dropdownEmail: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 },
  dropdownDivider: { height: 1, background: 'var(--border)' },
  dropdownItem: {
    display: 'block', padding: '11px 16px', fontSize: 14, color: 'var(--text-muted)',
    textDecoration: 'none', width: '100%', cursor: 'pointer', textAlign: 'left',
    background: 'none', border: 'none', transition: 'all 0.15s',
  },
  logoutItem: { color: 'var(--danger)', fontWeight: 600 },
  hamburger: { display: 'none', flexDirection: 'column', gap: 4, background: 'none', border: 'none', cursor: 'pointer' },
  burgerLine: { width: 20, height: 2, background: 'var(--text-muted)', borderRadius: 2 },
  mobileMenu: { borderTop: '1px solid var(--border)', padding: '12px 24px 16px', display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--bg)' },
  mobileLink: { padding: '10px 12px', borderRadius: 8, fontSize: 15, color: 'var(--text-muted)', textDecoration: 'none', display: 'block' },
  mobileLogout: { padding: '10px 12px', borderRadius: 8, fontSize: 15, color: 'var(--danger)', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontWeight: 600 }
};