// Appointments management section:
// Contains the booking form and the appointment schedule table.
import { DataTable, SectionHeader } from "./AdminDashboardCommon";
import { formatDisplayDate } from "./AdminDashboardUtils";

export default function AdminAppointmentsSection({
  active,
  appointmentForm,
  setAppointmentForm,
  patientOptions,
  doctorOptions,
  availableAppointmentSlots,
  appointmentError,
  filteredAppointments,
  onSubmit,
  onPatientChange,
  onDoctorChange,
}) {
  // AdminAppointmentsSection:
  // This component renders the appointment-booking tab for admins.
  // It combines patient selection, doctor selection, department display, date choice, and free-slot selection,
  // then forwards all actual booking logic back to the parent page through callback props.
  // appointmentColumns:
  // These columns define how the appointment schedule table should present each appointment row.
  // The date column uses the shared formatter so every appointment appears with the same display format.
  const appointmentColumns = [
    { key: "patient", label: "Patient" },
    { key: "doctor", label: "Doctor" },
    { key: "department", label: "Department" },
    {
      key: "date",
      label: "Date",
      render: (row) => formatDisplayDate(row.date),
    },
    { key: "time", label: "Time" },
    { key: "status", label: "Status" },
  ];

  return (
    <section id="appointments" className={`admin-page-section ${active ? "active" : ""}`}>
      <SectionHeader
        eyebrow="Appointments"
        title="Book and monitor appointments"
        description="Schedule visits using active patients and doctors already in the system."
      />

      <div className="admin-management-grid">
        <article className="admin-panel-card">
          <div className="admin-card-top">
            <h3>Book appointment</h3>
          </div>
          <form className="admin-form-grid" onSubmit={onSubmit}>
            {/* Patient dropdown chooses which person the appointment belongs to. */}
            <label htmlFor="appointment-patient">Patient</label>
            <select
              id="appointment-patient"
              value={appointmentForm.patientUid}
              onChange={(event) => onPatientChange(event.target.value)}
            >
              <option value="">Select patient</option>
              {patientOptions.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>

            {/* Doctor dropdown controls which department and time slots become available. */}
            <label htmlFor="appointment-doctor">Doctor</label>
            <select
              id="appointment-doctor"
              value={appointmentForm.doctorId}
              onChange={(event) => onDoctorChange(event.target.value)}
            >
              <option value="">Select doctor</option>
              {doctorOptions.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>

            {/* Department is read-only because it is derived automatically from the selected doctor. */}
            <label htmlFor="appointment-department">Department</label>
            <input
              id="appointment-department"
              type="text"
              value={appointmentForm.department}
              readOnly
              placeholder="Auto-filled from doctor"
            />

            <label htmlFor="appointment-date">Date</label>
            <input
              id="appointment-date"
              type="date"
              value={appointmentForm.date}
              onChange={(event) =>
                setAppointmentForm((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
            />

            {/* Available slots are already filtered by the parent page to exclude blocked times. */}
            <label htmlFor="appointment-time">Time</label>
            <select
              id="appointment-time"
              value={appointmentForm.time}
              onChange={(event) =>
                setAppointmentForm((current) => ({
                  ...current,
                  time: event.target.value,
                }))
              }
            >
              <option value="">Select available slot</option>
              {availableAppointmentSlots.map((slot) => (
                <option key={`${slot.day}-${slot.time}`} value={slot.time}>
                  {slot.display}
                </option>
              ))}
            </select>

            {appointmentError ? <p className="admin-form-error">{appointmentError}</p> : null}

            <button className="admin-btn primary" type="submit">
              Book appointment
            </button>
          </form>
        </article>

        <DataTable
          title="Appointment schedule"
          emptyText="No appointments found."
          columns={appointmentColumns}
          rows={filteredAppointments}
        />
      </div>
    </section>
  );
}
