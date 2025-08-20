import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBoxOpen } from "react-icons/fa";
import "./Inventario.css";

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaInventario, setBusquedaInventario] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [stock, setStock] = useState("");
  const [detalleProducto, setDetalleProducto] = useState(null);
  const [mensajeStock, setMensajeStock] = useState("");

  const { user, role } = useContext(AuthContext);

  useEffect(() => {
    if (user && role === "ADMIN") {
      cargarProductosConStock();
    }
  }, [user, role]);

  const cargarProductosConStock = async () => {
    try {
      const response = await axios.get("http://localhost:8888/api/productos/con-stock");
      const productosData = response.data;

      productosData.forEach((p) => {
        if (p.stockActual < p.stockMinimo) {
          toast.warn(`⚠️ El producto "${p.nombre}" tiene stock bajo (${p.stockActual}/${p.stockMinimo})`);
          axios.post("http://localhost:8888/api/notificaciones", {
            titulo: "Stock bajo",
            mensaje: `El producto "${p.nombre}" tiene stock bajo (${p.stockActual}/${p.stockMinimo})`,
            destinatario: user,
            leida: false,
            fechaCreacion: new Date().toISOString()
          }).catch(err => console.error("Error al crear notificación:", err));
        }
      });

      setProductos(productosData);
    } catch (error) {
      console.error("Error al obtener productos con stock:", error);
    }
  };

  const handleSeleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setStock("");
  };

  const handleGuardarStock = async () => {
    if (!stock || isNaN(stock)) return;
    try {
      const nuevoStock = Number(productoSeleccionado.stockActual) + Number(stock);

      const payload = {
        productoId: productoSeleccionado.id,
        stockActual: nuevoStock,
        stockMinimo: 5,
        stockMaximo: 100,
      };

      await axios.post("http://localhost:8888/api/inventario", payload);
      await cargarProductosConStock();
      setProductoSeleccionado(null);
      setStock("");
    } catch (error) {
      console.error("Error al guardar stock:", error);
    }
  };

  const handleVerDetalle = async (producto) => {
    try {
      const response = await axios.get(`http://localhost:8888/api/productos/${producto.id}/detallestock`);
      setDetalleProducto(response.data);
      setMensajeStock("");
    } catch (error) {
      setDetalleProducto(null);
      setMensajeStock("No se pudo obtener detalle del producto.");
      console.error(error);
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const productosConStock = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busquedaInventario.toLowerCase())
  );

  const getColorStock = (producto) => {
    const ratio = producto.stockActual / producto.stockMaximo;
    if (ratio < 0.3) return "#dc3545"; // rojo
    if (ratio < 0.7) return "#ffc107"; // amarillo
    return "#28a745"; // verde
  };

  return (
    <div className="inventario-contenedor">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Buscador de productos */}
      <div className="busqueda">
        <h2>Buscar producto</h2>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar producto..."
        />
        <div className="lista-busqueda">
          {productosFiltrados.map((p) => (
            <div key={p.id} className="item-busqueda" onClick={() => handleSeleccionarProducto(p)}>
              <FaBoxOpen className="icono-producto"/>
              <span>{p.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Inventario */}
      <div className="busqueda">
        <h2>Inventario</h2>
        <input
          type="text"
          value={busquedaInventario}
          onChange={(e) => setBusquedaInventario(e.target.value)}
          placeholder="Buscar en inventario..."
        />
        <div className="tarjetas-inventario">
          {productosConStock.map((producto) => (
            <div key={producto.id} className="tarjeta-modern" onClick={() => handleVerDetalle(producto)}>
              <div className="icono-producto"><FaBoxOpen size={40} /></div>
              <h4>{producto.nombre}</h4>
              <span className="categoria">{producto.categoria}</span>
              <div className="barra-stock">
                <div
                  className="barra-llenada"
                  style={{
                    width: `${(producto.stockActual / producto.stockMaximo) * 100}%`,
                    backgroundColor: getColorStock(producto)
                  }}
                ></div>
              </div>
              <span className="stock-texto">{producto.stockActual}/{producto.stockMaximo}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para agregar stock */}
      {productoSeleccionado && (
        <div className="modal">
          <div className="modal-contenido modal-agregar-stock">
            <h3>Agregar stock</h3>
            <p className="nombre-producto">{productoSeleccionado.nombre}</p>
            <input
              type="number"
              placeholder="Cantidad a agregar"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
            <div className="modal-botones">
              <button onClick={handleGuardarStock}>Guardar</button>
              <button className="cancelar" onClick={() => { setProductoSeleccionado(null); setStock(""); }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalle de producto */}
      {(detalleProducto || mensajeStock) && (
        <div className="modal">
          <div className="modal-contenido modal-detalle-producto">
            {detalleProducto ? (
              <div className="detalle-grid">
                <div className="detalle-izquierda">
                  <FaBoxOpen size={120} color="#007bff" />
                </div>
                <div className="detalle-derecha">
                  <h2 className="nombre-detalle">{detalleProducto.nombre}</h2>
                  <div className="detalle-info">
                    <p><span>Categoría:</span> {detalleProducto.categoria}</p>
                    <p><span>Precio:</span> ${detalleProducto.precio}</p>
                    <p><span>Stock actual:</span> <strong>{detalleProducto.stockActual}</strong></p>
                    <p><span>Stock mínimo:</span> {detalleProducto.stockMinimo}</p>
                    <p><span>Stock máximo:</span> {detalleProducto.stockMaximo}</p>
                  </div>
                  <div className="barra-stock-detalle">
                    <div
                      className="barra-llenada-detalle"
                      style={{
                        width: `${(detalleProducto.stockActual / detalleProducto.stockMaximo) * 100}%`,
                        backgroundColor: getColorStock(detalleProducto)
                      }}
                    ></div>
                  </div>
                  <div className="stock-texto-detalle">
                    {detalleProducto.stockActual}/{detalleProducto.stockMaximo}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mensaje-stock">{mensajeStock}</p>
            )}
            <div className="modal-botones">
              <button onClick={() => { setDetalleProducto(null); setMensajeStock(""); }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Inventario;
