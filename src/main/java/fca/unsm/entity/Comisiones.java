package fca.unsm.entity;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "comisiones")
@SQLDelete(sql = "UPDATE comisiones SET deleted = 0 WHERE idcomision = ?")
@Where(clause = "deleted = 1")
@Data

public class Comisiones {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Integer idcomision;
    private String nombrecomision;
    private String descripcion;
    private Integer deleted = 1;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idautoridad")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    public Autoridades idautoridad;

    public Comisiones() {}
    public Comisiones (Integer id){
        this.idcomision = id;
    }
}