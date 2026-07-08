package fca.unsm.entity.dao;

import lombok.Data;

@Data

public class EmpresasDTO {
    private Integer idempresa;
    private String nombreempresa;
    private String ruc;
    private String correo;
    private String direccion;
    private String telefono;
    private String rubro;
    private String logo;
    private Integer deleted = 1;

}