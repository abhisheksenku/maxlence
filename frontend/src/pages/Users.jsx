import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import Pagination from '../components/Pagination';

export default function Users() {
  const { isAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const debounceRef = useRef(null);

  /**
   * Fetch Users
   * Triggers on page change or search input (via debounce)
   */
  const fetchUsers = useCallback(async (p = page, q = search) => {
    setLoading(true);
    try {
      const { data } = await userAPI.getUsers({ page: p, limit: 10, search: q });
      setUsers(data.data.users);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Could not load user directory');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers(page, search);
  }, [page]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1); // Reset to first page on new search
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchUsers(1, val), 400);
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      await userAPI.deleteUser(id);
      toast.success('User removed from platform');
      setConfirmDelete(null);
      fetchUsers(page, search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (id) => {
    setActionLoading(id);
    try {
      const { data } = await userAPI.toggleStatus(id);
      toast.success(data.message);
      fetchUsers(page, search);
    } catch (err) {
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (id, role) => {
    setActionLoading(id);
    try {
      await userAPI.updateRole(id, role);
      toast.success(`Role updated to ${role}`);
      fetchUsers(page, search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        
        {/* ─── Header ─────────────────────────── */}
        <div className="fade-up" style={styles.header}>
          <div>
            <h1 style={styles.title}>Member Directory</h1>
            <p style={styles.subtitle}>
              {pagination ? `${pagination.total} registered professionals` : 'Browsing accounts...'}
            </p>
          </div>
        </div>

        {/* ─── Search Bar ─────────────────────── */}
        <div className="fade-up fade-up-d1" style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or expertise..."
            value={search}
            onChange={handleSearch}
            style={styles.searchInput}
          />
          {search && (
            <button 
              onClick={() => { setSearch(''); setPage(1); fetchUsers(1, ''); }} 
              style={styles.clearBtn}
            >
              ✕
            </button>
          )}
        </div>

        {/* ─── User List Card ─────────────────── */}
        <div className="card fade-up fade-up-d2" style={styles.listCard}>
          {loading ? (
            <div style={styles.loadingState}>
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : users.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>◎</div>
              <p style={styles.emptyText}>
                {search ? `No results found for "${search}"` : 'The directory is currently empty.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {/* Table Header */}
              <div style={styles.tableHeader}>
                <span style={{ flex: 3 }}>Professional</span>
                <span style={{ flex: 2 }}>Contact</span>
                <span style={{ flex: 1 }}>Role</span>
                <span style={{ flex: 1 }}>Status</span>
                {isAdmin && <span style={{ flex: 2, textAlign: 'right' }}>Management</span>}
              </div>

              {/* User Rows */}
              {users.map((u, i) => (
                <div key={u.id} style={styles.row}>
                  
                  {/* User Profile Info */}
                  <div style={{ flex: 3, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar user={u} size={40} />
                    <div style={{ minWidth: 0 }}>
                      <Link to={`/users/${u.id}`} style={styles.userName}>
                        {u.firstName} {u.lastName}
                      </Link>
                      <p style={styles.userMeta}>
                        {u.isVerified
                          ? <span style={{ color: 'var(--success)', fontSize: 10 }}>✓ Verified</span>
                          : <span style={{ color: 'var(--warning)', fontSize: 10 }}>○ Unverified</span>}
                      </p>
                    </div>
                  </div>

                  <div style={{ flex: 2 }}>
                    <span style={styles.email}>{u.email}</span>
                  </div>

                  <div style={{ flex: 1 }}>
                    {isAdmin && u.id !== currentUser?.id ? (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={actionLoading === u.id}
                        style={styles.roleSelect}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`badge badge-${u.role}`}>{u.role}</span>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {u.isActive ? 'Active' : 'Banned'}
                    </span>
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div style={styles.actionGroup}>
                      <Link to={`/users/${u.id}`} className="btn btn-ghost btn-sm" title="View Profile">
                        ↗
                      </Link>
                      
                      {/* Prevent admin from deactivating/deleting self */}
                      {u.id !== currentUser?.id && (
                        <>
                          <button
                            className={`btn btn-sm ${u.isActive ? 'btn-ghost' : 'btn-success'}`}
                            onClick={() => handleToggleStatus(u.id)}
                            disabled={actionLoading === u.id}
                            title={u.isActive ? 'Suspend' : 'Activate'}
                          >
                            {u.isActive ? '⊘' : '⊕'}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setConfirmDelete(u)}
                            disabled={actionLoading === u.id}
                            title="Delete"
                          >
                            ⊗
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Pagination ─────────────────────── */}
        {pagination && pagination.totalPages > 1 && (
          <div className="fade-up">
            <Pagination 
              pagination={pagination} 
              onPageChange={(p) => setPage(p)} 
            />
          </div>
        )}
      </div>

      {/* ─── Confirmation Modal ───────────────── */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>⚠️</div>
            <h3 style={styles.modalTitle}>Delete professional account?</h3>
            <p style={styles.modalBody}>
              Removing <strong>{confirmDelete.firstName} {confirmDelete.lastName}</strong> is permanent and will revoke all access immediately.
            </p>
            <div style={styles.modalActions}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={actionLoading === confirmDelete.id}
              >
                {actionLoading === confirmDelete.id ? <div className="spinner" /> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Sub-components for better organization
function Modal({ children, onClose }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div className="card" style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={styles.skeletonRow}>
      <div style={styles.skeletonAvatar} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={styles.skeletonTextLong} />
        <div style={styles.skeletonTextShort} />
      </div>
    </div>
  );
}

// --- Styles ---

const styles = {
  page: { padding: '40px 24px', minHeight: '100vh' },
  inner: { maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 },
  header: { marginBottom: 8 },
  title: { fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'Syne, sans-serif' },
  subtitle: { color: 'var(--text-muted)', fontSize: 15 },
  searchWrap: {
    position: 'relative', display: 'flex', alignItems: 'center',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', overflow: 'hidden', padding: '2px'
  },
  searchIcon: { padding: '0 16px', fontSize: 16, color: 'var(--text-dim)' },
  searchInput: {
    flex: 1, background: 'none', border: 'none', outline: 'none',
    color: 'var(--text)', fontSize: 15, padding: '14px 0',
    fontFamily: 'inherit',
  },
  clearBtn: { padding: '0 16px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' },
  listCard: { padding: 0, overflow: 'hidden', border: '1px solid var(--border)' },
  tableHeader: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px',
    background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: 'var(--text-dim)',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px',
    borderBottom: '1px solid var(--border)', transition: 'background 0.2s',
  },
  userName: { fontSize: 15, fontWeight: 600, color: 'var(--text)', textDecoration: 'none' },
  userMeta: { marginTop: 2 },
  email: { fontSize: 14, color: 'var(--text-muted)' },
  roleSelect: {
    background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 6, color: 'var(--text)', fontSize: 12, padding: '4px 8px', cursor: 'pointer'
  },
  actionGroup: { flex: 2, display: 'flex', gap: 8, justifyContent: 'flex-end' },
  loadingState: { display: 'flex', flexDirection: 'column' },
  emptyState: { padding: '80px 24px', textAlign: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.5 },
  emptyText: { color: 'var(--text-muted)', fontSize: 15 },
  modalOverlay: { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { maxWidth: 440, width: '100%', padding: 40 },
  modalContent: { textAlign: 'center' },
  modalIcon: { fontSize: 44, marginBottom: 20 },
  modalTitle: { marginBottom: 12, fontSize: 20, fontWeight: 800, fontFamily: 'Syne, sans-serif' },
  modalBody: { color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32 },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'center' },
  skeletonRow: { display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--border)' },
  skeletonAvatar: { width: 40, height: 40, borderRadius: '50%', background: 'var(--surface2)' },
  skeletonTextLong: { height: 12, width: '30%', background: 'var(--surface2)', borderRadius: 4 },
  skeletonTextShort: { height: 10, width: '50%', background: 'var(--border)', borderRadius: 4 },
};