// Role-based route guard:
// This wrapper is used for protected pages like the patient, doctor, and admin dashboards.
// It listens to Firebase authentication, fetches the logged-in user's Firestore profile,
// verifies the expected role, and only then allows the child page to render.
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

function ProtectedRoleRoute({ children, requiredRole, redirectTo }) {
  // `status` tracks the final permission result.
  // `authLoading` keeps the page from rendering too early while Firebase is still checking the session.
  const [status, setStatus] = useState("checking");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // This flag prevents state updates after the component has unmounted.
    let active = true;

    // Firebase notifies this callback whenever login state changes.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // No logged-in user means the route must be blocked.
      if (!user) {
        if (active) {
          setStatus("denied");
          setAuthLoading(false);
        }
        return;
      }

      try {
        // The app stores role information in Firestore, so auth alone is not enough.
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (active) {
          if (!userSnap.exists()) {
            setStatus("denied");
            setAuthLoading(false);
            return;
          }

          const userData = userSnap.data();

          // Doctors need one extra approval check because the app supports admin-approved doctor accounts.
          const isApprovedDoctor =
            requiredRole !== "doctor" ||
            (userData.role === "doctor" && userData.approved === true);

          setStatus(userData.role === requiredRole && isApprovedDoctor ? "allowed" : "denied");
          setAuthLoading(false);
        }
      } catch {
        if (active) {
          setStatus("denied");
          setAuthLoading(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [requiredRole]);

  // A small loading state avoids flashing protected content before checks complete.
  if (authLoading) {
    return <div style={{ padding: "2rem" }}>Checking access...</div>;
  }

  // If the role check passes, render the requested page.
  // Otherwise, send the user back to the matching login page.
  return status === "allowed" ? children : <Navigate to={redirectTo} replace />;
}

export default ProtectedRoleRoute;
