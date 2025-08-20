import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const [periodo, setPeriodo] = useState("semanal"); // 'semanal' o 'mensual'
  const [estadisticas, setEstadisticas] = useState([]);
  const [crecimiento, setCrecimiento] = useState(0);

  const [inventario, setInventario] = useState([]);
  const [inventarioBase, setInventarioBase] = useState([]);
  const [orden, setOrden] = useState("mayorVenta");

  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");

  const [offsetPeriodo, setOffsetPeriodo] = useState(0);

  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];

  const formatDate = (fechaISO) => {
    const d = new Date(fechaISO);
    if (isNaN(d)) return "";
    return d.toLocaleDateString();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      let fechaMostrar = "";

      if (periodo === "semanal") {
        const item = estadisticas.find((e) => e.fecha === label);
        if (item && item.fechaISO) fechaMostrar = formatDate(item.fechaISO);
      } else {
        fechaMostrar = `${label} ${new Date().getFullYear()}`;
      }

      return (
        <div className="custom-tooltip">
          <p>
            <strong>{label}</strong> {fechaMostrar && <> - {fechaMostrar}</>}
          </p>
          <p>Pedidos: {payload[0].value}</p>
          <p>Ventas: S/ {payload[1].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  const fetchEstadisticas = () => {
    const url =
      periodo === "semanal" || periodo === "mensual"
        ? `http://localhost:8888/api/pedidos/estadisticas/${periodo}?offset=${offsetPeriodo}`
        : `http://localhost:8888/pedidos/estadisticas/${periodo}`;

    axios
      .get(url)
      .then((res) => {
        let datos = res.data;

        if (periodo === "semanal") {
          const datosPorFecha = {};
          datos.forEach((d) => {
            datosPorFecha[d.fecha] = d;
          });

          const hoy = new Date();
          const diaSemana = hoy.getDay();
          const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
          const lunesActual = new Date(
            hoy.getFullYear(),
            hoy.getMonth(),
            hoy.getDate() - diasDesdeLunes
          );
          const lunesOffset = new Date(lunesActual);
          lunesOffset.setDate(lunesActual.getDate() + offsetPeriodo * 7);

          const semanaCompleta = diasSemana.map((dia, index) => {
            const fechaDia = new Date(lunesOffset);
            fechaDia.setDate(lunesOffset.getDate() + index);
            const fechaISO = fechaDia.toISOString().slice(0, 10);
            const datoDelDia = datosPorFecha[fechaISO] || {
              cantidadPedidos: 0,
              totalVendido: 0,
            };
            return {
              fecha: dia,
              cantidadPedidos: datoDelDia.cantidadPedidos,
              totalVendido: datoDelDia.totalVendido,
              fechaISO,
            };
          });

          datos = semanaCompleta;

        } else if (periodo === "mensual") {
          const datosPorMes = {};
          datos.forEach((d) => {
            const fechaMes = new Date(d.mes);
            if (!isNaN(fechaMes)) {
              const mesNum = fechaMes.getMonth() + 1;
              datosPorMes[mesNum] = d;
            }
          });

          const hoy = new Date();
          const mesActualNum = hoy.getMonth() + 1;
          let mesBaseNum = mesActualNum + offsetPeriodo;
          if (mesBaseNum < 1) mesBaseNum = 1;
          if (mesBaseNum > 12) mesBaseNum = 12;

          datos = meses.map((nombreMes, i) => {
            let mesNum = mesBaseNum - (11 - i);
            if (mesNum < 1) mesNum = 1;

            const datoMes = datosPorMes[mesNum] || {
              cantidadPedidos: 0,
              totalVendido: 0,
            };

            return {
              mes: nombreMes,
              cantidadPedidos: datoMes.cantidadPedidos,
              totalVendido: datoMes.totalVendido,
            };
          });
        }

        setEstadisticas(datos);
      })
      .catch((err) => {
        console.error("Error al cargar estadísticas:", err);
        setEstadisticas([]);
      });
  };

  useEffect(() => {
    fetchEstadisticas();
  }, [periodo, offsetPeriodo]);

  useEffect(() => {
    axios
      .get("http://localhost:8888/api/productos/categorias")
      .then((res) => setCategorias(["Todos", ...res.data]))
      .catch((err) => console.error("Error cargando categorías", err));
  }, []);

  useEffect(() => {
    const fetchInventarioConNombres = async () => {
      try {
        const invRes = await axios.get(
          "http://localhost:8888/api/inventario/dashboard"
        );
        const inventarioData = invRes.data;

        const prodRes = await axios.get("http://localhost:8888/api/productos");
        const productos = prodRes.data;

        const inventarioConNombres = inventarioData.map((item) => {
          const prod = productos.find((p) => p.id === item.productoId);
          return {
            ...item,
            nombreProducto: prod ? prod.nombre : `Producto ${item.productoId}`,
            categoria: prod ? prod.categoria : "Sin categoría",
          };
        });

        setInventario(inventarioConNombres);
        setInventarioBase(inventarioConNombres);
      } catch (err) {
        console.error("Error cargando inventario con nombres", err);
      }
    };

    fetchInventarioConNombres();
  }, []);

  useEffect(() => {
    if (categoriaSeleccionada === "" || categoriaSeleccionada === "Todos") {
      setInventario(inventarioBase);
    } else {
      setInventario(
        inventarioBase.filter((item) => item.categoria === categoriaSeleccionada)
      );
    }
  }, [categoriaSeleccionada, inventarioBase]);

  const totalPedidos = estadisticas.reduce(
    (acc, cur) => acc + (cur.cantidadPedidos ?? 0),
    0
  );
  const totalVentas = estadisticas.reduce(
    (acc, cur) => acc + (cur.totalVendido ?? 0),
    0
  );

  useEffect(() => {
    if (estadisticas.length < 2) {
      setCrecimiento(0);
      return;
    }

    let ultimo = 0;
    let anterior = 0;
    for (let i = estadisticas.length - 1; i >= 0; i--) {
      if (estadisticas[i].totalVendido > 0) {
        if (ultimo === 0) {
          ultimo = estadisticas[i].totalVendido;
        } else if (anterior === 0) {
          anterior = estadisticas[i].totalVendido;
          break;
        }
      }
    }

    if (ultimo > 0 && anterior > 0) {
      setCrecimiento(((ultimo - anterior) / anterior) * 100);
    } else {
      setCrecimiento(0);
    }
  }, [estadisticas]);

  const inventarioOrdenado = [...inventario].sort((a, b) => {
    switch (orden) {
      case "mayorVenta":
        return b.cantidadVendida - a.cantidadVendida;
      case "menorVenta":
        return a.cantidadVendida - b.cantidadVendida;
      case "mayorStock":
        return b.stockActual - a.stockActual;
      case "menorStock":
        return a.stockActual - b.stockActual;
      default:
        return 0;
    }
  });

  const handleAnterior = () => {
    setOffsetPeriodo((prev) => prev - 1);
  };
  const handleSiguiente = () => {
    if (offsetPeriodo < 0) {
      setOffsetPeriodo((prev) => prev + 1);
    }
  };

  const handleCambioPeriodo = (e) => {
    setPeriodo(e.target.value);
    setOffsetPeriodo(0);
  };

  return (
    <div className="dashboard-container">
      <main className="main-content">
        {/* Dashboard Ventas */}
        <section className="section ventas-section">
          <div className="section-header">
            <h1>Dashboard de Ventas</h1>
            <div className="periodo-controls">
              {(periodo === "semanal" || periodo === "mensual") && (
                <>
                  <button
                    className="nav-btn"
                    onClick={handleAnterior}
                    aria-label="Periodo anterior"
                    title="Periodo anterior"
                  >
                    <i className="fa fa-chevron-left"></i> Anterior
                  </button>
                  <button
                    className="nav-btn"
                    onClick={handleSiguiente}
                    aria-label="Próximo periodo"
                    title="Próximo periodo"
                    disabled={offsetPeriodo === 0}
                  >
                    Siguiente <i className="fa fa-chevron-right"></i>
                  </button>
                </>
              )}
              <select
                value={periodo}
                onChange={handleCambioPeriodo}
                className="periodo-select"
                aria-label="Seleccionar periodo"
              >
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>
          </div>

          <div className="cards-grid kpis-grid">
            <div className="card kpi-card total-pedidos">
              <h3><i className="fa fa-shopping-cart"></i> Total Pedidos</h3>
              <p>{totalPedidos}</p>
            </div>
            <div className="card kpi-card total-ventas">
              <h3><i className="fa fa-money"></i> Total Ventas</h3>
              <p>S/ {totalVentas.toFixed(2)}</p>
            </div>
            <div className="card kpi-card crecimiento">
              <h3>
                <i className={`fa ${crecimiento >= 0 ? "fa-arrow-up" : "fa-arrow-down"}`}></i> Crecimiento
              </h3>
              <p className={crecimiento >= 0 ? "positivo" : "negativo"}>
                {crecimiento >= 0 ? "+" : ""}
                {crecimiento.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">
              {periodo === "semanal"
                ? "Pedidos y Ventas por Día (Lun-Dom)"
                : "Pedidos y Ventas por Mes"}
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={estadisticas} margin={{ top: 30, right: 40, left: 30, bottom: 50 }}>
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis
                  dataKey={periodo === "semanal" ? "fecha" : "mes"}
                  tick={{ fontSize: 13, fill: "#555" }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 13, fill: "#555" }}
                  width={60}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "14px", fontWeight: "600" }}
                />
                <Bar
                  dataKey="cantidadPedidos"
                  name="Pedidos"
                  fill="#6c5ce7"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
                <Bar
                  dataKey="totalVendido"
                  name="Ventas"
                  fill="#00b894"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Dashboard Inventario */}
        <section className="section inventario-section">
          <div className="section-header">
            <h1>Dashboard de Inventario</h1>
            <div className="filtros-inventario">
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                className="periodo-select"
                aria-label="Ordenar inventario"
              >
                <option value="mayorVenta">Mayor venta primero</option>
                <option value="menorVenta">Menor venta primero</option>
                <option value="mayorStock">Mayor stock primero</option>
                <option value="menorStock">Menor stock primero</option>
              </select>
              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                className="periodo-select"
                aria-label="Filtrar por categoría"
              >
                {categorias.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="chart-card inventario-chart-card">
            <ResponsiveContainer width="100%" height={520}>
              <BarChart
                layout="horizontal"
                data={inventarioOrdenado}
                margin={{ top: 30, right: 30, left: 70, bottom: 100 }}
                barGap={12}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="category"
                  dataKey="nombreProducto"
                  interval={0}
                  angle={-55}
                  textAnchor="end"
                  height={120}
                  tick={{ fontSize: 13, fill: "#555" }}
                />
                <YAxis
                  type="number"
                  width={65}
                  tick={{ fontSize: 13, fill: "#555" }}
                />
                <Tooltip
                  contentStyle={{ fontSize: "14px", borderRadius: "10px" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "15px", fontWeight: "600" }}
                  verticalAlign="top"
                  height={40}
                />
                <Bar
                  dataKey="stockActual"
                  fill="#00b894"
                  name="Stock Actual"
                  radius={[6, 6, 0, 0]}
                  barSize={45}
                />
                <Bar
                  dataKey="cantidadVendida"
                  fill="#0984e3"
                  name="Cantidad Vendida"
                  radius={[6, 6, 0, 0]}
                  barSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
