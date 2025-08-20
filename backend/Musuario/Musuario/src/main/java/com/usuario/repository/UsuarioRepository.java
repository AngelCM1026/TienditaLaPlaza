package com.usuario.repository;

import com.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/** Acceso a BD con métodos CRUD automáticos */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
    
}
