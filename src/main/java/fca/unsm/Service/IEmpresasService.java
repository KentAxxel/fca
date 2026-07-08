package fca.unsm.Service;

import java.util.List;
import java.util.Optional;

import fca.unsm.entity.Empresas;

public interface IEmpresasService {
    List<Empresas> buscarTodos();
    Empresas guardar(Empresas empresa);
    Empresas modificar(Empresas empresa);
    Optional<Empresas> buscarPorId(Integer id);
    void eliminar(Integer id);
}
