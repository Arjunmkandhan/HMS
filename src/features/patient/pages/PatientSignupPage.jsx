// Patient signup page:
// This page creates new patient accounts and then redirects the user into the
// vitals-completion flow so their medical profile can be filled in.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../../lib/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import "../../../shared/styles/auth.css";

function PatientSignup() {
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();

  // Controlled form state for the signup fields.
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Shared routing helper:
  // After account creation or Google sign-in, the app checks whether this user already
  // has patient records and then sends them to either vitals setup or the dashboard.
  const routeAfterLogin = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // New Google user: create the shared user profile and a patient record immediately.
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
    if (userData.role !== "patient") {
      setError("This account is not registered as a Patient.");
      return;
    }

    const patientRef = doc(db, "patients", user.uid);
    const patientSnap = await getDoc(patientRef);

    if (patientSnap.exists() && patientSnap.data()?.vitalsCompleted) {
      navigate("/patient-dashboard");
    } else {
      navigate("/patient-vitals");
    }
  };

  // Google signup/login:
  // Firebase handles both cases, and this app decides the next page after checking Firestore.
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

  // Email/password signup:
  // Creates the auth account and a basic `users` document, then sends the patient to vitals setup.
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
        role: "patient",
        profileCompleted: false,
        createdAt: serverTimestamp(),
      });

      // The dedicated vitals page creates or completes the patient-specific document.
      navigate("/patient-vitals");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell">
        {/* Branding side that explains the purpose of the registration flow. */}
        <aside className="auth-brand-panel">
          <p className="auth-eyebrow">Patient Registration</p>
          <h1>Create Your Account</h1>
          <p>
            Join HMS Care to book appointments quickly and keep your health
            records organized in one place.
          </p>
          <ul>
            <li>Easy onboarding flow</li>
            <li>Protected patient data</li>
            <li>Access from any device</li>
          </ul>
        </aside>

        {/* Signup card containing the patient registration fields. */}
        <div className="auth-card">
          <h2>Patient Signup</h2>
          <p className="auth-subtext">Set up your secure patient account.</p>

          <form onSubmit={handleSignup} className="auth-form">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label htmlFor="signup-confirm-password">Confirm Password</label>
            <input
              id="signup-confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error ? <p className="auth-error">{error}</p> : null}

            <button className="auth-btn primary" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <button
              className="auth-btn secondary"
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/patient-login">Sign in</Link>
          </p>
          <Link className="auth-back" to="/">
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default PatientSignup;
