package com.sms.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity @Table(name="attendance", uniqueConstraints=@UniqueConstraint(columnNames={"enrollment_id","attendance_date"}))
public class Attendance extends BaseEntity {
    @ManyToOne(optional=false) @JoinColumn(name="enrollment_id") private Enrollment enrollment;
    @Column(name="attendance_date", nullable=false) private LocalDate date;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=10) private Status status;

    public enum Status { PRESENT, ABSENT }

    public Attendance() {}

    public Enrollment getEnrollment() { return enrollment; }
    public void setEnrollment(Enrollment enrollment) { this.enrollment = enrollment; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
