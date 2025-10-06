// Gọi API backend cho University
export const getUniversities = async () => {
  const res = await fetch("/api/university");
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getUniversityById = async (id) => {
  const res = await fetch(`/api/university/${id}`);
  if (!res.ok) throw await res.json();
  return res.json();
};

export const addUniversity = async (data) => {
  const res = await fetch("/api/university", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const updateUniversity = async (id, data) => {
  const res = await fetch(`/api/university/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const deleteUniversity = async (id) => {
  const res = await fetch(`/api/university/${id}`, {
    method: "DELETE",
  });

  if (!res.ok && res.status !== 204) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Không thể xóa trường này");
  }

  return true;
};
