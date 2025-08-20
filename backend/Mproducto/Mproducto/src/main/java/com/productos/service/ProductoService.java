package com.productos.service;

import com.productos.dto.NotificacionRequest;
import com.productos.feign.InventarioClient;
import com.productos.feign.NotificacionClient;
import com.productos.feign.ProveedorClient;
import com.productos.model.Producto;
import com.productos.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProveedorClient proveedorClient;
    private final InventarioClient inventarioClient;
    private final NotificacionClient notificacionClient;

    public ProductoService(ProductoRepository productoRepository,
                           ProveedorClient proveedorClient,
                           InventarioClient inventarioClient,
                           NotificacionClient notificacionClient) {
        this.productoRepository = productoRepository;
        this.proveedorClient = proveedorClient;
        this.inventarioClient = inventarioClient;
        this.notificacionClient = notificacionClient;
    }

    /* ————— CRUD existente ————— */
    public List<Producto> getAllProductos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> getProductoById(Long id) {
        return productoRepository.findById(id);
    }

    public Producto saveProducto(Producto producto) {
        boolean esNuevo = (producto.getId() == null);
        Producto guardado = productoRepository.save(producto);

        // Si es nuevo, enviamos notificación
        if (esNuevo) {
            try {
                NotificacionRequest notif = new NotificacionRequest(
                        "Nuevo producto agregado",
                        "Se ha agregado el producto: " + guardado.getNombre(),
                        "ADMIN" // destinatario (puede ser email o rol)
                );
                notificacionClient.enviarNotificacion(notif);
            } catch (Exception e) {
                System.err.println("Error al enviar notificación de nuevo producto: " + e.getMessage());
            }
        }

        return guardado;
    }

    public void deleteProducto(Long id) {
        productoRepository.deleteById(id);
    }

    /* ————— Detalle con Proveedor ————— */
    public ProductoProveedorDTO getDetalleProveedor(Long id) {
        Producto p = getProductoById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        var prov = proveedorClient.obtenerPorId(p.getProveedorId());
        return new ProductoProveedorDTO(
                p.getId(),
                p.getCodigo(),
                p.getNombre(),
                p.getCategoria(),
                p.getPrecio(),
                prov.id(),
                prov.nombre(),
                prov.telefono()
        );
    }

    public record ProductoProveedorDTO(
            Long id,
            String codigo,
            String nombre,
            String categoria,
            Double precio,
            Long proveedorId,
            String proveedorNombre,
            String proveedorTelefono
    ) {}

    /* ————— Detalle con Inventario ————— */
    public ProductoStockDTO getDetalleStock(Long id) {
        Producto p = getProductoById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        var inv = inventarioClient.getByProductoId(id);
        return new ProductoStockDTO(
                p.getId(),
                p.getCodigo(),
                p.getNombre(),
                p.getCategoria(),
                p.getPrecio(),
                inv.stockActual(),
                inv.stockMinimo(),
                inv.stockMaximo()
        );
    }

    public record ProductoStockDTO(
            Long id,
            String codigo,
            String nombre,
            String categoria,
            Double precio,
            Integer stockActual,
            Integer stockMinimo,
            Integer stockMaximo
    ) {}

    public List<Producto> getProductosByCategoria(String categoria) {
        return productoRepository.findByCategoria(categoria);
    }

    public List<String> getAllCategorias() {
        return productoRepository.findDistinctCategorias();
    }

    public List<Producto> obtenerProductosPorProveedor(Long proveedorId) {
        return productoRepository.findByProveedorId(proveedorId);
    }

    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }
    public List<ProductoStockDTO> getAllProductosConStock() {
        List<Producto> productos = productoRepository.findAll();
        return productos.stream().map(p -> {
            var invOpt = inventarioClient.getByProductoId(p.getId());
            return new ProductoStockDTO(
                    p.getId(),
                    p.getCodigo(),
                    p.getNombre(),
                    p.getCategoria(),
                    p.getPrecio(),
                    invOpt != null ? invOpt.stockActual() : 0,
                    invOpt != null ? invOpt.stockMinimo() : 0,
                    invOpt != null ? invOpt.stockMaximo() : 0
            );
        }).toList();
    }

}
