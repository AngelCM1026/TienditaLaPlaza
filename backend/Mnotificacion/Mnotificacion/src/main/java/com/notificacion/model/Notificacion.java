package com.notificacion.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa una notificación.
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID de la notificación

    private String titulo; // Título de la notificación
    private String mensaje; // Contenido de la notificación
    private String destinatario; // Usuario o admin que recibirá la notificación
    private boolean leida; // Indica si la notificación ya fue leída

    private LocalDateTime fechaCreacion; // Fecha de creación de la notificación
}
