// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { AuthContext } from './AuthContext' // para detectar login/logout

export const CartContext = createContext()

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext)
  const [cartItems, setCartItems] = useState([]) // siempre empieza vacío

  // Cada vez que el usuario cambie (login/logout), limpiar carrito
  useEffect(() => {
    setCartItems([])
    localStorage.removeItem('cart')
  }, [user])

  // Agregar un ítem al carrito (o incrementar cantidad si ya existe)
  const addItem = (producto, cantidad) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.producto.id === producto.id)
      if (exists) {
        return prev.map(i =>
          i.producto.id === producto.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        )
      }
      return [...prev, { producto, cantidad }]
    })
  }

  // Actualizar cantidad de un ítem
  const updateItem = (productoId, cantidad) => {
    setCartItems(prev =>
      prev.map(i =>
        i.producto.id === productoId
          ? { ...i, cantidad }
          : i
      )
    )
  }

  // Quitar un ítem del carrito
  const removeItem = productoId => {
    setCartItems(prev =>
      prev.filter(i => i.producto.id !== productoId)
    )
  }

  // Vaciar todo el carrito
  const clearCart = () => setCartItems([])

  return (
    <CartContext.Provider
      value={{ cartItems, addItem, updateItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

export default CartContext
