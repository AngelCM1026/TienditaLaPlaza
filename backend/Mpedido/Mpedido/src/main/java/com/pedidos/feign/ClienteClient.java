package com.pedidos.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Cliente Feign para comunicarse con el microservicio de Clientes
 */
@FeignClient(name = "mcliente")
public interface ClienteClient {

  @GetMapping("/api/clientes/{id}")
  ClienteDTO obtenerPorId(@PathVariable("id") Long id);

  record ClienteDTO(
    Long id,
    Long usuarioId,
    String nombre,
    String telefono,
    String email,
    String direccion,
    String referencia
  ) {}
}
