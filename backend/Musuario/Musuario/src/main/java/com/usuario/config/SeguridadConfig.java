package com.usuario.config;

import com.usuario.security.FiltroJwt;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;                                       // ← import correcto
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SeguridadConfig {

    private final FiltroJwt filtroJwt;
    public SeguridadConfig(FiltroJwt filtroJwt){ this.filtroJwt = filtroJwt; }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
          .csrf(csrf -> csrf.disable())
          .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
          .authorizeHttpRequests(auth -> auth
                // 1) público: registro y login
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()

                // 2) solo ADMIN puede manipular usuarios
                .requestMatchers(HttpMethod.POST,   "/api/usuarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/usuarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,    "/api/usuarios/**").hasAnyRole("ADMIN","TRABAJADOR", "CLIENTE")

                // 3) clientes: ADMIN/TRABAJADOR CRUD clientes
                .requestMatchers(HttpMethod.POST,   "/api/clientes").hasAnyRole("ADMIN","TRABAJADOR")
                .requestMatchers(HttpMethod.PUT,    "/api/clientes/**").hasAnyRole("ADMIN","TRABAJADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/clientes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,    "/api/clientes/**").hasAnyRole("ADMIN","TRABAJADOR")

                // 4) pedidos:
                //    • clientes pueden crear y ver sus pedidos
                .requestMatchers(HttpMethod.POST,   "/api/pedidos").hasRole("CLIENTE")
                .requestMatchers(HttpMethod.GET,    "/api/pedidos/**").hasAnyRole("CLIENTE","TRABAJADOR")
                //    • solo TRABAJADOR puede listar todos o cambiar estado
                .requestMatchers(HttpMethod.GET,    "/api/pedidos").hasRole("TRABAJADOR")
                .requestMatchers(HttpMethod.PATCH,  "/api/pedidos/**/estado").hasRole("TRABAJADOR")

                // 5) productos e inventario: solo ADMIN/TRABAJADOR
                .requestMatchers("/api/productos/**").hasAnyRole("ADMIN","TRABAJADOR")
                .requestMatchers("/api/inventario/**").hasAnyRole("ADMIN","TRABAJADOR")

                // 6) resto: cualquier petición autenticada
                .anyRequest().authenticated()
          )
          .addFilterBefore(filtroJwt, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}
