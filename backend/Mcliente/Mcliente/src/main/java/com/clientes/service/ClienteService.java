/* ───────────── ClienteService ───────────── */
package com.clientes.service;

import com.clientes.model.Cliente;
import com.clientes.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    /* Lecturas */
    public List<Cliente> getAllClientes()            
    { return clienteRepository.findAll(); }
    
    public Optional<Cliente> getClienteById(Long id) 
    { return clienteRepository.findById(id); }

    /* Altas / modificaciones */
    public Cliente saveCliente(Cliente cliente)      
    { return clienteRepository.save(cliente); }

    /* Borrado */
    public void deleteCliente(Long id)               
    { clienteRepository.deleteById(id); }
    
    public Optional<Cliente> getClienteByUsuarioId(Long usuarioId) {
        return clienteRepository.findByUsuarioId(usuarioId);
    }

}
