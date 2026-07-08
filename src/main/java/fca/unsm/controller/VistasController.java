package fca.unsm.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/fca")

public class VistasController {

    @GetMapping("/login")
    public String login() {
        return "public/login";
    }

    @GetMapping("/inicio")
    public String inicio() {
        return "public/principal";
    }

    @GetMapping("/registro")
    public String registro() {
        return "public/registro";
    }

    @GetMapping("/acceso-denegado")
    public String accesoDenegado() {
        return "public/denegado";
    }

    @GetMapping("/confirmacion")
    public String esperaConfirmacion() {
        return "public/confirmacion";
    }

    @GetMapping("/autoridades")
    public String autoridadesPublicas() {
        return "public/autoridades";
    }

    @GetMapping("/noticias")
    public String noticiasPublicas() {
        return "public/noticias";
    }

    @GetMapping("/eventos")
    public String eventosPublicos() {
        return "public/eventos";
    }

    @GetMapping("/laboratorios")
    public String laboratoriosPublicos() {
        return "public/laboratorios";
    }

    @GetMapping("/comisiones")
    public String comisionesPublicas() {
        return "public/comisiones";
    }

    @GetMapping("/bolsa-laboral")
    public String bolsaLaboralPublica() {
        return "public/ofertas";
    }

    @GetMapping("/empresas")
    public String empresasPublicas() {
        return "public/empresas";
    }
}
