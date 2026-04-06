// Patient login page:
// This page handles both email/password login and Google login for patients.
// It is the main entry point into the patient side of the website and decides
// whether the user should go to the vitals form or directly to the patient dashboard.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import "../../../shared/styles/auth.css";

function PatientLogin() {
  // Google provider is used by Firebase popup-based sign-in.
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();

  // Form and UI state for the login screen.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Post-login routing:
  // After Firebase authenticates a user, this helper checks Firestore to confirm that
  // the account belongs to the patient portal and that the profile has the required data.
  const routeAfterLogin = async (user) => {
    // The `users` collection stores the role for every logged-in account.
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // First-time Google login:
      // Create a shared user record plus a patient-specific record, then continue to vitals setup.
      await setDoc(userRef, {
        email: user.email || "",
        name: user.displayName || "Patient",
        role: "patient",
        profileCompleted: true,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, "patients", user.uid), {
        uid: user.uid,
        name: user.displayName || "Patient",
        email: user.email || "",
        role: "patient",
        vitalsCompleted: false,
        createdAt: serverTimestamp(),
      });

      navigate("/patient-vitals");
      return;
    }

    const userData = userSnap.data();

    // Prevent cross-portal access, such as an admin trying to enter the patient portal.
    if (userData.role && userData.role !== "patient") {
      setError("This account is not registered as a Patient. Please use the correct portal.");
      return;
    }

    // Older records may miss the role field, so the page repairs that data automatically.
    if (!userData.role) {
      await setDoc(
        userRef,
        {
          email: user.email || "",
          name: user.displayName || userData.name || "Patient",
          role: "patient",
          profileCompleted: userData.profileCompleted ?? true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    // The `patients` collection stores health-profile progress such as vitals completion.
    const patientRef = doc(db, "patients", user.uid);
    const patientSnap = await getDoc(patientRef);

    if (patientSnap.exists() && patientSnap.data()?.vitalsCompleted) {
      navigate("/patient-dashboard");
    } else {
      navigate("/patient-vitals");
    }
  };

  // Google sign-in flow:
  // Uses Firebase popup auth and then reuses the same routing helper as normal login.
  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const { user } = await signInWithPopup(auth, provider);
      await routeAfterLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Email/password sign-in flow.
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await routeAfterLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell">
        {/* Left branding panel that explains what the patient portal is used for. */}
        <aside className="auth-brand-panel">
          <p className="auth-eyebrow">Patient Access</p>
          <h1>Welcome Back</h1>
          <p>
            Sign in to manage your appointments, prescriptions, and health
            records securely.
          </p>
          <ul>
            <li>Fast appointment booking</li>
            <li>Secure medical history</li>
            <li>Simple doctor follow-ups</li>
          </ul>
        </aside>

        {/* Right-side login card that contains the actual authentication form. */}
        <div className="auth-card">
          <h2>Patient Login</h2>
          <p className="auth-subtext">Use your registered email and password.</p>

          <form onSubmit={handleLogin} className="auth-form">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="login-password">Password</label>
            <div className="auth-password-field">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {/* This button only changes visibility in the UI; it does not affect authentication logic. */}
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Error feedback is shown only when login fails or portal validation fails. */}
            {error ? <p className="auth-error">{error}</p> : null}

            <button className="auth-btn primary" type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* Alternate login path using Google Authentication. */}
            <button
              className="auth-btn secondary"
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>
          </form>

          {/* Navigation helpers for users who need signup or want to leave the portal. */}
          <p className="auth-switch">
            New patient? <Link to="/patient-signup">Create an account</Link>
          </p>
          <Link className="auth-back" to="/">
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default PatientLogin;
