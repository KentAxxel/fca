package fca.unsm.controller;

import java.security.Principal;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;



@Controller
@RequestMapping("/fca/admin")

public class AdminVistasController {
    
    @GetMapping
    public String dashboard(Model model, Principal principal, Authentication authentication) {

        String username = principal != null ? principal.getName() : "Usuario";

        String rol = "SIN ROL";
        if (authentication != null && !authentication.getAuthorities().isEmpty()) {
            rol = authentication.getAuthorities()
                    .iterator()
                    .next()
                    .getAuthority()
                    .replace("ROLE_", "");
        }

        model.addAttribute("username", username);
        model.addAttribute("rol", rol);

        return "admin/dashboard";
    }

    @GetMapping("/inicio")
    public String dashboard() {
        return "admin/dashboard";
    }

    @GetMapping("/usuarios")
    public String usuarios() {
        return "admin/usuarios";
    }

    @GetMapping("/roles")
    public String roles() {
        return "admin/roles";
    }

    @GetMapping("/noticias")
    public String noticias() {
        return "admin/noticias";
    }

    @GetMapping("/eventos")
    public String eventos() {
        return "admin/eventos";
    }

    @GetMapping("/laboratorios")
    public String laboratorios() {
        return "admin/laboratorios";
    }

    @GetMapping("/ofertas")
    public String ofertas() {
        return "admin/ofertas";
    }
    @GetMapping("/autoridades")
    public String autoridades() {
        return "admin/autoridades";
    }
    @GetMapping("/comisiones")
    public String comisiones() {
        return "admin/comisiones";
    }
    @GetMapping("/empresas")
    public String empresas() {
        return "admin/empresas";
    }
}
