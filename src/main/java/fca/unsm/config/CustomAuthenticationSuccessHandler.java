package fca.unsm.config;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        request.getSession().removeAttribute("intentos");

        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        boolean esAutor = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_AUTOR"));

        boolean esInvitado = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_INVITADO"));

        if (esAdmin || esAutor) {
            response.sendRedirect("/fca/admin");
            return;
        }

        if (esInvitado) {
            response.sendRedirect("/fca/confirmacion");
            return;
        }

        response.sendRedirect("/fca/acceso-denegado");
    }
}