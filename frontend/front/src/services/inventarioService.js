// src/services/inventarioService.js
import axios from 'axios';

const API_BASE = 'http://localhost:8888/api';

export const getInventario = () => axios.get(`${API_BASE}/inventario`);
export const registrarEntrada = (data) =>
  axios.post(`${API_BASE}/entrada`, data);
