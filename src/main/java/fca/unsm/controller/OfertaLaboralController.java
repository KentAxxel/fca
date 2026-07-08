package fca.unsm.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fca.unsm.Service.IOfertaService;
import fca.unsm.entity.Empresas;
import fca.unsm.entity.OfertaLaboral;
import fca.unsm.entity.dao.OfertaLaboralDTO;
import fca.unsm.repository.EmpresasRepository;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api")
public class OfertaLaboralController {

    @Autowired
    private IOfertaService serviOfertas;

    @Autowired
    private EmpresasRepository repoEmpresas;

    @GetMapping("/ofertas")
    public List<OfertaLaboral> buscarTodos() {
        return serviOfertas.buscarTodos();
    }

    @PostMapping("/ofertas")
    public ResponseEntity<?> guardar(@RequestBody OfertaLaboralDTO dto) {

        if (dto.getIdempresa() == null) {
            return ResponseEntity.badRequest().body("Debe seleccionar una empresa");
        }

        Empresas empresa = repoEmpresas.findById(dto.getIdempresa()).orElse(null);

        if (empresa == null) {
            return ResponseEntity.badRequest().body("La empresa seleccionada no existe");
        }

        OfertaLaboral oferta = new OfertaLaboral();
        oferta.setTitulo(dto.getTitulo());
        oferta.setDescripcion(dto.getDescripcion());
        oferta.setModalidad(dto.getModalidad());
        oferta.setFechalimite(dto.getFechalimite());
        oferta.setVacantes(dto.getVacantes());
        oferta.setSalario(dto.getSalario());
        oferta.setEstado(dto.getEstado());
        oferta.setUbicacion(dto.getUbicacion());
        oferta.setFechaPublicacion(dto.getFechaPublicacion());
        oferta.setIdempresa(empresa);

        return ResponseEntity.ok(serviOfertas.guardar(oferta));
    }

    @PutMapping("/ofertas")
    public ResponseEntity<?> modificar(@RequestBody OfertaLaboralDTO dto) {

        if (dto.getIdoferta() == null) {
            return ResponseEntity.badRequest().body("ID no existe");
        }

        if (dto.getIdempresa() == null) {
            return ResponseEntity.badRequest().body("Debe seleccionar una empresa");
        }

        Empresas empresa = repoEmpresas.findById(dto.getIdempresa()).orElse(null);

        if (empresa == null) {
            return ResponseEntity.badRequest().body("La empresa seleccionada no existe");
        }

        OfertaLaboral oferta = new OfertaLaboral();
        oferta.setIdoferta(dto.getIdoferta());
        oferta.setTitulo(dto.getTitulo());
        oferta.setDescripcion(dto.getDescripcion());
        oferta.setModalidad(dto.getModalidad());
        oferta.setFechalimite(dto.getFechalimite());
        oferta.setVacantes(dto.getVacantes());
        oferta.setSalario(dto.getSalario());
        oferta.setEstado(dto.getEstado());
        oferta.setUbicacion(dto.getUbicacion());
        oferta.setFechaPublicacion(dto.getFechaPublicacion());
        oferta.setIdempresa(empresa);

        return ResponseEntity.ok(serviOfertas.modificar(oferta));
    }

    @GetMapping("/ofertas/{id}")
    public Optional<OfertaLaboral> buscarPorId(@PathVariable("id") Integer id) {
        return serviOfertas.buscarPorId(id);
    }

    @DeleteMapping("/ofertas/{id}")
    public String eliminar(@PathVariable Integer id) {
        serviOfertas.eliminar(id);
        return "Registro eliminado correctamente";
    }
}
