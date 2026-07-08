package fca.unsm.Service.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import fca.unsm.Service.IEventosService;
import fca.unsm.entity.Eventos;
import fca.unsm.repository.EventosRepository;

@Service

public class EventosService implements IEventosService {
    @Autowired
    private EventosRepository repoEventos;

    public List<Eventos> buscarTodos() {
        return repoEventos.findAll();
    }

    public Eventos guardar(Eventos evento) {
        return repoEventos.save(evento);
    }

    @Override
    public Eventos modificar(Eventos evento) {

        Eventos existente = repoEventos.findById(evento.getIdevento())
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

        existente.setTitulo(evento.getTitulo());
        existente.setDescripcion(evento.getDescripcion());
        existente.setFecha(evento.getFecha());
        existente.setHora(evento.getHora());
        existente.setLugar(evento.getLugar());
        existente.setOrganizador(evento.getOrganizador());

        return repoEventos.save(existente);
    }

    public Optional<Eventos> buscarPorId(Integer id) {
        return repoEventos.findById(id);
    }

    public void eliminar(Integer id) {
        repoEventos.deleteById(id);
    }
}
