// Doctors management section:
// Contains the doctor creation form and the doctor directory table.
import { DataTable, SectionHeader } from "./AdminDashboardCommon";
import { formatSpecialization, normalizePhoneNumber } from "./AdminDashboardUtils";

export default function AdminDoctorsSection({
  active,
  doctorForm,
  setDoctorForm,
  doctorError,
  dayOptions,
  appointments,
  filteredDoctors,
  onSubmit,
  onDeleteDoctor,
  onToggleAllAvailabilityDays,
  onToggleAvailabilityDay,
  onAddTimeSlot,
  onRemoveTimeSlot,
}) {
  return (
    <section id="doctors" className={`admin-page-section ${active ? "active" : ""}`}>
      <SectionHeader
        eyebrow="Doctor Management"
        title="Add and review doctors"
        description="Register doctors with their department and consultation availability."
      />

      <div className="admin-management-grid">
        <article className="admin-panel-card">
          <div className="admin-card-top">
            <h3>Add doctor</h3>
          </div>

          <form className="admin-form-grid" onSubmit={onSubmit}>
            <label htmlFor="doctor-name">Doctor name</label>
            <input
              id="doctor-name"
              type="text"
              value={doctorForm.name}
              onChange={(event) =>
                setDoctorForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Enter full name"
            />

            <label htmlFor="doctor-specialization">Specialization</label>
            <input
              id="doctor-specialization"
              type="text"
              value={doctorForm.specialization}
              onChange={(event) =>
                setDoctorForm((current) => ({
                  ...current,
                  specialization: event.target.value,
                }))
              }
              placeholder="Cardiology"
            />

            <label htmlFor="doctor-email">Email</label>
            <input
              id="doctor-email"
              type="email"
              value={doctorForm.email}
              onChange={(event) =>
                setDoctorForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="doctor@hospital.com"
            />

            <label htmlFor="doctor-password">Password</label>
            <input
              id="doctor-password"
              type="password"
              value={doctorForm.password}
              onChange={(event) =>
                setDoctorForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="Minimum 6 characters"
            />

            <label htmlFor="doctor-phone">Phone</label>
            <input
              id="doctor-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={doctorForm.phone}
              onChange={(event) =>
                setDoctorForm((current) => ({
                  ...current,
                  phone: normalizePhoneNumber(event.target.value),
                }))
              }
              placeholder="9876543210"
            />

            <label htmlFor="doctor-availability">Availability</label>
            <div id="doctor-availability" className="admin-slot-list">
              <button
                type="button"
                className={`admin-slot-chip ${doctorForm.availabilityDays.length === dayOptions.length ? "active" : ""}`}
                onClick={onToggleAllAvailabilityDays}
              >
                All Days
              </button>
              {dayOptions.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`admin-slot-chip ${doctorForm.availabilityDays.includes(day) ? "active" : ""}`}
                  onClick={() => onToggleAvailabilityDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>

            <label htmlFor="doctor-time-slots">Time slots</label>
            <div className="admin-inline-time-grid">
              <select
                id="doctor-time-day"
                value={doctorForm.slotDay}
                onChange={(event) =>
                  setDoctorForm((current) => ({
                    ...current,
                    slotDay: event.target.value,
                  }))
                }
              >
                <option value="">Select day</option>
                <option value="__ALL__">All selected days</option>
                {doctorForm.availabilityDays.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <input
                id="doctor-time-slots"
                type="time"
                value={doctorForm.slotStart}
                onChange={(event) =>
                  setDoctorForm((current) => ({
                    ...current,
                    slotStart: event.target.value,
                  }))
                }
              />
              <input
                type="time"
                value={doctorForm.slotEnd}
                onChange={(event) =>
                  setDoctorForm((current) => ({
                    ...current,
                    slotEnd: event.target.value,
                  }))
                }
              />
              <button className="admin-btn secondary" onClick={onAddTimeSlot} type="button">
                Add Slot
              </button>
            </div>

            {doctorForm.timeSlots.length ? (
              <div className="admin-slot-list">
                {doctorForm.timeSlots.map((slot) => (
                  <button
                    key={`${slot.day}-${slot.label}`}
                    className="admin-slot-chip"
                    onClick={() => onRemoveTimeSlot(slot)}
                    type="button"
                  >
                    {slot.day} • {slot.label} ×
                  </button>
                ))}
              </div>
            ) : (
              <p className="admin-field-hint">Pick a day, then add one or more time ranges for that day.</p>
            )}

            {doctorError ? <p className="admin-form-error">{doctorError}</p> : null}

            <button className="admin-btn primary" type="submit">
              Save doctor
            </button>
          </form>
        </article>

        <DataTable
          title="Doctor directory"
          emptyText="No doctors available."
          columns={[
            { key: "name", label: "Doctor" },
            {
              key: "specialization",
              label: "Specialization",
              render: (row) => formatSpecialization(row.specialization),
            },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "availability", label: "Availability" },
            {
              key: "patientsToday",
              label: "Patients today",
              render: (row) =>
                appointments.filter((appointment) => appointment.doctorId === row.id).length,
            },
            {
              key: "approval",
              label: "Approval",
              render: (row) => (row.approved ? "Approved" : "Pending"),
            },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={() => onDeleteDoctor(row)}
                >
                  Delete
                </button>
              ),
            },
          ]}
          rows={filteredDoctors}
        />
      </div>
    </section>
  );
}
