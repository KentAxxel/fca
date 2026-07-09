package fca.unsm.entity;

import java.sql.Date;
import java.sql.Time;
import java.time.LocalTime;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "eventos")
@SQLDelete(sql = "UPDATE eventos SET deleted = 0 WHERE idevento = ?")
@Where(clause = "deleted = 1")
@Data

public class Eventos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    
    private Integer idevento;
    private String titulo;
    private String descripcion;
    private Date fecha;
    private LocalTime hora;
    private String lugar;
    private String organizador;
    private Integer deleted = 1;

    public Eventos() {}
    public Eventos (Integer id){
        this.idevento = id;
    }
}