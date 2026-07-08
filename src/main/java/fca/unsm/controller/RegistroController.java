package fca.unsm.controller;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import fca.unsm.Service.IUsuariosService;
import fca.unsm.entity.dao.UsuariosDTO;
import fca.unsm.repository.RolesRepository;

@Controller
@RequestMapping("/api")
public class RegistroController {

    private final IUsuariosService serviUsuarios;
    private final RolesRepository repoRoles;
    private final PasswordEncoder passwordEncoder;

    public RegistroController(
            IUsuariosService serviUsuarios,
            RolesRepository repoRoles,
            PasswordEncoder passwordEncoder
    ) {
        this.serviUsuarios = serviUsuarios;
        this.repoRoles = repoRoles;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/registro")
    public String mostrarRegistro(Model model) {
        model.addAttribute("usuario", new UsuariosDTO());
        return "registro";
    }
}