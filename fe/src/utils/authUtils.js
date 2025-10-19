// Hàm tiện ích liên quan đến xác thực và phân quyền
export const getStudentId = () => {
  const user = JSON.parse(localStorage.getItem("authUser") || "{}");
  return user.studentId || user.StudentId || user.Id; // Support all possible formats
};

export const getRole = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.role;
};

export const isAdmin = () => {
  return getRole() === "admin";
};

export const isOrganizer = () => {
  return getRole() === "organizer";
};

export const isStudent = () => {
  return getRole() === "student";
};
