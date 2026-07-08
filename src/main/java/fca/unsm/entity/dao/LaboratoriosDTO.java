package fca.unsm.entity.dao;

import lombok.Data;

@Data

public class LaboratoriosDTO {
    private Integer idlaboratorio;
    private String nombrelaboratorio;
    private String descripcion;
    private String ubicacion;
    private String imagen;
    private Integer deleted = 1;
}