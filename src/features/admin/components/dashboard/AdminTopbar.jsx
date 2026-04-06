// Admin topbar:
// Holds the shared admin search bar and account actions.
import { Link } from "react-router-dom";

export default function AdminTopbar({
  searchTerm,
  onSearchChange,
  onLogout,
  adminName = "Gowtham",
  adminEmail = "gowtham@hms.com",
}) {
  return (
    <header className="admin-topbar">
      <div>
        <p className="admin-section-eyebrow">Central Command</p>
        <h2>Welcome, Admin</h2>
        <p>Monitor hospital activity, manage teams, and respond to capacity changes.</p>
      </div>

      <div className="admin-topbar-tools">
        <label className="admin-search">
          <span>Search records</span>
          <input
            type="search"
            placeholder="Search patients, appointments, or departments"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <div className="admin-profile-card">
          <strong>{adminName}</strong>
          <small>{adminEmail}</small>
          <button type="button" className="admin-profile-action" onClick={onLogout}>
            Sign Out
          </button>
          <Link to="/" className="admin-home-link">
            Back to Home
          </Link>
        </div>
      </div>
    </header>
  );
}
