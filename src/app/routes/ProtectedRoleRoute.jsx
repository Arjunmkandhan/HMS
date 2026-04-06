import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

function ProtectedRoleRoute({ children, requiredRole, redirectTo }) {
  const [status, setStatus] = useState("checking");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (active) {
          setStatus("denied");
          setAuthLoading(false);
        }
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (active) {
          if (!userSnap.exists()) {
            setStatus("denied");
            setAuthLoading(false);
            return;
          }

          const userData = userSnap.data();
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

  if (authLoading) {
    return <div style={{ padding: "2rem" }}>Checking access...</div>;
  }

  return status === "allowed" ? children : <Navigate to={redirectTo} replace />;
}

export default ProtectedRoleRoute;
