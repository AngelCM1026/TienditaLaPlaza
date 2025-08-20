package com.inventario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InventarioDashboardDTO {
    private Long productoId;
    private Integer stockActual;
    private Integer cantidadVendida;
}
