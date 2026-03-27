import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { BASE_API_URL } from "../lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authSuccess = params.get('authSuccess');
    const role = params.get('role');
    const token = params.get('token');
    const userData = params.get('user');

    if (authSuccess === 'true') {
      try {
        // Store token in localStorage
        if (token) {
          localStorage.setItem('accessToken', token);
        }
        
        // Store user data if provided
        if (userData) {
          try {
            const user = JSON.parse(atob(userData));
            localStorage.setItem('user', JSON.stringify(user));
          } catch (e) {
            console.warn('Could not decode user data from URL');
          }
        }
        
        // Store role
        if (role) {
          localStorage.setItem('userRole', role);
        }
        
        // Redirect based on role
        const redirectRole = localStorage.getItem('userRole') || role;
        if (redirectRole === 'admin') {
          navigate("/admin-events");
        } else {
          navigate("/events");
        }
      } catch (err) {
        console.error("Error handling Google auth callback:", err);
      }
    }

    // Clean up URL params after handling
    if (authSuccess) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    // Do NOT send role - let backend determine it from database
    const payload = {
      email: form.get("email")?.toString().trim(),
      username: form.get("username")?.toString().trim(),
      password: form.get("password")
    };

    setMessage("Logging in...");
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        // Store tokens and user data
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        localStorage.setItem("userRole", data.data.user.role);
        
        // Route based on role from database (not from client)
        const userRole = data.data.user.role;
        if (userRole === "admin") {
          navigate("/admin-events");
        } else {
          navigate("/events");
        }
        return;
      }

      setMessage(data.message || "Login failed. Please check your credentials.");
    } catch {
      setMessage("Unable to connect to backend. Please check server and CORS settings.");
    } finally {
      setIsLoading(false);
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
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="info-item d-flex align-items-center">
                <div>
                  <h3><i className="bi bi-box-arrow-in-right"></i> Login</h3>
                  <p>Sign in with your email and password</p>
                </div>
              </div>

              <form className="mt-4 login-form" onSubmit={handleLogin}>
                {message && <p style={{ fontWeight: "bold", color: message.includes("success") ? "green" : "red" }}>{message}</p>}
                
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" name="email" required />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-control" name="username" required />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" name="password" required />
                </div>
                
                <button type="submit" disabled={isLoading}>{isLoading ? "Logging in..." : "Log In"}</button>
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
