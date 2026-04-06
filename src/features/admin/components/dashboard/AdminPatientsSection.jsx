// Patients management section:
// Contains the patient creation form and the patient registry table.
import { DataTable, SectionHeader } from "./AdminDashboardCommon";
import { getPatientDisplayName, normalizePhoneNumber } from "./AdminDashboardUtils";

export default function AdminPatientsSection({
  active,
  patientForm,
  setPatientForm,
  patientError,
  filteredPatients,
  onSubmit,
}) {
  return (
    <section id="patients" className={`admin-page-section ${active ? "active" : ""}`}>
      <SectionHeader
        eyebrow="Patient Registry"
        title="Add and manage patient records"
        description="Capture essential admission details and keep recent records visible."
      />

      <div className="admin-management-grid">
        <article className="admin-panel-card">
          <div className="admin-card-top">
            <h3>Add patient</h3>
          </div>
          <form className="admin-form-grid" onSubmit={onSubmit}>
            <label htmlFor="patient-name">Patient name</label>
            <input
              id="patient-name"
              type="text"
              value={patientForm.name}
              onChange={(event) =>
                setPatientForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Enter patient name"
            />

            <label htmlFor="patient-age">Age</label>
            <input
              id="patient-age"
              type="number"
              min="0"
              value={patientForm.age}
              onChange={(event) =>
                setPatientForm((current) => ({ ...current, age: event.target.value }))
              }
              placeholder="34"
            />

            <label htmlFor="patient-gender">Gender</label>
            <select
              id="patient-gender"
              value={patientForm.gender}
              onChange={(event) =>
                setPatientForm((current) => ({ ...current, gender: event.target.value }))
              }
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <label htmlFor="patient-phone">Phone</label>
            <input
              id="patient-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={patientForm.phone}
              onChange={(event) =>
                setPatientForm((current) => ({
                  ...current,
                  phone: normalizePhoneNumber(event.target.value),
                }))
              }
              placeholder="9876543210"
            />

            <label htmlFor="patient-address">Address</label>
            <input
              id="patient-address"
              type="text"
              value={patientForm.address}
              onChange={(event) =>
                setPatientForm((current) => ({
                  ...current,
                  address: event.target.value,
                }))
              }
              placeholder="City, State"
            />

            <label htmlFor="patient-blood-group">Blood Group</label>
            <input
              id="patient-blood-group"
              type="text"
              value={patientForm.bloodGroup}
              onChange={(event) =>
                setPatientForm((current) => ({
                  ...current,
                  bloodGroup: event.target.value,
                }))
              }
              placeholder="B+"
            />

            <label htmlFor="patient-condition">Condition</label>
            <input
              id="patient-condition"
              type="text"
              value={patientForm.condition}
              onChange={(event) =>
                setPatientForm((current) => ({
                  ...current,
                  condition: event.target.value,
                }))
              }
              placeholder="Condition or reason for admission"
            />

            {patientError ? <p className="admin-form-error">{patientError}</p> : null}

            <button className="admin-btn primary" type="submit">
              Add patient
            </button>
          </form>
        </article>

        <DataTable
          title="Patient list"
          emptyText="No patients found."
          columns={[
            {
              key: "name",
              label: "Patient",
              render: (row) => getPatientDisplayName(row),
            },
            { key: "age", label: "Age" },
            { key: "gender", label: "Gender" },
            { key: "condition", label: "Condition" },
            { key: "phone", label: "Phone" },
          ]}
          rows={filteredPatients}
        />
      </div>
    </section>
  );
}
