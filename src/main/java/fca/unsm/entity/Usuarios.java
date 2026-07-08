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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "usuarios")
@SQLDelete(sql = "UPDATE usuarios SET deleted = 0 WHERE idusuario = ?")
@Where(clause = "deleted = 1")
@Data
public class Usuarios {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idusuario;

    private String nombre;
    private String nombreusuario;
    private String correo;
    private String telefono;
    private String contrasena;
    private Integer deleted = 1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idrol")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Roles idrol;
}