package fca.unsm.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fca.unsm.Service.IEventosService;
import fca.unsm.entity.Eventos;
import fca.unsm.entity.dao.EventosDTO;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api")

public class EventosController {
    @Autowired
    private IEventosService serviEventos;

    @GetMapping("/eventos")
    public List<Eventos> buscarTodos () {
        return serviEventos.buscarTodos();
    }

    @PostMapping("/eventos")
    public ResponseEntity<?> guardar(@RequestBody EventosDTO dto) {

        Eventos evento  = new Eventos();
        evento.setTitulo(dto.getTitulo());
        evento.setDescripcion(dto.getDescripcion());
        evento.setFecha(dto.getFecha());
        evento.setHora(dto.getHora());
        evento.setLugar(dto.getLugar());
        evento.setOrganizador(dto.getOrganizador());

        return ResponseEntity.ok(serviEventos.guardar(evento));
    }

    @PutMapping("/eventos")
    public ResponseEntity<?> modificar(@RequestBody EventosDTO dto) {
        
        if (dto.getIdevento() == null) {
            return ResponseEntity.badRequest().body("ID no existe");
        }

        Eventos evento = new Eventos();
        evento.setIdevento(dto.getIdevento());
        evento.setTitulo(dto.getTitulo());
        evento.setDescripcion(dto.getDescripcion());
        evento.setFecha(dto.getFecha());
        evento.setHora(dto.getHora());
        evento.setLugar(dto.getLugar());
        evento.setOrganizador(dto.getOrganizador());
        
        return ResponseEntity.ok(serviEventos.modificar(evento));
    }

    @GetMapping("/eventos/{id}")
    public Optional<Eventos> buscarPorId(@PathVariable("id") Integer id) {
        return serviEventos.buscarPorId(id);
    }

    @DeleteMapping("/eventos/{id}")
    public String eliminar(@PathVariable Integer id){
        serviEventos.eliminar(id);
        return "Registro eliminado correctamente";
    }
}
