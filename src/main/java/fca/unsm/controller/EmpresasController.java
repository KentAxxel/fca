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

import fca.unsm.Service.IEmpresasService;
import fca.unsm.entity.Empresas;
import fca.unsm.entity.dao.EmpresasDTO;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api")

public class EmpresasController {
    @Autowired
    private IEmpresasService serviEmpresas;

    @GetMapping("/empresas")
    public List<Empresas> buscarTodos() {
        return serviEmpresas.buscarTodos();
    }

    @PostMapping("/empresas")
    public ResponseEntity<?> guardar(@RequestBody EmpresasDTO dto) {

        Empresas empresa = new Empresas();
        empresa.setNombreempresa(dto.getNombreempresa());
        empresa.setRuc(dto.getRuc());
        empresa.setCorreo(dto.getCorreo());
        empresa.setDireccion(dto.getDireccion());
        empresa.setTelefono(dto.getTelefono());
        empresa.setRubro(dto.getRubro());
        empresa.setLogo(dto.getLogo());

        return ResponseEntity.ok(serviEmpresas.guardar(empresa));
    }

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/empresas/subir-logo")
    public ResponseEntity<?> subirLogo(@RequestParam("logo") MultipartFile logo) {

        if (logo.isEmpty()) {
            return ResponseEntity.badRequest().body("Debe seleccionar una imagen");
        }

        String contentType = logo.getContentType();

        if (contentType == null ||
                !(contentType.equals("image/jpeg")
                        || contentType.equals("image/png")
                        || contentType.equals("image/webp"))) {
            return ResponseEntity.badRequest().body("Solo se permiten imágenes JPG, PNG o WEBP");
        }

        long maxSize = 10 * 1024 * 1024;

        if (logo.getSize() > maxSize) {
            return ResponseEntity.badRequest().body("La imagen no debe superar los 10 MB");
        }

        try {
            String nombreOriginal = logo.getOriginalFilename();
            String extension = "";

            if (nombreOriginal != null && nombreOriginal.contains(".")) {
                extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
            }

            String nombreArchivo = UUID.randomUUID().toString() + extension;

            Path carpeta = Paths.get(uploadDir,"empresas");

            if (!Files.exists(carpeta)) {
                Files.createDirectories(carpeta);
            }

            Path rutaArchivo = carpeta.resolve(nombreArchivo);

            Files.copy(logo.getInputStream(), rutaArchivo);

            String rutaPublica = "/uploads/empresas/" + nombreArchivo;

            return ResponseEntity.ok(rutaPublica);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Error al subir el logo");
        }
    }

    @PutMapping("/empresas")
    public ResponseEntity<?> modificar(@RequestBody EmpresasDTO dto) {

        if (dto.getIdempresa() == null) {
            return ResponseEntity.badRequest().body("ID no existe");
        }

        Empresas empresa = new Empresas();
        empresa.setIdempresa(dto.getIdempresa());
        empresa.setNombreempresa(dto.getNombreempresa());
        empresa.setRuc(dto.getRuc());
        empresa.setCorreo(dto.getCorreo());
        empresa.setDireccion(dto.getDireccion());
        empresa.setTelefono(dto.getTelefono());
        empresa.setRubro(dto.getRubro());
        empresa.setLogo(dto.getLogo());

        return ResponseEntity.ok(serviEmpresas.modificar(empresa));
    }

    @GetMapping("/empresas/{id}")
    public Optional<Empresas> buscarPorId(@PathVariable("id") Integer id) {
        return serviEmpresas.buscarPorId(id);
    }

    @DeleteMapping("/empresas/{id}")
    public String eliminar(@PathVariable Integer id) {
        serviEmpresas.eliminar(id);
        return "Registro eliminado correctamente";
    }
}
