// Home page composition:
// This file builds the public landing page by arranging reusable home-page sections.
// The real visual structure lives in the imported components below, while this page
// acts as the container that assembles them in order.
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import PortalCards from "../components/PortalCards";
import Features from "../components/Features";
import Footer from "../components/Footer";
import "../../../shared/styles/home.css";

function Home() {
  // The `home-page` wrapper activates the shared landing-page stylesheet.
  return (
    <div className="home-page">
      {/* Fixed top navigation for landing-page anchors like Features and Portals. */}
      <Navbar />

      {/* Main hero banner introducing the product and its purpose. */}
      <Hero />

      {/* Portal selection cards that route users into patient, doctor, or admin login flows. */}
      <PortalCards />

      {/* Marketing section summarizing the major website capabilities. */}
      <Features />

      {/* Closing footer for project identity and credits. */}
      <Footer />
    </div>
  );
}

export default Home;
