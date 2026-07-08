package fca.unsm.entity;

import java.sql.Date;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "noticias")
@SQLDelete(sql = "UPDATE noticias SET deleted = 0 WHERE idnoticia = ?")
@Where(clause = "deleted = 1")
@Data

public class Noticias {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Integer idnoticia;
    private String titulo;
    private String resumen;
    private String contenido;
    private Date fecha;
    private String imagen;
    private String autor;
    private String enlaces;
    private Integer deleted = 1;

    public Noticias() {}
    public Noticias (Integer id){
        this.idnoticia = id;
    }
}