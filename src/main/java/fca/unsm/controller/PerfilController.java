package fca.unsm.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fca.unsm.entity.Usuarios;
import fca.unsm.entity.dao.CambiarContrasenaDTO;
import fca.unsm.repository.UsuariosRepository;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    private final UsuariosRepository usuariosRepository;
    private final PasswordEncoder passwordEncoder;

    public PerfilController(
            UsuariosRepository usuariosRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuariosRepository = usuariosRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PutMapping("/cambiar-contrasena")
    public ResponseEntity<?> cambiarContrasena(
            @RequestBody CambiarContrasenaDTO dto,
            Authentication authentication
    ) {

        if (authentication == null) {
            return ResponseEntity.status(401).body("No hay sesión activa");
        }

        String username = authentication.getName();

        Usuarios usuario = usuariosRepository.findByNombreusuario(username)
                .orElse(null);

        if (usuario == null) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }

        if (dto.getContrasenaActual() == null || dto.getContrasenaActual().isBlank()) {
            return ResponseEntity.badRequest().body("La contraseña actual es obligatoria");
        }

        if (!passwordEncoder.matches(dto.getContrasenaActual(), usuario.getContrasena())) {
            return ResponseEntity.badRequest().body("La contraseña actual no es correcta");
        }

        if (dto.getNuevaContrasena() == null || dto.getNuevaContrasena().length() < 8) {
            return ResponseEntity.badRequest().body("La nueva contraseña debe tener al menos 8 caracteres");
        }

        usuario.setContrasena(passwordEncoder.encode(dto.getNuevaContrasena()));
        usuariosRepository.save(usuario);

        return ResponseEntity.ok("Contraseña actualizada correctamente");
    }
}