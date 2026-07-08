package fca.unsm.Service;

import java.util.List;
import java.util.Optional;

import fca.unsm.entity.Comisiones;

public interface IComisionesService {
    List<Comisiones> buscarTodos();
    Comisiones guardar(Comisiones comision);
    Comisiones modificar(Comisiones comision);
    Optional<Comisiones> buscarPorId(Integer id);
    void eliminar(Integer id);
}
