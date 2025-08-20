package com.proveedores.repository;

import com.proveedores.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;

/** Acceso CRUD a la tabla proveedores. */
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
}
