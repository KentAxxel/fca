package fca.unsm.Service.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import fca.unsm.Service.IUsuariosService;
import fca.unsm.entity.Usuarios;
import fca.unsm.repository.UsuariosRepository;

@Service

public class UsuariosService implements IUsuariosService {
    @Autowired
    private UsuariosRepository repoUsuarios;

    public List<Usuarios> buscarTodos() {
        return repoUsuarios.findAll();
    }

    public Usuarios guardar(Usuarios usuario) {
        return repoUsuarios.save(usuario);
    }

    @Override
    public Usuarios modificar(Usuarios usuario) {

        Usuarios existente = repoUsuarios.findById(usuario.getIdusuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        existente.setNombre(usuario.getNombre());
        existente.setNombreusuario(usuario.getNombreusuario());
        existente.setCorreo(usuario.getCorreo());
        existente.setTelefono(usuario.getTelefono());
        existente.setIdrol(usuario.getIdrol());

        if (usuario.getContrasena() != null && !usuario.getContrasena().isBlank()) {
            existente.setContrasena(usuario.getContrasena());
        }

        return repoUsuarios.save(existente);
    }

    public Optional<Usuarios> buscarPorId(Integer id) {
        return repoUsuarios.findById(id);
    }

    public void eliminar(Integer id) {
        repoUsuarios.deleteById(id);
    }

    @Override
    public boolean existePorNombreusuario(String nombreusuario) {
        return repoUsuarios.existsByNombreusuario(nombreusuario);
    }

    @Override
    public boolean existePorCorreo(String correo) {
        return repoUsuarios.existsByCorreo(correo);
    }
}
