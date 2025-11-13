import React, { useState, useEffect } from 'react';
import { getRoles, getAllPermissions, createRole, updateRole, deleteRole } from '../../api/adminService'; 
import { PlusCircle, Edit, Trash2, CheckSquare, Square } from 'lucide-react'; // <-- Íconos añadidos
import 'bootstrap/dist/css/bootstrap.min.css'; 
import "../../styles/AdminLayout.css"; 

function RoleListPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    permission_ids: [] 
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, permissionsResponse] = await Promise.all([
        getRoles(),
        getAllPermissions()
      ]);
      
      setRoles(rolesResponse.data.results || rolesResponse.data); 
      setPermissions(permissionsResponse.data); 
      setError(null);

    } catch (err) {
      setError("Error al cargar datos. ¿Estás logueado como Admin?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []); 

  const handleOpenCreateModal = () => {
    setSelectedRole(null);
    setFormData({ name: '', permission_ids: [] });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      permission_ids: role.permissions.map(p => p.id) 
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedRole(null);
    setError(null); // <-- Limpiamos el error al cerrar
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionsChange = (e) => {
    const options = [...e.target.selectedOptions];
    const values = options.map(option => parseInt(option.value, 10)); 
    setFormData(prev => ({ ...prev, permission_ids: values }));
  };

  // --- ¡NUEVAS FUNCIONES PARA SELECCIONAR TODO! ---
  const handleSelectAllPermissions = () => {
    // Tomamos todos los IDs de la lista 'permissions'
    const allIds = permissions.map(p => p.id);
    setFormData(prev => ({ ...prev, permission_ids: allIds }));
  };

  const handleDeselectAllPermissions = () => {
    // Vaciamos la lista
    setFormData(prev => ({ ...prev, permission_ids: [] }));
  };
  // ----------------------------------------------

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    // Reseteamos el error
    setError(null); 
    
    try {
      if (selectedRole) {
        await updateRole(selectedRole.id, formData);
      } else {
        await createRole(formData);
      }
      closeModals();
      loadData(); 
    } catch (err) {
      console.error("Error al guardar rol:", err.response?.data);
      setError(err.response?.data?.name?.[0] || "Error al guardar. Revisa los campos.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;
    try {
      await deleteRole(selectedRole.id);
      closeModals();
      loadData(); 
    } catch (err) {
      console.error("Error al eliminar rol:", err);
      setError("Error al eliminar rol.");
    }
  };

  if (loading) return <p>Cargando roles y permisos...</p>;
  if (error && !isFormModalOpen) return <p className="text-danger">{error}</p>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Gestión de Roles y Permisos</h2>
        <button 
          className="btn btn-primary btn-sm d-flex align-items-center gap-2"
          onClick={handleOpenCreateModal}
        >
          <PlusCircle size={18} />
          <span>Crear Rol</span>
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered mt-3">
          {/* ... (Tu <thead> de la tabla se queda igual) ... */}
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
                <td>{role.permissions.length} permisos</td>
                <td>
                  <button 
                    className="btn btn-sm btn-outline-primary me-2" 
                    title="Editar"
                    onClick={() => handleOpenEditModal(role)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    title="Eliminar"
                    onClick={() => handleOpenDeleteModal(role)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE CREAR / EDITAR (MEJORADO) --- */}
      {isFormModalOpen && (
        <div className="logout-modal-overlay"> 
          <div className="logout-modal" style={{width: '600px', maxWidth: '90%'}}>
            <h3>{selectedRole ? 'Editar Rol' : 'Crear Nuevo Rol'}</h3>
            
            {error && <p className="text-danger small text-start">{error}</p>}

            <form onSubmit={handleSaveSubmit}>
              <div className="mb-2 text-start">
                <label htmlFor="name" className="form-label">Nombre del Rol</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required 
                />
              </div>

              <div className="mb-2 text-start">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label htmlFor="permission_ids" className="form-label mb-0">Permisos</label>
                  {/* --- ¡NUEVOS BOTONES! --- */}
                  <div>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={handleSelectAllPermissions}
                    >
                      <CheckSquare size={14} /> Todos
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleDeselectAllPermissions}
                    >
                      <Square size={14} /> Ninguno
                    </button>
                  </div>
                </div>
                
                <select 
                  multiple 
                  className="form-select" 
                  id="permission_ids" 
                  name="permission_ids" 
                  value={formData.permission_ids} 
                  onChange={handlePermissionsChange}
                  style={{ height: '250px' }} 
                >
                  {permissions.map(perm => (
                    <option key={perm.id} value={perm.id}>{perm.name} ({perm.codename})</option>
                  ))}
                </select>
              </div>
              
              <div className="logout-actions mt-4">
                <button type="submit" className="btn-accept">
                  {selectedRole ? 'Guardar Cambios' : 'Crear Rol'}
                </button>
                <button type="button" onClick={closeModals} className="btn-cancel">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMACIÓN DE BORRADO --- */}
      {isDeleteModalOpen && (
        // ... (Tu modal de borrado se queda igual, está perfecto) ...
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>¿Seguro que deseas eliminar este rol?</h3>
            <p className="text-warning">Rol: {selectedRole?.name}</p>
            <p className="text-light">Esta acción no se puede deshacer.</p>
            <div classNameclassName="logout-actions">
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

export default RoleListPage;