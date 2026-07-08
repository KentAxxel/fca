package fca.unsm.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fca.unsm.Service.IAutoridadesService;
import fca.unsm.entity.Autoridades;
import fca.unsm.entity.dao.AutoridadesDTO;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AutoridadesController {

    @Autowired
    private IAutoridadesService serviAutoridades;

    @GetMapping("/autoridades")
    public List<Autoridades> buscarTodos() {
        return serviAutoridades.buscarTodos();
    }

    @PostMapping("/autoridades")
    public ResponseEntity<?> guardar(@RequestBody AutoridadesDTO dto) {

        ResponseEntity<?> validacion = validarAutoridad(dto, false);
        if (validacion != null) {
            return validacion;
        }

        Autoridades autoridad = new Autoridades();
        autoridad.setAutoridad(dto.getAutoridad().trim());
        autoridad.setCorreo(dto.getCorreo().trim());
        autoridad.setCargo(dto.getCargo().trim());
        autoridad.setFoto(dto.getFoto());

        return ResponseEntity.ok(serviAutoridades.guardar(autoridad));
    }

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/autoridades/subir-foto")
    public ResponseEntity<?> subirFoto(@RequestParam("foto") MultipartFile foto) {

        if (foto.isEmpty()) {
            return ResponseEntity.badRequest().body("Debe seleccionar una imagen");
        }

        String contentType = foto.getContentType();

        if (contentType == null ||
                !(contentType.equals("image/jpeg")
                        || contentType.equals("image/png")
                        || contentType.equals("image/webp"))) {
            return ResponseEntity.badRequest().body("Solo se permiten imágenes JPG, PNG o WEBP");
        }

        long maxSize = 10 * 1024 * 1024;

        if (foto.getSize() > maxSize) {
            return ResponseEntity.badRequest().body("La imagen no debe superar los 2 MB");
        }

        try {
            String nombreOriginal = foto.getOriginalFilename();
            String extension = "";

            if (nombreOriginal != null && nombreOriginal.contains(".")) {
                extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
            }

            String nombreArchivo = UUID.randomUUID().toString() + extension;

            Path carpeta = Paths.get(uploadDir, "autoridades");

            if (!Files.exists(carpeta)) {
                Files.createDirectories(carpeta);
            }

            Path rutaArchivo = carpeta.resolve(nombreArchivo);

            Files.copy(foto.getInputStream(), rutaArchivo);

            String rutaPublica = "/uploads/autoridades/" + nombreArchivo;

            return ResponseEntity.ok(rutaPublica);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error al subir la imagen");
        }
    }

    @PutMapping("/autoridades")
    public ResponseEntity<?> modificar(@RequestBody AutoridadesDTO dto) {

        if (dto.getIdautoridad() == null) {
            return ResponseEntity.badRequest().body("ID no existe");
        }

        ResponseEntity<?> validacion = validarAutoridad(dto, true);
        if (validacion != null) {
            return validacion;
        }

        Autoridades autoridad = new Autoridades();
        autoridad.setIdautoridad(dto.getIdautoridad());
        autoridad.setAutoridad(dto.getAutoridad().trim());
        autoridad.setCorreo(dto.getCorreo().trim());
        autoridad.setCargo(dto.getCargo().trim());
        autoridad.setFoto(dto.getFoto());

        return ResponseEntity.ok(serviAutoridades.modificar(autoridad));
    }

    @GetMapping("/autoridades/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable("id") Integer id) {
        Optional<Autoridades> autoridad = serviAutoridades.buscarPorId(id);

        if (autoridad.isEmpty()) {
            return ResponseEntity.badRequest().body("Autoridad no encontrada");
        }

        return ResponseEntity.ok(autoridad.get());
    }

    @DeleteMapping("/autoridades/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        serviAutoridades.eliminar(id);
        return ResponseEntity.ok("Registro eliminado correctamente");
    }

    private ResponseEntity<?> validarAutoridad(AutoridadesDTO dto, boolean editando) {

        if (dto.getAutoridad() == null || dto.getAutoridad().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre de la autoridad es obligatorio");
        }

        if (dto.getAutoridad().trim().length() < 3) {
            return ResponseEntity.badRequest().body("El nombre debe tener al menos 3 caracteres");
        }

        if (dto.getCargo() == null || dto.getCargo().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El cargo es obligatorio");
        }

        if (dto.getCorreo() == null || dto.getCorreo().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El correo es obligatorio");
        }

        if (!dto.getCorreo().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body("El correo no tiene un formato válido");
        }

        return null;
    }
}