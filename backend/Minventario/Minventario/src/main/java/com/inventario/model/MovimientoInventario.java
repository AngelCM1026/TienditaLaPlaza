package com.inventario.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos_inventario")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long movimientoId;

    private Long productoId;
    private String tipo;          // ENTRADA | SALIDA
    private Integer cantidad;
    private LocalDateTime fechaHora;
    private String referencia;
}
