package fca.unsm.entity.dao;

import java.sql.Date;

import lombok.Data;

@Data

public class NoticiasDTO {
    private Integer idnoticia;
    private String titulo;
    private String resumen;
    private String contenido;
    private Date fecha;
    private String imagen;
    private String autor;
    private String enlaces;
    private Integer deleted = 1;
}
