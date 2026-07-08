package fca.unsm.Service;

import java.util.List;
import java.util.Optional;

import fca.unsm.entity.Autoridades;

public interface IAutoridadesService {
    List<Autoridades> buscarTodos();
    Autoridades guardar(Autoridades autoridad);
    Autoridades modificar(Autoridades autoridad);
    Optional<Autoridades> buscarPorId(Integer id);
    void eliminar(Integer id);
}
