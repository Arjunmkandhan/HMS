// Admin dashboard page:
// This file is now the data/controller layer for the admin portal.
// It loads Firestore data, manages form state and actions, and passes that information
// into smaller dashboard section components for rendering.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, createDoctorAuthAccount, db } from "../../../lib/firebase";
import {
  buildAppointmentSlotId,
  expandDoctorTimeSlotsForDay,
  getDayNameFromDate,
  getAppointmentSortValue,
  isDateWithinAvailability,
  normalizeDoctorTimeSlots,
} from "../../../shared/utils/appointmentSlots";
import AdminAppointmentsSection from "../components/dashboard/AdminAppointmentsSection";
import AdminBedsSection from "../components/dashboard/AdminBedsSection";
import AdminBillingSection from "../components/dashboard/AdminBillingSection";
import {
  DAY_OPTIONS,
  appointmentAnalyticsData,
  bedChartColors,
  initialBeds,
  inventoryData,
  navigationItems,
  patientGrowthData,
} from "../components/dashboard/AdminDashboardConstants";
import {
  getDoctorDepartment,
  getPatientDisplayName,
  normalizePhoneNumber,
  formatTimeLabel,
} from "../components/dashboard/AdminDashboardUtils";
import AdminDoctorsSection from "../components/dashboard/AdminDoctorsSection";
import AdminInventorySection from "../components/dashboard/AdminInventorySection";
import AdminOverviewSection from "../components/dashboard/AdminOverviewSection";
import AdminPatientsSection from "../components/dashboard/AdminPatientsSection";
import AdminSidebar from "../components/dashboard/AdminSidebar";
import AdminTopbar from "../components/dashboard/AdminTopbar";
import "../../../shared/styles/admin.css";

function AdminPanel() {
  const todayDate = new Date().toISOString().slice(0, 10);
  const navigate = useNavigate();

  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [beds, setBeds] = useState([]);
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    specialization: "",
    email: "",
    password: "",
    phone: "",
    availabilityDays: [],
    slotDay: "",
    slotStart: "",
    slotEnd: "",
    timeSlots: [],
  });
  const [patientForm, setPatientForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    address: "",
    bloodGroup: "",
    condition: "",
  });
  const [appointmentForm, setAppointmentForm] = useState({
    patientUid: "",
    patientName: "",
    doctorId: "",
    doctorName: "",
    department: "",
    date: "",
    time: "",
  });
  const [bedForm, setBedForm] = useState({ bedId: "", status: "Available", patient: "" });
  const [doctorError, setDoctorError] = useState("");
  const [patientError, setPatientError] = useState("");
  const [appointmentError, setAppointmentError] = useState("");
  const [bedError, setBedError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/admin-login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().role === "admin") {
          setAuthLoading(false);
        } else {
          navigate("/admin-login");
        }
      } catch (error) {
        console.error("Auth error", error);
        navigate("/admin-login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [doctorSnap, patientSnap, appointmentSnap] = await Promise.all([
          getDocs(collection(db, "doctors")),
          getDocs(collection(db, "patients")),
          getDocs(collection(db, "appointments")),
        ]);

        if (!isMounted) {
          return;
        }

        const doctorData = doctorSnap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        const patientData = patientSnap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
          admittedOn:
            item.data().admittedOn ||
            item.data().createdAt?.toDate?.().toISOString().slice(0, 10) ||
            "",
        }));

        const appointmentData = appointmentSnap.docs.map((item) => {
          const data = item.data();
          return {
            id: item.id,
            ...data,
            patient: data.patientName || data.patient || "Unknown patient",
            doctor: data.doctor || data.doctorName || "Unknown doctor",
            department:
              data.department ||
              data.specialty ||
              data.specialization ||
              "General",
            status: data.status || "pending",
          };
        });

        setDoctors(doctorData);
        setPatients(patientData);
        setAppointments(appointmentData);
        setBeds(initialBeds);
      } catch (error) {
        console.error("Failed to load admin dashboard data", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [authLoading]);

  const filteredPatients = useMemo(() => {
    const queryValue = searchTerm.trim().toLowerCase();
    if (!queryValue) {
      return patients;
    }

    return patients.filter((patient) =>
      [
        getPatientDisplayName(patient),
        patient.condition,
        patient.phone,
        patient.email,
      ]
        .join(" ")
        .toLowerCase()
        .includes(queryValue)
    );
  }, [patients, searchTerm]);

  const filteredDoctors = useMemo(() => {
    const queryValue = searchTerm.trim().toLowerCase();
    if (!queryValue) {
      return doctors;
    }

    return doctors.filter((doctor) =>
      [
        doctor.name,
        Array.isArray(doctor.specialization)
          ? doctor.specialization.join(" ")
          : doctor.specialization,
        doctor.email,
        doctor.phone,
        doctor.availability,
      ]
        .join(" ")
        .toLowerCase()
        .includes(queryValue)
    );
  }, [doctors, searchTerm]);

  const filteredAppointments = useMemo(() => {
    const queryValue = searchTerm.trim().toLowerCase();
    if (!queryValue) {
      return appointments;
    }

    return appointments.filter((appointment) =>
      [appointment.patient, appointment.doctor, appointment.department, appointment.status]
        .join(" ")
        .toLowerCase()
        .includes(queryValue)
    );
  }, [appointments, searchTerm]);

  const filteredBeds = useMemo(() => {
    const queryValue = searchTerm.trim().toLowerCase();
    if (!queryValue) {
      return beds;
    }

    return beds.filter((bed) =>
      [bed.id, bed.ward, bed.patient, bed.status, bed.bedType]
        .join(" ")
        .toLowerCase()
        .includes(queryValue)
    );
  }, [beds, searchTerm]);

  const filteredInventory = useMemo(() => {
    const queryValue = searchTerm.trim().toLowerCase();
    if (!queryValue) {
      return inventoryData.map((item) => ({ ...item, id: item.item }));
    }

    return inventoryData
      .filter((item) => [item.item, item.vendor].join(" ").toLowerCase().includes(queryValue))
      .map((item) => ({ ...item, id: item.item }));
  }, [searchTerm]);

  const totalBeds = beds.length;
  const availableBeds = beds.filter((bed) => bed.status === "Available").length;
  const occupiedBeds = beds.filter((bed) => bed.status === "Occupied").length;
  const maintenanceBeds = beds.filter((bed) => bed.status === "Maintenance").length;
  const appointmentsToday = appointments.filter((appointment) => appointment.date === todayDate).length;

  const stats = [
    { label: "Total Doctors", value: doctors.length, helper: "Across core hospital departments" },
    { label: "Total Patients", value: patients.length, helper: "Active patient records in the system" },
    { label: "Total Beds", value: totalBeds, helper: "Including ICU, general, and private wards" },
    { label: "Available Beds", value: availableBeds, helper: "Beds ready for immediate allocation" },
    { label: "Appointments Today", value: appointmentsToday, helper: "Confirmed and pending visits for today" },
  ];

  const bedOccupancyData = [
    { name: "Occupied", value: occupiedBeds },
    { name: "Available", value: availableBeds },
    { name: "Maintenance", value: maintenanceBeds },
  ];

  const lowStockAlerts = inventoryData.filter((item) => item.remaining <= item.threshold);
  const bedAlerts = availableBeds <= 2
    ? [{ title: "Low bed availability", note: `${availableBeds} beds are currently open for admissions.` }]
    : [{ title: "Bed capacity stable", note: `${availableBeds} beds remain available across wards.` }];

  const patientOptions = useMemo(
    () =>
      patients.map((patient) => ({
        id: patient.uid || patient.id,
        name: getPatientDisplayName(patient),
      })),
    [patients]
  );

  const doctorOptions = useMemo(
    () =>
      doctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.name,
        department: getDoctorDepartment(doctor),
        availability: doctor.availability || "",
        timeSlots: normalizeDoctorTimeSlots(doctor.timeSlots),
      })),
    [doctors]
  );

  const availableAppointmentSlots = useMemo(() => {
    const selectedDoctor = doctorOptions.find((doctor) => doctor.id === appointmentForm.doctorId);
    if (!selectedDoctor) {
      return [];
    }

    if (!isDateWithinAvailability(appointmentForm.date, selectedDoctor.availability)) {
      return [];
    }

    const expandedSlots = expandDoctorTimeSlotsForDay(
      selectedDoctor.timeSlots || [],
      getDayNameFromDate(appointmentForm.date)
    );

    const occupiedSlots = appointments
      .filter(
        (appointment) =>
          appointment.doctorId === appointmentForm.doctorId &&
          appointment.date === appointmentForm.date &&
          (appointment.status || "").toLowerCase() !== "cancelled"
      )
      .map((appointment) => appointment.time)
      .filter(Boolean);

    return expandedSlots.filter((slot) => !occupiedSlots.includes(slot.time));
  }, [appointmentForm.date, appointmentForm.doctorId, appointments, doctorOptions]);

  const handleDoctorSubmit = async (event) => {
    event.preventDefault();

    const {
      name,
      specialization,
      email,
      password,
      phone,
      availabilityDays,
      timeSlots,
    } = doctorForm;

    const parsedTimeSlots = Array.isArray(timeSlots) ? timeSlots.filter(Boolean) : [];
    const availability = Array.isArray(availabilityDays) ? availabilityDays.join(", ") : "";
    const normalizedPhone = normalizePhoneNumber(phone);

    if (!name.trim() || !specialization.trim() || !email.trim() || password.trim().length < 6) {
      setDoctorError("Enter doctor name, email, specialization, and a password of at least 6 characters.");
      return;
    }

    if (!availabilityDays.length) {
      setDoctorError("Select at least one available day for the doctor.");
      return;
    }

    if (!parsedTimeSlots.length) {
      setDoctorError("Add at least one day-specific time slot for the doctor.");
      return;
    }

    if (normalizedPhone && normalizedPhone.length !== 10) {
      setDoctorError("Doctor phone number must contain exactly 10 digits.");
      return;
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const existingDoctorQuery = query(collection(db, "users"), where("email", "==", normalizedEmail));
      const existingDoctorSnap = await getDocs(existingDoctorQuery);

      if (!existingDoctorSnap.empty) {
        setDoctorError("A user with this email already exists.");
        return;
      }

      const createdDoctorUser = await createDoctorAuthAccount(normalizedEmail, password.trim());

      const payload = {
        uid: createdDoctorUser.uid,
        name: name.trim(),
        specialization: [specialization.trim()],
        email: normalizedEmail,
        phone: normalizedPhone,
        availability: availability.trim(),
        timeSlots: parsedTimeSlots,
        approved: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", createdDoctorUser.uid), {
        uid: createdDoctorUser.uid,
        doctorId: createdDoctorUser.uid,
        name: name.trim(),
        email: normalizedEmail,
        role: "doctor",
        specialization: specialization.trim(),
        approved: true,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, "doctors", createdDoctorUser.uid), payload);

      setDoctors((current) => [
        {
          id: createdDoctorUser.uid,
          ...payload,
          specialization: payload.specialization,
          patientsToday: 0,
        },
        ...current,
      ]);
      setDoctorForm({
        name: "",
        specialization: "",
        email: "",
        password: "",
        phone: "",
        availabilityDays: [],
        slotDay: "",
        slotStart: "",
        slotEnd: "",
        timeSlots: [],
      });
      setDoctorError("");
    } catch (error) {
      console.error("Failed to add doctor", error);
      if (error.code === "auth/email-already-in-use") {
        setDoctorError("A Firebase account already exists for this email.");
      } else if (error.code === "auth/weak-password") {
        setDoctorError("Password must be at least 6 characters long.");
      } else {
        setDoctorError("Unable to create doctor account right now.");
      }
    }
  };

  const handlePatientSubmit = async (event) => {
    event.preventDefault();

    const { name, age, gender, phone, address, bloodGroup, condition } = patientForm;
    const normalizedPhone = normalizePhoneNumber(phone);

    if (!name.trim() || !age || !normalizedPhone || !address.trim() || !bloodGroup.trim() || !condition.trim()) {
      setPatientError("Complete patient name, age, phone, address, blood group, and condition.");
      return;
    }

    if (normalizedPhone.length !== 10) {
      setPatientError("Patient phone number must contain exactly 10 digits.");
      return;
    }

    try {
      const patientRef = doc(collection(db, "patients"));
      const payload = {
        uid: patientRef.id,
        name: name.trim(),
        age: Number(age),
        gender,
        phone: normalizedPhone,
        address: address.trim(),
        bloodGroup: bloodGroup.trim().toUpperCase(),
        condition: condition.trim(),
        vitalsCompleted: false,
        role: "patient",
        admittedOn: todayDate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(patientRef, payload);
      setPatients((current) => [{ id: patientRef.id, ...payload }, ...current]);
      setPatientForm({
        name: "",
        age: "",
        gender: "Male",
        phone: "",
        address: "",
        bloodGroup: "",
        condition: "",
      });
      setPatientError("");
    } catch (error) {
      console.error("Failed to add patient", error);
      setPatientError("Unable to save patient to Firestore.");
    }
  };

  const handleAppointmentPatientChange = (patientUid) => {
    const selectedPatient = patientOptions.find((patient) => patient.id === patientUid);
    setAppointmentForm((current) => ({
      ...current,
      patientUid,
      patientName: selectedPatient?.name || "",
    }));
  };

  const handleAppointmentDoctorChange = (doctorId) => {
    const selectedDoctor = doctorOptions.find((doctor) => doctor.id === doctorId);
    setAppointmentForm((current) => ({
      ...current,
      doctorId,
      doctorName: selectedDoctor?.name || "",
      department: selectedDoctor?.department || "",
      time: "",
    }));
  };

  const handleAppointmentSubmit = async (event) => {
    event.preventDefault();

    const { patientUid, patientName, doctorId, doctorName, department, date, time } = appointmentForm;

    if (!patientUid || !doctorId || !department || !date || !time) {
      setAppointmentError("Select patient, doctor, date, and time before booking.");
      return;
    }

    try {
      const selectedDoctor = doctorOptions.find((doctor) => doctor.id === doctorId);
      if (!isDateWithinAvailability(date, selectedDoctor?.availability)) {
        setAppointmentError("The selected doctor is not available on that day.");
        return;
      }

      const existingAppointmentQuery = query(
        collection(db, "appointments"),
        where("doctorId", "==", doctorId),
        where("date", "==", date),
        where("time", "==", time)
      );
      const existingAppointmentSnap = await getDocs(existingAppointmentQuery);
      const slotTaken = existingAppointmentSnap.docs.some(
        (item) => (item.data().status || "").toLowerCase() !== "cancelled"
      );

      if (slotTaken) {
        setAppointmentError("This time slot is already booked for the selected doctor.");
        return;
      }

      const payload = {
        patientUid,
        patientName,
        doctorId,
        doctor: doctorName,
        specialty: department,
        date,
        time,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      const appointmentRef = doc(
        db,
        "appointments",
        buildAppointmentSlotId(doctorId, date, time)
      );

      await runTransaction(db, async (transaction) => {
        const existingSlotDoc = await transaction.get(appointmentRef);
        if (existingSlotDoc.exists()) {
          throw new Error("slot-already-booked");
        }

        transaction.set(appointmentRef, payload);
      });

      setAppointments((current) => [
        {
          id: appointmentRef.id,
          ...payload,
          patient: patientName,
          department,
        },
        ...current,
      ]);
      setAppointmentForm({
        patientUid: "",
        patientName: "",
        doctorId: "",
        doctorName: "",
        department: "",
        date: "",
        time: "",
      });
      setAppointmentError("");
    } catch (error) {
      console.error("Failed to book appointment", error);
      if (error.message === "slot-already-booked") {
        setAppointmentError("This time slot is already booked for the selected doctor.");
      } else {
        setAppointmentError("Unable to save appointment to Firestore.");
      }
    }
  };

  const handleBedSubmit = (event) => {
    event.preventDefault();

    const { bedId, status, patient } = bedForm;
    if (!bedId) {
      setBedError("Choose a bed to update.");
      return;
    }

    if (status === "Occupied" && !patient) {
      setBedError("Select a patient when assigning an occupied bed.");
      return;
    }

    setBeds((current) =>
      current.map((bed) =>
        bed.id === bedId
          ? { ...bed, status, patient: status === "Occupied" ? patient : "" }
          : bed
      )
    );
    setBedForm({ bedId: "", status: "Available", patient: "" });
    setBedError("");
  };

  const handleDeleteDoctor = async (doctor) => {
    const confirmed = window.confirm(`Delete ${doctor.name} and all linked Firestore records?`);
    if (!confirmed) {
      return;
    }

    try {
      const appointmentQuery = query(collection(db, "appointments"), where("doctorId", "==", doctor.id));
      const appointmentSnap = await getDocs(appointmentQuery);
      await Promise.all(appointmentSnap.docs.map((item) => deleteDoc(item.ref)));

      const prescriptionQuery = query(collection(db, "prescriptions"), where("doctorId", "==", doctor.id));
      const prescriptionSnap = await getDocs(prescriptionQuery);
      await Promise.all(prescriptionSnap.docs.map((item) => deleteDoc(item.ref)));

      const userQueryByEmail = query(collection(db, "users"), where("email", "==", (doctor.email || "").toLowerCase()));
      const userQueryByDoctorId = query(collection(db, "users"), where("doctorId", "==", doctor.id));
      const [userSnapByEmail, userSnapByDoctorId] = await Promise.all([
        getDocs(userQueryByEmail),
        getDocs(userQueryByDoctorId),
      ]);

      const userRefs = [
        ...userSnapByEmail.docs.map((item) => item.ref),
        ...userSnapByDoctorId.docs.map((item) => item.ref),
      ].reduce((refs, ref) => {
        refs.set(ref.path, ref);
        return refs;
      }, new Map());

      await Promise.all([...userRefs.values()].map((ref) => deleteDoc(ref)));
      await deleteDoc(doc(db, "doctors", doctor.id));

      setDoctors((current) => current.filter((item) => item.id !== doctor.id));
      setAppointments((current) => current.filter((item) => item.doctorId !== doctor.id));
    } catch (error) {
      console.error("Failed to delete doctor", error);
      setDoctorError("Unable to delete doctor from Firestore.");
    }
  };

  const handleAddDoctorTimeSlot = () => {
    if (!doctorForm.slotDay || !doctorForm.slotStart || !doctorForm.slotEnd) {
      setDoctorError("Select a day, slot start, and slot end time.");
      return;
    }

    if (doctorForm.slotStart >= doctorForm.slotEnd) {
      setDoctorError("Slot end time must be later than the start time.");
      return;
    }

    const targetDays =
      doctorForm.slotDay === "__ALL__"
        ? doctorForm.availabilityDays
        : [doctorForm.slotDay];

    if (!targetDays.length) {
      setDoctorError("Select at least one available day before adding a slot.");
      return;
    }

    const nextSlots = targetDays.map((day) => ({
      day,
      start: formatTimeLabel(doctorForm.slotStart),
      end: formatTimeLabel(doctorForm.slotEnd),
      label: `${formatTimeLabel(doctorForm.slotStart)} - ${formatTimeLabel(doctorForm.slotEnd)}`,
    }));

    setDoctorForm((current) => ({
      ...current,
      timeSlots: nextSlots.reduce((updatedSlots, nextSlot) => {
        if (
          updatedSlots.some(
            (slot) => slot.day === nextSlot.day && slot.label === nextSlot.label
          )
        ) {
          return updatedSlots;
        }

        return [...updatedSlots, nextSlot];
      }, current.timeSlots),
      slotDay: "",
      slotStart: "",
      slotEnd: "",
    }));
    setDoctorError("");
  };

  const handleToggleDoctorAvailabilityDay = (day) => {
    setDoctorForm((current) => {
      const removingDay = current.availabilityDays.includes(day);
      const nextDays = removingDay
        ? current.availabilityDays.filter((item) => item !== day)
        : [...current.availabilityDays, day];

      return {
        ...current,
        availabilityDays: DAY_OPTIONS.filter((item) => nextDays.includes(item)),
        slotDay: current.slotDay === day && removingDay ? "" : current.slotDay,
        timeSlots: removingDay
          ? current.timeSlots.filter((slot) => slot.day !== day)
          : current.timeSlots,
      };
    });
  };

  const handleToggleAllDoctorAvailabilityDays = () => {
    setDoctorForm((current) => {
      const enableAllDays = current.availabilityDays.length !== DAY_OPTIONS.length;

      return {
        ...current,
        availabilityDays: enableAllDays ? [...DAY_OPTIONS] : [],
        slotDay: enableAllDays ? current.slotDay : "",
        timeSlots: enableAllDays ? current.timeSlots : [],
      };
    });
  };

  const handleRemoveDoctorTimeSlot = (slotToRemove) => {
    setDoctorForm((current) => ({
      ...current,
      timeSlots: current.timeSlots.filter(
        (slot) => !(slot.day === slotToRemove.day && slot.label === slotToRemove.label)
      ),
    }));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin-login");
  };

  if (authLoading || loading) {
    return (
      <main className="admin-dashboard-page">
        <section className="admin-loading-shell">
          <p className="admin-section-eyebrow">Hospital Administration</p>
          <h1>Preparing the admin dashboard</h1>
          <p>Loading doctors, patients, appointments, and bed summaries.</p>
          <div className="admin-loading-bar">
            <span />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-dashboard-page">
      <div className="admin-layout">
        <AdminSidebar
          activeNav={activeNav}
          navigationItems={navigationItems}
          onNavigate={setActiveNav}
        />

        <section className="admin-main">
          <AdminTopbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onLogout={handleLogout}
          />

          <AdminOverviewSection
            active={activeNav === "overview"}
            stats={stats}
            patientGrowthData={patientGrowthData}
            appointmentAnalyticsData={appointmentAnalyticsData}
            bedOccupancyData={bedOccupancyData}
            bedChartColors={bedChartColors}
            filteredPatients={filteredPatients}
            filteredAppointments={filteredAppointments}
            lowStockAlerts={lowStockAlerts}
            bedAlerts={bedAlerts}
            getAppointmentSortValue={getAppointmentSortValue}
          />

          <AdminDoctorsSection
            active={activeNav === "doctors"}
            doctorForm={doctorForm}
            setDoctorForm={setDoctorForm}
            doctorError={doctorError}
            dayOptions={DAY_OPTIONS}
            appointments={appointments}
            filteredDoctors={filteredDoctors}
            onSubmit={handleDoctorSubmit}
            onDeleteDoctor={handleDeleteDoctor}
            onToggleAllAvailabilityDays={handleToggleAllDoctorAvailabilityDays}
            onToggleAvailabilityDay={handleToggleDoctorAvailabilityDay}
            onAddTimeSlot={handleAddDoctorTimeSlot}
            onRemoveTimeSlot={handleRemoveDoctorTimeSlot}
          />

          <AdminPatientsSection
            active={activeNav === "patients"}
            patientForm={patientForm}
            setPatientForm={setPatientForm}
            patientError={patientError}
            filteredPatients={filteredPatients}
            onSubmit={handlePatientSubmit}
          />

          <AdminAppointmentsSection
            active={activeNav === "appointments"}
            appointmentForm={appointmentForm}
            setAppointmentForm={setAppointmentForm}
            patientOptions={patientOptions}
            doctorOptions={doctorOptions}
            availableAppointmentSlots={availableAppointmentSlots}
            appointmentError={appointmentError}
            filteredAppointments={filteredAppointments}
            onSubmit={handleAppointmentSubmit}
            onPatientChange={handleAppointmentPatientChange}
            onDoctorChange={handleAppointmentDoctorChange}
          />

          <AdminBedsSection
            active={activeNav === "beds"}
            bedForm={bedForm}
            setBedForm={setBedForm}
            bedError={bedError}
            beds={beds}
            patientOptions={patientOptions}
            filteredBeds={filteredBeds}
            onSubmit={handleBedSubmit}
          />

          <AdminBillingSection active={activeNav === "billing"} />

          <AdminInventorySection
            active={activeNav === "inventory"}
            filteredInventory={filteredInventory}
          />
        </section>
      </div>
    </main>
  );
}

export default AdminPanel;
