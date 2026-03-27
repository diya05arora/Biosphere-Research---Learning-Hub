import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { BASE_API_URL } from "../lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [userMessage, setUserMessage] = useState("");
  const [adminMessage, setAdminMessage] = useState("");

  async function handleLogin(e, role) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      email: form.get("email")?.toString().trim(),
      username: form.get("username")?.toString().trim(),
      password: form.get("password"),
      role
    };

    role === "user" ? setUserMessage("Logging in...") : setAdminMessage("Logging in...");

    try {
      const res = await fetch(`${BASE_API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("accessToken", data.data.accessToken);
        navigate("/events");
        return;
      }

      role === "user"
        ? setUserMessage(data.message || "Login failed")
        : setAdminMessage(data.message || "Login failed");
    } catch {
      const error = "Unable to connect to backend. Please check server and CORS settings.";
      role === "user" ? setUserMessage(error) : setAdminMessage(error);
    }
  }

  return (
    <Layout active="home">
      <section id="login" className="login section">
        <div className="google-login-container">
          <button
            id="googleLoginBtn"
            className="google-login-button"
            onClick={() => (window.location.href = `${BASE_API_URL}/users/auth/google`)}
          >
            Login with <img id="googleLogo" src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" />
          </button>
        </div>

        <div className="or-divider">OR</div>

        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6">
              <div className="info-item d-flex align-items-center">
                <div>
                  <h3><i className="bi bi-people"></i> Admin Login</h3>
                </div>
              </div>

              <form className="mt-3 login-form" onSubmit={(e) => handleLogin(e, "admin")}>
                <p style={{ fontWeight: "bold" }}>{adminMessage}</p>
                <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" name="email" required /></div>
                <div className="mb-3"><label className="form-label">AdminName</label><input type="text" className="form-control" name="username" required /></div>
                <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control" name="password" required /></div>
                <button type="submit">Log In</button>
              </form>
            </div>

            <div className="col-lg-6">
              <div className="info-item d-flex align-items-center">
                <div>
                  <h3><i className="bi bi-person"></i> User Login</h3>
                </div>
              </div>

              <form className="mt-3 login-form" onSubmit={(e) => handleLogin(e, "user")}>
                <p style={{ fontWeight: "bold" }}>{userMessage}</p>
                <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" name="email" required /></div>
                <div className="mb-3"><label className="form-label">Username</label><input type="text" className="form-control" name="username" required /></div>
                <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control" name="password" required /></div>
                <button type="submit">Log In</button>
              </form>
            </div>
          </div>
        </div>

        <div className="signup text-center mt-3">
          <p>Don't have an account? <Link to="/signup" className="signup-link">Signup</Link></p>
        </div>
      </section>
    </Layout>
  );
}
