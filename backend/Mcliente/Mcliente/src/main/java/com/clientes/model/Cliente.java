package com.clientes.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clientes")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Cliente {

    /* PK */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ClienteID")
    private Long id;

    /* Relación con microservicio Usuario */
    @Column(name = "UsuarioID", nullable = false, unique = true)
    private Long usuarioId;

    /* Datos básicos */
    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String telefono;

    @Column(nullable = false, unique = true)
    private String email;
   
}