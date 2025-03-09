const API_URL = "http://localhost:9090/api/user"; // API base URL

// Kullanıcıları listele
export const fetchUsers = async () => {
  const response = await fetch(`${API_URL}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

// Kullanıcı ekle
export const createUser = async (userData) => {
  const response = await fetch(`${API_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return response;
};

// Kullanıcı sil
export const deleteUser = async (userId) => {
  const response = await fetch(`${API_URL}/delete/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
};
