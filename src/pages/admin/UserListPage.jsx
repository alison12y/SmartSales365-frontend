import React, { useState, useEffect } from 'react';
// ¡IMPORTANTE! Importamos TODAS las funciones de adminService que usaremos
import { getUsers, getRoles, createUser, updateUser, deleteUser } from '../../api/adminService'; 
import { PlusCircle, Edit, Trash2 } from 'lucide-react'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import "../../styles/AdminLayout.css"; // Contiene los estilos de modal y página

function UserListPage() {
  // --- Estados de Datos ---
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); // <-- NUEVO: Para el <select> de roles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados de UI (Modales y Formularios) ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); // Modal de Crear/Editar
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal de Confirmar Borrado
  const [selectedUser, setSelectedUser] = useState(null); // Guarda el usuario a editar/borrar
  const [formData, setFormData] = useState({ // Estado para el formulario
    username: '',
    email: '',
    nombre: '',
    apellido_paterno: '',
    password: '',
    is_active: true,
    is_staff: false,
    groups: [] // Para los roles
  });

  // --- 1. FUNCIÓN PARA CARGAR DATOS (REUTILIZABLE) ---
  // La sacamos del useEffect para poder llamarla después de crear/editar/borrar
  const loadData = async () => {
    try {
      setLoading(true);
      // Hacemos ambas llamadas a la API al mismo tiempo
      const [usersResponse, rolesResponse] = await Promise.all([
        getUsers(),
        getRoles()
      ]);
      
      setUsers(usersResponse.data.results || usersResponse.data); 
      setRoles(rolesResponse.data.results || rolesResponse.data);
      setError(null);

    } catch (err) {
      setError("Error al cargar datos. ¿Estás logueado como Admin?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. USE EFFECT (SOLO CARGA LOS DATOS AL INICIO) ---
  useEffect(() => {
    loadData();
  }, []); // El [] asegura que se ejecute solo una vez al montar

  // --- 3. MANEJADORES DE MODALES (ABRIR/CERRAR) ---
  const handleOpenCreateModal = () => {
    setSelectedUser(null); // Limpiamos el usuario seleccionado
    setFormData({ // Reseteamos el formulario a valores por defecto
      username: '',
      email: '',
      nombre: '',
      apellido_paterno: '',
      password: '', // Importante para 'crear'
      is_active: true,
      is_staff: false,
      groups: []
    });
    setIsFormModalOpen(true); // Abrimos el modal
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user); // Guardamos el usuario a editar
    setFormData({ // Llenamos el formulario con los datos del usuario
      ...user,
      groups: user.groups || [] // Aseguramos que 'groups' sea un array
    });
    setIsFormModalOpen(true); // Abrimos el modal
  };

  const handleOpenDeleteModal = (user) => {
    setSelectedUser(user); // Guardamos el usuario a borrar
    setIsDeleteModalOpen(true); // Abrimos el modal de confirmación
  };

  const closeModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  // --- 4. MANEJADORES DE FORMULARIO ---
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRolesChange = (e) => {
    // Maneja la selección múltiple de roles
    const options = [...e.target.selectedOptions];
    const values = options.map(option => option.value);
    setFormData(prev => ({
      ...prev,
      groups: values
    }));
  };

  // --- 5. MANEJADORES DE ACCIONES (API) ---
  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        // --- Lógica de EDITAR (PUT) ---
        // Quitamos el password, no se debe cambiar en el 'edit'
        const { password, ...updateData } = formData;
        await updateUser(selectedUser.id, updateData);
      } else {
        // --- Lógica de CREAR (POST) ---
        // Tu UserAdminSerializer (backend) necesita el password en 'create'
        await createUser(formData);
      }
      closeModals(); // Cerramos el modal
      loadData(); // ¡Refrescamos la lista de usuarios!
    } catch (err) {
      console.error("Error al guardar usuario:", err.response?.data);
      setError("Error al guardar. Revisa los campos.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      // --- Lógica de BORRAR (DELETE) ---
      await deleteUser(selectedUser.id);
      closeModals(); // Cerramos el modal
      loadData(); // ¡Refrescamos la lista de usuarios!
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setError("Error al eliminar usuario.");
    }
  };

  // --- Vistas de Carga y Error ---
  if (loading) return <p>Cargando usuarios y roles...</p>;
  // Mantenemos el error de carga principal
  if (error && !isFormModalOpen) return <p className="text-danger">{error}</p>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Gestión de Usuarios</h2>
        {/* --- BOTÓN CREAR (AHORA FUNCIONAL) --- */}
        <button 
          className="btn btn-primary btn-sm d-flex align-items-center gap-2"
          onClick={handleOpenCreateModal}
        >
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
                  {/* --- BOTONES DE ACCIÓN (AHORA FUNCIONALES) --- */}
                  <button 
                    className="btn btn-sm btn-outline-primary me-2" 
                    title="Editar"
                    onClick={() => handleOpenEditModal(user)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    title="Eliminar"
                    onClick={() => handleOpenDeleteModal(user)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- 6. MODAL DE CREAR / EDITAR --- */}
      {isFormModalOpen && (
        <div className="logout-modal-overlay"> {/* Reutilizamos el estilo del modal */}
          <div className="logout-modal" style={{width: '500px'}}>
            <h3>{selectedUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
            
            {/* Mostramos errores de guardado del formulario */}
            {error && <p className="text-danger">{error}</p>}

            <form onSubmit={handleSaveSubmit}>
              <div className="mb-2 text-start">
                <label htmlFor="username" className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="username" 
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  required 
                />
              </div>
              <div className="mb-2 text-start">
                <label htmlFor="email" className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required 
                />
              </div>
              
              {/* Solo mostrar campo de contraseña al CREAR */}
              {!selectedUser && (
                <div className="mb-2 text-start">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    required 
                  />
                </div>
              )}

              <div className="mb-2 text-start">
                <label htmlFor="nombre" className="form-label">Nombre</label>
                <input type="text" className="form-control" id="nombre" name="nombre" value={formData.nombre} onChange={handleFormChange} />
              </div>
              <div className="mb-2 text-start">
                <label htmlFor="apellido_paterno" className="form-label">Apellido</label>
                <input type="text" className="form-control" id="apellido_paterno" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleFormChange} />
              </div>

              <div className="mb-2 text-start">
                <label htmlFor="roles" className="form-label">Roles (Grupos)</label>
                <select 
                  multiple 
                  className="form-select" 
                  id="roles" 
                  name="groups" 
                  value={formData.groups} // 'groups' es un array de strings (nombres)
                  onChange={handleRolesChange}
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="d-flex justify-content-start gap-4 mt-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleFormChange} />
                  <label className="form-check-label" htmlFor="is_active">Activo</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="is_staff" name="is_staff" checked={formData.is_staff} onChange={handleFormChange} />
                  <label className="form-check-label" htmlFor="is_staff">Staff (Admin)</label>
                </div>
              </div>
              
              <div className="logout-actions mt-4">
                <button type="submit" className="btn-accept">
                  {selectedUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
                <button type="button" onClick={closeModals} className="btn-cancel">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 7. MODAL DE CONFIRMACIÓN DE BORRADO --- */}
      {isDeleteModalOpen && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>¿Seguro que deseas eliminar a este usuario?</h3>
            <p className="text-warning">Usuario: {selectedUser?.username}</p>
            <p className="text-light">Esta acción no se puede deshacer.</p>
            
            <div className="logout-actions">
              <button onClick={handleDeleteConfirm} className="btn-accept" style={{backgroundColor: '#e74c3c'}}>
                Sí, Eliminar
              </button>
              <button onClick={closeModals} className="btn-cancel">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default UserListPage;