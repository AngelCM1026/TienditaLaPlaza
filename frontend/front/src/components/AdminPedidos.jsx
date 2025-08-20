import React, { useEffect, useState } from 'react';
import { getPedidos, descargarBoleta } from '../services/PedidoService.js';
import PedidoModal from './PedidoModal';
import './pedido.css';

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  useEffect(() => {
    getPedidos().then(res => setPedidos(res.data));
  }, []);

  const filtrarPedidos = () => {
    return pedidos.filter(p =>
      (p.cliente?.nombre?.toLowerCase() || '').includes(filtro.toLowerCase()) &&
      (fechaFiltro ? p.fecha.includes(fechaFiltro) : true)
    );
  };

  const handleExportar = (id) => {
    descargarBoleta(id).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `boleta_pedido_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }).catch(err => {
      console.error('Error al descargar boleta', err);
      alert('No se pudo generar la boleta');
    });
  };

  // ✅ Actualizar el estado de un pedido desde el modal
  const actualizarEstadoPedido = (id, nuevoEstado) => {
    setPedidos(prevPedidos =>
      prevPedidos.map(p =>
        p.id === id ? { ...p, estado: nuevoEstado } : p
      )
    );
    if (pedidoSeleccionado?.id === id) {
      setPedidoSeleccionado(prev => ({
        ...prev,
        estado: nuevoEstado
      }));
    }
  };

  return (
    <div className="admin-pedidos-container">
      <h1 className="titulo-admin">📦 Administración de Pedidos</h1>

      <div className="filtros-pedidos">
        <input
          className="input-filtro"
          placeholder="🔍 Buscar por cliente"
          onChange={e => setFiltro(e.target.value)}
        />
        <input
          type="date"
          className="input-fecha"
          onChange={e => setFechaFiltro(e.target.value)}
        />
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-pedidos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrarPedidos().map(pedido => (
              <tr key={pedido.id}>
                <td>{pedido.id}</td>
                <td>{pedido.fecha}</td>
                <td>{pedido.cliente?.nombre || 'Sin cliente'}</td>
                <td>{pedido.estado}</td>
                <td>S/ {pedido.total?.toFixed(2)}</td>
                <td className="opciones">
                  <button
                    className="btn-ver"
                    onClick={() => setPedidoSeleccionado(pedido)}
                  >
                    Ver
                  </button>
                  <button
                    className="btn-exportar"
                    onClick={() => handleExportar(pedido.id)}
                  >
                    Exportar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pedidoSeleccionado && (
        <PedidoModal
          pedido={pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
          onEstadoActualizado={actualizarEstadoPedido} // ✅ nuevo prop
        />
      )}
    </div>
  );
};

export default AdminPedidos;
