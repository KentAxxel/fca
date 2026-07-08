package fca.unsm.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import fca.unsm.entity.Empresas;

public interface EmpresasRepository extends JpaRepository<Empresas, Integer> {
    
}
