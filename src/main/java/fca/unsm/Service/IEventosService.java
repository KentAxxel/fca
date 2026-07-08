package fca.unsm.Service;

import java.util.List;
import java.util.Optional;

import fca.unsm.entity.Eventos;

public interface IEventosService {
    List<Eventos> buscarTodos();
    Eventos guardar(Eventos evento);
    Eventos modificar(Eventos evento);
    Optional<Eventos> buscarPorId(Integer id);
    void eliminar(Integer id);
}
