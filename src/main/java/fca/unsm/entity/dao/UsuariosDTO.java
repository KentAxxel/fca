package fca.unsm.entity.dao;

import lombok.Data;

@Data

public class UsuariosDTO {
    private Integer idusuario;
    private String nombre;
    private String nombreusuario;
    private String correo;
    private String telefono;
    private String contrasena;
    private Integer deleted = 1;
    private Integer idrol;
}