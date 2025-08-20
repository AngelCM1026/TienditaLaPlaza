import React, { useState, useEffect } from "react";
import "./PedidoModal.css";
import axios from "axios";

const PedidoModal = ({ pedido, onClose, onEstadoActualizado }) => {
  const [estado, setEstado] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (pedido) {
      setEstado(pedido.estado);
    }
  }, [pedido]);

  const handleGuardarEstado = async () => {
    if (!estado) {
      alert("Por favor selecciona un estado válido.");
      return;
    }
    setGuardando(true);
    try {
      await axios.patch(`http://localhost:8888/api/pedidos/${pedido.id}/estado`, {
        estado,
      });
      alert("✅ Estado actualizado correctamente");
      if (onEstadoActualizado) {
        onEstadoActualizado(pedido.id, estado);
      }
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      alert("❌ Hubo un error al actualizar el estado");
    } finally {
      setGuardando(false);
    }
  };

  if (!pedido) {
    return (
      <div className="modal-overlay">
        <div className="modal-content loading">
          <h2>Cargando pedido...</h2>
          <button className="btn-cerrar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
          &times;
        </button>

        <h2 id="modal-title" className="modal-title">
          Detalles del Pedido #{pedido.id}
        </h2>

        <section className="cliente-info">
          <h3>Cliente</h3>
          <p>
            <strong>Nombre:</strong> {pedido.cliente?.nombre || "Sin nombre"}
          </p>
          <p>
            <strong>Teléfono:</strong> {pedido.cliente?.telefono || "Sin teléfono"}
          </p>
          <p>
            <strong>Email:</strong> {pedido.cliente?.email || "Sin email"}
          </p>
        </section>

        <section className="pedido-info">
          <h3>Información del Pedido</h3>
          <p>
            <strong>Dirección:</strong> {pedido.direccion}
          </p>
          <p>
            <strong>Referencia:</strong> {pedido.referencia || "-"}
          </p>
          <p>
            <strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}
          </p>
          <p>
            <strong>Total:</strong> S/ {pedido.total?.toFixed(2) || "0.00"}
          </p>

          <label htmlFor="estado-select" className="estado-label">
            <strong>Estado:</strong>
          </label>
          <select
            id="estado-select"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            disabled={guardando}
            className="estado-select"
          >
            <option value="NUEVO">NUEVO</option>
            <option value="EN PROCESO">EN PROCESO</option>
            <option value="ENTREGADO">ENTREGADO</option>
            <option value="CANCELADO">CANCELADO</option>
          </select>
        </section>

        <section className="productos-info">
          <h3>Productos</h3>
          {pedido.items && pedido.items.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>ID</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario (S/)</th>
                  <th>Subtotal (S/)</th>
                </tr>
              </thead>
              <tbody>
                {pedido.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.nombreProducto || "Sin nombre"}</td>
                    <td>{item.productoId}</td>
                    <td>{item.cantidad}</td>
                    <td>{item.precioUnit?.toFixed(2)}</td>
                    <td>{item.subtotal?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="sin-productos">No hay productos listados para este pedido.</p>
          )}
        </section>

        <div className="btn-container">
          <button
            className="btn-guardar"
            onClick={handleGuardarEstado}
            disabled={guardando}
            aria-live="polite"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PedidoModal;
