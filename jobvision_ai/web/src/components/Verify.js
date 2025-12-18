// src/components/Verify.js
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../app/api";
import "./Verify.css"; // import dedicated CSS

const Verify = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await verifyEmail(token); // backend verify
      if (res.success) {
        setMessage("Email verified successfully!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(res.message);
      }
    } catch {
      setMessage("Verification failed");
    }
  };

  return (
    <div className="verify-container">
      <form onSubmit={handleVerify} className="verify-form">
        <h1>Verify Email</h1>
        {message && <p className="message">{message}</p>}
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

export default Verify;
