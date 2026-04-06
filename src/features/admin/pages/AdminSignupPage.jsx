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

  // This state manages every moving part of the admin registration form.
  // The text states keep each field controlled, `loading` prevents repeat submissions while
  // Firebase is creating the account, and `error` gives the user a visible explanation when
  // validation or account creation fails.
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // What this function is for:
  // It creates a brand-new administrator account for the hospital system.
  //
  // How it works:
  // 1. Prevents the browser's default form refresh.
  // 2. Verifies that the password and confirm-password fields match.
  // 3. Uses Firebase Authentication to create the secure login credentials.
  // 4. Writes a matching profile document into Firestore under `users/{uid}`.
  // 5. Stores the essential role metadata (`role: "admin"`) that the admin login and dashboard
  //    later use to authorize access.
  // 6. Redirects the newly created admin user to the admin dashboard.
  //
  // How it integrates with other admin files:
  // `AdminLoginPage.jsx` checks this saved Firestore role during login, and
  // `AdminDashboardPage.jsx` assumes that an account reaching it has already been marked as admin.
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

        {/* The actual admin registration form. This is where the admin account gets created. */}
        <div className="auth-card">
          <h2>Admin Setup</h2>
          <p className="auth-subtext">Register a new administrative account.</p>

          {/* This form collects the data required to create both the Auth account and Firestore profile. */}
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
