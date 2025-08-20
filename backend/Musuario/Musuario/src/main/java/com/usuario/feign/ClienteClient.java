package com.usuario.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "mcliente")
public interface ClienteClient {

  @PostMapping("/api/clientes")
  ClienteDTO crearCliente(@RequestBody ClienteDTO dto);
  
  @GetMapping("/api/clientes/usuario/{usuarioId}")
  ClienteDTO obtenerClientePorUsuarioId(@PathVariable("usuarioId") Long usuarioId);

  record ClienteDTO(
    Long id,
    Long usuarioId,
    String nombre,
    String telefono,
    String email
  ) {}
}
