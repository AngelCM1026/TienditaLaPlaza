import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import './Perfil.css';

export default function Perfil() {
  const { clienteId, token, user: username } = useContext(AuthContext); // user es username
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCliente() {
      try {
        setLoading(true);
        const response = await api.get(`/api/clientes/usuario/${clienteId}`, { // usa el endpoint correcto para buscar por usuarioId
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCliente(response.data);
      } catch (e) {
        setError('No se pudo cargar la información del perfil');
      } finally {
        setLoading(false);
      }
    }

    if (clienteId && token) {
      fetchCliente();
    }
  }, [clienteId, token]);

  if (loading) return <div className="perfil-container"><p>Cargando perfil...</p></div>;
  if (error) return <div className="perfil-container"><p className="error">{error}</p></div>;

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <h1>Mi Perfil</h1>
        {cliente ? (
          <>
            <div className="perfil-item">
              <label>Usuario:</label>
              <span>{username}</span>
            </div>
            <div className="perfil-item">
              <label>Nombre completo:</label>
              <span>{cliente.nombre}</span>
            </div>
            <div className="perfil-item">
              <label>Teléfono:</label>
              <span>{cliente.telefono}</span>
            </div>
            <div className="perfil-item">
              <label>Correo electrónico:</label>
              <span>{cliente.email}</span>
            </div>

            <button
              className="btn-cambiar-contrasena"
              onClick={() => alert('Funcionalidad para cambiar contraseña próximamente')}
            >
              Cambiar contraseña
            </button>
          </>
        ) : (
          <p>No hay datos disponibles.</p>
        )}
      </div>
    </div>
  );
}
