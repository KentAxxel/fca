package fca.unsm.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import fca.unsm.entity.Usuarios;

public interface UsuariosRepository extends JpaRepository<Usuarios, Integer> {
    Optional<Usuarios> findByNombreusuario(String nombreusuario);

    Optional<Usuarios> findByCorreo(String correo);

    boolean existsByNombreusuario(String nombreusuario);

    boolean existsByCorreo(String correo);
}
