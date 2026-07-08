package fca.unsm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import fca.unsm.entity.Laboratorios;

public interface LaboratoriosRepository extends JpaRepository<Laboratorios, Integer> {
    
}
