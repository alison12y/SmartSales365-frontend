// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { registerUser } from "../api/auth.js";
// Opcional: para redirigir al usuario después del registro
import { useNavigate } from 'react-router-dom'; 

function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        // --- Campos del User ---
        username: '',
        email: '',
        password: '',
        password2: '', // Para la confirmación
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        // --- Campos del Cliente ---
        ci_nit: '',
        telefono: '',
        direccion: '',
        ciudad: '',
    });
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validar que las contraseñas coincidan (frontend)
        if (formData.password !== formData.password2) {
            setError({ password2: ["Las contraseñas no coinciden."] });
            setLoading(false);
            return;
        }

        try {
            // Llama al servicio de API que creamos
            await registerUser(formData);
            
            // ¡Éxito!
            setLoading(false);
            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            navigate('/login'); // Redirige al login

        } catch (err) {
            // Manejar errores del backend
            setLoading(false);
            if (err.response && err.response.data) {
                // err.response.data será un objeto como:
                // { email: ["Este email ya existe."], password: [...] }
                setError(err.response.data);
            } else {
                setError({ general: "Ocurrió un error. Intenta de nuevo." });
            }
        }
    };

    return (
        <div>
            <h2>Crear Cuenta</h2>
            <form onSubmit={handleSubmit}>
                {/* Campos del User */}
                <input type="text" name="username" placeholder="Nombre de usuario" onChange={handleChange} required />
                {error?.username && <small style={{color: 'red'}}>{error.username[0]}</small>}
                
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                {error?.email && <small style={{color: 'red'}}>{error.email[0]}</small>}

                <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
                {error?.password && <small style={{color: 'red'}}>{error.password[0]}</small>}

                <input type="password" name="password2" placeholder="Confirmar contraseña" onChange={handleChange} required />
                {error?.password2 && <small style={{color: 'red'}}>{error.password2[0]}</small>}

                <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} />
                <input type="text" name="apellido_paterno" placeholder="Apellido Paterno" onChange={handleChange} />
                <input type="text" name="apellido_materno" placeholder="Apellido Materno" onChange={handleChange} />
                
                <hr />
                {/* Campos del Cliente */}
                <input type="text" name="ci_nit" placeholder="CI o NIT" onChange={handleChange} />
                <input type="text" name="telefono" placeholder="Teléfono" onChange={handleChange} />
                <input type="text" name="direccion" placeholder="Dirección" onChange={handleChange} />
                <input type="text" name="ciudad" placeholder="Ciudad" onChange={handleChange} />

                <button type="submit" disabled={loading}>
                    {loading ? 'Registrando...' : 'Crear Cuenta'}
                </button>
                
                {error?.general && <p style={{color: 'red'}}>{error.general}</p>}
            </form>
        </div>
    );
}

export default RegisterPage;