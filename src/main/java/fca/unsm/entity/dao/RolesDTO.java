package fca.unsm.entity.dao;

import lombok.Data;

@Data

public class RolesDTO {
    private Integer idrol;
    private String rol;
    private Integer deleted = 1;
}