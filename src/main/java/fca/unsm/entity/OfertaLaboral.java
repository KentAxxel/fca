package fca.unsm.entity;

import java.sql.Date;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "ofertalaboral")
@SQLDelete(sql = "UPDATE oferta_laboral SET deleted = 0 WHERE idoferta = ?")
@Where(clause = "deleted = 1")
@Data

public class OfertaLaboral {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idempresa")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Empresas idempresa;

    public OfertaLaboral() {}
    public OfertaLaboral (Integer id){
        this.idoferta = id;
    }
}