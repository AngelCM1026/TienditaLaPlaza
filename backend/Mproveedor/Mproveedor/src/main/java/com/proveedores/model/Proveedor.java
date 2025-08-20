package com.proveedores.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "proveedores")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ProveedorID", nullable = false)
    private Long id;

    @Column(name = "nombre", nullable = false)
    private String nombre;
    
    @Column(name = "imagen_url",nullable = false)
    private String imagenUrl;

    @Column(name = "razon_social", nullable = false)
    private String razonSocial;

    @Column(name = "telefono", nullable = false)
    private String telefono;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "direccion", nullable = false)
    private String direccion;
}
