package com.sms.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity @Table(name="students")
public class Student extends BaseEntity {
    @OneToOne(optional=false) @JoinColumn(name="user_id", unique=true) private User user;
    @Column(nullable=false, unique=true, length=30) private String usn;
    @Column(nullable=false, length=120) private String name;
    private LocalDate dateOfBirth;
    @Column(length=20) private String phone;
    @Column(length=500) private String address;
    @ManyToOne(optional=false) @JoinColumn(name="department_id") private Department department;
    @Column(nullable=false) private Integer semester;
    @Column(name="previous_attendance") private Double previousAttendance = 85.0;
    @Column(name="previous_gpa") private Double previousGpa = 7.50;

    public Student() {}

    public Double getPreviousAttendance() { return previousAttendance; }
    public void setPreviousAttendance(Double previousAttendance) { this.previousAttendance = previousAttendance; }

    public Double getPreviousGpa() { return previousGpa; }
    public void setPreviousGpa(Double previousGpa) { this.previousGpa = previousGpa; }


    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getUsn() { return usn; }
    public void setUsn(String usn) { this.usn = usn; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
}
