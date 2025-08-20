// src/components/Checkout.jsx
import React, { useContext, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../services/api'
import {
  useJsApiLoader,
  Autocomplete,
  GoogleMap,
  Marker
} from '@react-google-maps/api'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './Checkout.css'


const mapContainerStyle = { width: '100%', height: '300px' }
const initialPosition = { lat: -12.0464, lng: -77.0428 } // Lima
const GOOGLE_LIBRARIES = ['places']

export default function Checkout() {
  const { clienteId, user } = useContext(AuthContext)
  const { cartItems, clearCart } = useCart()
  const [direccion, setDireccion] = useState('')
  const [referencia, setReferencia] = useState('')
  const [autocomplete, setAutocomplete] = useState(null)
  const [mapPosition, setMapPosition] = useState(initialPosition)
  const mapRef = useRef(null)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Tu API key aquí
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || 'AIzaSyD9IvSyOtr6kGXGkaWL-Q7aAiKbo55-nt8'

  // Hook para cargar script y controlar estado
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
    libraries: GOOGLE_LIBRARIES
  })

  const subtotal = cartItems.reduce(
    (sum, it) => sum + it.producto.precio * it.cantidad,
    0
  )

  const handleLoad = autoC => setAutocomplete(autoC)

  const handlePlaceChanged = () => {
    if (!autocomplete) return
    const place = autocomplete.getPlace()
    if (place.formatted_address) {
      setDireccion(place.formatted_address)
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        setMapPosition({ lat, lng })
        if (mapRef.current) mapRef.current.panTo({ lat, lng })
      }
    }
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización')
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const geocoder = new window.google.maps.Geocoder()
        const latlng = { lat: coords.latitude, lng: coords.longitude }
        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setDireccion(results[0].formatted_address)
            setMapPosition(latlng)
            if (mapRef.current) mapRef.current.panTo(latlng)
          } else {
            toast.error('No fue posible obtener tu ubicación')
          }
        })
      },
      () => toast.error('No fue posible obtener tu ubicación')
    )
  }

  const handleMapClick = event => {
    const lat = event.latLng.lat()
    const lng = event.latLng.lng()
    setMapPosition({ lat, lng })
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) setDireccion(results[0].formatted_address)
    })
  }

  const handleMarkerDragEnd = event => {
    handleMapClick(event)
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!clienteId || isNaN(clienteId)) {
      toast.error('Tu sesión no tiene un cliente asociado. Inicia sesión nuevamente.')
      return
    }

    if (cartItems.length === 0) {
      toast.error('El carrito está vacío.')
      return
    }

    if (!direccion) {
      toast.error('Por favor ingresa una dirección de entrega válida.')
      return
    }

    setLoading(true)

    const fechaActual = new Date().toISOString()
    const total = subtotal
    const estado = 'NUEVO'

    const itemsDto = cartItems.map(i => ({
      productoId: i.producto.id,
      cantidad: i.cantidad,
      precioUnit: i.producto.precio,
      subtotal: i.producto.precio * i.cantidad
    }))

    try {
  // Crear pedido
  await api.post('/api/pedidos', {
    clienteId: Number(clienteId),
    fecha: fechaActual,
    direccion,
    referencia,
    total,
    estado,
    items: itemsDto
  })

  // Crear notificación para el usuario logueado
  if (clienteId) {
    await api.post('/api/notificaciones', {
      titulo: 'Pedido creado',
      mensaje: `Se creó un nuevo pedido con total S/ ${total.toFixed(2)}.`,
      destinatario: user, // <-- user proviene del AuthContext
      leida: false,
      fechaCreacion: new Date().toISOString()
    })
  }

  // Limpiar carrito y mostrar confirmación
  clearCart()
  toast.success('✅ Pedido creado con éxito')
  navigate('/orders')
} catch (err) {
  console.error(err)
  toast.error('❌ Error al crear el pedido')
} finally {
  setLoading(false)
}
  }

  if (loadError) return <div>Error cargando Google Maps</div>
  if (!isLoaded) return <div>Cargando mapa...</div>

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <h2>Checkout</h2>
      </header>

      <div className="checkout-content">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="form-group location-group">
            <label>Dirección de entrega</label>
            <Autocomplete onLoad={handleLoad} onPlaceChanged={handlePlaceChanged}>
              <div
                className="autocomplete-wrapper"
                style={{ position: 'relative', display: 'flex' }}
              >
                <input
                  type="text"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  placeholder="Ingresa tu dirección"
                  required
                  style={{ flexGrow: 1, paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className="locate-btn"
                  onClick={handleLocateMe}
                  title="Usar mi ubicación actual"
                  style={{
                    position: 'absolute',
                    right: 4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: '#bf9000'
                  }}
                >
                  <FaMapMarkerAlt />
                </button>
              </div>
            </Autocomplete>

            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapPosition}
              zoom={15}
              onClick={handleMapClick}
              onLoad={map => (mapRef.current = map)}
            >
              <Marker
                position={mapPosition}
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
              />
            </GoogleMap>
          </div>

          <div className="form-group">
            <label>Referencia</label>
            <input
              type="text"
              value={referencia}
              onChange={e => setReferencia(e.target.value)}
              placeholder="Piso, depto., indicaciones..."
            />
          </div>

          <button type="submit" className="confirm-btn" disabled={loading}>
            {loading ? 'Procesando...' : 'Confirmar pedido'}
          </button>
        </form>

        <aside className="order-summary">
          <h3>Resumen del pedido</h3>
          {cartItems.length === 0 ? (
            <p className="empty-cart">No hay productos en el carrito</p>
          ) : (
            <>
              <ul className="summary-list">
                {cartItems.map(item => (
                  <li key={item.producto.id} className="summary-item">
                    <img
                      src={
                        item.producto.imagenUrl.startsWith('/')
                          ? item.producto.imagenUrl
                          : `/img/${item.producto.imagenUrl}`
                      }
                      alt={item.producto.nombre}
                      className="summary-img"
                      loading="lazy"
                    />
                    <div className="summary-info">
                      <span className="summary-name">{item.producto.nombre}</span>
                      <span className="summary-qty">x{item.cantidad}</span>
                      <span className="summary-price">
                        S/ {(item.producto.precio * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="summary-footer">
                <div className="summary-subtotal">
                  Sub‑Total: <strong>S/ {subtotal.toFixed(2)}</strong>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  )
}
