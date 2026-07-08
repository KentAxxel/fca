package fca.unsm.config;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fca.unsm.entity.Usuarios;
import fca.unsm.repository.UsuariosRepository;

@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuariosRepository usuariosRepository;

    public UsuarioDetailsService(UsuariosRepository usuariosRepository) {
        this.usuariosRepository = usuariosRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Usuarios usuario = usuariosRepository.findByNombreusuario(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        String rol = usuario.getIdrol().getRol().trim().toUpperCase();

        if (!rol.startsWith("ROLE_")) {
            rol = "ROLE_" + rol;
        }

        return User.builder()
                .username(usuario.getNombreusuario())
                .password(usuario.getContrasena())
                .authorities(rol)
                .build();
    }
}