// Admin login page:
// This page allows only admin-role accounts to enter the admin dashboard.
// It checks Firebase Authentication plus the Firestore `users` record for role validation.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../../lib/firebase";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "../../../shared/styles/auth.css";

function AdminLogin() {
  const navigate = useNavigate();

  // This local state powers the whole admin login screen.
  // `email` and `password` keep the form inputs controlled, `showPassword` controls whether the
  // password text is hidden or visible, `loading` prevents duplicate submissions, `checkingSession`
  // keeps the page in a loading state while Firebase checks for an existing login, and `error`
  // stores friendly feedback for failed authentication attempts.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // What this effect is for:
    // It checks whether the browser already has a signed-in Firebase user before showing the form.
    //
    // How it works:
    // Firebase's `onAuthStateChanged` listener runs immediately when the component mounts.
    // If no user session exists, the page stops "checking" and shows the login form.
    // If a user is already signed in, the code reads that person's Firestore document from
    // `users/{uid}` and checks the stored `role` value.
    //
    // How it integrates with other admin code:
    // The admin dashboard route should only open for users whose database role is `admin`.
    // This effect supports that rule by auto-redirecting valid admins to the dashboard and
    // signing out anyone whose Firebase session exists but whose Firestore profile is missing
    // or belongs to another role such as doctor or patient.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCheckingSession(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().role === "admin") {
          navigate("/admin/dashboard", { replace: true });
          return;
        }

        await signOut(auth);
      } catch (err) {
        console.error("Admin session check failed", err);
        await signOut(auth);
      } finally {
        setCheckingSession(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // What this function is for:
  // It handles the form submission when an administrator manually logs in.
  //
  // How it works:
  // 1. Prevents the browser's default form submission refresh.
  // 2. Uses Firebase Authentication to validate the email/password combination.
  // 3. Loads the signed-in user's Firestore profile document.
  // 4. Confirms that the profile exists and is marked with the `admin` role.
  // 5. Signs out unauthorized users and shows an error if the account is not allowed.
  // 6. Navigates successful admin users into `/admin/dashboard`.
  //
  // Why this extra role check matters:
  // Authentication only proves who the user is. The Firestore role check decides whether that
  // authenticated user belongs in the admin area of the hospital system.
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);
        setError("Unauthorized access");
        return;
      }

      const userData = userSnap.data();
      if (userData.role !== "admin") {
        await signOut(auth);
        setError("Unauthorized access");
        return;
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-email"
      ) {
        setError("Invalid credentials");
      } else {
        setError("Unable to sign in right now. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="auth-page">
        <section className="auth-shell">
          {/* This left panel keeps the loading state visually aligned with the normal admin portal. */}
          <aside className="auth-brand-panel" style={{ background: "linear-gradient(135deg, #7f1d1d, #450a0a)" }}>
            <p className="auth-eyebrow">Admin Access</p>
            <h1>System Administrator</h1>
            <p>
              Secure portal for hospital administration, doctor management, and system operations.
            </p>
          </aside>

          {/* This card is shown while the app is still validating whether an admin session already exists. */}
          <div className="auth-card">
            <h2>Admin Login</h2>
            <p className="auth-subtext">Checking your session...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        {/* The left panel explains the admin role and the type of control this portal provides. */}
        <aside className="auth-brand-panel" style={{ background: "linear-gradient(135deg, #7f1d1d, #450a0a)" }}>
          <p className="auth-eyebrow">Admin Access</p>
          <h1>System Administrator</h1>
          <p>
            Secure portal for hospital administration, doctor management, and system operations.
          </p>
          <ul>
            <li>Manage medical staff</li>
            <li>Monitor appointment flows</li>
            <li>Maintain system integrity</li>
          </ul>
        </aside>

        {/* The right panel contains the restricted login form. */}
        <div className="auth-card">
          <h2>Admin Login</h2>
          <p className="auth-subtext">Restricted Area. Authorized personnel only.</p>

          {/* This form is the direct entry point into the admin dashboard and is wired to `handleLogin`. */}
          <form onSubmit={handleLogin} className="auth-form">
            <label htmlFor="login-email">Admin Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="admin@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="login-password">Password</label>
            <div className="auth-password-field">
              {/* The password input remains controlled so the component always knows the current value. */}
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                // This toggles password visibility for usability without submitting the form.
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {error ? <p className="auth-error">{error}</p> : null}

            <button className="auth-btn primary" type="submit" disabled={loading} style={{ background: "#7f1d1d" }}>
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>

          <Link className="auth-back" to="/">
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default AdminLogin;
