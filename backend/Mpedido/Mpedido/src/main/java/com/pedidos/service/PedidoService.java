package com.pedidos.service;

import com.pedidos.dto.NotificacionRequest;
import com.pedidos.dto.PedidoConClienteDTO;
import com.pedidos.dto.PedidoEstadisticaDiariaDTO;
import com.pedidos.dto.PedidoEstadisticaMensualDTO;
import com.pedidos.feign.ClienteClient;
import com.pedidos.feign.InventarioClient;
import com.pedidos.feign.NotificacionClient;
import com.pedidos.feign.ProductoClient;
import com.pedidos.model.DetallePedido;
import com.pedidos.model.Pedido;
import com.pedidos.repository.PedidoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepo;
    private final ProductoClient productoClient;
    private final InventarioClient inventarioClient;
    private final ClienteClient clienteClient;
    private final NotificacionClient notificacionClient; // Cliente Feign para notificaciones

    public PedidoService(PedidoRepository pedidoRepo,
                         ProductoClient productoClient,
                         ClienteClient clienteClient,
                         InventarioClient inventarioClient,
                         NotificacionClient notificacionClient) {
        this.pedidoRepo       = pedidoRepo;
        this.productoClient   = productoClient;
        this.inventarioClient = inventarioClient;
        this.clienteClient    = clienteClient;
        this.notificacionClient = notificacionClient;
    }

    /* ---------- lecturas ---------- */

    public List<Pedido> getAll() {
        return pedidoRepo.findAll();
    }

    public Optional<Pedido> getById(Long id) {
        return pedidoRepo.findById(id);
    }

    public List<PedidoConClienteDTO> getAllConCliente() {
        return pedidoRepo.findAll().stream()
            .map(p -> {
                var cliente = clienteClient.obtenerPorId(p.getClienteId());
                return PedidoConClienteDTO.from(p, cliente, productoClient);
            }).toList();
    }

    public Optional<PedidoConClienteDTO> getByIdConCliente(Long id) {
        return pedidoRepo.findById(id).map(p -> {
            var cliente = clienteClient.obtenerPorId(p.getClienteId());
            return PedidoConClienteDTO.from(p, cliente, productoClient);
        });
    }

    /* ---------- crear pedido, descontar stock y notificar ---------- */
    @Transactional
    public Pedido crear(Pedido pedido) {
        // 1. Obtener precio unitario de cada producto y vincular al pedido
        for (DetallePedido d : pedido.getItems()) {
            var prod = productoClient.getById(d.getProductoId());
            d.setPrecioUnit(prod.precio());
            d.setPedido(pedido);
        }

        // 2. Calcular el total del pedido
        double total = pedido.getItems().stream()
                .mapToDouble(DetallePedido::getSubtotal)
                .sum();
        pedido.setTotal(total);
        pedido.setEstado("NUEVO");

        // 3. Guardar pedido
        Pedido guardado = pedidoRepo.save(pedido);

        // 4. Descontar stock en inventario
        for (DetallePedido d : guardado.getItems()) {
            var movimiento = new InventarioClient.MovimientoDTO(
                    d.getProductoId(),
                    d.getCantidad(),
                    "Pedido-" + guardado.getId()
            );
            inventarioClient.registrarSalida(movimiento);
        }

        // 5. Enviar notificación al cliente
        var cliente = clienteClient.obtenerPorId(guardado.getClienteId());
        NotificacionRequest notificacion = new NotificacionRequest(
                "Pedido creado",
                "Tu pedido #" + guardado.getId() + " ha sido registrado con éxito.",
                cliente.email() // Usamos email como destinatario
        );
        notificacionClient.enviarNotificacion(notificacion);

        return guardado;
    }

    /* ---------- actualizar estado ---------- */
    public Optional<Pedido> actualizarEstado(Long id, String nuevoEstado) {
        return pedidoRepo.findById(id).map(p -> {
            p.setEstado(nuevoEstado);
            Pedido actualizado = pedidoRepo.save(p);

            // Enviar notificación por cambio de estado
            var cliente = clienteClient.obtenerPorId(actualizado.getClienteId());
            NotificacionRequest notificacion = new NotificacionRequest(
                    "Estado actualizado",
                    "El pedido #" + actualizado.getId() + " ahora está en estado: " + nuevoEstado,
                    cliente.email()
            );
            notificacionClient.enviarNotificacion(notificacion);

            return actualizado;
        });
    }

    /* ---------- eliminar ---------- */
    public void eliminar(Long id) {
        pedidoRepo.deleteById(id);
    }

    public List<PedidoConClienteDTO> getPedidosPorClienteId(Long clienteId) {
        return pedidoRepo.findByClienteId(clienteId).stream()
            .map(p -> {
                var cliente = clienteClient.obtenerPorId(p.getClienteId());
                return PedidoConClienteDTO.from(p, cliente, productoClient);
            }).toList();
    }

    /* ---------- estadísticas ---------- */
    public List<PedidoEstadisticaDiariaDTO> obtenerEstadisticasSemana() {
        LocalDate hoy = LocalDate.now();
        LocalDateTime inicioSemana = hoy.minusDays(6).atStartOfDay();
        LocalDateTime fin = hoy.plusDays(1).atStartOfDay();

        List<Object[]> resultados = pedidoRepo.obtenerEstadisticasAgrupadasPorDia(inicioSemana, fin);

        return resultados.stream()
            .map(r -> new PedidoEstadisticaDiariaDTO(
                ((java.sql.Date) r[0]).toLocalDate(),
                ((Number) r[1]).longValue(),
                ((Number) r[2]).doubleValue()
            ))
            .toList();
    }

    public List<PedidoEstadisticaMensualDTO> obtenerEstadisticasMesesAnio() {
        LocalDate hoy = LocalDate.now();
        LocalDateTime inicioAnio = hoy.withDayOfYear(1).atStartOfDay();
        LocalDateTime fin = hoy.plusDays(1).atStartOfDay();

        List<Object[]> resultados = pedidoRepo.obtenerEstadisticasAgrupadasPorMes(inicioAnio, fin);

        return resultados.stream()
            .map(r -> new PedidoEstadisticaMensualDTO(
                LocalDate.parse(((String) r[0]).substring(0, 10)),
                ((Number) r[1]).longValue(),
                ((Number) r[2]).doubleValue()
            ))
            .toList();
    }
}
