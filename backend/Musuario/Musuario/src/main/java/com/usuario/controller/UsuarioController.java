package com.usuario.controller;

import com.usuario.dto.UsuarioConClienteDTO;
import com.usuario.model.Usuario;
import com.usuario.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService){
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<Usuario> getAllUsuarios(){
        return usuarioService.getAllUsuarios();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Long id){
        return usuarioService.getUsuarioById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Usuario createUsuario(@RequestBody Usuario usuario){
        return usuarioService.saveUsuario(usuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> updateUsuario(@PathVariable Long id,
                                                 @RequestBody Usuario usuarioDetails){
        return usuarioService.getUsuarioById(id)
                .map(u -> {
                    u.setUsername(usuarioDetails.getUsername());
                    // Para no re-codificar la contraseña si ya está encriptada
                    if (usuarioDetails.getPassword() != null && !usuarioDetails.getPassword().startsWith("$2a$")) {
                        u.setPassword(usuarioDetails.getPassword());
                    }
                    u.setRol(usuarioDetails.getRol());
                    Usuario updated = usuarioService.saveUsuario(u);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id){
        if(usuarioService.getUsuarioById(id).isPresent()){
            usuarioService.deleteUsuario(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/me")
    public ResponseEntity<UsuarioConClienteDTO> getMiUsuario(Principal principal) {
        String username = principal.getName();

        return usuarioService.getUsuarioByUsername(username)
            .map(usuario -> {
            	var cliente = usuarioService.obtenerClientePorUsuarioId(usuario.getId());
            	Long clienteId = cliente != null ? cliente.id() : null;


                UsuarioConClienteDTO dto = new UsuarioConClienteDTO(
                    usuario.getId(),
                    usuario.getUsername(),
                    usuario.getRol(),
                    clienteId
                );
                return ResponseEntity.ok(dto);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
