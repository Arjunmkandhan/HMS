// Doctor dashboard content sections:
// This file groups the tab content used by the doctor dashboard.
// The parent page owns data loading and mutations, while these components focus on
// rendering the overview, appointments list, patients panel, prescriptions form, and profile tab.

// Date formatter used across multiple doctor dashboard sections.
function formatDisplayDate(dateValue) {
  // Converts stored Firestore date strings into a more readable format for the UI.
  if (!dateValue) {
    return "Not scheduled";
  }

  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Status-to-style mapper used by appointment and prescription summary pills.
function getStatusClass(status) {
  const normalized = (status || "pending").toLowerCase();
  return `dd-pill dd-pill-${normalized.replace(/\s+/g, "-")}`;
}

// Overview tab:
// This is the first screen a doctor sees after login. It summarizes workload, today’s pending
// appointments, and recently assigned patients using data passed from the main dashboard page.
export function DoctorOverview({
  doctorProfile,
  stats,
  highlightedAppointments,
  recentPatients,
  onQuickNavigate,
}) {
  return (
    <div className="dd-overview">
      {/* Welcome banner introducing the doctor and their specialization. */}
      <section className="dd-welcome-banner">
        <div>
          <p className="dd-eyebrow">Doctor Workspace</p>
          <h2>{doctorProfile?.name || "Doctor"}</h2>
          <p className="dd-muted-light">
            Track today&apos;s workload, complete consultations, and stay on top of pending patients.
          </p>
        </div>
        <div className="dd-banner-note">
          <span>Specialization</span>
          <strong>{doctorProfile?.specializationLabel || "General"}</strong>
        </div>
      </section>

      {/* Stats grid where each card also works as a navigation shortcut. */}
      <section className="dd-stats-grid">
        {[
          { label: "Total Patients", value: stats.totalPatients, tone: "blue", tab: "patients" },
          { label: "Today's Appointments", value: stats.todayAppointments, tone: "teal", tab: "appointments" },
          { label: "Upcoming Appointments", value: stats.upcomingAppointments, tone: "amber", tab: "appointments" },
          { label: "Completed Consultations", value: stats.completedConsultations, tone: "green", tab: "appointments" },
        ].map((item) => (
          <button
            key={item.label}
            className={`dd-stat-card dd-stat-${item.tone}`}
            onClick={() => onQuickNavigate(item.tab)}
            type="button"
          >
            <p>{item.label}</p>
            <strong>{item.value}</strong>
          </button>
        ))}
      </section>

      {/* Two-column area showing pending appointments and the doctor's current patients. */}
      <section className="dd-two-column">
        <article className="dd-card">
          <div className="dd-card-head">
            <h3>Today&apos;s Pending Appointments</h3>
            <button className="dd-link-btn" onClick={() => onQuickNavigate("appointments")} type="button">
              View all
            </button>
          </div>

          {highlightedAppointments.length === 0 ? (
            <p className="dd-empty-text">No pending appointments for today.</p>
          ) : (
            <div className="dd-list">
              {highlightedAppointments.map((appointment) => (
                <div className="dd-list-item dd-list-item-highlight" key={appointment.id}>
                  <div>
                    <strong>{appointment.patientName || "Patient"}</strong>
                    <p>
                      {formatDisplayDate(appointment.date)} at {appointment.time || "Time pending"}
                    </p>
                  </div>
                  <span className={getStatusClass(appointment.status)}>{appointment.status}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="dd-card">
          <div className="dd-card-head">
            <h3>Assigned Patients</h3>
            <button className="dd-link-btn" onClick={() => onQuickNavigate("patients")} type="button">
              Open patients
            </button>
          </div>

          {recentPatients.length === 0 ? (
            <p className="dd-empty-text">Assigned patients will appear once appointments are linked.</p>
          ) : (
            <div className="dd-list">
              {recentPatients.slice(0, 5).map((patient) => (
                <div className="dd-list-item" key={patient.id}>
                  <div>
                    <strong>{patient.name || patient.fullName || "Patient"}</strong>
                    <p>
                      Age {patient.age || "N/A"} • {patient.condition || "History available in profile"}
                    </p>
                  </div>
                  <span className="dd-mini-badge">{patient.bloodGroup || "Patient"}</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

// Appointments tab:
// Displays live appointments for the current doctor, grouped by filter and equipped with
// quick actions for completion and cancellation.
export function DoctorAppointmentsSection({
  appointments,
  appointmentFilter,
  setAppointmentFilter,
  loading,
  actionLoadingId,
  onUpdateStatus,
}) {
  return (
    <section className="dd-section">
      <div className="dd-section-head">
        <div>
          <h2>Appointments</h2>
          <p className="dd-muted">Only appointments linked to the logged-in doctor are shown here.</p>
        </div>
        <div className="dd-filter-group">
          {["today", "upcoming", "completed"].map((filter) => (
            <button
              key={filter}
              className={`dd-filter-btn ${appointmentFilter === filter ? "active" : ""}`}
              onClick={() => setAppointmentFilter(filter)}
              type="button"
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <article className="dd-card">
        {loading ? (
          <p className="dd-empty-text">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p className="dd-empty-text">No appointments found for the selected filter.</p>
        ) : (
          <div className="dd-appointment-list">
            {appointments.map((appointment) => {
              const normalizedStatus = (appointment.status || "pending").toLowerCase();
              const isTodayPending =
                appointment.date === new Date().toISOString().slice(0, 10) && normalizedStatus === "pending";
              const showActions = appointmentFilter !== "completed";

              return (
                <div
                  className={`dd-appointment-card ${isTodayPending ? "dd-appointment-card-alert" : ""}`}
                  key={appointment.id}
                >
                  <div className="dd-appointment-main">
                    <div>
                      <strong>{appointment.patientName || "Patient"}</strong>
                      <p>
                        {formatDisplayDate(appointment.date)} at {appointment.time || "Time pending"}
                      </p>
                      <small>{appointment.specialty || appointment.department || "General consultation"}</small>
                    </div>
                    <span className={getStatusClass(appointment.status)}>{appointment.status}</span>
                  </div>

                  {showActions ? (
                    <div className="dd-appointment-actions">
                      <button
                        className="dd-btn dd-btn-primary"
                        disabled={normalizedStatus === "completed" || actionLoadingId === appointment.id}
                        onClick={() => onUpdateStatus(appointment.id, "completed")}
                        type="button"
                      >
                        {actionLoadingId === appointment.id ? "Saving..." : "Mark as Completed"}
                      </button>
                      <button
                        className="dd-btn dd-btn-danger"
                        disabled={normalizedStatus === "cancelled" || actionLoadingId === appointment.id}
                        onClick={() => onUpdateStatus(appointment.id, "cancelled")}
                        type="button"
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </article>
    </section>
  );
}

// Patients tab:
// Lets the doctor search among patients connected through appointments and inspect one selected record.
export function DoctorPatientsSection({
  patients,
  searchValue,
  setSearchValue,
  selectedPatient,
  onSelectPatient,
  loading,
}) {
  return (
    <section className="dd-section">
      <div className="dd-section-head">
        <div>
          <h2>Patients</h2>
          <p className="dd-muted">Search and view patients who have appointments with this doctor.</p>
        </div>
        {/* This search bar filters the patient list in real time using state stored in the parent page. */}
        <input
          className="dd-search-input"
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search by patient name"
          type="text"
          value={searchValue}
        />
      </div>

      <div className="dd-two-column">
        <article className="dd-card">
          <div className="dd-card-head">
            <h3>Assigned Patient List</h3>
            <span className="dd-count-chip">{patients.length}</span>
          </div>

          {loading ? (
            <p className="dd-empty-text">Loading patients...</p>
          ) : patients.length === 0 ? (
            <p className="dd-empty-text">No patients match this doctor yet.</p>
          ) : (
            <div className="dd-list">
              {patients.map((patient) => (
                <button
                  className={`dd-patient-row ${selectedPatient?.id === patient.id ? "active" : ""}`}
                  key={patient.id}
                  onClick={() => onSelectPatient(patient)}
                  type="button"
                >
                  <div>
                    <strong>{patient.name || patient.fullName || "Patient"}</strong>
                    <p>Age {patient.age || "N/A"} • {patient.gender || "Not specified"}</p>
                  </div>
                  <span>{patient.bloodGroup || "Info"}</span>
                </button>
              ))}
            </div>
          )}
        </article>

        <article className="dd-card">
          <div className="dd-card-head">
            <h3>Patient Details</h3>
          </div>

          {selectedPatient ? (
            <div className="dd-details-grid">
              <div className="dd-detail-block">
                <span>Name</span>
                <strong>{selectedPatient.name || selectedPatient.fullName || "Patient"}</strong>
              </div>
              <div className="dd-detail-block">
                <span>Age</span>
                <strong>{selectedPatient.age || "N/A"}</strong>
              </div>
              <div className="dd-detail-block dd-detail-block-full">
                <span>History</span>
                <strong>
                  {selectedPatient.condition ||
                    selectedPatient.vitals?.chronicConditions ||
                    selectedPatient.vitals?.allergies ||
                    "No history recorded yet."}
                </strong>
              </div>
            </div>
          ) : (
            <p className="dd-empty-text">Select a patient to see details and history.</p>
          )}
        </article>
      </div>
    </section>
  );
}

// Prescriptions tab:
// Enables the doctor to create prescriptions for assigned patients and review previously saved ones.
export function DoctorPrescriptionsSection({
  patients,
  prescriptionForm,
  setPrescriptionForm,
  onSubmitPrescription,
  saving,
  prescriptions,
}) {
  return (
    <section className="dd-section">
      <div className="dd-section-head">
        <div>
          <h2>Prescriptions</h2>
          <p className="dd-muted">Create prescriptions and store them in Firestore for assigned patients.</p>
        </div>
      </div>

      <div className="dd-two-column">
        <article className="dd-card">
          <div className="dd-card-head">
            <h3>Add Prescription</h3>
          </div>

          <form className="dd-form-grid" onSubmit={onSubmitPrescription}>
            <label>
              <span>Patient</span>
              <select
                onChange={(event) =>
                  setPrescriptionForm((current) => ({ ...current, patientId: event.target.value }))
                }
                required
                value={prescriptionForm.patientId}
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name || patient.fullName || "Patient"}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Medicines</span>
              <textarea
                onChange={(event) =>
                  setPrescriptionForm((current) => ({ ...current, medicines: event.target.value }))
                }
                placeholder="Example: Paracetamol 650mg - twice daily"
                required
                rows="5"
                value={prescriptionForm.medicines}
              />
            </label>

            <label>
              <span>Notes</span>
              <textarea
                onChange={(event) =>
                  setPrescriptionForm((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Follow-up advice or dosage notes"
                required
                rows="4"
                value={prescriptionForm.notes}
              />
            </label>

            <button className="dd-btn dd-btn-primary" disabled={saving} type="submit">
              {saving ? "Saving..." : "Save Prescription"}
            </button>
          </form>
        </article>

        <article className="dd-card">
          <div className="dd-card-head">
            <h3>Recent Prescriptions</h3>
            <span className="dd-count-chip">{prescriptions.length}</span>
          </div>

          {prescriptions.length === 0 ? (
            <p className="dd-empty-text">No prescriptions have been added yet.</p>
          ) : (
            <div className="dd-list">
              {prescriptions.map((prescription) => (
                <div className="dd-list-item dd-list-item-stack" key={prescription.id}>
                  <div>
                    <strong>{prescription.patientName || prescription.patientId}</strong>
                    <p>{formatDisplayDate(prescription.date)}</p>
                  </div>
                  <small>{prescription.medicines}</small>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

// Profile tab:
// Shows current doctor information and provides a form to update key profile fields used by the dashboard.
export function DoctorProfileSection({
  doctorProfile,
  profileForm,
  setProfileForm,
  onSaveProfile,
  saving,
}) {
  return (
    <section className="dd-section">
      <div className="dd-section-head">
        <div>
          <h2>Doctor Profile</h2>
          <p className="dd-muted">Keep your core dashboard information up to date.</p>
        </div>
      </div>

      <div className="dd-two-column">
        <article className="dd-card">
          <div className="dd-card-head">
            <h3>Profile Summary</h3>
          </div>

          <div className="dd-details-grid">
            <div className="dd-detail-block">
              <span>Name</span>
              <strong>{doctorProfile?.name || "Doctor"}</strong>
            </div>
            <div className="dd-detail-block">
              <span>Email</span>
              <strong>{doctorProfile?.email || "Not available"}</strong>
            </div>
            <div className="dd-detail-block">
              <span>Specialization</span>
              <strong>{doctorProfile?.specializationLabel || "General"}</strong>
            </div>
            <div className="dd-detail-block">
              <span>Phone</span>
              <strong>{doctorProfile?.phone || "Not available"}</strong>
            </div>
          </div>
        </article>

        <article className="dd-card">
          <div className="dd-card-head">
            <h3>Update Profile</h3>
          </div>

          <form className="dd-form-grid" onSubmit={onSaveProfile}>
            <label>
              <span>Name</span>
              <input
                onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                required
                type="text"
                value={profileForm.name}
              />
            </label>

            <label>
              <span>Specialization</span>
              <input
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, specialization: event.target.value }))
                }
                required
                type="text"
                value={profileForm.specialization}
              />
            </label>

            <label>
              <span>Phone</span>
              <input
                onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                type="text"
                value={profileForm.phone}
              />
            </label>

            <label>
              <span>Availability</span>
              <input
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, availability: event.target.value }))
                }
                type="text"
                value={profileForm.availability}
              />
            </label>

            {/* Email is shown for reference but not editable because authentication identity comes from Firebase Auth. */}
            <label>
              <span>Email</span>
              <input readOnly type="email" value={doctorProfile?.email || ""} />
            </label>

            <button className="dd-btn dd-btn-primary" disabled={saving} type="submit">
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}
