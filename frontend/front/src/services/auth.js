// src/services/auth.js
import { api } from './api'

export function login(username, password) {
  // Llama a /api/auth/login en lugar de /usuario/api/auth/login
  return api.post('/api/auth/login', { username, password })
}

export function registerUser({ username, password, nombre, telefono, email }) {
  // Registro de usuario en /api/auth/register
  return api
    .post('/api/auth/register', {
      username,
      password,
      rol: 'CLIENTE',
      nombre,
      telefono,
      email
    })
    .then(res => {
      const userId = res.data.id
      // Luego crea cliente en /api/clientes (predicado Path=/api/clientes/**)
      return api.post('/api/clientes', {
        usuarioId: userId,
        nombre,
        telefono,
        email
      })
    })
}
