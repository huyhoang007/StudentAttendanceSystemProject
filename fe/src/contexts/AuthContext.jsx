import React, { createContext, useState, useContext, useEffect } from "react";
// import { validateToken } from "../services/authService";
import {
  checkTokenAndRedirect,
  setupAutoLogout /*, isTokenExpired*/,
} from "../utils/tokenUtils";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("student"); // 'admin', 'organizer', 'student'
  const [organizerId, setOrganizerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth data from localStorage on component mount
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const savedUser = localStorage.getItem("authUser");
        const savedRole = localStorage.getItem("authRole");
        const savedOrganizerId = localStorage.getItem("authOrganizerId");
        const savedToken = localStorage.getItem("authToken");

        if (savedUser && savedRole && savedToken) {
          // Restore auth state without validation to avoid infinite loading
          setUser(JSON.parse(savedUser));
          setRole(savedRole);
          if (savedOrganizerId) {
            console.log(
              "Restoring organizerId from localStorage:",
              savedOrganizerId
            );
            setOrganizerId(savedOrganizerId);
          } else {
            console.log("No organizerId found in localStorage");
          }

          console.log("Auth data restored from localStorage:", {
            role: savedRole,
            organizerId: savedOrganizerId,
            hasUser: !!savedUser,
          });
        }
      } catch (error) {
        console.error("Error loading auth data from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem("authUser");
        localStorage.removeItem("authRole");
        localStorage.removeItem("authOrganizerId");
        localStorage.removeItem("authToken");
      } finally {
        // Always set loading to false to stop the loading state
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, []);

  const login = async (userData, userRole, token = null) => {
    try {
      console.log("[AuthContext] Login called with:");
      console.log("  userData:", JSON.stringify(userData, null, 2));
      console.log("  userRole:", userRole);
      console.log("  token:", token ? "provided" : "not provided");

      setUser(userData);
      setRole(userRole);

      // Save to localStorage for persistence
      localStorage.setItem("authUser", JSON.stringify(userData));
      localStorage.setItem("authRole", userRole);
      if (token) {
        localStorage.setItem("authToken", token);
        // Setup auto logout for this session
        setupAutoLogout();
      }

      if (userRole === "organizer") {
        // Lấy organizerId từ response với nhiều variation
        const orgId =
          userData.organizerId ||
          userData.OrganizerId ||
          userData.organizer_id ||
          "";
        console.log("[AuthContext] Setting organizerId:", orgId);
        console.log(
          "[AuthContext] Available properties in userData:",
          Object.keys(userData)
        );
        setOrganizerId(orgId);
        localStorage.setItem("authOrganizerId", orgId);

        // Log warning if no organizerId found
        if (!orgId) {
          console.warn(
            "[AuthContext] No organizerId found for organizer role. Available properties:",
            Object.keys(userData)
          );
        }
      } else {
        setOrganizerId(null);
        localStorage.removeItem("authOrganizerId");
      }

      console.log("[AuthContext] User logged in successfully:", {
        userData,
        userRole,
        organizerId:
          userRole === "organizer"
            ? userData.organizerId || userData.OrganizerId
            : null,
      });
    } catch (error) {
      console.error("[AuthContext] Error during login:", error);
    }
  };

  const logout = () => {
    setUser(null);
    setRole("student");
    setOrganizerId(null);

    // Clear localStorage
    localStorage.removeItem("authUser");
    localStorage.removeItem("authRole");
    localStorage.removeItem("authOrganizerId");
    localStorage.removeItem("authToken");

    console.log("User logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        organizerId,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
