package com.usuario.security;

import com.usuario.model.Usuario;
import org.springframework.security.core.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

public class DetallesUsuario implements UserDetails {

    private final Usuario usuario;

    public DetallesUsuario(Usuario usuario) { this.usuario = usuario; }

    @Override public List<GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol()));
    }
    @Override public String getPassword()   { return usuario.getPassword(); }
    @Override public String getUsername()   { return usuario.getUsername(); }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}
