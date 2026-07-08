package fca.unsm.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fca.unsm.Service.IUsuariosService;
import fca.unsm.entity.Roles;
import fca.unsm.entity.Usuarios;
import fca.unsm.entity.dao.UsuariosDTO;
import fca.unsm.repository.RolesRepository;

@RestController
@RequestMapping("/api")
public class UsuariosController {

    private final PasswordEncoder passwordEncoder;

    @Autowired
    private IUsuariosService serviUsuarios;

    @Autowired
    private RolesRepository repoROles;

    public UsuariosController(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/usuarios")
    public List<Usuarios> buscarTodos() {
        return serviUsuarios.buscarTodos();
    }

    @PostMapping("/usuarios/registro-publico")
    public ResponseEntity<?> registroPublico(@RequestBody UsuariosDTO dto) {

        ResponseEntity<?> validacion = validarUsuario(dto, true);
        if (validacion != null) {
            return validacion;
        }

        if (serviUsuarios.existePorNombreusuario(dto.getNombreusuario())) {
            return ResponseEntity.badRequest().body("El nombre de usuario ya está registrado");
        }

        if (serviUsuarios.existePorCorreo(dto.getCorreo())) {
            return ResponseEntity.badRequest().body("El correo ya está registrado");
        }

        Usuarios usuario = new Usuarios();
        usuario.setNombre(dto.getNombre().trim());
        usuario.setNombreusuario(dto.getNombreusuario().trim());
        usuario.setCorreo(dto.getCorreo().trim());
        usuario.setTelefono(dto.getTelefono().trim());
        usuario.setContrasena(passwordEncoder.encode(dto.getContrasena()));

        Roles rolInvitado = repoROles.findByRolIgnoreCase("INVITADO")
                .orElseGet(() -> {
                    Roles nuevoRol = new Roles();
                    nuevoRol.setRol("INVITADO");
                    return repoROles.save(nuevoRol);
                });

        usuario.setIdrol(rolInvitado);

        return ResponseEntity.ok(serviUsuarios.guardar(usuario));
    }

    @PostMapping("/usuarios")
    public ResponseEntity<?> guardar(@RequestBody UsuariosDTO dto) {

        ResponseEntity<?> validacion = validarUsuario(dto, true);
        if (validacion != null) {
            return validacion;
        }

        if (dto.getIdrol() == null) {
            return ResponseEntity.badRequest().body("Debe seleccionar un rol");
        }

        if (serviUsuarios.existePorNombreusuario(dto.getNombreusuario())) {
            return ResponseEntity.badRequest().body("El nombre de usuario ya está registrado");
        }

        if (serviUsuarios.existePorCorreo(dto.getCorreo())) {
            return ResponseEntity.badRequest().body("El correo ya está registrado");
        }

        Roles rol = repoROles.findById(dto.getIdrol())
                .orElse(null);

        if (rol == null) {
            return ResponseEntity.badRequest().body("El rol seleccionado no existe");
        }

        Usuarios usuario = new Usuarios();
        usuario.setNombre(dto.getNombre().trim());
        usuario.setNombreusuario(dto.getNombreusuario().trim());
        usuario.setCorreo(dto.getCorreo().trim());
        usuario.setTelefono(dto.getTelefono().trim());
        usuario.setContrasena(passwordEncoder.encode(dto.getContrasena()));
        usuario.setIdrol(rol);

        return ResponseEntity.ok(serviUsuarios.guardar(usuario));
    }

    @PutMapping("/usuarios")
    public ResponseEntity<?> modificar(@RequestBody UsuariosDTO dto) {

        if (dto.getIdusuario() == null) {
            return ResponseEntity.badRequest().body("ID no existe");
        }

        ResponseEntity<?> validacion = validarUsuario(dto, false);
        if (validacion != null) {
            return validacion;
        }

        if (dto.getIdrol() == null) {
            return ResponseEntity.badRequest().body("Debe seleccionar un rol");
        }

        Roles rol = repoROles.findById(dto.getIdrol())
                .orElse(null);

        if (rol == null) {
            return ResponseEntity.badRequest().body("El rol seleccionado no existe");
        }

        Usuarios usuario = new Usuarios();
        usuario.setIdusuario(dto.getIdusuario());
        usuario.setNombre(dto.getNombre().trim());
        usuario.setNombreusuario(dto.getNombreusuario().trim());
        usuario.setCorreo(dto.getCorreo().trim());
        usuario.setTelefono(dto.getTelefono().trim());
        usuario.setIdrol(rol);

        if (dto.getContrasena() != null && !dto.getContrasena().isBlank()) {
            usuario.setContrasena(passwordEncoder.encode(dto.getContrasena()));
        }

        return ResponseEntity.ok(serviUsuarios.modificar(usuario));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        serviUsuarios.eliminar(id);
        return ResponseEntity.ok("Usuario eliminado correctamente");
    }

    private ResponseEntity<?> validarUsuario(UsuariosDTO dto, boolean validarContrasena) {

        if (dto.getNombre() == null || dto.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre es obligatorio");
        }

        if (dto.getNombreusuario() == null || dto.getNombreusuario().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre de usuario es obligatorio");
        }

        if (!dto.getNombreusuario().matches("^[a-zA-Z0-9._]{4,30}$")) {
            return ResponseEntity.badRequest().body("El usuario debe tener entre 4 y 30 caracteres. Solo letras, números, punto o guion bajo");
        }

        if (dto.getCorreo() == null || dto.getCorreo().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El correo es obligatorio");
        }

        if (!dto.getCorreo().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body("El correo no tiene un formato válido");
        }

        if (dto.getTelefono() == null || !dto.getTelefono().matches("\\d{9}")) {
            return ResponseEntity.badRequest().body("El teléfono debe tener exactamente 9 números");
        }

        if (validarContrasena) {
            if (dto.getContrasena() == null || dto.getContrasena().length() < 8) {
                return ResponseEntity.badRequest().body("La contraseña debe tener al menos 8 caracteres");
            }
        }

        return null;
    }
}