package fca.unsm.Service;

import java.util.List;
import java.util.Optional;

import fca.unsm.entity.OfertaLaboral;

public interface IOfertaService {
    List<OfertaLaboral> buscarTodos();
    OfertaLaboral guardar(OfertaLaboral oferta);
    OfertaLaboral modificar(OfertaLaboral oferta);
    Optional<OfertaLaboral> buscarPorId(Integer id);
    void eliminar(Integer id);
}
