// src/main/java/com/pedidos/feign/InventarioClient.java
package com.pedidos.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "minventario", path = "/api/inventario")
public interface InventarioClient {
    @PostMapping("/salida")
    InventarioDTO registrarSalida(@RequestBody MovimientoDTO movimiento);

    record MovimientoDTO(Long productoId, Integer cantidad, String referencia) {}
    record InventarioDTO(
        Long productoId,
        Integer stockActual,
        Integer stockMinimo,
        Integer stockMaximo
    ) {}
}
