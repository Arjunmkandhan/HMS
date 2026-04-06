// Doctor dashboard top bar:
// This header stays at the top of the doctor portal and shows the current section title,
// today's pending count, a link back to the public website, and the account dropdown.
import { Link } from "react-router-dom";

function DoctorTopbar({
  activeLabel,
  doctorName,
  doctorEmail,
  notificationCount,
  showMenu,
  setShowMenu,
  setSidebarOpen,
  onLogout,
}) {
  // The same initials logic used in the sidebar is repeated here for the top-right avatar.
  const initials = (doctorName || "Doctor")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="dd-topbar">
      {/* Hamburger button is mainly used on smaller screens where the sidebar becomes collapsible. */}
      <button
        className="dd-hamburger"
        onClick={() => setSidebarOpen((current) => !current)}
        type="button"
        aria-label="Toggle doctor dashboard menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <h1 className="dd-topbar-title">{activeLabel}</h1>

      <div className="dd-topbar-actions">
        {/* This chip summarizes how many pending appointments exist for today. */}
        <div className="dd-notification-chip">
          <span>Today</span>
          <strong>{notificationCount}</strong>
        </div>

        {/* Quick exit from the portal back to the public landing page. */}
        <Link className="dd-home-link" to="/">
          Back to Home
        </Link>

        <div className="dd-user-wrap">
          {/* Clicking the avatar toggles the small account menu. */}
          <button className="dd-user-avatar" onClick={() => setShowMenu((current) => !current)} type="button">
            {initials || "DR"}
          </button>

          {showMenu ? (
            <>
              {/* The dropdown gives the doctor identity confirmation and a logout action. */}
              <div className="dd-user-menu">
                <strong>{doctorName || "Doctor"}</strong>
                <p>{doctorEmail || "No email available"}</p>
                <button className="dd-menu-button" onClick={onLogout} type="button">
                  Logout
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default DoctorTopbar;
