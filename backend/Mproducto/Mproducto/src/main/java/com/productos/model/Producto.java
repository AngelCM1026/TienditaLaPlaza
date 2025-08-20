package com.productos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="productos")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ProductoID", nullable = false)
    private Long id;

    @Column(name="Codigo",nullable = false, unique = true)
    private String codigo;

    @Column(name="nombre" ,nullable = false)
    private String nombre;
    
    @Column(name="categoria" ,nullable = false)
    private String categoria;
    
    @Column(name = "imagen_url",nullable = false)
    private String imagenUrl;

    @Column(name="precio", nullable = false)
    private Double precio;
    
    @Column(name = "ProveedorID", nullable = false)
    private Long proveedorId;


}
