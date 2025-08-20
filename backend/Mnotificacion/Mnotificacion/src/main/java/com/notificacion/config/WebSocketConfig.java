package com.notificacion.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // prefijos para los topics (canales de salida)
        config.enableSimpleBroker("/topic");
        // prefijo para los destinos a los que el cliente puede enviar mensajes
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // endpoint WebSocket al que se conectará React
        registry.addEndpoint("/ws-notificaciones")
                .setAllowedOriginPatterns("*")  // permite cualquier origen
                .withSockJS();                  // soporte para clientes que no soportan WS nativo
    }
}
