import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../api/auth";
import "../styles/Login.css";
import logo from "../../public/logo1..png"; 

// Íconos
import { FaUser, FaLock } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginAdmin(email, password);
    if (result.success) {
      localStorage.setItem("token", result.token);
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo-section">
          <img src={logo} alt="SmartSales365" className="login-logo" />
          <h2 className="login-title">SMART</h2>
          <h3 className="login-subtitle">SALES365</h3>
          <p className="login-access">Acceso exclusivo para Administradores</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>Usuario</label>
          <div className="input-icon">
            <FaUser className="icon" />
            <input
              type="email"
              placeholder="admin@smartsales.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Contraseña</label>
          <div className="input-icon">
            <FaLock className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="remember-container">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Recordarme</label>
          </div>

          <button type="submit" className="login-btn">
            Iniciar Sesión
          </button>

          {error && <p className="login-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;