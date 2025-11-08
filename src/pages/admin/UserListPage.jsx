import React, { useState, useEffect } from 'react';
import { getUsers } from '../../api/adminService'; 
import { PlusCircle, Edit, Trash2 } from 'lucide-react'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import "../../styles/AdminLayout.css";

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers();
        // 'results' es importante si tu API de Django usa paginación
        setUsers(response.data.results || response.data); 
        setError(null);
      } catch (err) {
        setError("Error al cargar usuarios. ¿Estás logueado como Admin?");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); 

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Gestión de Usuarios</h2>
        <button className="btn btn-primary btn-sm d-flex align-items-center gap-2">
          <PlusCircle size={18} />
          <span>Crear Usuario</span>
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered mt-3">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Nombre Completo</th>
              <th>Roles</th>
              <th>Activo</th>
              <th>Staff</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.nombre} {user.apellido_paterno}</td>
                <td>{user.groups.join(', ') || 'N/A'}</td>
                <td>{user.is_active ? 'Sí' : 'No'}</td>
                <td>{user.is_staff ? 'Sí' : 'No'}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" title="Editar">
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-sm btn-outline-danger" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserListPage;