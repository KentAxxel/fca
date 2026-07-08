package fca.unsm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import fca.unsm.entity.Noticias;

public interface NoticiasRepository extends JpaRepository<Noticias, Integer> {
    
}
