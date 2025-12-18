import React from "react";
import { useAuth } from "../hooks/AuthContext";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();          // Clear cookies and user state
      navigate("/login");      // Redirect to login page
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Logout;
