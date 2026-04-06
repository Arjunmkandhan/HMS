// Shared admin dashboard building blocks:
// These reusable UI pieces keep the extracted admin sections consistent.

export function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="admin-section-head">
      <div>
        <p className="admin-section-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

export function StatCard({ label, value, helper }) {
  return (
    <article className="admin-stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{helper}</span>
    </article>
  );
}

export function DataTable({ title, columns, rows, emptyText }) {
  return (
    <article className="admin-panel-card">
      <div className="admin-card-top">
        <h3>{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="admin-empty-state">{emptyText}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
