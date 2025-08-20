// src/components/AuthModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import { registerUser } from '../services/auth';
import { AuthContext } from '../context/AuthContext';
import {
  FaLock,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaEye,
  FaEyeSlash,
  FaUser
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose }) {
  const { login: contextLogin } = useContext(AuthContext);

  const [view, setView] = useState('login');
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    telefono: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [showPasswordFields, setShowPasswordFields] = useState({
    password: false,
    confirmPassword: false
  });
  const [submitting, setSubmitting] = useState(false);

  // Validación en tiempo real
  useEffect(() => {
    const err = {};
    if (!form.username) err.username = 'El usuario es requerido';
    if (!form.password) err.password = 'La contraseña es requerida';
    if (view === 'register') {
      if (form.password.length < 6) err.password = 'Mínimo 6 caracteres';
      if (form.password !== form.confirmPassword) err.confirmPassword = 'No coinciden';
      if (!form.nombre) err.nombre = 'El nombre es requerido';
      if (!form.telefono) err.telefono = 'El teléfono es requerido';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = 'Email inválido';
    }
    setErrors(err);
  }, [form, view]);

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const resetForm = () => {
    setForm({
      username: '',
      password: '',
      confirmPassword: '',
      nombre: '',
      telefono: '',
      email: ''
    });
    setErrors({});
    setShowPasswordFields({ password: false, confirmPassword: false });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);

    if (Object.keys(errors).length > 0) {
      toast.error('Por favor completa todos los campos correctamente');
      setSubmitting(false);
      return;
    }

    try {
      if (view === 'login') {
        await contextLogin(form.username, form.password);
        resetForm();
        onClose();
        toast.success('¡Bienvenido!');
      } else {
        await registerUser({
          username: form.username,
          password: form.password,
          nombre: form.nombre,
          telefono: form.telefono,
          email: form.email
        });
        toast.success('¡Cuenta creada correctamente!');
        setView('login');
        resetForm();
      }
    } catch (err) {
      toast.error('Ocurrió un error. Intenta nuevamente.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-tabs">
          <button
            className={view === 'login' ? 'active' : ''}
            onClick={() => setView('login')}
          >
            Iniciar sesión
          </button>
          <button
            className={view === 'register' ? 'active' : ''}
            onClick={() => setView('register')}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Usuario */}
          <div className="form-group">
            <label>Usuario</label>
            <div className="input-container">
              <FaUserCircle className="input-icon" />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Nombre de usuario"
              />
            </div>
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-container">
              <FaLock className="input-icon" />
              <input
                type={showPasswordFields.password ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className="password-input"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() =>
                  setShowPasswordFields(s => ({ ...s, password: !s.password }))
                }
              >
                {showPasswordFields.password ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Confirmar contraseña */}
          {view === 'register' && (
            <div className="form-group">
              <label>Confirmar contraseña</label>
              <div className="input-container">
                <FaLock className="input-icon" />
                <input
                  type={showPasswordFields.confirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="password-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() =>
                    setShowPasswordFields(s => ({ ...s, confirmPassword: !s.confirmPassword }))
                  }
                >
                  {showPasswordFields.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>
          )}

          {/* Campos registro */}
          {view === 'register' && (
            <>
              <div className="form-group">
                <label>Nombre completo</label>
                <div className="input-container">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                  />
                </div>
                {errors.nombre && <span className="field-error">{errors.nombre}</span>}
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <div className="input-container">
                  <FaPhone className="input-icon" />
                  <input
                    type="text"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="123456789"
                  />
                </div>
                {errors.telefono && <span className="field-error">{errors.telefono}</span>}
              </div>
              <div className="form-group">
                <label>Correo electrónico</label>
                <div className="input-container">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ejemplo@dominio.com"
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
            </>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={submitting}
          >
            {submitting
              ? 'Procesando...'
              : view === 'login'
                ? 'Entrar'
                : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
}
