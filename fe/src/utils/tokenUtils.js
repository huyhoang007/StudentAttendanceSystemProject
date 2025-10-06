// Utility functions for token management

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

export const getTokenExpirationTime = (token) => {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error("Error getting token expiration:", error);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  localStorage.removeItem("authRole");
  localStorage.removeItem("authOrganizerId");
  window.location.href = "/login";
};

export const checkTokenAndRedirect = () => {
  // Don't check token on login/register pages
  const currentPath = window.location.pathname;
  if (currentPath === "/login" || currentPath === "/register") {
    return true;
  }

  const token = localStorage.getItem("authToken");

  if (!token || isTokenExpired(token)) {
    logout();
    return false;
  }

  return true;
};

// Auto logout setup
export const setupAutoLogout = () => {
  const token = localStorage.getItem("authToken");

  if (!token) return;

  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) return;

  const timeUntilExpiration = expirationTime.getTime() - Date.now();

  if (timeUntilExpiration > 0) {
    // Set timeout to logout 1 minute before token expires
    const logoutTime = Math.max(timeUntilExpiration - 60000, 0);

    setTimeout(() => {
      if (
        window.confirm(
          "Phiên đăng nhập của bạn sắp hết hạn. Bạn có muốn tiếp tục?"
        )
      ) {
        // User wants to continue, but we still need to logout as token expired
        alert("Vui lòng đăng nhập lại để tiếp tục sử dụng.");
      }
      logout();
    }, logoutTime);
  } else {
    logout();
  }
};
