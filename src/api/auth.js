export async function loginAdmin(email, password) {
  // Simulación temporal de login
  if (email === "admin@smartsales.com" && password === "12345") {
    return { success: true, token: "fake-jwt-token" };
  } else {
    return { success: false, message: "Credenciales incorrectas" };
  }

  // 🔹 Cuando tengas backend Django REST, usarás:
  /*
  import axios from "axios";
  const response = await axios.post("http://localhost:8000/api/login/", {
    email,
    password,
  });
  return response.data;
  */
}