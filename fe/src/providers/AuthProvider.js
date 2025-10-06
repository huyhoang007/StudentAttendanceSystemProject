import React, { useState, useEffect } from "react";
import { login as loginService } from "../services/authService";
import { AuthContext } from "../contexts/AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("app_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const login = async (username, password) => {
    const data = await loginService(username, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("app_user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("app_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
