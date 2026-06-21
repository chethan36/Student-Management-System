package com.sms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity @Table(name="departments")
public class Department extends BaseEntity {
    @NotBlank @Column(nullable=false, unique=true, length=20) private String code;
    @NotBlank @Column(nullable=false, unique=true, length=120) private String name;

    public Department() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
