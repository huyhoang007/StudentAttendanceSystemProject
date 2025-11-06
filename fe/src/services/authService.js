// Gọi API backend để đăng nhập

export const login = async (email, password) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }
  if (!response.ok) {
    throw data || { message: "Đăng nhập thất bại!" };
  }

  console.log(
    "[AuthService] Login response data:",
    JSON.stringify(data, null, 2)
  );
  console.log(
    "[AuthService] User object:",
    JSON.stringify(data?.user, null, 2)
  );
  console.log(
    "[AuthService] OrganizerId in response:",
    data?.user?.OrganizerId
  );

  return data;
};

// Gọi API backend để đăng ký

export const register = async (registerData) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registerData),
  });
  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }
  if (!response.ok) {
    throw data || { message: "Đăng ký thất bại!" };
  }
  return data;
};

// Validate token by calling a protected endpoint
export const validateToken = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await fetch("/api/auth/validate", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Token validation failed");
    }

    return await response.json();
  } catch (error) {
    // Clear invalid token
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("authRole");
    localStorage.removeItem("authOrganizerId");
    throw error;
  }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("No token found");
  }

  const response = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    throw data || { message: "Đổi mật khẩu thất bại!" };
  }

  return data;
};
