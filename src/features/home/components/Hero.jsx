// Hero section:
// This is the main introduction block on the landing page. It explains what the
// system does, gives the user quick entry buttons, and shows a supporting illustration.
import doctorImg from "../../../shared/assets/illustrations/undraw_medicine_hqqg.svg";

function Hero() {
  return (
    <section className="hero-section">
      {/* Text column describing the system value and navigation shortcuts. */}
      <div className="hero-content">
        <span className="hero-kicker">Trusted & Efficent Healthcare Operations Platform</span>
        <h1>Hospital Management System Built for Speed and Reliability</h1>
        <p>
          Unify patient records, appointments, doctor schedules, and admin workflows
          in one secure and intuitive workspace.
        </p>

        <div className="hero-actions">
          {/* These anchor buttons jump to sections on the same landing page. */}
          <a className="btn btn-primary" href="#portal">
            Get Started
          </a>
          <a className="btn btn-secondary" href="#features">
            Explore Features
          </a>
        </div>

        <div className="hero-metrics">
          {/* Short feature highlights make the hero section feel more informative and trustworthy. */}
          <div>
            <strong>24/7</strong>
            <span>Operations Ready</span>
          </div>
          <div>
            <strong>Secure</strong>
            <span>Role-Based Access</span>
          </div>
          <div>
            <strong>Fast</strong>
            <span>Appointment Flow</span>
          </div>
        </div>
      </div>

      {/* Visual column holding the illustration imported from shared assets. */}
      <div className="hero-visual" aria-hidden="true">
        <img src={doctorImg} alt="Doctors" />
      </div>
    </section>
  );
}

export default Hero;
