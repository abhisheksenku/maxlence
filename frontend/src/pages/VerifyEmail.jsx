import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authAPI } from "../services/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const token = searchParams.get("token");
  const called = useRef(false);
  useEffect(() => {
    if (called.current) return; // prevent second call
    called.current = true;
    // If no token is provided in the URL, fail immediately
    if (!token) {
      setStatus("error");
      return;
    }

    // Call the backend to verify the token
    authAPI
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        console.error("Verification error:", err);
        if (err.response?.status === 400) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      });
  }, [token]);

  return (
    <div style={styles.page}>
      <div className="card fade-up" style={styles.card}>
        {/* ─── Loading State ────────────────────── */}
        {status === "loading" && (
          <div style={styles.stateWrapper}>
            <div className="spinner" style={styles.spinner} />
            <h2 style={styles.title}>Verifying account...</h2>
            <p style={styles.subtitle}>
              Please hold on while we confirm your email address.
            </p>
          </div>
        )}

        {/* ─── Success State ────────────────────── */}
        {status === "success" && (
          <div style={styles.stateWrapper}>
            <div style={styles.iconSuccess}>✅</div>
            <h2 style={styles.title}>Email Verified!</h2>
            <p style={styles.subtitle}>
              Your account is now active. You can proceed to sign in to the
              NexusLink platform.
            </p>
            <Link
              to="/login"
              className="btn btn-primary btn-full"
              style={{ marginTop: 12 }}
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* ─── Error State ──────────────────────── */}
        {status === "error" && (
          <div style={styles.stateWrapper}>
            <div style={styles.iconError}>❌</div>
            <h2 style={styles.title}>Verification Failed</h2>
            <p style={styles.subtitle}>
              This link is invalid or has expired. Links are usually valid for
              24 hours.
            </p>
            <div style={styles.actionGroup}>
              <Link to="/register" className="btn btn-primary btn-full">
                Register Again
              </Link>
              <Link to="/login" style={styles.backLink}>
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Styles ---

const styles = {
  page: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    textAlign: "center",
    padding: "56px 40px",
    maxWidth: "420px",
    width: "100%",
  },
  stateWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  spinner: {
    width: 44,
    height: 44,
    margin: "0 auto 24px",
    borderWidth: 3,
    borderTopColor: "var(--accent)",
  },
  title: {
    fontSize: "24px",
    fontWeight: 800,
    marginBottom: "12px",
    fontFamily: "Syne, sans-serif",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: "var(--text-muted)",
    marginBottom: "32px",
    lineHeight: 1.6,
    fontSize: "15px",
  },
  iconSuccess: {
    fontSize: "52px",
    marginBottom: "20px",
  },
  iconError: {
    fontSize: "52px",
    marginBottom: "20px",
  },
  actionGroup: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  backLink: {
    fontSize: "14px",
    color: "var(--text-dim)",
    textDecoration: "none",
    fontWeight: 500,
  },
};
