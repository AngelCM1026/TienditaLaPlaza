package com.productos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.productos.model.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
	List<Producto> findByCategoria(String categoria);
	@Query("select distinct p.categoria from Producto p")
	  List<String> findDistinctCategorias();
	List<Producto> findByProveedorId(Long proveedorId);
	List<Producto> findByNombreContainingIgnoreCase(String nombre);
	
}
