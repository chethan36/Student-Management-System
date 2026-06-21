package com.sms.entity;

import jakarta.persistence.*;

@Entity @Table(name="courses")
public class Course extends BaseEntity {
    @Column(nullable=false, unique=true, length=30) private String code;
    @Column(nullable=false, length=150) private String name;
    @Column(nullable=false) private Integer credits;
    @Column(nullable=false) private Integer semester;
    @ManyToOne(optional=false) @JoinColumn(name="department_id") private Department department;
    @ManyToOne @JoinColumn(name="faculty_id") private Faculty faculty;

    public Course() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public Faculty getFaculty() { return faculty; }
    public void setFaculty(Faculty faculty) { this.faculty = faculty; }
}
