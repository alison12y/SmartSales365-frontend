import React, { useState, useEffect } from 'react';
import { getRoles } from '../../api/adminService'; 
import { PlusCircle, Edit, Trash2 } from 'lucide-react'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import "../../styles/AdminLayout.css"; 

function RoleListPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);

        const response = await getRoles();

        setRoles(response.data.results || response.data); 
        setError(null);
      } catch (err) {
        setError("Error al cargar roles. ¿Estás logueado como Admin?");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []); 

  if (loading) return <p>Cargando roles...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Gestión de Roles y Permisos</h2>
        <button className="btn btn-primary btn-sm d-flex align-items-center gap-2">
          <PlusCircle size={18} />
          <span>Crear Rol</span>
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered mt-3">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre del Rol</th>
              <th>Permisos Asignados</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td>{role.id}</td>
                <td>{role.name}</td>
                {/* La API de roles anida los permisos, así que podemos contarlos */}
                <td>{role.permissions.length} permisos</td>
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

export default RoleListPage;