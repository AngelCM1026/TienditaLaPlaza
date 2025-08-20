package com.notificacion.repository;

import com.notificacion.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Interfaz para acceder a la base de datos de notificaciones.
 * Hereda de JpaRepository para operaciones CRUD automáticas.
 */
@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    // Busca todas las notificaciones de un destinatario específico
    List<Notificacion> findByDestinatario(String destinatario);
}
