// src/main/java/com/productos/controller/ProductoController.java
package com.productos.controller;

import com.productos.model.Producto;
import com.productos.service.ProductoService;
import com.productos.service.ProductoService.ProductoProveedorDTO;
import com.productos.service.ProductoService.ProductoStockDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService){
        this.productoService = productoService;
    }

    @GetMapping
    public List<Producto> getAllProductos(){
        return productoService.getAllProductos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> getProductoById(@PathVariable Long id){
        return productoService.getProductoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Producto createProducto(@RequestBody Producto producto){
        Producto creado = productoService.saveProducto(producto);
        System.out.println("Producto creado y notificación enviada: " + creado.getNombre());
        return creado;
    }


    @PutMapping("/{id}")
    public ResponseEntity<Producto> updateProducto(@PathVariable Long id,
                                                   @RequestBody Producto productoDetails){
        return productoService.getProductoById(id)
                .map(p -> {
                    p.setCodigo(productoDetails.getCodigo());
                    p.setNombre(productoDetails.getNombre());
                    p.setCategoria(productoDetails.getCategoria());
                    p.setImagenUrl(productoDetails.getImagenUrl());
                    p.setPrecio(productoDetails.getPrecio());
                    p.setProveedorId(productoDetails.getProveedorId());
                    return ResponseEntity.ok(productoService.saveProducto(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteProducto(@PathVariable Long id){
        return productoService.getProductoById(id)
                .map(p -> {
                    productoService.deleteProducto(id);
                    return ResponseEntity.<Void>ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Detalle solo proveedor */
    @GetMapping("/{id}/detalle")
    public ResponseEntity<ProductoProveedorDTO> detalleProveedor(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productoService.getDetalleProveedor(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Detalle solo inventario */
    @GetMapping("/{id}/detallestock")
    public ResponseEntity<ProductoStockDTO> detalleStock(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productoService.getDetalleStock(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /** Filtrar productos por categoría */
    @GetMapping("/categoria/{categoria}")
    public List<Producto> getProductosByCategoria(@PathVariable String categoria) {
        return productoService.getProductosByCategoria(categoria);
    }
    
    @GetMapping("/categorias")
    public List<String> getCategorias() {
        return productoService.getAllCategorias();  // un DISTINCT desde el servicio/repositorio
    }
    
    @GetMapping("/proveedor/{proveedorId}")
    public List<Producto> obtenerPorProveedor(@PathVariable Long proveedorId) {
        return productoService.obtenerProductosPorProveedor(proveedorId);
    }
    
    @GetMapping("/nombre")
    public List<Producto> getAllProductos(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return productoService.buscarPorNombre(search);
        }
        return productoService.getAllProductos();
    }
    
    @GetMapping("/con-stock")
    public List<ProductoService.ProductoStockDTO> listarProductosConStock() {
        return productoService.getAllProductosConStock();
    }


}
