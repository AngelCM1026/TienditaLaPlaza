// src/main/java/com/productos/dto/ProductoConStockDTO.java
package com.productos.dto;

import com.productos.feign.InventarioClient.InventarioDTO;
import com.productos.model.Producto;

public record ProductoConStockDTO(
    Long id,
    String codigo,
    String nombre,
    String categoria,
    Double precio,
    Long proveedorId,
    Integer stockActual,
    Integer stockMinimo,
    Integer stockMaximo
) {
    public static ProductoConStockDTO from(Producto p, InventarioDTO i) {
        return new ProductoConStockDTO(
            p.getId(),
            p.getCodigo(),
            p.getNombre(),
            p.getCategoria(),
            p.getPrecio(),
            p.getProveedorId(),
            i.stockActual(),
            i.stockMinimo(),
            i.stockMaximo()
        );
    }
}
