package fca.unsm.entity.dao;

import lombok.Data;

@Data

public class ComisionesDTO {
    private Integer idcomision;
    private String nombrecomision;
    private String descripcion;
    private Integer deleted = 1;
    private Integer idautoridad;
}