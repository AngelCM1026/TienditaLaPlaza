import React, { useState } from 'react'
import { FaEye, FaPlus, FaMinus } from 'react-icons/fa'
import './Producto.css'

export default function ProductCard({
  producto,
  onAddToCart,
  onQuickView,          // nueva prop para vista rápida
  mostrarPrecio = true,
  mostrarControles = true,
}) {
  const [qty, setQty] = useState(1)

  const dec = () => setQty(q => Math.max(1, q - 1))
  const inc = () => setQty(q => q + 1)

  return (
    <article className="product-card">
      <div className="image-container">
        {producto.imagenUrl && (
          <img
            src={producto.imagenUrl.startsWith('/') ? producto.imagenUrl : `/img/${producto.imagenUrl}`}
            alt={producto.nombre}
            className="product-image"
          />
        )}
        <div
          className="overlay"
          onClick={() => onQuickView && onQuickView(producto.id)}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyPress={e => { if (e.key === 'Enter') onQuickView && onQuickView(producto.id) }}
          aria-label={`Ver detalles rápidos de ${producto.nombre}`}
        >
          <FaEye className="overlay-icon" />
          <span>Vista rápida</span>
        </div>
      </div>

      <div className="info">
        <h4 className="product-name">{producto.nombre}</h4>
        {mostrarPrecio && (
          <p className="product-price">S/ {producto.precio.toFixed(2)}</p>
        )}
      </div>

      {mostrarControles && (
        <div className="actions">
          <div className="qty-selector">
            <button onClick={dec} aria-label="Disminuir cantidad" className="qty-btn">
              <FaMinus />
            </button>
            <span className="qty-value">{qty}</span>
            <button onClick={inc} aria-label="Aumentar cantidad" className="qty-btn">
              <FaPlus />
            </button>
          </div>
          <button
            className="add-btn"
            onClick={() => onAddToCart(producto, qty)}
          >
            Agregar al carrito
          </button>
        </div>
      )}
    </article>
  )
}
