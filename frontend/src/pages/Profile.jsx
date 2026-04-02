import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { userAPI, authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ImageUpload from "../components/ImageUpload";
import Avatar from "../components/Avatar";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);
  const [newImage, setNewImage] = useState(null);

  // 1. Form for General Info
  const {
    register: regInfo,
    handleSubmit: handleInfoSubmit,
    formState: { errors: infoErrors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  // 2. Form for Password Change
  const {
    register: regPass,
    handleSubmit: handlePassSubmit,
    watch,
    reset: resetPassForm,
    formState: { errors: passErrors },
  } = useForm();

  const newPassword = watch("password");

  // Handle Profile Update
  const onInfoSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      if (newImage) formData.append("profileImage", newImage);

      const { data: res } = await userAPI.updateProfile(formData);
      updateUser(res.data.user);
      toast.success("Profile updated successfully!");
      setNewImage(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Handle Internal Password Reset
  const onPassSubmit = async (data) => {
    setPassLoading(true);
    try {
      // We use the same resetPassword API but with current user context
      await authAPI.updatePassword({
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success("Password changed successfully!");
      setShowPassForm(false);
      resetPassForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        {/* ─── Page Header ────────────────────── */}
        <div className="fade-up">
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>
            Manage your professional identity and public information
          </p>
        </div>

        {/* ─── Profile Overview Card ───────────── */}
        <div className="card fade-up fade-up-d1" style={styles.summaryCard}>
          <Avatar user={user} size={80} />
          <div style={styles.summaryInfo}>
            <h2 style={styles.summaryName}>
              {user?.firstName} {user?.lastName}
            </h2>
            <p style={styles.summaryEmail}>{user?.email}</p>
            <div style={styles.summaryBadges}>
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
              <span
                className={`badge ${user?.isVerified ? "badge-verified" : "badge-unverified"}`}
              >
                {user?.isVerified ? "✓ Verified" : "⚠ Unverified"}
              </span>
            </div>
          </div>

          <div style={styles.summaryMeta}>
            <div style={styles.metaItem}>
              <p style={styles.metaLabel}>Member Since</p>
              <p style={styles.metaValue}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en", {
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Edit Information Form ───────────── */}
        <div className="card fade-up fade-up-d2">
          <h2 style={styles.sectionTitle}>General Information</h2>
          <form onSubmit={handleInfoSubmit(onInfoSubmit)} style={styles.form}>
            <ImageUpload onChange={setNewImage} label="Change Profile Photo" />

            <div style={styles.nameRow}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">First Name</label>
                <input
                  {...regInfo("firstName", { required: "Required" })}
                  className={`input-field ${infoErrors.firstName ? "error" : ""}`}
                />
              </div>

              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Last Name</label>
                <input
                  {...regInfo("lastName", { required: "Required" })}
                  className={`input-field ${infoErrors.lastName ? "error" : ""}`}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                value={user?.email || ""}
                className="input-field"
                disabled
                style={styles.disabledInput}
              />
            </div>

            <div style={styles.formFooter}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* ─── NEW: Internal Password Change ────── */}
        <div className="card fade-up fade-up-d3">
          <h2 style={styles.sectionTitle}>Account Security</h2>

          {!showPassForm ? (
            <div style={styles.securityRow}>
              <div>
                <p style={styles.securityTitle}>Password</p>
                <p style={styles.securityDesc}>
                  Update your account password to keep your account safe.
                </p>
              </div>
              <button
                onClick={() => setShowPassForm(true)}
                className="btn btn-ghost btn-sm"
              >
                Change Password
              </button>
            </div>
          ) : (
            <form onSubmit={handlePassSubmit(onPassSubmit)} style={styles.form}>
              <div style={styles.nameRow}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">New Password</label>
                  <input
                    {...regPass("password", {
                      required: "Required",
                      minLength: { value: 8, message: "Min 8 characters" },
                    })}
                    type="password"
                    className={`input-field ${passErrors.password ? "error" : ""}`}
                  />
                  {passErrors.password && (
                    <p className="field-error">{passErrors.password.message}</p>
                  )}
                </div>

                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Confirm Password</label>
                  <input
                    {...regPass("confirmPassword", {
                      validate: (val) =>
                        val === newPassword || "Passwords do not match",
                    })}
                    type="password"
                    className={`input-field ${passErrors.confirmPassword ? "error" : ""}`}
                  />
                  {passErrors.confirmPassword && (
                    <p className="field-error">
                      {passErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div style={styles.formFooter}>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={passLoading}
                >
                  {passLoading ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassForm(false)}
                  className="btn btn-ghost btn-sm"
                  style={{ marginLeft: 10 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ─── Danger Zone ─────────────────────── */}
        <div className="card fade-up fade-up-d4" style={styles.dangerCard}>
          <h2 style={{ ...styles.sectionTitle, color: "var(--danger)" }}>
            Danger Zone
          </h2>
          <div style={styles.securityRow}>
            <div>
              <p style={styles.securityTitle}>Account ID</p>
              <code style={styles.code}>#{user?.id}</code>
            </div>
            <p style={styles.dangerHint}>Contact Admin to delete account.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "40px 24px", minHeight: "100vh" },
  inner: {
    maxWidth: 620,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginBottom: 4,
  },
  subtitle: { color: "var(--text-muted)", fontSize: 14 },
  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    padding: "28px 32px",
    flexWrap: "wrap",
  },
  summaryInfo: { flex: 1, minWidth: 180 },
  summaryName: { fontSize: 20, fontWeight: 800, marginBottom: 4 },
  summaryEmail: { fontSize: 14, color: "var(--text-muted)" },
  summaryBadges: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 },
  summaryMeta: {
    display: "flex",
    gap: 24,
    flexShrink: 0,
    borderLeft: "1px solid var(--border)",
    paddingLeft: 24,
  },
  metaLabel: {
    fontSize: 10,
    color: "var(--text-dim)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 4,
  },
  metaValue: { fontSize: 14, fontWeight: 600 },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 20 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  nameRow: { display: "flex", gap: 16 },
  disabledInput: {
    opacity: 0.5,
    cursor: "not-allowed",
    background: "var(--surface)",
  },
  formFooter: { paddingTop: 4 },
  securityRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  securityTitle: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  securityDesc: { fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4 },
  dangerCard: { borderColor: "rgba(248,113,113,0.2)" },
  dangerHint: { fontSize: 12, color: "var(--text-dim)" },
  code: {
    fontFamily: "monospace",
    background: "var(--surface2)",
    padding: "2px 4px",
    borderRadius: 4,
  },
};
