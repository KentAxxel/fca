package fca.unsm.entity;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "laboratorios")
@SQLDelete(sql = "UPDATE laboratorios SET deleted = 0 WHERE idlaboratorio = ?")
@Where(clause = "deleted = 1")
@Data

public class Laboratorios {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    
    private Integer idlaboratorio;
    private String nombrelaboratorio;
    private String descripcion;
    private String ubicacion;
    private String imagen;
    private Integer deleted = 1;

    public Laboratorios() {}
    public Laboratorios (Integer id){
        this.idlaboratorio = id;
    }
}