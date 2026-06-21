package com.sms.entity;

import jakarta.persistence.*;

@Entity @Table(name="enrollments", uniqueConstraints=@UniqueConstraint(columnNames={"student_id","course_id"}))
public class Enrollment extends BaseEntity {
    @ManyToOne(optional=false) @JoinColumn(name="student_id") private Student student;
    @ManyToOne(optional=false) @JoinColumn(name="course_id") private Course course;
    @Column(nullable=false, length=20) private String academicYear;

    public Enrollment() {}

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
}
