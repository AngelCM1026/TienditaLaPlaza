// src/components/Orders.jsx
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { api } from '../services/api'
import './Orders.css'

const estados = ['NUEVO', 'EN_PROCESO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO']

export default function Orders() {
  const { clienteId } = useContext(AuthContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    if (!clienteId) return

    let intervalId

    async function fetchOrders() {
      setLoading(true)
      setError(null)
      try {
        const resp = await api.get(`/api/pedidos/cliente/${clienteId}/lista`)
        if (!Array.isArray(resp.data)) {
          console.warn('Respuesta inesperada:', resp.data)
          setOrders([])
        } else {
          setOrders(resp.data)
          setLastUpdated(new Date())
        }
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar los pedidos.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()

    intervalId = setInterval(fetchOrders, 30000)

    return () => clearInterval(intervalId)
  }, [clienteId])

  if (!clienteId) {
    return <p className="orders-message">Inicia sesión para ver tus pedidos.</p>
  }

  if (loading) {
    return <p className="orders-message">Cargando pedidos...</p>
  }

  if (error) {
    return <p className="orders-message error">{error}</p>
  }

  if (orders.length === 0) {
    return <p className="orders-message">No tienes pedidos aún.</p>
  }

  // Función para obtener índice del estado actual
  const getEstadoIndex = (estado) => {
    // Normalizamos estados para que coincidan con el array 'estados'
    switch (estado.toUpperCase()) {
      case 'NUEVO': return 0
      case 'EN_PROCESO': return 1
      case 'EN CAMINO':
      case 'EN_CAMINO': return 2
      case 'ENTREGADO': return 3
      case 'CANCELADO': return 4
      default: return 0
    }
  }

  return (
    <div className="orders-container">
      <h2>Mis Pedidos</h2>

      {lastUpdated && (
        <p className="last-updated">
          Actualizado: {lastUpdated.toLocaleTimeString('es-PE')}
        </p>
      )}

      {orders.map(order => {
        const currentStep = getEstadoIndex(order.estado)
        return (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span>Pedido #{order.id}</span>
              <span>
                {new Date(order.fecha).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className={`status ${order.estado.toLowerCase()}`}>
                {order.estado.replace('_', ' ')}
              </span>
            </div>

            {/* Barra de progreso */}
            <div className="progress-bar-container" aria-label="Progreso del pedido">
              {estados.slice(0, 4).map((estadoItem, i) => {
                const isActive = i <= currentStep
                return (
                  <div
                    key={estadoItem}
                    className={`progress-step ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <div className="step-number">{i + 1}</div>
                    <div className="step-label">{estadoItem.replace('_', ' ')}</div>
                    {i < 3 && <div className={`step-bar ${i < currentStep ? 'filled' : ''}`}></div>}
                  </div>
                )
              })}
            </div>

            <div className="order-items">
              {order.items && order.items.length > 0 ? (
                order.items.map((prod, i) => (
                  <div key={i} className="order-item">
                    <span>{prod.nombreProducto}</span>
                    <span>Cant: {prod.cantidad}</span>
                    <span>S/ {(prod.precioUnit * prod.cantidad).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="no-products">Este pedido no tiene productos listados.</p>
              )}
            </div>

            <div className="order-total">Total: S/ {order.total.toFixed(2)}</div>
          </div>
        )
      })}
    </div>
  )
}
