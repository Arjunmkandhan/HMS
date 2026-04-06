// Landing-page navigation bar:
// This header is only used on the public home page. It provides quick anchor links
// to scroll within the same page, not route navigation to separate React pages.
function Navbar() {
  return (
    <header className="home-header">
      <nav className="home-nav">
        {/* Brand area shown on the far left of the landing page. */}
        <a className="home-brand" href="#">
          <span className="home-brand-dot">+</span>
          VIT Hospital Management System
        </a>

        {/* In-page anchor links connect to the matching `id` values in other homepage sections. */}
        <div className="home-nav-links">
          <a href="#">Home</a>
          <a href="#features">Features</a>
          <a href="#portal">Portals</a>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
