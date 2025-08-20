import React, { useEffect, useState, useContext } from "react";
import "./CrearProducto.css";
import { FaBarcode, FaTag, FaDollarSign, FaUserAlt, FaImage, FaPlus } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext"; // Importamos el context

const CrearProducto = () => {
  const { user } = useContext(AuthContext); // <-- usuario logueado
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  const [formulario, setFormulario] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    precio: "",
    proveedorId: "",
    imagenUrl: "",
  });

  useEffect(() => {
    fetch("http://localhost:8888/api/productos").then(res => res.json()).then(setProductos);
    fetch("http://localhost:8888/api/proveedores").then(res => res.json()).then(setProveedores);
    fetch("http://localhost:8888/api/productos/categorias").then(res => res.json()).then(setCategorias);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const categoriaFinal =
      formulario.categoria === "OTRA" && nuevaCategoria.trim() !== ""
        ? nuevaCategoria.trim()
        : formulario.categoria;

    const datosAEnviar = { ...formulario, categoria: categoriaFinal };

    try {
      // Crear producto
      const res = await fetch("http://localhost:8888/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosAEnviar),
      });
      const nuevoProducto = await res.json();
      setProductos([...productos, nuevoProducto]);

      // Limpiar formulario
      setFormulario({
        codigo: "",
        nombre: "",
        categoria: "",
        precio: "",
        proveedorId: "",
        imagenUrl: "",
      });
      setNuevaCategoria("");

      // Enviar notificación al usuario logueado
      await fetch("http://localhost:8888/api/notificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: "Producto creado",
          mensaje: `Se creó el producto '${nuevoProducto.nombre}'.`,
          destinatario: user, // <-- usuario logueado
        }),
      });

      alert("Producto creado y notificación enviada ✅");

    } catch (error) {
      console.error(error);
      alert("Hubo un error al crear el producto o enviar la notificación ❌");
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="crear-producto-container">
      <h2><FaPlus /> Crear Nuevo Producto</h2>

      <form onSubmit={handleSubmit} className="formulario-producto">

        <div className="input-group">
          <FaBarcode className="icono" />
          <input
            type="text"
            name="codigo"
            placeholder="Código"
            value={formulario.codigo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <FaTag className="icono" />
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formulario.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <FaTag className="icono" />
          <select
            name="categoria"
            value={formulario.categoria}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione categoría</option>
            {categorias.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
            <option value="OTRA">Otra...</option>
          </select>
        </div>

        {formulario.categoria === "OTRA" && (
          <div className="input-group">
            <FaTag className="icono" />
            <input
              type="text"
              placeholder="Ingrese nueva categoría"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              required
            />
          </div>
        )}

        <div className="input-group">
          <FaDollarSign className="icono" />
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={formulario.precio}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <FaUserAlt className="icono" />
          <select
            name="proveedorId"
            value={formulario.proveedorId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione proveedor</option>
            {proveedores.map((prov) => (
              <option key={prov.id} value={prov.id}>{prov.nombre}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <FaImage className="icono" />
          <input
            type="text"
            name="imagenUrl"
            placeholder="Nombre de imagen (ej. atun.png)"
            value={formulario.imagenUrl}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit"><FaPlus /> Guardar Producto</button>
      </form>

      <div className="filtro-busqueda">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <table className="tabla-productos">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Proveedor</th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map((prod) => (
            <tr key={prod.id}>
              <td>
                <img
                  src={`/img/${prod.imagenUrl}`} // Apunta a public/img
                  alt={prod.nombre}
                  className="imagen-tabla"
                />
              </td>
              <td>{prod.codigo}</td>
              <td>{prod.nombre}</td>
              <td>{prod.categoria}</td>
              <td>S/. {prod.precio.toFixed(2)}</td>
              <td>{prod.proveedorId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CrearProducto;
