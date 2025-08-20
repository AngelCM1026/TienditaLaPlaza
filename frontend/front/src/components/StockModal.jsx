// src/components/StockModal.jsx
import React, { useState } from 'react';

export default function StockModal({ visible, onClose, producto, onSubmit }) {
  const [cantidad, setCantidad] = useState('');
  const [referencia, setReferencia] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      productoId: producto.productoId,
      cantidad: parseInt(cantidad),
      referencia
    });
    setCantidad('');
    setReferencia('');
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Agregar stock a producto #{producto.productoId}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label>Cantidad</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded-md"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label>Referencia</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded-md"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
