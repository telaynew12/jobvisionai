import React, { useState } from "react";
import { registerUser, verifyEmail } from "../app/api.js";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [code, setCode] = useState("");
  const [emailToVerify, setEmailToVerify] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const result = await registerUser(form.name, form.email, form.password);
      if (result.message) {
        setEmailToVerify(form.email);
        setVerificationSent(true);
        setMessage("✅ " + result.message);
      }
    } catch (err) {
      setMessage("❌ Registration failed: " + err.message);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const result = await verifyEmail(emailToVerify, code);
      if (result.message) {
        setMessage("✅ Email verified! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1000);
      }
    } catch (err) {
      setMessage("❌ Verification failed: " + err.message);
    }
  };

  return (
    <div className="register-container">
      {!verificationSent ? (
        <div>
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button type="submit" className="register-btn">Register</button>
          </form>
          <p>
            Already have an account?{" "}
            <a onClick={() => navigate("/login")}>Login</a>
          </p>
        </div>
      ) : (
        <div>
          <h2>Verify Email</h2>
          <p>Verification code sent to: {emailToVerify}</p>
          <form onSubmit={handleVerify}>
            <input
              className="verification-input"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button type="submit" className="verify-btn">Verify</button>
          </form>
          {message && <p>{message}</p>}
        </div>
      )}
    </div>
  );
};

export default Register;
