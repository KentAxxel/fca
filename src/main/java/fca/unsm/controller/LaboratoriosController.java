package fca.unsm.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import fca.unsm.Service.ILaboratoriosService;
import fca.unsm.entity.Laboratorios;
import fca.unsm.entity.dao.LaboratoriosDTO;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api")

public class LaboratoriosController {
    @Autowired
    private ILaboratoriosService serviLaboratorios;

    @GetMapping("/laboratorios")
    public List<Laboratorios> buscarTodos() {
        return serviLaboratorios.buscarTodos();
    }

    @PostMapping("/laboratorios")
    public ResponseEntity<?> guardar(@RequestBody LaboratoriosDTO dto) {

        Laboratorios lab = new Laboratorios();
        lab.setNombrelaboratorio(dto.getNombrelaboratorio());
        lab.setDescripcion(dto.getDescripcion());
        lab.setUbicacion(dto.getUbicacion());
        lab.setImagen(dto.getImagen());

        return ResponseEntity.ok(serviLaboratorios.guardar(lab));
    }

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/laboratorios/subir-imagen")
    public ResponseEntity<?> subirImagen(@RequestParam("imagen") MultipartFile imagen) {

        if (imagen.isEmpty()) {
            return ResponseEntity.badRequest().body("Debe seleccionar una imagen");
        }

        String contentType = imagen.getContentType();

        if (contentType == null ||
                !(contentType.equals("image/jpeg")
                        || contentType.equals("image/png")
                        || contentType.equals("image/webp"))) {
            return ResponseEntity.badRequest().body("Solo se permiten imágenes JPG, PNG o WEBP");
        }

        long maxSize = 10 * 1024 * 1024;

        if (imagen.getSize() > maxSize) {
            return ResponseEntity.badRequest().body("La imagen no debe superar los 10 MB");
        }

        try {
            String nombreOriginal = imagen.getOriginalFilename();
            String extension = "";

            if (nombreOriginal != null && nombreOriginal.contains(".")) {
                extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
            }

            String nombreArchivo = UUID.randomUUID().toString() + extension;

            Path carpeta = Paths.get(uploadDir,"laboratorios");

            if (!Files.exists(carpeta)) {
                Files.createDirectories(carpeta);
            }

            Path rutaArchivo = carpeta.resolve(nombreArchivo);

            Files.copy(imagen.getInputStream(), rutaArchivo);

            String rutaPublica = "/uploads/laboratorios/" + nombreArchivo;

            return ResponseEntity.ok(rutaPublica);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error al subir la imagen");
        }
    }

    @PutMapping("/laboratorios")
    public ResponseEntity<?> modificar(@RequestBody LaboratoriosDTO dto) {

        if (dto.getIdlaboratorio() == null) {
            return ResponseEntity.badRequest().body("ID no existe");
        }

        Laboratorios lab = new Laboratorios();
        lab.setIdlaboratorio(dto.getIdlaboratorio());
        lab.setNombrelaboratorio(dto.getNombrelaboratorio());
        lab.setDescripcion(dto.getDescripcion());
        lab.setUbicacion(dto.getUbicacion());
        lab.setImagen(dto.getImagen());

        return ResponseEntity.ok(serviLaboratorios.modificar(lab));
    }

    @GetMapping("/laboratorios/{id}")
    public Optional<Laboratorios> buscarPorId(@PathVariable("id") Integer id) {
        return serviLaboratorios.buscarPorId(id);
    }

    @DeleteMapping("/laboratorios/{id}")
    public String eliminar(@PathVariable Integer id) {
        serviLaboratorios.eliminar(id);
        return "Registro eliminado correctamente";
    }
}
