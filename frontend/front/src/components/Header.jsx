import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBars, FaUserCircle, FaShoppingCart, FaBell, FaHome,
  FaBoxOpen, FaTruck, FaWarehouse, FaClipboardList,
  FaChartBar, FaEnvelope, FaUser, FaSignOutAlt,
  FaListAlt, FaCheckDouble
} from 'react-icons/fa';
import './Header.css';
import logo from '../assets/logo3.jpeg';
import AuthModal from './AuthModal';
import CartDrawer from './CartDrawer';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// ================= MODAL DE NOTIFICACIONES =================
function NotificationsModal({ isOpen, onClose, notificaciones, toggleSelect, marcarVariasLeidas }) {
  if (!isOpen) return null;

  return (
    <div className="notifications-backdrop" onClick={onClose}>
      <div className="notifications-modal" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="notif-header">
          <h3>🔔 Notificaciones</h3>
        </div>

        {/* Contenido */}
        <div className="notif-body">
          {notificaciones.length === 0 ? (
            <p>No tienes notificaciones nuevas.</p>
          ) : (
            <ul className="notifications-list">
  {[...notificaciones]
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)) // 🔥 más recientes arriba
    .map(n => (
      <li key={n.id} className={n.leida ? "leida" : "no-leida"}>
        <input
          type="checkbox"
          checked={n.seleccionada || false}
          onChange={() => toggleSelect(n.id)}
        />
        <span><strong>{n.titulo}:</strong> {n.mensaje}</span>
        <small>{new Date(n.fechaCreacion).toLocaleString()}</small>
      </li>
    ))}
</ul>

          )}
        </div>

        {/* Footer con botón */}
        {notificaciones.length > 0 && (
          <div className="notif-footer">
            <button className="btn-marcar-leida" onClick={marcarVariasLeidas}>
              <FaCheckDouble /> Marcar todas leídas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ================= HEADER =================
export default function Header() {
  const { user, logout, role } = useContext(AuthContext);
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [userMenuOpen, setUserMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userMenuRef = useRef(null);
  const wsRef = useRef(null);

  // Cerrar menú usuario al hacer click afuera
  useEffect(() => {
    const onClick = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  // Notificaciones + WebSocket
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const resp = await fetch(`http://localhost:8888/api/notificaciones/${user}`);
        const data = await resp.json();
        setNotificaciones(data);
        setUnreadCount(data.filter(n => !n.leida).length);
      } catch (err) {
        console.error("Error al cargar notificaciones:", err);
      }
    };
    fetchNotifications();

    wsRef.current = new WebSocket("ws://localhost:8080/ws-notificaciones");
    wsRef.current.onopen = () => console.log("✅ Conectado al WS de notificaciones");
    wsRef.current.onmessage = (event) => {
      try {
        const nuevaNotif = JSON.parse(event.data);
        setNotificaciones(prev => [nuevaNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      } catch (err) {
        console.error("❌ Error procesando WS:", err);
      }
    };
    wsRef.current.onclose = () => console.log("🔌 WS cerrado");

    return () => {
      wsRef.current?.close();
    };
  }, [user]);

  // Toggle selección
  const toggleSelect = (id) => {
    setNotificaciones(prev =>
      prev.map(n => n.id === id ? { ...n, seleccionada: !n.seleccionada } : n)
    );
  };

  // Marcar varias leídas
  const marcarVariasLeidas = async () => {
    const seleccionadas = notificaciones.filter(n => n.seleccionada && !n.leida);
    try {
      for (const n of seleccionadas) {
        await fetch(`http://localhost:8888/api/notificaciones/leida/${n.id}`, { method: "PUT" });
      }
      setNotificaciones(prev =>
        prev.map(n => n.seleccionada ? { ...n, leida: true, seleccionada: false } : n)
      );
      setUnreadCount(notificaciones.filter(n => !n.leida && !n.seleccionada).length);
    } catch (err) {
      console.error("Error al marcar múltiples como leídas:", err);
    }
  };

  const adminMenuItems = [
    { label: 'Inicio', path: '/', icon: <FaHome /> },
    { label: 'Producto', path: '/producto', icon: <FaBoxOpen /> },
    { label: 'Proveedor', path: '/proveedor', icon: <FaTruck /> },
    { label: 'Inventario', path: '/inventario', icon: <FaWarehouse /> },
    { label: 'Ver Pedidos', path: '/pedido', icon: <FaClipboardList /> },
    { label: 'Ver Dashboard', path: '/dashboard', icon: <FaChartBar /> },
    { label: 'Contacto', path: '/contacto', icon: <FaEnvelope /> },
  ];
  const clienteMenuItems = [
    { label: 'Inicio', path: '/', icon: <FaHome /> },
    { label: 'Contacto', path: '/contacto', icon: <FaEnvelope /> },
  ];
  const menuItems = role?.toUpperCase() === 'ADMIN' ? adminMenuItems : clienteMenuItems;

  return (
    <>
      <header className="header">
        <button className="hamburger-btn" onClick={() => setNavOpen(o => !o)}>
          <FaBars size={28} color="white" />
        </button>
        <div className="header-center">
          <img src={logo} alt="Logo Market" className="header-logo" />
        </div>
        <div className="header-right">

          {/* Notificaciones */}
          <button className="action-btn" onClick={() => setNotifOpen(true)}>
            <FaBell size={22} className="icon" />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {/* Usuario */}
          {user ? (
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button className="action-btn" onClick={() => setUserMenu(o => !o)}>
                <FaUserCircle size={28} className="icon" />
                <span className="action-text">{user.toUpperCase()}</span>
              </button>
              {userMenuOpen && (
                <ul className="user-dropdown">
                  <li onClick={() => navigate('/perfil')}>
                    <FaUser className="dropdown-icon" /> Ver mi perfil
                  </li>
                  <li onClick={() => navigate('/orders')}>
                    <FaListAlt className="dropdown-icon" /> Ver mis pedidos
                  </li>
                  <li onClick={() => { logout(); setModalOpen(true); }}>
                    <FaSignOutAlt className="dropdown-icon" /> Salir
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <button className="action-btn" onClick={() => setModalOpen(true)}>
              <FaUserCircle size={28} className="icon" />
              <span className="action-text">Ingresar</span>
            </button>
          )}

          {/* Carrito */}
          <button className="action-btn" onClick={() => setCartOpen(true)}>
            <FaShoppingCart size={28} className="icon" />
            <span className="action-text">{cartItems.length}</span>
          </button>
        </div>
      </header>

      {navOpen && <div className="backdrop" onClick={() => setNavOpen(false)} />}
      <aside className={`side-drawer ${navOpen ? 'open' : ''}`}>
        <button className="drawer-close" onClick={() => setNavOpen(false)}>×</button>
        <nav>
          <ul>
            {menuItems.map(item => (
              <li key={item.path} onClick={() => { navigate(item.path); setNavOpen(false); }}>
                <span className="drawer-icon">{item.icon}</span> {item.label}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} openLoginModal={() => setModalOpen(true)} />
      <NotificationsModal
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notificaciones={notificaciones}
        toggleSelect={toggleSelect}
        marcarVariasLeidas={marcarVariasLeidas}
      />
    </>
  );
}
