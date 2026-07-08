package fca.unsm.entity.dao;

import java.sql.Date;

import lombok.Data;

@Data

public class OfertaLaboralDTO {
    private Integer idoferta;
    private String titulo;
    private String descripcion;
    private String modalidad; //nose
    private Date fechalimite;
    private Integer vacantes;
    private Double salario;
    private String estado;
    private String ubicacion;
    private String fechaPublicacion;
    private Integer deleted = 1;
    private Integer idempresa;
}
