package com.proveedores.controller;

import com.proveedores.model.Proveedor;
import com.proveedores.service.ProveedorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    private final ProveedorService proveedorService;

    public ProveedorController(ProveedorService proveedorService) {
        this.proveedorService = proveedorService;
    }

    @GetMapping
    public List<Proveedor> getAllProveedores() {
        return proveedorService.getAllProveedores();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> getProveedorById(@PathVariable Long id) {
        return proveedorService.getProveedorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Proveedor createProveedor(@RequestBody Proveedor proveedor) {
        return proveedorService.saveProveedor(proveedor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proveedor> updateProveedor(@PathVariable Long id,
                                                     @RequestBody Proveedor detalles) {
        return proveedorService.getProveedorById(id)
                .map(p -> {
                    p.setNombre(detalles.getNombre());
                    p.setImagenUrl(detalles.getImagenUrl());
                    p.setRazonSocial(detalles.getRazonSocial());
                    p.setTelefono(detalles.getTelefono());
                    p.setEmail(detalles.getEmail());
                    p.setDireccion(detalles.getDireccion());
                    Proveedor actualizado = proveedorService.saveProveedor(p); // aquí también notifica
                    return ResponseEntity.ok(actualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProveedor(@PathVariable Long id) {
        if (proveedorService.getProveedorById(id).isPresent()) {
            proveedorService.deleteProveedor(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
