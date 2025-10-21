// User Service for Admin Management

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getAllUsers = async () => {
  const res = await fetch("/api/users", {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

export const createUser = async (userData) => {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create user");
  }
  return res.json();
};

export const updateUser = async (userId, userData) => {
  const res = await fetch(`/api/users/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update user");
  }
  return res.json();
};

export const deleteUser = async (userId) => {
  const res = await fetch(`/api/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete user");
  }
  return res.json();
};

export const resetPassword = async (userId) => {
  const res = await fetch(`/api/users/${userId}/reset-password`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to reset password");
  }
  return res.json();
};

export const toggleUserStatus = async (userId) => {
  const res = await fetch(`/api/users/${userId}/toggle-status`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to toggle user status");
  }
  return res.json();
};

// Legacy functions for backward compatibility
const users = [
  { user_id: 1, username: "admin", role: "admin" },
  { user_id: 2, username: "organizer", role: "organizer" },
  { user_id: 3, username: "student", role: "student" },
];

export const getUsers = () => Promise.resolve(users);
