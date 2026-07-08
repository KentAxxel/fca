package fca.unsm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import fca.unsm.entity.Eventos;

public interface EventosRepository extends JpaRepository<Eventos, Integer> {
    
}
