package com.pedidos.repository;

import com.pedidos.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByClienteId(Long clienteId);

    @Query(value = """
        SELECT DATE(p.fecha) AS fecha,
               COUNT(*) AS cantidadPedidos,
               SUM(p.total) AS totalVendido
        FROM pedidos p
        WHERE p.fecha BETWEEN :inicio AND :fin
        GROUP BY fecha
        ORDER BY fecha
    """, nativeQuery = true)
    List<Object[]> obtenerEstadisticasAgrupadasPorDia(@Param("inicio") LocalDateTime inicio,
                                                      @Param("fin") LocalDateTime fin);

    @Query(value = """
        SELECT DATE_FORMAT(p.fecha, '%Y-%m-01') AS mes,
               COUNT(*) AS cantidadPedidos,
               SUM(p.total) AS totalVendido
        FROM pedidos p
        WHERE p.fecha BETWEEN :inicio AND :fin
        GROUP BY mes
        ORDER BY mes
    """, nativeQuery = true)
    List<Object[]> obtenerEstadisticasAgrupadasPorMes(@Param("inicio") LocalDateTime inicio,
                                                      @Param("fin") LocalDateTime fin);

}




