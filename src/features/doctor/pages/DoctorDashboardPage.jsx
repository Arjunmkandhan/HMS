// Doctor dashboard page:
// This is the main smart container for the doctor portal.
// It loads the authenticated doctor's Firestore profile, subscribes to appointments and prescriptions,
// derives dashboard statistics, and then delegates the visual rendering to child dashboard components.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getAppointmentSortValue } from "../../../shared/utils/appointmentSlots";
import DoctorSidebar from "../components/dashboard/DoctorSidebar";
import DoctorTopbar from "../components/dashboard/DoctorTopbar";
import {
  DoctorAppointmentsSection,
  DoctorOverview,
  DoctorPatientsSection,
  DoctorPrescriptionsSection,
  DoctorProfileSection,
} from "../components/dashboard/DoctorSections";
import { auth, db } from "../../../lib/firebase";
import "../../../shared/styles/doctorDashboard.css";

const TAB_LABELS = {
  overview: "Dashboard",
  appointments: "Appointments",
  patients: "Patients",
  prescriptions: "Prescriptions",
  profile: "Profile",
};

function normalizeSpecialization(specialization) {
  // Doctors may store specialization as a single string or an array, so this helper creates one display label.
  if (Array.isArray(specialization)) {
    return specialization.join(", ");
  }

  return specialization || "General";
}

function sortByDateTime(items) {
  // Keeps dashboard lists sorted using the same shared appointment utility used across the app.
  return [...items].sort((first, second) => {
    const firstValue = getAppointmentSortValue(first.date, first.time);
    const secondValue = getAppointmentSortValue(second.date, second.time);
    return secondValue - firstValue;
  });
}

function DoctorDashboard() {
  const navigate = useNavigate();
  // `today` is reused by filters, overview cards, and prescription records.
  const today = new Date().toISOString().slice(0, 10);

  // UI state for navigation, menus, and loading feedback.
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointmentFilter, setAppointmentFilter] = useState("today");
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [prescriptionSaving, setPrescriptionSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: "",
    medicines: "",
    notes: "",
  });
  const [profileForm, setProfileForm] = useState({
    name: "",
    specialization: "",
    phone: "",
    availability: "",
  });

  useEffect(() => {
    // Real-time subscriptions are declared outside so they can be cleaned up whenever auth changes.
    let unsubscribeAppointments = null;
    let unsubscribePrescriptions = null;
    let cancelled = false;

    // First step: confirm the logged-in user is an approved doctor.
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/doctor-login", { replace: true });
        return;
      }

      setLoading(true);
      setError("");

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        // Block access if the account exists but is not a valid approved doctor.
        if (
          !userSnap.exists() ||
          userSnap.data().role !== "doctor" ||
          userSnap.data().approved !== true
        ) {
          await signOut(auth);
          navigate("/doctor-login", { replace: true });
          return;
        }

        const userData = userSnap.data();
        let doctorId = userData.doctorId || "";
        let doctorData = null;

        // Prefer the linked doctor ID stored on the user profile when it already exists.
        if (doctorId) {
          const doctorDocSnap = await getDoc(doc(db, "doctors", doctorId));
          if (doctorDocSnap.exists()) {
            doctorData = { id: doctorDocSnap.id, ...doctorDocSnap.data() };
          }
        }

        // If the link is missing, fall back to matching the doctor by email and then repair the user document.
        if (!doctorData) {
          const normalizedEmail = (user.email || userData.email || "").trim().toLowerCase();
          const doctorQuery = query(collection(db, "doctors"), where("email", "==", normalizedEmail));
          const doctorSnap = await getDocs(doctorQuery);
          const doctorDoc = doctorSnap.docs[0];

          if (!doctorDoc) {
            if (!cancelled) {
              setDoctorProfile(null);
              setLoading(false);
              setError("No doctor profile was found for this account.");
            }
            return;
          }

          doctorData = { id: doctorDoc.id, ...doctorDoc.data() };
          doctorId = doctorDoc.id;

          await updateDoc(userRef, {
            doctorId,
            email: normalizedEmail,
            name: doctorData.name || userData.name || "Doctor",
            updatedAt: serverTimestamp(),
          });
        }

        if (cancelled) {
          return;
        }

        const nextDoctorProfile = {
          ...doctorData,
          specializationLabel: normalizeSpecialization(doctorData.specialization),
        };

        // Keep a separate editable form copy so the doctor can change fields without mutating saved state immediately.
        setDoctorProfile(nextDoctorProfile);
        setProfileForm({
          name: nextDoctorProfile.name || "",
          specialization: nextDoctorProfile.specializationLabel || "",
          phone: nextDoctorProfile.phone || "",
          availability: nextDoctorProfile.availability || "",
        });

        if (unsubscribeAppointments) {
          unsubscribeAppointments();
        }
        if (unsubscribePrescriptions) {
          unsubscribePrescriptions();
        }

        // Live appointments listener:
        // Any change in Firestore immediately refreshes the doctor's appointments view.
        const appointmentQuery = query(collection(db, "appointments"), where("doctorId", "==", doctorId));
        unsubscribeAppointments = onSnapshot(appointmentQuery, (snapshot) => {
          const appointmentData = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
            status: (item.data().status || "pending").toLowerCase(),
          }));
          setAppointments(sortByDateTime(appointmentData));
          setLoading(false);
        });

        // Live prescriptions listener for the prescriptions tab and dashboard summary.
        const prescriptionQuery = query(collection(db, "prescriptions"), where("doctorId", "==", doctorId));
        unsubscribePrescriptions = onSnapshot(prescriptionQuery, (snapshot) => {
          const prescriptionData = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }));
          setPrescriptions(sortByDateTime(prescriptionData));
        });
      } catch (fetchError) {
        console.error("Doctor dashboard load failed", fetchError);
        if (!cancelled) {
          setError("Unable to load the doctor dashboard right now.");
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribeAuth();
      if (unsubscribeAppointments) {
        unsubscribeAppointments();
      }
      if (unsubscribePrescriptions) {
        unsubscribePrescriptions();
      }
    };
  }, [navigate]);

  useEffect(() => {
    // The doctor does not have a direct patient list collection, so patients are derived from appointment links.
    if (!appointments.length) {
      setPatients([]);
      setSelectedPatient(null);
      return;
    }

    let cancelled = false;

    async function loadPatients() {
      try {
        // Collect unique patient IDs from appointments, then fetch those patient documents one by one.
        const uniquePatientIds = [...new Set(appointments.map((item) => item.patientUid).filter(Boolean))];
        const patientData = [];

        for (const patientId of uniquePatientIds) {
          const patientSnap = await getDoc(doc(db, "patients", patientId));
          if (patientSnap.exists()) {
            patientData.push({
              id: patientSnap.id,
              ...patientSnap.data(),
            });
          }
        }

        if (!cancelled) {
          setPatients(patientData);
          setSelectedPatient((current) => {
            if (!current) {
              return patientData[0] || null;
            }

            return patientData.find((item) => item.id === current.id) || patientData[0] || null;
          });
        }
      } catch (patientError) {
        console.error("Failed to load doctor patients", patientError);
      }
    }

    loadPatients();

    return () => {
      cancelled = true;
    };
  }, [appointments]);

  // Logs the doctor out and sends them back to the login page.
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/doctor-login", { replace: true });
  };

  const handleStatusUpdate = async (appointmentId, nextStatus) => {
    try {
      setActionLoadingId(appointmentId);

      // Cancellation is implemented by deleting the appointment document entirely.
      if (nextStatus === "cancelled") {
        await deleteDoc(doc(db, "appointments", appointmentId));
        return;
      }

      // Other status changes update the same Firestore appointment document.
      await updateDoc(doc(db, "appointments", appointmentId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (updateError) {
      console.error("Failed to update appointment status", updateError);
      setError("Unable to update appointment status.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleSavePrescription = async (event) => {
    event.preventDefault();

    if (!doctorProfile?.id) {
      return;
    }

    try {
      setPrescriptionSaving(true);
      const selectedPrescriptionPatient = patients.find((item) => item.id === prescriptionForm.patientId);

      // Save the prescription as a new Firestore document that will later appear in both doctor and patient portals.
      await addDoc(collection(db, "prescriptions"), {
        patientId: prescriptionForm.patientId,
        patientName:
          selectedPrescriptionPatient?.name ||
          selectedPrescriptionPatient?.fullName ||
          "Patient",
        doctorId: doctorProfile.id,
        medicines: prescriptionForm.medicines.trim(),
        notes: prescriptionForm.notes.trim(),
        date: today,
        createdAt: serverTimestamp(),
      });

      setPrescriptionForm({
        patientId: "",
        medicines: "",
        notes: "",
      });
    } catch (saveError) {
      console.error("Failed to save prescription", saveError);
      setError("Unable to save prescription.");
    } finally {
      setPrescriptionSaving(false);
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!doctorProfile?.id || !auth.currentUser) {
      return;
    }

    try {
      setProfileSaving(true);

      // Specializations are stored as an array in Firestore even though the form uses comma-separated text.
      const specializationArray = profileForm.specialization
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      await updateDoc(doc(db, "doctors", doctorProfile.id), {
        name: profileForm.name.trim(),
        specialization: specializationArray.length ? specializationArray : [profileForm.specialization.trim()],
        phone: profileForm.phone.trim(),
        availability: profileForm.availability.trim(),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        name: profileForm.name.trim(),
        updatedAt: serverTimestamp(),
      });
    } catch (saveError) {
      console.error("Failed to update doctor profile", saveError);
      setError("Unable to update doctor profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Search bar filter used in the patients tab.
  const filteredPatients = patients.filter((patient) => {
    const queryValue = patientSearch.trim().toLowerCase();
    if (!queryValue) {
      return true;
    }

    return `${patient.name || patient.fullName || ""}`.toLowerCase().includes(queryValue);
  });

  // Tab-level appointment filter used by the appointments section buttons.
  const filteredAppointments = appointments.filter((appointment) => {
    const status = (appointment.status || "pending").toLowerCase();
    if (appointmentFilter === "today") {
      return appointment.date === today && status !== "completed" && status !== "cancelled";
    }
    if (appointmentFilter === "upcoming") {
      return appointment.date > today && status !== "completed" && status !== "cancelled";
    }
    return status === "completed";
  });

  // Summary numbers displayed in the overview cards.
  const stats = {
    totalPatients: patients.length,
    todayAppointments: appointments.filter(
      (item) =>
        item.date === today &&
        !["completed", "cancelled"].includes((item.status || "pending").toLowerCase())
    ).length,
    upcomingAppointments: appointments.filter(
      (item) =>
        item.date > today &&
        !["completed", "cancelled"].includes((item.status || "pending").toLowerCase())
    ).length,
    completedConsultations: appointments.filter(
      (item) => (item.status || "pending").toLowerCase() === "completed"
    ).length,
  };

  const highlightedAppointments = appointments.filter(
    (item) => item.date === today && (item.status || "pending").toLowerCase() === "pending"
  );

  const renderContent = () => {
    // If the account is valid but no doctor profile document exists, show a helpful fallback card.
    if (!doctorProfile && !loading) {
      return (
        <div className="dd-card">
          <h2>Doctor Profile Not Found</h2>
          <p className="dd-muted">
            This account is authenticated, but there is no linked doctor record in Firestore yet.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case "appointments":
        // Appointments tab passes filtered data and mutation handlers to the presentational child component.
        return (
          <DoctorAppointmentsSection
            actionLoadingId={actionLoadingId}
            appointmentFilter={appointmentFilter}
            appointments={filteredAppointments}
            loading={loading}
            onUpdateStatus={handleStatusUpdate}
            setAppointmentFilter={setAppointmentFilter}
          />
        );
      case "patients":
        // Patients tab receives the current search state and selected patient details.
        return (
          <DoctorPatientsSection
            loading={loading}
            onSelectPatient={setSelectedPatient}
            patients={filteredPatients}
            searchValue={patientSearch}
            selectedPatient={selectedPatient}
            setSearchValue={setPatientSearch}
          />
        );
      case "prescriptions":
        // Prescriptions tab receives the controlled form plus the live prescription list.
        return (
          <DoctorPrescriptionsSection
            patients={patients}
            prescriptionForm={prescriptionForm}
            prescriptions={prescriptions}
            saving={prescriptionSaving}
            setPrescriptionForm={setPrescriptionForm}
            onSubmitPrescription={handleSavePrescription}
          />
        );
      case "profile":
        // Profile tab shows current doctor data and lets the doctor update profile fields.
        return (
          <DoctorProfileSection
            doctorProfile={doctorProfile}
            profileForm={profileForm}
            saving={profileSaving}
            setProfileForm={setProfileForm}
            onSaveProfile={handleSaveProfile}
          />
        );
      default:
        // Default tab is the overview dashboard.
        return (
          <DoctorOverview
            doctorProfile={doctorProfile}
            highlightedAppointments={highlightedAppointments}
            onQuickNavigate={setActiveTab}
            recentPatients={patients}
            stats={stats}
          />
        );
    }
  };

  return (
    <div className="dd-layout">
      {/* Sidebar controls which section is active and provides logout/navigation actions. */}
      <DoctorSidebar
        activeTab={activeTab}
        doctorName={doctorProfile?.name}
        onLogout={handleLogout}
        onNavigate={setActiveTab}
        setSidebarOpen={setSidebarOpen}
        sidebarOpen={sidebarOpen}
      />

      <div className="dd-main">
        {/* Top bar reflects the current tab and exposes quick actions like menu toggle and logout. */}
        <DoctorTopbar
          activeLabel={TAB_LABELS[activeTab]}
          doctorEmail={doctorProfile?.email}
          doctorName={doctorProfile?.name}
          notificationCount={highlightedAppointments.length}
          onLogout={handleLogout}
          setShowMenu={setShowUserMenu}
          setSidebarOpen={setSidebarOpen}
          showMenu={showUserMenu}
        />

        <main className="dd-content">
          {/* Shared error banner used for Firestore operation failures. */}
          {error ? <div className="dd-alert">{error}</div> : null}

          {/* If profile data has not loaded yet, show a placeholder card instead of an empty page. */}
          {loading && !doctorProfile ? <div className="dd-card">Loading doctor dashboard...</div> : renderContent()}
        </main>
      </div>
    </div>
  );
}

export default DoctorDashboard;
