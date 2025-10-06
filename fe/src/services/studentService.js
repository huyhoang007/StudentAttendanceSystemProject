// Gọi API backend cho Student

export const getStudents = async () => {
  const res = await fetch("/api/student");
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getStudentById = async (id) => {
  const res = await fetch(`/api/student/${id}`);
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getStudentByCode = async (studentCode) => {
  const res = await fetch(`/api/student/by-code/${studentCode}`);
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getStudentByUserId = async (userId) => {
  const res = await fetch(`/api/student/by-user/${userId}`);
  if (!res.ok) throw await res.json();
  return res.json();
};

export const addStudent = async (student) => {
  const res = await fetch("/api/student", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const updateStudent = async (id, payload) => {
  const res = await fetch(`/api/student/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const deleteStudent = async (id) => {
  const res = await fetch(`/api/student/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const importStudentsFromFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/student/import-file", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Import failed");
  }

  return res.json();
};
