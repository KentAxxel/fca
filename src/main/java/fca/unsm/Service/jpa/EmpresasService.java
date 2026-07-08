package fca.unsm.Service.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import fca.unsm.Service.IEmpresasService;
import fca.unsm.entity.Empresas;
import fca.unsm.repository.EmpresasRepository;

@Service

public class EmpresasService implements IEmpresasService {
    @Autowired
    private EmpresasRepository repoEmpresas;

    public List<Empresas> buscarTodos() {
        return repoEmpresas.findAll();
    }

    public Empresas guardar(Empresas empresa) {
        return repoEmpresas.save(empresa);
    }

    @Override
    public Empresas modificar(Empresas empresa) {

        Empresas existente = repoEmpresas.findById(empresa.getIdempresa())
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        existente.setNombreempresa(empresa.getNombreempresa());
        existente.setRuc(empresa.getRuc());
        existente.setCorreo(empresa.getCorreo());
        existente.setDireccion(empresa.getDireccion());
        existente.setTelefono(empresa.getTelefono());
        existente.setRubro(empresa.getRubro());
        existente.setLogo(empresa.getLogo());

        return repoEmpresas.save(existente);
    }

    public Optional<Empresas> buscarPorId(Integer id) {
        return repoEmpresas.findById(id);
    }

    public void eliminar(Integer id) {
        repoEmpresas.deleteById(id);
    }
}
