// Admin sidebar:
// Renders the left navigation used to switch between admin dashboard sections.

export default function AdminSidebar({ activeNav, navigationItems, onNavigate }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <p>Hospital Management</p>
        <h1>Admin Dashboard</h1>
        <span>Operations, admissions, and daily monitoring</span>
      </div>

      <nav className="admin-sidebar-nav">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activeNav === item.id ? "active" : ""}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
