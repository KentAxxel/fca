package fca.unsm.Service.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import fca.unsm.Service.IOfertaService;
import fca.unsm.entity.OfertaLaboral;
import fca.unsm.repository.OfertaLaboralRepository;

@Service

public class OfertaService implements IOfertaService {
    @Autowired
    private OfertaLaboralRepository repoOfertaLaboral;

    public List<OfertaLaboral> buscarTodos() {
        return repoOfertaLaboral.findAll();
    }

    public OfertaLaboral guardar(OfertaLaboral oferta) {
        return repoOfertaLaboral.save(oferta);
    }

    @Override
    public OfertaLaboral modificar(OfertaLaboral oferta) {

        OfertaLaboral existente = repoOfertaLaboral.findById(oferta.getIdoferta())
                .orElseThrow(() -> new RuntimeException("Oferta laboral no encontrada"));

        existente.setTitulo(oferta.getTitulo());
        existente.setDescripcion(oferta.getDescripcion());
        existente.setModalidad(oferta.getModalidad());
        existente.setFechalimite(oferta.getFechalimite());
        existente.setVacantes(oferta.getVacantes());
        existente.setSalario(oferta.getSalario());
        existente.setEstado(oferta.getEstado());
        existente.setUbicacion(oferta.getUbicacion());
        existente.setFechaPublicacion(oferta.getFechaPublicacion());
        existente.setIdempresa(oferta.getIdempresa());

        return repoOfertaLaboral.save(existente);
    }

    public Optional<OfertaLaboral> buscarPorId(Integer id) {
        return repoOfertaLaboral.findById(id);
    }

    public void eliminar(Integer id) {
        repoOfertaLaboral.deleteById(id);
    }
}
