import React, { createContext, useContext, useState, useEffect } from "react";
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  fetchUserByEmail,
} from "../app/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check if already logged in via cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await getCurrentUser();
        if (res && res.user && res.user.id) {
          setUser(res.user);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    console.log('AuthContext: Starting login for', email);
    const res = await loginUser(email, password);
    console.log('AuthContext: Login response', res);
    if (res.error) throw new Error(res.error);

    // Fetch full user by email to get ID and other info
    const fullUser = await fetchUserByEmail(email);
    console.log('AuthContext: Full user data', fullUser);
    if (!fullUser || !fullUser.id)
      throw new Error("Invalid user data returned from login");

    setUser(fullUser);
    console.log('AuthContext: User set in state', fullUser);
    return fullUser;
  };

  // Logout function
  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
