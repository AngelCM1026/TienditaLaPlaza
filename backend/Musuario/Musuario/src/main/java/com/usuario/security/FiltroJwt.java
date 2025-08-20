package com.usuario.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class FiltroJwt extends OncePerRequestFilter {

    private final JwtUtil jwt;
    private final DetallesUsuarioService detallesSrv;

    public FiltroJwt(JwtUtil jwt, DetallesUsuarioService detallesSrv){
        this.jwt = jwt; this.detallesSrv = detallesSrv;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {

        String header = req.getHeader("Authorization");
        if(header != null && header.startsWith("Bearer ")){
            String token = header.substring(7);
            if(jwt.esValido(token)){
                String user = jwt.obtenerUsuario(token);
                var detalles = detallesSrv.loadUserByUsername(user);

                var auth = new UsernamePasswordAuthenticationToken(
                        detalles, null, detalles.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(req, res);
    }
}
