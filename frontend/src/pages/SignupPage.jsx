import { useState } from "react";
import Layout from "../components/Layout";
import { BASE_API_URL } from "../lib/api";

export default function SignupPage() {
  const [message, setMessage] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("Signing up...");
    const form = new FormData(e.currentTarget);

    const res = await fetch(`${BASE_API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.get("fullName"),
        email: form.get("email"),
        username: form.get("username"),
        password: form.get("password"),
        role: "user"
      })
    });

    const data = await res.json();
    setMessage(data.message || (res.ok ? "Sign up successful" : "Sign up failed"));
  }

  return (
    <Layout active="home">
      <section id="signup" className="signup section">
        <div className="container section-title">
          <h2><i className="bi bi-person"></i> User Sign Up</h2>
          <p>Sign up to create your user account.</p>
        </div>
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6">
              <form className="mt-3 signup-form" onSubmit={onSubmit}>
                <p style={{ fontWeight: "bold" }}>{message}</p>
                <div className="mb-3"><label className="form-label">Full Name</label><input type="text" className="form-control" name="fullName" required /></div>
                <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" name="email" required /></div>
                <div className="mb-3"><label className="form-label">Username</label><input type="text" className="form-control" name="username" required /></div>
                <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control" name="password" required /></div>
                <button type="submit">Sign Up</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
