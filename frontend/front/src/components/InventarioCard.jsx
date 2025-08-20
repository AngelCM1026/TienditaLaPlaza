// src/components/InventarioCard.jsx
import React from 'react';

export default function InventarioCard({ producto, onActualizar }) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-4 relative group hover:shadow-2xl transition duration-300">
      <h2 className="text-lg font-semibold mb-2">Producto #{producto.productoId}</h2>
      <p><strong>Stock:</strong> {producto.stockActual}</p>
      <p className="text-sm text-gray-500">Mín: {producto.stockMinimo} | Máx: {producto.stockMaximo}</p>

      <button
        className="absolute bottom-3 right-3 bg-blue-500 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition"
        onClick={() => onActualizar(producto)}
      >
        Actualizar Stock
      </button>
    </div>
  );
}
