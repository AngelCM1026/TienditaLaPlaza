import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import Producto from './Producto'
import { useCart } from '../context/CartContext'
import ProductDetailsModal from './DetallesProducto'
import './Categoria.css'

const categoryImages = {
  Ninguno: '/img/ningunologo.jpg',
  Fideos: '/img/fi.jpg',
  Atun: '/img/logoatun.jpg',
  Leche: '/img/lechelogo.jpg',
  azúcar: '/img/azucarlogo.jpg',
  arroz: '/img/arrozlogo.jpg',
  Limpieza: '/img/limpiezalogo.jpg',
  Bebida: '/img/bebi.webp',
  Cerveza: '/img/cervezalogo.jpeg',
  // añade más categorías e imágenes según necesites
}

export default function CategoryGrid() {
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState('Ninguno')
  const [filteredProducts, setFilteredProducts] = useState([])

  const { addItem } = useCart()

  const [modalOpen, setModalOpen] = useState(false)
  const [detalleProducto, setDetalleProducto] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const resp = await api.get('/api/productos/categorias')
        setCategories(['Ninguno', ...resp.data])
      } catch (e) {
        console.error('Error cargando categorías', e)
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      try {
        const resp = await api.get('/api/productos')
        setProducts(resp.data)
      } catch (e) {
        console.error('Error cargando productos', e)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    if (selectedCategory === 'Ninguno') {
      setFilteredProducts([])
    } else {
      setFilteredProducts(products.filter(p => p.categoria === selectedCategory))
    }
  }, [selectedCategory, products])

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

  function handleAddToCart(producto, cantidad) {
    addItem(producto, cantidad)
    console.log('Producto agregado:', producto.nombre, 'Cantidad:', cantidad)
  }

  function handleCloseModal() {
    setModalOpen(false)
    setDetalleProducto(null)
  }

  if (loadingCategories || loadingProducts) return <p>Cargando...</p>
  if (!categories.length) return <p>No hay categorías disponibles</p>

  return (
    <>
      <section className="category-grid-no-card">
        {categories.map(cat => (
          <div
            key={cat}
            className={`category-item ${cat === selectedCategory ? 'selected' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            <div className="category-image-wrapper">
              <img
                src={categoryImages[cat] || categoryImages['Ninguno']}
                alt={cat}
                className="category-image"
              />
            </div>
            <h3>{cat}</h3>
          </div>
        ))}
      </section>

      <section className="product-grid">
        {filteredProducts.length === 0 ? (
          <p></p>
        ) : (
          filteredProducts.map(producto => (
            <Producto
              key={producto.id}
              producto={producto}
              mostrarControles={true}
              onAddToCart={handleAddToCart}
              onQuickView={handleQuickView}
            />
          ))
        )}
      </section>

      <ProductDetailsModal
        producto={detalleProducto}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        loading={loadingDetalle}
      />
    </>
  )
}
