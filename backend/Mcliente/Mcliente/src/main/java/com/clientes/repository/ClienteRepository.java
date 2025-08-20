/* ───────────── ClienteRepository ───────────── */
package com.clientes.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clientes.model.Cliente;

import java.util.Optional;

/** CRUD de la tabla clientes */
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByUsuarioId(Long usuarioId);
    Optional<Cliente> findByEmail(String email);
    
}
