import React, { useContext } from 'react'
import { useCart } from '../context/CartContext'
import { FaTimes, FaTrash, FaPlus, FaMinus } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import './CartDrawer.css'

export default function CartDrawer({ isOpen, onClose, openLoginModal }) {
  const { cartItems, updateItem, removeItem } = useCart()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.producto.precio * item.cantidad,
    0
  )

  const getThumb = url =>
    url.startsWith('/') ? url : `/img/${url}`

  if (!isOpen) return null

  const handleCheckout = () => {
    onClose()
    if (!user) {
      openLoginModal()
    } else {
      navigate('/checkout')
    }
  }

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <aside className="cart-drawer" onClick={e => e.stopPropagation()}>
        <header className="cart-header">
          <h3>🛒 Tu Carrito</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes size={18}/>
          </button>
        </header>

        {cartItems.length === 0 ? (
          <p className="empty-msg">Tu carrito está vacío</p>
        ) : (
          <ul className="cart-items">
            {cartItems.map(item => (
              <li key={item.producto.id} className="cart-item">
                <img
                  className="item-thumb"
                  src={getThumb(item.producto.imagenUrl)}
                  alt={item.producto.nombre}
                />
                <div className="item-info">
                  <span className="item-name">{item.producto.nombre}</span>
                  <div className="qty-controls">
                    <button onClick={() =>
                      updateItem(item.producto.id, Math.max(1, item.cantidad - 1))
                    }><FaMinus/></button>
                    <span>{item.cantidad}</span>
                    <button onClick={() =>
                      updateItem(item.producto.id, item.cantidad + 1)
                    }><FaPlus/></button>
                  </div>
                  <span className="item-price">
                    S/ {(item.producto.precio * item.cantidad).toFixed(2)}
                  </span>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.producto.id)}
                  title="Eliminar producto"
                >
                  <FaTrash/>
                </button>
              </li>
            ))}
          </ul>
        )}

        <footer className="cart-footer">
          <div className="subtotal">
            Subtotal: <strong>S/ {subtotal.toFixed(2)}</strong>
          </div>
          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            Realizar pedido →
          </button>
        </footer>
      </aside>
    </div>
  )
}
