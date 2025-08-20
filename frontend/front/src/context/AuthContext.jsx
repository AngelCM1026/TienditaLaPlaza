import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => localStorage.getItem('username'));
  const [clienteId, setCliente] = useState(() => {
    const val = localStorage.getItem('clienteId');
    return val ? parseInt(val, 10) : null;
  });
  const [role, setRole] = useState(() => localStorage.getItem('role') || null);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  const SESSION_DURATION = 5 * 60 * 1000; // 5 minutos

  useEffect(() => {
    const expiration = localStorage.getItem('sessionExpiration');
    const now = Date.now();

    if (expiration && now > parseInt(expiration)) {
      logout();
    } else if (expiration) {
      const remainingTime = parseInt(expiration) - now;
      startSessionTimer(remainingTime);
    }
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const startSessionTimer = (duration) => {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    const timeout = setTimeout(() => {
      logout();
    }, duration);
    setSessionTimeout(timeout);
  };

  const login = async (username, password) => {
  const resp = await api.post('/api/auth/login', { username, password });
  const t = resp.data.token;

  const expirationTime = Date.now() + SESSION_DURATION;
  localStorage.setItem('token', t);
  localStorage.setItem('username', username);
  localStorage.setItem('sessionExpiration', expirationTime);
  setToken(t);
  setUser(username);

  startSessionTimer(SESSION_DURATION);

  try {
    const clienteResp = await api.get(`/api/usuarios/me`);
    const cid = clienteResp.data.clienteId;  // <-- Aquí cambiamos id por clienteId
    const userRole = clienteResp.data.rol;   // campo rol en español

    localStorage.setItem('clienteId', cid);
    localStorage.setItem('role', userRole);

    setCliente(cid ? parseInt(cid, 10) : null);
    setRole(userRole);
  } catch (e) {
    console.warn('No se pudo obtener clienteId o rol:', e.message);
    setCliente(null);
    setRole(null);
  }
};


  const logout = () => {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('clienteId');
    localStorage.removeItem('role');
    localStorage.removeItem('sessionExpiration');
    setToken(null);
    setUser(null);
    setCliente(null);
    setRole(null);
    if (sessionTimeout) clearTimeout(sessionTimeout);
  };

  return (
    <AuthContext.Provider value={{ user, token, clienteId, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
