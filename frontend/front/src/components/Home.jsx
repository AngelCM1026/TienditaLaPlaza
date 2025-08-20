import React, { useEffect, useState } from 'react'
import Header from './Header'
import SearchBar from './SearchBar'
import CategoryGrid from './Categoria'
import ProductCard from './Producto'
import ProductDetailsModal from './DetallesProducto'  // Importa el modal
import { api } from '../services/api'
import { useCart } from '../context/CartContext'
import './Home.css'

export default function Home() {
  const [productos, setProductos] = useState([])
  const [filtro, setFiltro] = useState(null)      // categoría
  const [busqueda, setBusqueda] = useState('')   // nombre
  const { addItem } = useCart()

  // Estados para modal vista rápida
  const [modalOpen, setModalOpen] = useState(false)
  const [detalleProducto, setDetalleProducto] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  useEffect(() => {
    let url
    if (busqueda && busqueda.trim() !== '') {
      // Prioridad: búsqueda por nombre
      url = `/api/productos/nombre?search=${encodeURIComponent(busqueda)}`
    } else if (filtro) {
      // Filtrar por categoría
      url = `/api/productos/categoria/${encodeURIComponent(filtro)}`
    } else {
      // Todos los productos
      url = '/api/productos'
    }

    api.get(url)
      .then(res => setProductos(res.data))
      .catch(console.error)
  }, [filtro, busqueda])

  // Función para abrir modal y cargar detalle del producto
  async function handleQuickView(productId) {
    setLoadingDetalle(true)
    setModalOpen(true)
    try {
      const resp = await api.get(`/api/productos/${productId}/detallestock`)
      setDetalleProducto(resp.data)
    } catch (e) {
      console.error('Error cargando detalles del producto', e)
      setDetalleProducto(null)
    } finally {
      setLoadingDetalle(false)
    }
  }

  // Cierra modal y limpia detalle
  function handleCloseModal() {
    setModalOpen(false)
    setDetalleProducto(null)
  }

  return (
    <>
      <Header />
      <SearchBar onSearch={setBusqueda} />

      <main style={{ padding: '1rem', minHeight: '80vh' }}>
        <h2>Categorías</h2>
        <CategoryGrid onSelectCategory={setFiltro} />

        <h2 style={{ marginTop: '2rem' }}>
          {busqueda
            ? `Resultados para "${busqueda}"`
            : filtro
              ? `Productos en "${filtro}"`
              : 'Catálogo de productos'}
        </h2>
        <section className="product-grid">
          {productos.map(p => (
            <ProductCard
              key={p.id}
              producto={p}
              onAddToCart={addItem}
              onQuickView={handleQuickView}  
            />
          ))}
        </section>
      </main>

      {/* Modal detalles */}
      <ProductDetailsModal
        producto={detalleProducto}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        loading={loadingDetalle}
      />
    </>
  )
}
