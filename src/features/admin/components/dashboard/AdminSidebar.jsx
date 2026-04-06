// Admin sidebar:
// Renders the left navigation used to switch between admin dashboard sections.

export default function AdminSidebar({ activeNav, navigationItems, onNavigate }) {
  // AdminSidebar:
  // This component receives the currently selected admin section and the list of sidebar items.
  // It renders a button for each section and calls `onNavigate` with that section's ID when clicked,
  // allowing the parent page to decide which admin panel should be visible.
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <p>Hospital Management</p>
        <h1>Admin Dashboard</h1>
        <span>Operations, admissions, and daily monitoring</span>
      </div>

      <nav className="admin-sidebar-nav">
        {/* The active button is highlighted by comparing each item id with the parent's `activeNav` state. */}
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
