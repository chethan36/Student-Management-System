package com.sms.entity;

import jakarta.persistence.*;

@Entity @Table(name="faculty")
public class Faculty extends BaseEntity {
    @OneToOne(optional=false) @JoinColumn(name="user_id", unique=true) private User user;
    @Column(nullable=false, unique=true, length=30) private String employeeId;
    @Column(nullable=false, length=120) private String name;
    @Column(length=20) private String phone;
    @Column(length=120) private String designation;
    @ManyToOne(optional=false) @JoinColumn(name="department_id") private Department department;

    public Faculty() {}

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
}
