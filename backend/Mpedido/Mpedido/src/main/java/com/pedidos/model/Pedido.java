package com.pedidos.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "pedidos")
@Data @AllArgsConstructor @NoArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PedidoID", nullable = false)
    private Long id;

    @Column(name = "ClienteID", nullable = false)
    private Long clienteId;

    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();
    
    /* Dirección */
    @Column(nullable = false)
    private String direccion;     // Calle y número

    private String referencia;    // Indicación adicional para el repartidor


    @Column(nullable = false)
    private Double total;

    @Column(nullable = false)
    private String estado = "NUEVO";   // NUEVO | PAGADO | ENVIADO | ENTREGADO

    /* Ítems */
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference            // ← añade esta línea
    private List<DetallePedido> items;

}
