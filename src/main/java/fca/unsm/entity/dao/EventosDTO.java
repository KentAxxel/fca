package fca.unsm.entity.dao;

import java.sql.Date;
import java.sql.Time;

import lombok.Data;

@Data

public class EventosDTO {
    private Integer idevento;
    private String titulo;
    private String descripcion;
    private Date fecha;
    private Time hora;
    private String lugar;
    private String organizador;
    private Integer deleted = 1;
}