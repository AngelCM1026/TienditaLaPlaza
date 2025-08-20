package com.usuario.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="usuarios")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UsuarioID", nullable = false)
    private Long id;

    @Column(name = "usuario", nullable = false)
    private String username;

    @Column(name = "contraseña", nullable = false)
    private String password;

    @Column(name = "rol", nullable = false)
    private String rol;
}
