package com.sms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name="marks", uniqueConstraints=@UniqueConstraint(columnNames={"enrollment_id","assessment"}))
public class Mark extends BaseEntity {
    @ManyToOne(optional=false) @JoinColumn(name="enrollment_id") private Enrollment enrollment;
    @Column(nullable=false, length=50) private String assessment;
    @Column(nullable=false, precision=6, scale=2) private BigDecimal score;
    @Column(nullable=false, precision=6, scale=2) private BigDecimal maxScore;
    @Column(length=5) private String grade;

    public Mark() {}

    public Enrollment getEnrollment() { return enrollment; }
    public void setEnrollment(Enrollment enrollment) { this.enrollment = enrollment; }

    public String getAssessment() { return assessment; }
    public void setAssessment(String assessment) { this.assessment = assessment; }

    public BigDecimal getScore() { return score; }
    public void setScore(BigDecimal score) { this.score = score; }

    public BigDecimal getMaxScore() { return maxScore; }
    public void setMaxScore(BigDecimal maxScore) { this.maxScore = maxScore; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
}
