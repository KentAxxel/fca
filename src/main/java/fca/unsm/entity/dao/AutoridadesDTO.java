package fca.unsm.entity.dao;

import lombok.Data;

@Data

public class AutoridadesDTO {
    private Integer idautoridad;
    private String autoridad;
    private String correo;
    private String cargo;
    private String foto;
    private Integer deleted = 1;
}