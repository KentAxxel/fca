package fca.unsm.Service.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import fca.unsm.Service.IAutoridadesService;
import fca.unsm.entity.Autoridades;
import fca.unsm.repository.AutoridadesRepository;

@Service

public class AutoridadesService implements IAutoridadesService {

    @Autowired
    private AutoridadesRepository repoAutoridades;

    public List<Autoridades> buscarTodos() {
        return repoAutoridades.findAll();
    }

    public Autoridades guardar(Autoridades autoridad) {
        return repoAutoridades.save(autoridad);
    }

    @Override
    public Autoridades modificar(Autoridades autoridad) {

        Autoridades existente = repoAutoridades.findById(autoridad.getIdautoridad())
                .orElseThrow(() -> new RuntimeException("Autoridad no encontrada"));

        existente.setAutoridad(autoridad.getAutoridad());
        existente.setCargo(autoridad.getCargo());
        existente.setCorreo(autoridad.getCorreo());
        existente.setFoto(autoridad.getFoto());

        return repoAutoridades.save(existente);
    }

    public Optional<Autoridades> buscarPorId(Integer id) {
        return repoAutoridades.findById(id);
    }

    public void eliminar(Integer id) {
        repoAutoridades.deleteById(id);
    }
}
