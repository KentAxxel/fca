package fca.unsm.Service;

import java.util.List;
import java.util.Optional;

import fca.unsm.entity.Usuarios;

public interface IUsuariosService {
    List<Usuarios> buscarTodos();

    Usuarios guardar(Usuarios usuario);

    Usuarios modificar(Usuarios usuario);

    Optional<Usuarios> buscarPorId(Integer id);

    void eliminar(Integer id);

    boolean existePorNombreusuario(String nombreusuario);

    boolean existePorCorreo(String correo);
}
