package com.productos.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "minventario")
public interface InventarioClient {

  @GetMapping("/api/inventario/{productoId}")
  InventarioDTO getByProductoId(@PathVariable("productoId") Long productoId);

  record InventarioDTO(
    Long productoId,
    Integer stockActual,
    Integer stockMinimo,
    Integer stockMaximo
  ) {}
}
