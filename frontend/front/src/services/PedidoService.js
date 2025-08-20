import axios from 'axios';

const API_URL = "http://localhost:8888/api/pedidos";

export const getPedidos = () => 
  axios.get(`${API_URL}/cliente`);

export const getPedidoById = (id) => 
  axios.get(`${API_URL}/${id}`);

export const actualizarEstadoPedido = (id, estado) =>
  axios.patch(`${API_URL}/${id}/estado`, { estado });

// NUEVO: Descargar boleta PDF
export const descargarBoleta = (id) =>
  axios.get(`${API_URL}/${id}/boleta`, {
    responseType: 'blob', // Muy importante para descargar archivos binarios
  });
