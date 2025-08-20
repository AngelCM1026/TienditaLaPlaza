/* ───────────────────────── InventarioRepository ───────────────────────── */
package com.inventario.repository;

import com.inventario.model.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * CRUD sobre la tabla inventario.
 * Su clave primaria es productoId (Long).
 */
public interface InventarioRepository extends JpaRepository<Inventario, Long> {
}
