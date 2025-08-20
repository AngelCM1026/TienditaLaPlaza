package com.pedidos.dto;

import java.time.LocalDate;

public record PedidoEstadisticaDiariaDTO(
    LocalDate fecha,
    Long cantidadPedidos,
    Double totalVendido
) {}
