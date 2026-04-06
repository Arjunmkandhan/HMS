// Portal selection cards:
// This section tells the user where each major role enters the system.
// It is the bridge from the public landing page into the protected role-specific portals.
import { Link } from "react-router-dom";

function PortalCards() {
  return (
    <section id="portal" className="portal-section">
      <div className="section-head">
        <h2>Choose Your Portal</h2>
        <p>Role-specific access for patients, doctors, and administrators.</p>
      </div>

      <div className="portal-grid">
        {/* Patient entry point: routes to patient login/signup flow. */}
        <article className="portal-card">
          <h3>Patient Portal</h3>
          <p>Book appointments, track prescriptions, and manage profile details.</p>
          <Link to="/patient-login" className="card-action">
            Enter Portal
          </Link>
        </article>

        {/* Doctor entry point: routes to the doctor login page. */}
        <article className="portal-card">
          <h3>Doctor Portal</h3>
          <p>Review schedules, patient history, and daily consultation updates.</p>
          <Link to="/doctor-login" className="card-action">
            Enter Portal
          </Link>
        </article>

        {/* Admin entry point: routes through `/admin`, which then redirects to the actual admin login page. */}
        <article className="portal-card">
          <h3>Admin Portal</h3>
          <p>Monitor system activity, add doctors, and operational performance.</p>
          <Link to="/admin" className="card-action">
            Enter Portal
          </Link>
        </article>
      </div>
    </section>
  );
}

export default PortalCards;

