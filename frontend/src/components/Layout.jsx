import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Header({ active = "home", showLogout = false, onLogout }) {
  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="container-fluid position-relative d-flex align-items-center justify-content-between">
        <Link to="/" className="logo d-flex align-items-center me-auto me-xl-0">
          <img src="/assets/img/logo.png" alt="" />
        </Link>

        <nav id="navmenu" className="navmenu">
          <ul>
            <li><Link to="/" className={active === "home" ? "active" : ""}>Home</Link></li>
            <li><Link to="/about" className={active === "about" ? "active" : ""}>About Us</Link></li>
            <li><Link to="/domains" className={active === "domains" ? "active" : ""}>Core Domains</Link></li>
            <li><Link to="/events" className={active === "events" ? "active" : ""}>Events</Link></li>
            <li><Link to="/contact" className={active === "contact" ? "active" : ""}>Contact</Link></li>
          </ul>
        </nav>

        <div className="header-social-links">
          {showLogout ? (
            <button type="button" className="login-link btn btn-link p-0" onClick={onLogout}>Logout</button>
          ) : (
            <Link to="/login" className="login-link">Login</Link>
          )}
          <a href="https://www.linkedin.com/company/biosphereresearchandlearninghub/" className="linkedin">
            <i className="bi bi-linkedin"></i>
          </a>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer id="footer" className="footer dark-background">
      <div className="container">
        <div className="row gy-3">
          <div className="col-lg-3 col-md-6 d-flex">
            <i className="bi bi-geo-alt icon"></i>
            <div className="address">
              <h4>Address</h4>
              <p>Shahwajpur, Muzaffarpur</p>
              <p>Bihar, India -842004</p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 d-flex">
            <i className="bi bi-telephone icon"></i>
            <div>
              <h4>Contact</h4>
              <p>
                <strong>Phone:</strong> <span>+917519990367</span><br />
                <strong>Email:</strong> <span>anurag.mdiagnostic@gmail.com</span><br />
              </p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 d-flex">
            <i className="bi bi-clock icon"></i>
            <div>
              <h4>Opening Hours</h4>
              <p>
                <strong>Mon-Sat:</strong> <span>09:00 AM - 05:00 PM</span><br />
                <strong>Saturday, Sunday</strong>: <span>Closed</span>
              </p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <h4>Follow Us</h4>
            <div className="social-links d-flex">
              <a href="https://www.linkedin.com/company/biosphereresearchandlearninghub/" className="linkedin"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
        </div>
      </div>

      <div className="container copyright text-center mt-4">
        <p>
          © <span>Copyright</span> <strong className="px-1 sitename">BioSphere</strong>
          <span>All Rights Reserved</span>
        </p>
        <div className="credits">
          Designed by <a href="https://bootstrapmade.com/">BootstrapMade</a>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ active, children, showLogout = false, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRefreshToken, setHasRefreshToken] = useState(Boolean(localStorage.getItem("refreshToken")));

  useEffect(() => {
    setHasRefreshToken(Boolean(localStorage.getItem("refreshToken")));
  }, [location.pathname]);

  useEffect(() => {
    function handleStorageChange() {
      setHasRefreshToken(Boolean(localStorage.getItem("refreshToken")));
    }

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const shouldShowLogout = showLogout || hasRefreshToken;

  function handleLogout() {
    if (typeof onLogout === "function") {
      onLogout();
      return;
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    setHasRefreshToken(false);
    navigate("/login");
  }

  return (
    <div className="index-page">
      <Header active={active} showLogout={shouldShowLogout} onLogout={handleLogout} />
      <main className="main">{children}</main>
      <Footer />
      <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
        <i className="bi bi-arrow-up-short"></i>
      </a>
    </div>
  );
}
