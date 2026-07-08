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
@Table(name = "empresas")
@SQLDelete(sql = "UPDATE empresas SET deleted = 0 WHERE idempresa = ?")
@Where(clause = "deleted = 1")
@Data

public class Empresas {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    
    private Integer idempresa;
    private String nombreempresa;
    private String ruc;
    private String correo;
    private String direccion;
    private String telefono;
    private String rubro;
    private String logo;
    private Integer deleted = 1;

    public Empresas() {}
    public Empresas (Integer id){
        this.idempresa = id;
    }
}