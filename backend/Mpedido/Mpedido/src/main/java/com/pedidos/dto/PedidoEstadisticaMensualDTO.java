package com.pedidos.dto;

import java.time.LocalDate;

public record PedidoEstadisticaMensualDTO(
    LocalDate mes,
    Long cantidadPedidos,
    Double totalVendido
) {}
