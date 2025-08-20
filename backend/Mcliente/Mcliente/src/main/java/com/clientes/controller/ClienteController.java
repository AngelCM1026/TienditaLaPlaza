/* ───────────── ClienteController ───────────── */
package com.clientes.controller;

import com.clientes.model.Cliente;
import com.clientes.service.ClienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    /* --------- Listar y consultar --------- */

    @GetMapping
    public List<Cliente> getAllClientes() {
        return clienteService.getAllClientes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> getClienteById(@PathVariable Long id) {
        return clienteService.getClienteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /* --------- Crear --------- */

    @PostMapping
    public Cliente createCliente(@RequestBody Cliente cliente) {
        return clienteService.saveCliente(cliente);
    }

    /* --------- Actualizar --------- */

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> updateCliente(@PathVariable Long id,
                                                 @RequestBody Cliente detalles) {
        return clienteService.getClienteById(id)
                .map(c -> {
                    c.setNombre(detalles.getNombre());
                    c.setTelefono(detalles.getTelefono());
                    c.setEmail(detalles.getEmail());
                    Cliente actualizado = clienteService.saveCliente(c);
                    return ResponseEntity.ok(actualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /* --------- Eliminar --------- */

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCliente(@PathVariable Long id) {
        if (clienteService.getClienteById(id).isPresent()) {
            clienteService.deleteCliente(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<Cliente> getClienteByUsuarioId(@PathVariable Long usuarioId) {
        return clienteService.getClienteByUsuarioId(usuarioId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


}
