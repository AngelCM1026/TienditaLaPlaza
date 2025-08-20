// src/main/java/com/pedidos/feign/ProductoClient.java
package com.pedidos.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "mproducto")
public interface ProductoClient {
    @GetMapping("/api/productos/{id}")
    ProductoDTO getById(@PathVariable("id") Long id);

    record ProductoDTO(
        Long id,
        String codigo,
        String nombre,
        Double precio,
        Long proveedorId
    ) {}
}
