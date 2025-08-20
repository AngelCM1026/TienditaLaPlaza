package com.usuario.controller;

import com.usuario.feign.ClienteClient;
import com.usuario.model.Usuario;
import com.usuario.repository.UsuarioRepository;
import com.usuario.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authMgr;
    private final JwtUtil jwt;
    private final PasswordEncoder encoder;
    private final UsuarioRepository repo;
    private final ClienteClient clienteClient;    // ← Feign cliente de Clientes

    public AuthController(AuthenticationManager authMgr,
                          JwtUtil jwt,
                          PasswordEncoder encoder,
                          UsuarioRepository repo,
                          ClienteClient clienteClient) {
        this.authMgr       = authMgr;
        this.jwt           = jwt;
        this.encoder       = encoder;
        this.repo          = repo;
        this.clienteClient = clienteClient;
    }

    /* ──────── REGISTRO ──────── */
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegistroCliente dto) {
        if (repo.findByUsername(dto.username()).isPresent()) {
            return ResponseEntity.badRequest().body("Usuario ya existe");
        }

        // 1) Creo el usuario (rol CLIENTE fijo)
        Usuario nuevo = new Usuario(
            null,
            dto.username(),
            encoder.encode(dto.password()),
            "CLIENTE"
        );
        repo.save(nuevo);

        // 2) Creo la ficha de Cliente en el microservicio Clientes
        clienteClient.crearCliente(new ClienteClient.ClienteDTO(
            null,
            nuevo.getId(),
            dto.nombre(),
            dto.telefono(),
            dto.email()
        ));

        return ResponseEntity.ok("Cliente registrado");
    }

    /* ──────── LOGIN ──────── */
    @PostMapping("/login")
    public ResponseEntity<Token> login(@RequestBody Login dto) {
        authMgr.authenticate(
            new UsernamePasswordAuthenticationToken(dto.username(), dto.password())
        );
        var user = repo.findByUsername(dto.username()).orElseThrow();
        String token = jwt.generarToken(user.getUsername(), "ROLE_" + user.getRol());
        return ResponseEntity.ok(new Token(token));
    }

    /* DTOs */
    public record RegistroCliente(
        String username,
        String password,
        String rol,      // este campo será ignorado y forzado a CLIENTE
        String nombre,
        String telefono,
        String email
    ) {}
    public record Login(String username, String password) {}
    public record Token(String token) {}
}
