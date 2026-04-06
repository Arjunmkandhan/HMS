// Admin signup page:
// This page creates new admin accounts and stores their role information in Firestore.
// It is mainly used to initialize or add administrative access for the system.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import "../../../shared/styles/auth.css";

function AdminSignup() {
  const navigate = useNavigate();

  // Controlled input and submission state.
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Creates the Firebase Authentication account and matching Firestore user profile.
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", user.uid), {
        email: user.email || email,
        name: fullName,
        role: "admin",
        profileCompleted: true,
        createdAt: serverTimestamp(),
      });

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell">
        {/* Informational panel for the admin onboarding purpose. */}
        <aside className="auth-brand-panel" style={{ background: "linear-gradient(135deg, #7f1d1d, #450a0a)" }}>
          <p className="auth-eyebrow">Admin Registration</p>
          <h1>Initialize Admin</h1>
          <p>
            Create an administrative account to oversee system components and medical staff.
          </p>
          <ul>
            <li>Full system authority</li>
            <li>Doctor onboarding flow</li>
            <li>Audit appointment records</li>
          </ul>
        </aside>

        {/* The actual admin registration form. */}
        <div className="auth-card">
          <h2>Admin Setup</h2>
          <p className="auth-subtext">Register a new administrative account.</p>

          <form onSubmit={handleSignup} className="auth-form">
            <label htmlFor="signup-email">Official Email</label>
            <input
              id="signup-email"
              type="email"
              placeholder="admin@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="signup-name">Admin Name</label>
            <input
              id="signup-name"
              type="text"
              placeholder="e.g., Chief Administrator"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <label htmlFor="signup-password">Security Key (Password)</label>
            <input
              id="signup-password"
              type="password"
              placeholder="Create a complex password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label htmlFor="signup-confirm-password">Confirm Security Key</label>
            <input
              id="signup-confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error ? <p className="auth-error">{error}</p> : null}

            <button className="auth-btn primary" type="submit" disabled={loading} style={{ background: "#7f1d1d" }}>
              {loading ? "Creating..." : "Create Admin Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already an Admin? <Link to="/admin-login">Sign in</Link>
          </p>
          <Link className="auth-back" to="/">
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default AdminSignup;
