package com.notificacion.controller;

import com.notificacion.model.Notificacion;
import com.notificacion.service.NotificacionService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controlador REST para manejar las notificaciones.
 */
@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService servicio;

    public NotificacionController(NotificacionService servicio) {
        this.servicio = servicio;
    }

    /**
     * Endpoint para enviar una notificación.
     * Ejemplo: POST /api/notificaciones/enviar?titulo=Hola&mensaje=Pedido recibido&destinatario=usuario1
     */
    @PostMapping
    public Notificacion enviar(@RequestBody Notificacion notificacion) {
        return servicio.enviarNotificacion(
                notificacion.getTitulo(),
                notificacion.getMensaje(),
                notificacion.getDestinatario()
        );
    }


    /**
     * Endpoint para obtener todas las notificaciones de un destinatario.
     * Ejemplo: GET /api/notificaciones/usuario1
     */
    @GetMapping("/{destinatario}")
    public List<Notificacion> obtenerPorDestinatario(@PathVariable String destinatario) {
        return servicio.obtenerPorDestinatario(destinatario);
    }

    /**
     * Endpoint para marcar una notificación como leída.
     * Ejemplo: PUT /api/notificaciones/leida/5
     */
    @PutMapping("/leida/{id}")
    public void marcarComoLeida(@PathVariable Long id) {
        servicio.marcarComoLeida(id);
    }
}
