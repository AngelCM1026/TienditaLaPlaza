import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUser, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "./Proveedores.css";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [proveedor, setProveedor] = useState({
    id: null,
    nombre: "",
    razonSocial: "",
    telefono: "",
    email: "",
    direccion: "",
    imagenUrl: "",
  });

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productos, setProductos] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    obtenerProveedores();
  }, []);

  const obtenerProveedores = async () => {
    try {
      const res = await axios.get("http://localhost:8888/api/proveedores");
      setProveedores(res.data);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    }
  };

  const handleChange = (e) => {
    setProveedor({ ...proveedor, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editando) {
        await axios.put(`http://localhost:8888/api/proveedores/${proveedor.id}`, proveedor);
      } else {
        await axios.post("http://localhost:8888/api/proveedores", proveedor);
      }
      setProveedor({
        id: null,
        nombre: "",
        razonSocial: "",
        telefono: "",
        email: "",
        direccion: "",
        imagenUrl: "",
      });
      setEditando(false);
      obtenerProveedores();
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
    }
  };

  const abrirModal = async (prov) => {
    setProveedorSeleccionado(prov);
    try {
      const res = await axios.get(`http://localhost:8888/api/productos/proveedor/${prov.id}`);
      setProductos(res.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      setProductos([]);
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductos([]);
    setProveedorSeleccionado(null);
  };

  const editarProveedor = () => {
    setProveedor(proveedorSeleccionado);
    setEditando(true);
    cerrarModal();
  };

  return (
    <div className="contenedor">
      {/* Formulario */}
      <div className="formulario">
        <h2>{editando ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label><FaUser /> Nombre</label>
            <input
              name="nombre"
              value={proveedor.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label><FaBuilding /> Razón Social</label>
            <input
              name="razonSocial"
              value={proveedor.razonSocial}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label><FaPhone /> Teléfono</label>
            <input
              name="telefono"
              value={proveedor.telefono}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label><FaEnvelope /> Email</label>
            <input
              name="email"
              value={proveedor.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label><FaMapMarkerAlt /> Dirección</label>
            <input
              name="direccion"
              value={proveedor.direccion}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Imagen (nombre archivo en /img-prov)</label>
            <input
              name="imagenUrl"
              value={proveedor.imagenUrl}
              onChange={handleChange}
              placeholder="ejemplo.jpg"
            />
          </div>
          <button type="submit">{editando ? "Actualizar" : "Registrar"}</button>
        </form>
      </div>

      {/* Lista de Proveedores */}
      <div className="lista-proveedores">
        <h2>Proveedores</h2>
        <div className="cards">
          {proveedores.map((prov) => (
            <div key={prov.id} className="card" onClick={() => abrirModal(prov)}>
              {prov.imagenUrl && (
                <img
                  src={`/img-prov/${prov.imagenUrl}`}
                  alt={prov.nombre}
                  className="img-proveedor"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/80";
                  }}
                />
              )}
              <h3>{prov.nombre}</h3>
              <p>{prov.razonSocial}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalAbierto && proveedorSeleccionado && (
        <div className="modal">
          <div className="modal-contenido modal-grid">
            <span className="cerrar" onClick={cerrarModal}>×</span>

            {/* IZQUIERDA: Imagen + Datos */}
            <div className="modal-izquierda">
              {proveedorSeleccionado.imagenUrl && (
                <img
                  src={`/img-prov/${proveedorSeleccionado.imagenUrl}`}
                  alt={proveedorSeleccionado.nombre}
                  className="img-proveedor-modal"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/160";
                  }}
                />
              )}
              <div className="datos-proveedor estilizado">
                <h2>{proveedorSeleccionado.nombre}</h2>
                <p><strong>Razón Social:</strong> {proveedorSeleccionado.razonSocial}</p>
                <p><strong>Teléfono:</strong> {proveedorSeleccionado.telefono}</p>
                <p><strong>Email:</strong> {proveedorSeleccionado.email}</p>
                <p><strong>Dirección:</strong> {proveedorSeleccionado.direccion}</p>
              </div>
              <button onClick={editarProveedor}>Editar</button>
            </div>

            {/* DERECHA: Productos */}
            <div className="modal-derecha">
              <h3>Productos</h3>
              <div className="productos-grid">
                {productos.length === 0 && <p>No hay productos disponibles.</p>}
                {productos.map((prod) => (
                  <div className="producto-card" key={prod.id}>
                    <img
                      src={`/img/${prod.imagenUrl}`}
                      alt={prod.nombre}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/100"; }}
                    />
                    <span>{prod.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proveedores;
