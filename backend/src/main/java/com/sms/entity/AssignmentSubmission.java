package com.sms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name="assignment_submissions")
public class AssignmentSubmission extends BaseEntity {
    @ManyToOne(optional=false)
    @JoinColumn(name="assignment_id")
    private Assignment assignment;

    @ManyToOne(optional=false)
    @JoinColumn(name="student_id")
    private Student student;

    @Column(name="file_path", length=255)
    private String filePath;

    @Column(precision=6, scale=2)
    private BigDecimal score;

    @Column(length=2000)
    private String feedback;

    @Column(name="improvement_suggestions", length=2000)
    private String improvementSuggestions;

    @Column(name="similarity_score", precision=5, scale=2)
    private BigDecimal similarityScore;

    @Column(nullable=false, length=20)
    private String status = "PENDING"; // PENDING, EVALUATED

    public AssignmentSubmission() {}

    public Assignment getAssignment() { return assignment; }
    public void setAssignment(Assignment assignment) { this.assignment = assignment; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public BigDecimal getScore() { return score; }
    public void setScore(BigDecimal score) { this.score = score; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getImprovementSuggestions() { return improvementSuggestions; }
    public void setImprovementSuggestions(String improvementSuggestions) { this.improvementSuggestions = improvementSuggestions; }

    public BigDecimal getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(BigDecimal similarityScore) { this.similarityScore = similarityScore; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
