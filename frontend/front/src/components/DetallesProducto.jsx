import React from 'react'
import './DetallesProducto.css'

export default function ProductDetailsModal({ producto, onClose, isOpen, loading }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>

        {loading ? (
          <p>Cargando detalles...</p>
        ) : producto ? (
          <div className="modal-body">
            {/* Placeholder gris en vez de imagen */}
            <div className="modal-product-image placeholder-image">
              <span>Sin imagen</span>
            </div>
            <div className="modal-product-info">
              <h2>{producto.nombre}</h2>
              <p><strong>Código:</strong> {producto.codigo}</p>
              <p><strong>Categoría:</strong> {producto.categoria}</p>
              <p><strong>Precio:</strong> S/ {producto.precio.toFixed(2)}</p>
              <p><strong>Stock actual:</strong> {producto.stockActual}</p>
            </div>
          </div>
        ) : (
          <p>Error cargando detalles del producto.</p>
        )}
      </div>
    </div>
  )
}
