package fca.unsm.Service.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import fca.unsm.Service.IComisionesService;
import fca.unsm.entity.Comisiones;
import fca.unsm.repository.ComisionesRepository;

@Service

public class ComisionesService implements IComisionesService {
    @Autowired
    private ComisionesRepository repoComisiones;

    public List<Comisiones> buscarTodos() {
        return repoComisiones.findAll();
    }

    public Comisiones guardar(Comisiones comision) {
        return repoComisiones.save(comision);
    }

    @Override
    public Comisiones modificar(Comisiones comision) {

        Comisiones existente = repoComisiones.findById(comision.getIdcomision())
                .orElseThrow(() -> new RuntimeException("Comisión no encontrada"));

        existente.setNombrecomision(comision.getNombrecomision());
        existente.setDescripcion(comision.getDescripcion());
        existente.setIdautoridad(comision.getIdautoridad());

        return repoComisiones.save(existente);
    }

    public Optional<Comisiones> buscarPorId(Integer id) {
        return repoComisiones.findById(id);
    }

    public void eliminar(Integer id) {
        repoComisiones.deleteById(id);
    }
}
