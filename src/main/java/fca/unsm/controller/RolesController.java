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

import fca.unsm.Service.IRolesService;
import fca.unsm.entity.Roles;
import fca.unsm.entity.dao.RolesDTO;

@RestController
@RequestMapping("/api")

public class RolesController {
    @Autowired
    private IRolesService serviRroles;

    @GetMapping("/roles")
    public List<Roles> buscarTodos() {
        return serviRroles.buscarTodos();
    }

    @PostMapping("/roles")
    public ResponseEntity<?> guardar(@RequestBody RolesDTO dto) {

        Roles rol  = new Roles();
        rol.setRol(dto.getRol());

        return ResponseEntity.ok(serviRroles.guardar(rol));
    }

    @PutMapping("/roles")
    public ResponseEntity<?> modificar(@RequestBody RolesDTO dto) {
        
        if (dto.getIdrol() == null) {
            return ResponseEntity.badRequest().body("ID no existe");
        }

        Roles rol  = new Roles();
        rol.setIdrol(dto.getIdrol());
        rol.setRol(dto.getRol());
        
        return ResponseEntity.ok(serviRroles.modificar(rol));
    }

    @GetMapping("/roles/{id}")
    public Optional<Roles> buscarPorId(@PathVariable("id") Integer id) {
        return serviRroles.buscarPorId(id);
    }

    @DeleteMapping("/roles/{id}")
    public String eliminar(@PathVariable Integer id){
        serviRroles.eliminar(id);
        return "Registro eliminado correctamente";
    }
}
