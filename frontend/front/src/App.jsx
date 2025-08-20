import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Checkout from './components/Checkout';
import Orders from './components/Orders';
import Inventario from './components/Inventario';
import CrearProducto from './components/CrearProducto';
import Proveedores from './components/Proveedores';
import AdminPedidos from './components/AdminPedidos';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import AuthModal from './components/AuthModal';
import Perfil from './components/Perfil';

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/checkout"
          element={
            <PrivateRoute openAuthModal={() => setAuthModalOpen(true)}>
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route path="/orders" element={<Orders />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/producto" element={<CrearProducto />} />
        <Route path="/proveedor" element={<Proveedores />} />
        <Route path="/pedido" element={<AdminPedidos />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
