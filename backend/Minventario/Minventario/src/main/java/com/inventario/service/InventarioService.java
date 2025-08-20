package com.inventario.service;

import com.inventario.dto.InventarioDashboardDTO;
import com.inventario.dto.NotificacionRequest;
import com.inventario.feign.NotificacionClient;
import com.inventario.model.Inventario;
import com.inventario.model.MovimientoInventario;
import com.inventario.repository.InventarioRepository;
import com.inventario.repository.MovimientoInventarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InventarioService {

    private final InventarioRepository inventarioRepo;
    private final MovimientoInventarioRepository movimientoRepo;
    private final NotificacionClient notificacionClient; // Cliente Feign para enviar notificaciones

    public InventarioService(InventarioRepository inventarioRepo,
                             MovimientoInventarioRepository movimientoRepo,
                             NotificacionClient notificacionClient) {
        this.inventarioRepo = inventarioRepo;
        this.movimientoRepo = movimientoRepo;
        this.notificacionClient = notificacionClient;
    }

    /* ---------- LECTURAS ---------- */

    // Obtener todo el inventario
    public List<Inventario> getAllInventario() {
        return inventarioRepo.findAll();
    }

    // Obtener inventario por ID de producto
    public Optional<Inventario> getByProductoId(Long productoId) {
        return inventarioRepo.findById(productoId);
    }

    /* ---------- CREACIÓN DE INVENTARIO BASE ---------- */

    // Guardar un inventario nuevo
    public Inventario saveInventario(Inventario inv) {
        return inventarioRepo.save(inv);
    }

    /* ---------- ENTRADAS DE STOCK ---------- */

    public Inventario registrarEntrada(Long productoId, int cantidad, String referencia) {
        // Si el inventario no existe, se crea uno nuevo con stock inicial 0
        Inventario inv = inventarioRepo.findById(productoId)
                .orElseGet(() -> {
                    Inventario nuevo = new Inventario();
                    nuevo.setProductoId(productoId);
                    nuevo.setStockActual(0);
                    nuevo.setStockMinimo(0);
                    nuevo.setStockMaximo(Integer.MAX_VALUE);
                    return nuevo;
                });

        // Actualizar stock actual
        inv.setStockActual(inv.getStockActual() + cantidad);
        inventarioRepo.save(inv);

        // Registrar movimiento de inventario
        movimientoRepo.save(new MovimientoInventario(
                null, productoId, "ENTRADA", cantidad, LocalDateTime.now(), referencia));

        return inv;
    }

    /* ---------- SALIDAS DE STOCK ---------- */

    public Optional<Inventario> registrarSalida(Long productoId, int cantidad, String referencia) {
        return inventarioRepo.findById(productoId).map(inv -> {
            // Reducir stock actual
            inv.setStockActual(inv.getStockActual() - cantidad);
            inventarioRepo.save(inv);

            // Registrar movimiento de salida
            movimientoRepo.save(new MovimientoInventario(
                    null, productoId, "SALIDA", cantidad, LocalDateTime.now(), referencia));

            // 🚨 Verificar stock bajo
            if (inv.getStockActual() < inv.getStockMinimo()) {
                NotificacionRequest alerta = new NotificacionRequest(
                    "Stock bajo para producto ID: " + productoId,
                    "El stock actual (" + inv.getStockActual() +
                    ") está por debajo del mínimo (" + inv.getStockMinimo() + ").",
                    "ADMIN" // <-- usar rol en vez de email
                );
                notificacionClient.enviarNotificacion(alerta);
            }

            

            return inv;
        });
    }

    /* ---------- ALERTA DE STOCK BAJO ---------- */

    // Revisar todos los productos y enviar notificación si el stock está por debajo del mínimo
    public void alertarStockBajo(String usuario) {
        inventarioRepo.findAll().forEach(inv -> {
            if (inv.getStockActual() < inv.getStockMinimo()) {
                NotificacionRequest alerta = new NotificacionRequest(
                        "Stock bajo para producto ID: " + inv.getProductoId(),
                        "El stock actual (" + inv.getStockActual() +
                                ") está por debajo del mínimo (" + inv.getStockMinimo() + ").",
                        usuario
                );
                notificacionClient.enviarNotificacion(alerta);
            }
        });
    }

    /* ---------- DASHBOARD DE INVENTARIO ---------- */

    public List<InventarioDashboardDTO> getInventarioDashboard(Long productoId) {
        List<Inventario> inventarios = (productoId != null)
                ? inventarioRepo.findById(productoId).stream().toList()
                : inventarioRepo.findAll();

        // Mapear datos a DTO con stock actual y cantidad vendida
        return inventarios.stream().map(inv -> {
            Integer cantidadVendida = movimientoRepo.sumCantidadByProductoAndTipo(inv.getProductoId(), "SALIDA")
                    .orElse(0);
            return new InventarioDashboardDTO(
                    inv.getProductoId(),
                    inv.getStockActual(),
                    cantidadVendida
            );
        }).toList();
    }
}
