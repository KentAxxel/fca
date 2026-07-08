package fca.unsm.Service;

import java.util.List;
import java.util.Optional;

import fca.unsm.entity.Laboratorios;

public interface ILaboratoriosService {
    List<Laboratorios> buscarTodos();
    Laboratorios guardar(Laboratorios laboratorio);
    Laboratorios modificar(Laboratorios laboratorio);
    Optional<Laboratorios> buscarPorId(Integer id);
    void eliminar(Integer id);
}