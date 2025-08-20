package com.pedidos.dto;

import com.pedidos.model.Pedido;
import com.pedidos.model.DetallePedido;
import com.pedidos.feign.ClienteClient.ClienteDTO;
import com.pedidos.feign.ProductoClient;
import com.pedidos.feign.ProductoClient.ProductoDTO;

import java.time.LocalDateTime; // ← importar
import java.util.List;
import java.util.stream.Collectors;

public record PedidoConClienteDTO(
    Long id,
    Long clienteId,
    ClienteInfo cliente,
    String estado,
    Double total,
    List<DetalleInfo> items,
    String direccion,
    String referencia,
    LocalDateTime fecha // ← AGREGADO
) {
    public record ClienteInfo(
        Long id,
        String nombre,
        String telefono,
        String email
    ) {}

    public record DetalleInfo(
        Long productoId,
        String nombreProducto,
        Integer cantidad,
        Double precioUnit,
        Double subtotal
    ) {}

    public static PedidoConClienteDTO from(Pedido pedido, ClienteDTO c, ProductoClient productoClient) {
        List<DetalleInfo> detalles = pedido.getItems().stream()
            .map(i -> {
                var producto = productoClient.getById(i.getProductoId());
                return new DetalleInfo(
                    i.getProductoId(),
                    producto.nombre(), // ← nuevo campo
                    i.getCantidad(),
                    i.getPrecioUnit(),
                    i.getSubtotal()
                );
            })
            .collect(Collectors.toList());

        return new PedidoConClienteDTO(
            pedido.getId(),
            pedido.getClienteId(),
            new ClienteInfo(
                c.id(), c.nombre(), c.telefono(), c.email()
            ),
            pedido.getEstado(),
            pedido.getTotal(),
            detalles,
            pedido.getDireccion(),
            pedido.getReferencia(),
            pedido.getFecha()
        );
    }
}


