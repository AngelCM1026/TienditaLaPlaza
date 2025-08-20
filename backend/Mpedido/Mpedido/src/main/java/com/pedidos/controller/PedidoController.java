package com.pedidos.controller;

import com.pedidos.dto.PedidoConClienteDTO;
import com.pedidos.dto.PedidoEstadisticaDiariaDTO;
import com.pedidos.dto.PedidoEstadisticaMensualDTO;
import com.pedidos.model.Pedido;
import com.pedidos.model.DetallePedido;
import com.pedidos.service.PedidoService;
import com.pedidos.service.BoletaGeneratorService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controlador REST para operaciones con pedidos.
 * Maneja endpoints de CRUD, estadísticas y exportación de boletas.
 */
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService servicio;
    private final BoletaGeneratorService boletaService;

    public PedidoController(PedidoService servicio, BoletaGeneratorService boletaService) {
        this.servicio = servicio;
        this.boletaService = boletaService;
    }

    /* ---------- listar y consultar ---------- */

    @GetMapping
    public List<PedidoConClienteDTO> getAll() {
        return servicio.getAllConCliente();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getById(@PathVariable Long id) {
        return servicio.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cliente")
    public List<PedidoConClienteDTO> getAllConCliente() {
        return servicio.getAllConCliente();
    }

    @GetMapping("/cliente/{id}")
    public ResponseEntity<PedidoConClienteDTO> getByIdConCliente(@PathVariable Long id) {
        return servicio.getByIdConCliente(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /* ---------- crear ---------- */
    @PostMapping
    public Pedido crear(@RequestBody CrearPedidoDTO dto) {
        Pedido pedido = new Pedido();
        pedido.setClienteId(dto.clienteId());
        pedido.setDireccion(dto.direccion());
        pedido.setReferencia(dto.referencia());

        List<DetallePedido> items = dto.items().stream().map(i -> {
            DetallePedido d = new DetallePedido();
            d.setProductoId(i.productoId());
            d.setCantidad(i.cantidad());
            return d;
        }).toList();

        pedido.setItems(items);
        return servicio.crear(pedido);
    }

    /* ---------- actualizar estado ---------- */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Pedido> cambiarEstado(@PathVariable Long id,
                                                @RequestBody EstadoDTO dto) {
        return servicio.actualizarEstado(id, dto.estado())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /* ---------- eliminar ---------- */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (servicio.getById(id).isPresent()) {
            servicio.eliminar(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    /* ---------- exportar boleta ---------- */
    @GetMapping("/{id}/boleta")
    public ResponseEntity<byte[]> exportarBoleta(@PathVariable Long id) {
        Optional<PedidoConClienteDTO> pedidoOpt = servicio.getByIdConCliente(id);
        if (pedidoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        byte[] pdf = boletaService.generarBoletaPDF(pedidoOpt.get());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "boleta_pedido_" + id + ".pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    @GetMapping("/cliente/{clienteId}/lista")
    public ResponseEntity<List<PedidoConClienteDTO>> getPedidosPorCliente(@PathVariable Long clienteId) {
        List<PedidoConClienteDTO> pedidos = servicio.getPedidosPorClienteId(clienteId);
        if (pedidos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/estadisticas/semanal")
    public ResponseEntity<List<PedidoEstadisticaDiariaDTO>> obtenerEstadisticasSemana() {
        return ResponseEntity.ok(servicio.obtenerEstadisticasSemana());
    }

    @GetMapping("/estadisticas/mensual")
    public ResponseEntity<List<PedidoEstadisticaMensualDTO>> obtenerEstadisticasMeses() {
        return ResponseEntity.ok(servicio.obtenerEstadisticasMesesAnio());
    }

    /* ---------- DTOs internos para el Controller ---------- */
    public record CrearPedidoDTO(Long clienteId, String direccion, String referencia, List<ItemDTO> items) {}
    public record ItemDTO(Long productoId, Integer cantidad) {}
    public record EstadoDTO(String estado) {}
}
