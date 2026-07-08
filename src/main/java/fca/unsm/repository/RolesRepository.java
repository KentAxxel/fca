package fca.unsm.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import fca.unsm.entity.Roles;

public interface RolesRepository extends JpaRepository<Roles, Integer> {
    Optional<Roles> findByRolIgnoreCase(String rol);
}
