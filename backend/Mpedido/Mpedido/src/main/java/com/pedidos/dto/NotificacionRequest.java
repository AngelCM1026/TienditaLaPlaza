package com.pedidos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para enviar notificaciones desde otros microservicios
 * hacia el microservicio de notificaciones.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificacionRequest {

    @NotBlank(message = "El título es obligatorio")
    private String titulo; // Título breve de la notificación

    @NotBlank(message = "El mensaje es obligatorio")
    private String mensaje; // Contenido de la notificación

    @NotBlank(message = "El destinatario es obligatorio")
    private String destinatario; // Puede ser el email o ID de usuario
}
