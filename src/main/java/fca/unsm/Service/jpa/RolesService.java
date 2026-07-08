package fca.unsm.Service.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import fca.unsm.Service.IRolesService;
import fca.unsm.entity.Roles;
import fca.unsm.repository.RolesRepository;

@Service

public class RolesService implements IRolesService{
    @Autowired
    private RolesRepository repoRoles;

    public List<Roles> buscarTodos(){
        return repoRoles.findAll();
    }
    public Roles guardar(Roles rol){
        return repoRoles.save(rol);
    }
    public Roles modificar(Roles rol){
        return repoRoles.save(rol);
    }
    public Optional<Roles> buscarPorId(Integer id){
        return repoRoles.findById(id);
    }
    public void eliminar(Integer id){
        repoRoles.deleteById(id);
    }
}
