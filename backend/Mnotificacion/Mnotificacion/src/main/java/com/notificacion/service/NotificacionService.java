package com.notificacion.service;

import com.notificacion.model.Notificacion;
import com.notificacion.repository.NotificacionRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Lógica de negocio para notificaciones, integrada con WebSocket.
 */
@Service
public class NotificacionService {

    private final NotificacionRepository repositorio;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificacionService(NotificacionRepository repositorio,
                               SimpMessagingTemplate messagingTemplate) {
        this.repositorio = repositorio;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Envía una nueva notificación, la guarda en la base de datos
     * y la publica en WebSocket en tiempo real.
     */
    public Notificacion enviarNotificacion(String titulo, String mensaje, String destinatario) {
        Notificacion notificacion = Notificacion.builder()
                .titulo(titulo)
                .mensaje(mensaje)
                .destinatario(destinatario)
                .leida(false)
                .fechaCreacion(LocalDateTime.now())
                .build();

        Notificacion guardada = repositorio.save(notificacion);

        // 🔔 Enviar la notificación al canal del destinatario
        messagingTemplate.convertAndSend(
                "/topic/notificaciones/" + destinatario,
                guardada
        );

        return guardada;
    }

    /**
     * Obtiene todas las notificaciones de un destinatario.
     */
    public List<Notificacion> obtenerPorDestinatario(String destinatario) {
        return repositorio.findByDestinatario(destinatario);
    }

    /**
     * Marca una notificación como leída y emite la actualización por WebSocket.
     */
    public void marcarComoLeida(Long id) {
        repositorio.findById(id).ifPresent(n -> {
            n.setLeida(true);
            Notificacion actualizada = repositorio.save(n);

            // 🔄 Emitir el cambio al canal del destinatario
            messagingTemplate.convertAndSend(
                    "/topic/notificaciones/" + actualizada.getDestinatario(),
                    actualizada
            );
        });
    }
}
