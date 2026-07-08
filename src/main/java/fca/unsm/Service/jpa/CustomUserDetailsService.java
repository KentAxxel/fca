package fca.unsm.Service.jpa;

import java.util.Optional;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import fca.unsm.entity.Usuarios;
import fca.unsm.repository.UsuariosRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuariosRepository usuariosRepository;

    public CustomUserDetailsService(UsuariosRepository usuariosRepository) {
        this.usuariosRepository = usuariosRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Usuarios> usuarioOpt = usuariosRepository.findByNombreusuario(username);

        if (usuarioOpt.isEmpty()) {
            usuarioOpt = usuariosRepository.findByCorreo(username);
        }

        Usuarios usuario = usuarioOpt.orElseThrow(() ->
                new UsernameNotFoundException("Usuario no encontrado: " + username));

        String roleName = usuario.getIdrol() != null && usuario.getIdrol().getRol() != null
                ? usuario.getIdrol().getRol()
                : "USER";

        String authority = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName.toUpperCase();

        return User.withUsername(usuario.getNombreusuario())
                .password(usuario.getContrasena())
                .authorities(authority)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
