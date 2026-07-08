package fca.unsm.entity;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "roles")
@SQLDelete(sql = "UPDATE roles SET deleted = 0 WHERE idrol = ?")
@Where(clause = "deleted = 1")
@Data

public class Roles {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    
    private int idrol;
    private String rol;
    private Integer deleted = 1;

    public Roles() {}
    public Roles (Integer id){
        this.idrol = id;
    }
}