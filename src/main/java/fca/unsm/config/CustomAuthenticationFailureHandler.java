package fca.unsm.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.session.SessionAuthenticationException;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class CustomAuthenticationFailureHandler implements AuthenticationFailureHandler {

    private static final int MAX_INTENTOS = 4;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException, ServletException {

        HttpSession session = request.getSession();

        if (exception instanceof SessionAuthenticationException) {
            response.sendRedirect("/fca/login?active=true");
            return;
        }

        if (exception instanceof BadCredentialsException) {
            Integer intentos = (Integer) session.getAttribute("intentos");

            if (intentos == null) {
                intentos = 0;
            }

            intentos++;
            session.setAttribute("intentos", intentos);

            int restantes = MAX_INTENTOS - intentos;

            if (intentos >= MAX_INTENTOS) {
                session.removeAttribute("intentos");
                response.sendRedirect("/fca/login?blocked=true");
                return;
            }

            response.sendRedirect("/fca/login?error=true&intentos=" + intentos + "&restantes=" + restantes);
            return;
        }

        String mensaje = URLEncoder.encode(
                exception.getMessage(),
                StandardCharsets.UTF_8
        );

        response.sendRedirect("/fca/login?error=true&mensaje=" + mensaje);
    }
}