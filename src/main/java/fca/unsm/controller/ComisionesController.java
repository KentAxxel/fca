package fca.unsm.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fca.unsm.Service.IComisionesService;
import fca.unsm.entity.Autoridades;
import fca.unsm.entity.Comisiones;
import fca.unsm.entity.dao.ComisionesDTO;
import fca.unsm.repository.AutoridadesRepository;

@RestController
@RequestMapping("/api")
public class ComisionesController {

    @Autowired
    private IComisionesService serviComisiones;

    @Autowired
    private AutoridadesRepository repoAutoridades;

    @GetMapping("/comisiones")
    public List<Comisiones> buscarTodos() {
        return serviComisiones.buscarTodos();
    }

    @PostMapping("/comisiones")
    public ResponseEntity<?> guardar(@RequestBody ComisionesDTO dto) {

        if (dto.getNombrecomision() == null || dto.getNombrecomision().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre de la comisión es obligatorio");
        }

        if (dto.getDescripcion() == null || dto.getDescripcion().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("La descripción es obligatoria");
        }

        if (dto.getIdautoridad() == null) {
            return ResponseEntity.badRequest().body("Debe seleccionar una autoridad responsable");
        }

        Autoridades autoridad = repoAutoridades.findById(dto.getIdautoridad())
                .orElse(null);

        if (autoridad == null) {
            return ResponseEntity.badRequest().body("La autoridad seleccionada no existe");
        }

        Comisiones comision = new Comisiones();
        comision.setNombrecomision(dto.getNombrecomision().trim());
        comision.setDescripcion(dto.getDescripcion().trim());
        comision.setIdautoridad(autoridad);

        return ResponseEntity.ok(serviComisiones.guardar(comision));
    }

    @PutMapping("/comisiones")
    public ResponseEntity<?> modificar(@RequestBody ComisionesDTO dto) {

        if (dto.getIdcomision() == null) {
            return ResponseEntity.badRequest().body("ID no existe");
        }

        if (dto.getNombrecomision() == null || dto.getNombrecomision().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre de la comisión es obligatorio");
        }

        if (dto.getDescripcion() == null || dto.getDescripcion().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("La descripción es obligatoria");
        }

        if (dto.getIdautoridad() == null) {
            return ResponseEntity.badRequest().body("Debe seleccionar una autoridad responsable");
        }

        Autoridades autoridad = repoAutoridades.findById(dto.getIdautoridad())
                .orElse(null);

        if (autoridad == null) {
            return ResponseEntity.badRequest().body("La autoridad seleccionada no existe");
        }

        Comisiones comision = new Comisiones();
        comision.setIdcomision(dto.getIdcomision());
        comision.setNombrecomision(dto.getNombrecomision().trim());
        comision.setDescripcion(dto.getDescripcion().trim());
        comision.setIdautoridad(autoridad);

        return ResponseEntity.ok(serviComisiones.modificar(comision));
    }

    @GetMapping("/comisiones/{id}")
    public Optional<Comisiones> buscarPorId(@PathVariable("id") Integer id) {
        return serviComisiones.buscarPorId(id);
    }

    @DeleteMapping("/comisiones/{id}")
    public String eliminar(@PathVariable Integer id) {
        serviComisiones.eliminar(id);
        return "Registro eliminado correctamente";
    }
}