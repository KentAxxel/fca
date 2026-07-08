package fca.unsm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import fca.unsm.entity.Comisiones;

public interface ComisionesRepository extends JpaRepository<Comisiones, Integer> {
    
}
