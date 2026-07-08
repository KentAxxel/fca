package fca.unsm.Service;

import java.util.List;
import java.util.Optional;

import fca.unsm.entity.Noticias;

public interface INoticiasService {
    List<Noticias> buscarTodos();
    Noticias guardar(Noticias noticia);
    Noticias modificar(Noticias noticia);
    Optional<Noticias> buscarPorId(Integer id);
    void eliminar(Integer id);
}