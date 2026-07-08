package fca.unsm.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fca.unsm.Service.INoticiasService;
import fca.unsm.entity.Noticias;
import fca.unsm.entity.dao.NoticiasDTO;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api")

public class NoticiasController {
    @Autowired
    private INoticiasService serviNoticias;

    @GetMapping("/noticias")
    public List<Noticias> buscarTodos() {
        return serviNoticias.buscarTodos();
    }

    @PostMapping("/noticias")
    public ResponseEntity<?> guardar(@RequestBody NoticiasDTO dto) {

        Noticias noticia = new Noticias();
        noticia.setTitulo(dto.getTitulo());
        noticia.setResumen(dto.getResumen());
        noticia.setContenido(dto.getContenido());
        noticia.setFecha(dto.getFecha());
        noticia.setImagen(dto.getImagen());
        noticia.setAutor(dto.getAutor());

        return ResponseEntity.ok(serviNoticias.guardar(noticia));
    }

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/noticias/subir-imagen")
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

            Path carpeta = Paths.get(uploadDir, "noticias");

            if (!Files.exists(carpeta)) {
                Files.createDirectories(carpeta);
            }

            Path rutaArchivo = carpeta.resolve(nombreArchivo);

            Files.copy(imagen.getInputStream(), rutaArchivo);

            String rutaPublica = "/uploads/noticias/" + nombreArchivo;

            return ResponseEntity.ok(rutaPublica);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error al subir la imagen");
        }
    }

    @PutMapping("/noticias")
    public ResponseEntity<?> modificar(@RequestBody NoticiasDTO dto) {

        if (dto.getIdnoticia() == null) {
            return ResponseEntity.badRequest().body("ID no existe");
        }

        Noticias noticia = new Noticias();
        noticia.setIdnoticia(dto.getIdnoticia());
        noticia.setTitulo(dto.getTitulo());
        noticia.setResumen(dto.getResumen());
        noticia.setContenido(dto.getContenido());
        noticia.setFecha(dto.getFecha());
        noticia.setImagen(dto.getImagen());
        noticia.setAutor(dto.getAutor());

        return ResponseEntity.ok(serviNoticias.modificar(noticia));
    }

    @GetMapping("/noticias/{id}")
    public Optional<Noticias> buscarPorId(@PathVariable("id") Integer id) {
        return serviNoticias.buscarPorId(id);
    }

    @DeleteMapping("/noticias/{id}")
    public String eliminar(@PathVariable Integer id) {
        serviNoticias.eliminar(id);
        return "Registro eliminado correctamente";
    }
}
