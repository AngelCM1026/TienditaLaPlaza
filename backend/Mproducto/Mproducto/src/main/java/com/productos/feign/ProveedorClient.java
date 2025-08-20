package com.productos.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "mproveedor")
public interface ProveedorClient {

    @GetMapping("/api/proveedores/{id}")
    ProveedorDTO obtenerPorId(@PathVariable("id") Long id);

    record ProveedorDTO(Long id, String nombre, String telefono) {}
}