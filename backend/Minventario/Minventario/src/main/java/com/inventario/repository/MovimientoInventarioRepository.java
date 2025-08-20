package com.inventario.repository;

import com.inventario.model.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    @Query("SELECT SUM(m.cantidad) FROM MovimientoInventario m " +
           "WHERE m.productoId = :productoId AND m.tipo = :tipo")
    Optional<Integer> sumCantidadByProductoAndTipo(Long productoId, String tipo);
}
