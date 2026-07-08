package fca.unsm.controller;

import fca.unsm.entity.Usuarios;
import fca.unsm.repository.UsuariosRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class UsuarioSesionAdvice {

    private final UsuariosRepository usuariosRepository;

    public UsuarioSesionAdvice(UsuariosRepository usuariosRepository) {
        this.usuariosRepository = usuariosRepository;
    }

    @ModelAttribute("username")
    public String username(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return "Usuario";
        }

        if ("anonymousUser".equals(authentication.getName())) {
            return "Usuario";
        }

        return authentication.getName();
    }

    @ModelAttribute("nombreUsuarioSesion")
    public String nombreUsuarioSesion(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return "Usuario";
        }

        if ("anonymousUser".equals(authentication.getName())) {
            return "Usuario";
        }

        return usuariosRepository.findByNombreusuario(authentication.getName())
                .map(Usuarios::getNombre)
                .orElse(authentication.getName());
    }

    @ModelAttribute("rol")
    public String rol(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return "SIN ROL";
        }

        if ("anonymousUser".equals(authentication.getName())) {
            return "SIN ROL";
        }

        return authentication.getAuthorities()
                .stream()
                .findFirst()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .orElse("SIN ROL");
    }
}