package com.inventario.controller;

import com.inventario.dto.InventarioDashboardDTO;
import com.inventario.model.Inventario;
import com.inventario.service.InventarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
public class InventarioController {

    private final InventarioService servicio;

    public InventarioController(InventarioService servicio) {
        this.servicio = servicio;
    }

    /* ---------- Obtener todo el inventario ---------- */
    @GetMapping
    public List<Inventario> listar() {
        return servicio.getAllInventario();
    }

    /* ---------- Buscar inventario por producto ---------- */
    @GetMapping("/{productoId}")
    public ResponseEntity<Inventario> porProducto(@PathVariable Long productoId) {
        return servicio.getByProductoId(productoId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /* ---------- Crear inventario base ---------- */
    @PostMapping
    public ResponseEntity<Inventario> crear(@RequestBody Inventario inv) {
        Inventario creado = servicio.saveInventario(inv);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    /* ---------- Registrar entrada de stock ---------- */
    @PostMapping("/entrada")
    public Inventario entrada(@RequestBody MovimientoDTO dto) {
        return servicio.registrarEntrada(dto.productoId(), dto.cantidad(), dto.referencia());
    }

    /* ---------- Registrar salida de stock ---------- */
    @PostMapping("/salida")
    public ResponseEntity<Inventario> salida(@RequestBody MovimientoDTO dto) {
        return servicio.registrarSalida(dto.productoId(), dto.cantidad(), dto.referencia())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /* ---------- Ver dashboard de inventario ---------- */
    @GetMapping("/dashboard")
    public List<InventarioDashboardDTO> dashboard(@RequestParam(required = false) Long productoId) {
        return servicio.getInventarioDashboard(productoId);
    }

    /* ---------- Alertar stock bajo (nuevo endpoint) ---------- */
    @GetMapping("/alertar-stock-bajo/{usuario}")
    public ResponseEntity<Void> alertarStockBajo(@PathVariable String usuario) {
        servicio.alertarStockBajo(usuario);
        return ResponseEntity.ok().build();
    }

    /* ---------- DTO interno para movimientos ---------- */
    public record MovimientoDTO(Long productoId, Integer cantidad, String referencia) {}
}
