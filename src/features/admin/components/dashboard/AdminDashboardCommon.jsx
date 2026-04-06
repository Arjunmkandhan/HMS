// Shared admin dashboard building blocks:
// These reusable UI pieces keep the extracted admin sections consistent.

export function SectionHeader({ eyebrow, title, description }) {
  // SectionHeader:
  // This small presentational component standardizes the heading area used by every admin tab.
  // Instead of repeating the same eyebrow/title/description markup in each section file,
  // the dashboard passes the text as props and this function renders it with the shared CSS classes.
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
  // StatCard:
  // This component renders one summary metric card, such as total doctors or total patients.
  // It receives plain data through props and converts it into a consistently styled card so
  // overview, billing, and other summary sections all look uniform.
  return (
    <article className="admin-stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{helper}</span>
    </article>
  );
}

export function DataTable({ title, columns, rows, emptyText }) {
  // DataTable:
  // This is the generic table renderer for the admin dashboard.
  // `columns` describes what each column should show, including optional custom render functions,
  // while `rows` contains the actual records. If no rows are available, the component shows the
  // provided empty-state message instead of rendering an empty table.
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
