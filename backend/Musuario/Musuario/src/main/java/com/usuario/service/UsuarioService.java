package com.usuario.service;

import com.usuario.feign.ClienteClient;
import com.usuario.feign.ClienteClient.ClienteDTO;
import com.usuario.model.Usuario;
import com.usuario.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder encoder;
    private final ClienteClient clienteClient;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder encoder, ClienteClient clienteClient){
        this.usuarioRepository = usuarioRepository;
        this.encoder = encoder;
        this.clienteClient = clienteClient;
    }

    public List<Usuario> getAllUsuarios(){
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> getUsuarioById(Long id){
        return usuarioRepository.findById(id);
    }

    public Usuario saveUsuario(Usuario usuario){
        // Solo codifica la contraseña si está cambiando o es nueva
        if (usuario.getPassword() != null && !usuario.getPassword().startsWith("$2a$")) { 
            usuario.setPassword(encoder.encode(usuario.getPassword()));
        }
        return usuarioRepository.save(usuario);
    }

    public void deleteUsuario(Long id){
        usuarioRepository.deleteById(id);
    }
    
    public Optional<Usuario> getUsuarioByUsername(String username) {
        return usuarioRepository.findByUsername(username);
    }
    
    public ClienteClient.ClienteDTO obtenerClientePorUsuarioId(Long usuarioId) {
        try {
            return clienteClient.obtenerClientePorUsuarioId(usuarioId);
        } catch (Exception e) {
            // Aquí podrías loggear el error para debugging
            return null;
        }
    }
}
