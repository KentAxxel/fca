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
@Table(name = "autoridades")
@SQLDelete(sql = "UPDATE autoridades SET deleted = 0 WHERE idautoridad = ?")
@Where(clause = "deleted = 1")
@Data

public class Autoridades {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Integer idautoridad;
    private String autoridad;
    private String correo;
    private String cargo;
    private String foto;
    private Integer deleted = 1;

    public Autoridades() {}

    public Autoridades (Integer id){
        this.idautoridad = id;
    }
}