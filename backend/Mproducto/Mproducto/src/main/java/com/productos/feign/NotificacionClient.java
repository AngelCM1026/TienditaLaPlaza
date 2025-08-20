package com.productos.feign;


import com.productos.dto.NotificacionRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "Mnotificacion", path = "/api/notificaciones")
public interface NotificacionClient {

    @PostMapping
    void enviarNotificacion(@RequestBody NotificacionRequest request);
}
