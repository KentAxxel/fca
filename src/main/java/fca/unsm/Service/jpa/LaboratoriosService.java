package fca.unsm.Service.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import fca.unsm.Service.ILaboratoriosService;
import fca.unsm.entity.Laboratorios;
import fca.unsm.repository.LaboratoriosRepository;

@Service

public class LaboratoriosService implements ILaboratoriosService {
    @Autowired
    private LaboratoriosRepository repoLaboratorios;

    public List<Laboratorios> buscarTodos() {
        return repoLaboratorios.findAll();
    }

    public Laboratorios guardar(Laboratorios laboratorio) {
        return repoLaboratorios.save(laboratorio);
    }

    @Override
    public Laboratorios modificar(Laboratorios laboratorio) {

        Laboratorios existente = repoLaboratorios.findById(laboratorio.getIdlaboratorio())
                .orElseThrow(() -> new RuntimeException("Laboratorio no encontrado"));

        existente.setNombrelaboratorio(laboratorio.getNombrelaboratorio());
        existente.setDescripcion(laboratorio.getDescripcion());
        existente.setUbicacion(laboratorio.getUbicacion());
        existente.setImagen(laboratorio.getImagen());

        return repoLaboratorios.save(existente);
    }

    public Optional<Laboratorios> buscarPorId(Integer id) {
        return repoLaboratorios.findById(id);
    }

    public void eliminar(Integer id) {
        repoLaboratorios.deleteById(id);
    }
}
