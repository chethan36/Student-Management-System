package com.sms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name="assignments")
public class Assignment extends BaseEntity {
    @ManyToOne(optional=false)
    @JoinColumn(name="course_id")
    private Course course;

    @Column(nullable=false, length=150)
    private String title;

    @Column(length=1000)
    private String description;

    @Column(name="due_date")
    private LocalDate dueDate;

    @Column(name="max_score", nullable=false, precision=6, scale=2)
    private BigDecimal maxScore;

    public Assignment() {}

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public BigDecimal getMaxScore() { return maxScore; }
    public void setMaxScore(BigDecimal maxScore) { this.maxScore = maxScore; }
}
