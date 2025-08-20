package com.usuario.security;

import com.usuario.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

/** Spring lo usa para buscar al usuario cuando haces login */
@Service
public class DetallesUsuarioService implements UserDetailsService {

    private final UsuarioRepository repo;

    public DetallesUsuarioService(UsuarioRepository repo){ this.repo = repo; }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repo.findByUsername(username)
                   .map(DetallesUsuario::new)
                   .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }
}
