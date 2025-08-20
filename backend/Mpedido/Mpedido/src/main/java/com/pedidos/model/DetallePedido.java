package com.pedidos.model;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "detalles_pedido")
@Data @AllArgsConstructor @NoArgsConstructor
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long detalleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PedidoID")
    @JsonBackReference               // ← añade esta línea
    private Pedido pedido;


    @Column(nullable = false)
    private Long productoId;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private Double precioUnit;

    /* Conveniencia: subtotal = cantidad * precioUnit */
    public Double getSubtotal() {
        return cantidad * precioUnit;
    }
}
