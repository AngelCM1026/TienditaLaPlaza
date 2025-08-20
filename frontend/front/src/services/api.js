// src/services/api.js
import axios from 'axios'

// Usamos el gateway como URL base
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8888'
})

// Inyectar token si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
