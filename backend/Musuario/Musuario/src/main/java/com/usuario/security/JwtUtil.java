package com.usuario.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key clave;
    private final long expiracionMs;

    public JwtUtil(@Value("${jwt.secret}") String secreto,
                   @Value("${jwt.expiration}") long expiracionMs) {
        this.clave = Keys.hmacShaKeyFor(secreto.getBytes());
        this.expiracionMs = expiracionMs;
    }

    /** Crea token con usuario y rol */
    public String generarToken(String usuario, String rol){
        Date ahora = new Date();
        return Jwts.builder()
                .setSubject(usuario)
                .claim("rol", rol)
                .setIssuedAt(ahora)
                .setExpiration(new Date(ahora.getTime() + expiracionMs))
                .signWith(clave)
                .compact();
    }

    public String obtenerUsuario(String token){
        return Jwts.parserBuilder().setSigningKey(clave).build()
                   .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean esValido(String token){
        try{ Jwts.parserBuilder().setSigningKey(clave).build().parseClaimsJws(token); return true; }
        catch (JwtException | IllegalArgumentException e){ return false; }
    }
}
