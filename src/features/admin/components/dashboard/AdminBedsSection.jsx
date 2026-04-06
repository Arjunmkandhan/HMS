// Beds management section:
// Contains the bed status form and the bed overview table.
import { DataTable, SectionHeader } from "./AdminDashboardCommon";

export default function AdminBedsSection({
  active,
  bedForm,
  setBedForm,
  bedError,
  beds,
  patientOptions,
  filteredBeds,
  onSubmit,
}) {
  // AdminBedsSection:
  // This component renders the bed-management tab.
  // It lets the admin choose a bed, assign a status, optionally attach a patient, and then
  // shows the resulting bed list through the shared table component.
  // bedColumns:
  // These columns define the table layout for the bed overview panel.
  // The patient column adds a readable fallback so empty bed assignments are clearly labeled.
  const bedColumns = [
    { key: "id", label: "Bed ID" },
    { key: "ward", label: "Ward" },
    { key: "bedType", label: "Type" },
    {
      key: "patient",
      label: "Patient",
      render: (row) => row.patient || "Unassigned",
    },
    { key: "status", label: "Status" },
  ];

  return (
    <section id="beds" className={`admin-page-section ${active ? "active" : ""}`}>
      <SectionHeader
        eyebrow="Bed Management"
        title="Track occupancy and assign beds"
        description="Update bed status for admissions, discharge readiness, and maintenance handling."
      />

      <div className="admin-management-grid">
        <article className="admin-panel-card">
          <div className="admin-card-top">
            <h3>Update bed status</h3>
          </div>
          <form className="admin-form-grid" onSubmit={onSubmit}>
            {/* Bed selection chooses which local-state bed record should be updated. */}
            <label htmlFor="bed-id">Bed</label>
            <select
              id="bed-id"
              value={bedForm.bedId}
              onChange={(event) =>
                setBedForm((current) => ({
                  ...current,
                  bedId: event.target.value,
                }))
              }
            >
              <option value="">Select bed</option>
              {beds.map((bed) => (
                <option key={bed.id} value={bed.id}>
                  {bed.id} - {bed.ward}
                </option>
              ))}
            </select>

            <label htmlFor="bed-status">Status</label>
            <select
              id="bed-status"
              value={bedForm.status}
              onChange={(event) =>
                setBedForm((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>

            {/* Patient selection is only enabled when the admin marks the bed as occupied. */}
            <label htmlFor="bed-patient">Assigned patient</label>
            <select
              id="bed-patient"
              value={bedForm.patient}
              onChange={(event) =>
                setBedForm((current) => ({
                  ...current,
                  patient: event.target.value,
                }))
              }
              disabled={bedForm.status !== "Occupied"}
            >
              <option value="">Select patient</option>
              {patientOptions.map((patient) => (
                <option key={patient.id} value={patient.name}>
                  {patient.name}
                </option>
              ))}
            </select>

            {bedError ? <p className="admin-form-error">{bedError}</p> : null}

            <button className="admin-btn primary" type="submit">
              Update bed
            </button>
          </form>
        </article>

        <DataTable
          title="Bed overview"
          emptyText="No beds found."
          columns={bedColumns}
          rows={filteredBeds}
        />
      </div>
    </section>
  );
}
