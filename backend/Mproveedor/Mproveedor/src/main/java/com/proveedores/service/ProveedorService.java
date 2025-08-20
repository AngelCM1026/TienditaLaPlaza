package com.proveedores.service;

import com.proveedores.dto.NotificacionRequest;
import com.proveedores.feign.NotificacionClient;
import com.proveedores.model.Proveedor;
import com.proveedores.repository.ProveedorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final NotificacionClient notificacionClient;

    public ProveedorService(ProveedorRepository proveedorRepository,
                            NotificacionClient notificacionClient) {
        this.proveedorRepository = proveedorRepository;
        this.notificacionClient = notificacionClient;
    }

    public List<Proveedor> getAllProveedores() {
        return proveedorRepository.findAll();
    }

    public Optional<Proveedor> getProveedorById(Long id) {
        return proveedorRepository.findById(id);
    }

    public Proveedor saveProveedor(Proveedor proveedor) {
        boolean esNuevo = (proveedor.getId() == null);
        Proveedor guardado = proveedorRepository.save(proveedor);

        try {
            String titulo = esNuevo
                    ? "Nuevo proveedor registrado"
                    : "Datos de proveedor actualizados";

            String mensaje = esNuevo
                    ? "Se ha registrado un nuevo proveedor: " + guardado.getNombre()
                    : "Se han actualizado los datos del proveedor: " + guardado.getNombre();

            NotificacionRequest notif = new NotificacionRequest(
                    titulo,
                    mensaje,
                    guardado.getEmail() != null ? guardado.getEmail() : "ADMIN"
            );

            notificacionClient.enviarNotificacion(notif);
        } catch (Exception e) {
            System.err.println("Error al enviar notificación de proveedor: " + e.getMessage());
        }

        return guardado;
    }

    public void deleteProveedor(Long id) {
        proveedorRepository.deleteById(id);
    }
}
