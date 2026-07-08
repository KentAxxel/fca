package fca.unsm.config;

import fca.unsm.entity.Roles;
import fca.unsm.entity.Usuarios;
import fca.unsm.repository.RolesRepository;
import fca.unsm.repository.UsuariosRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UsuariosRepository usuariosRepository;
    private final RolesRepository rolesRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.init:false}")
    private boolean crearAdmin;

    public AdminInitializer(
            UsuariosRepository usuariosRepository,
            RolesRepository rolesRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuariosRepository = usuariosRepository;
        this.rolesRepository = rolesRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {

        if (!crearAdmin) {
            return;
        }

        String nombreUsuario = "AdminFCA";

        boolean existeAdmin = usuariosRepository.existsByNombreusuario(nombreUsuario);

        if (existeAdmin) {
            System.out.println("El usuario AdminFCA ya existe. No se creó nuevamente.");
            return;
        }

        Roles rolAdmin = rolesRepository.findByRolIgnoreCase("ADMIN")
                .orElseGet(() -> {
                    Roles nuevoRol = new Roles();
                    nuevoRol.setRol("ADMIN");
                    return rolesRepository.save(nuevoRol);
                });

        Usuarios admin = new Usuarios();
        admin.setNombre("Administrador FCA");
        admin.setNombreusuario(nombreUsuario);
        admin.setCorreo("adminfca@unsm.edu.pe");
        admin.setTelefono("900000000");
        admin.setContrasena(passwordEncoder.encode("adminfca2026."));
        admin.setIdrol(rolAdmin);

        usuariosRepository.save(admin);

        System.out.println("Usuario AdminFCA creado correctamente.");
    }
}