package fca.unsm.Service.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import fca.unsm.Service.INoticiasService;
import fca.unsm.entity.Noticias;
import fca.unsm.repository.NoticiasRepository;

@Service

public class NoticiasService implements INoticiasService {
    @Autowired
    private NoticiasRepository repoNoticias;

    public List<Noticias> buscarTodos() {
        return repoNoticias.findAll();
    }

    public Noticias guardar(Noticias noticia) {
        return repoNoticias.save(noticia);
    }

    @Override
    public Noticias modificar(Noticias noticia) {

        Noticias existente = repoNoticias.findById(noticia.getIdnoticia())
                .orElseThrow(() -> new RuntimeException("Noticia no encontrada"));

        existente.setTitulo(noticia.getTitulo());
        existente.setResumen(noticia.getResumen());
        existente.setContenido(noticia.getContenido());
        existente.setFecha(noticia.getFecha());
        existente.setImagen(noticia.getImagen());
        existente.setAutor(noticia.getAutor());

        return repoNoticias.save(existente);
    }

    public Optional<Noticias> buscarPorId(Integer id) {
        return repoNoticias.findById(id);
    }

    public void eliminar(Integer id) {
        repoNoticias.deleteById(id);
    }
}
