package com.sms.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name="placement_readiness")
public class PlacementReadiness extends BaseEntity {
    @OneToOne(optional=false)
    @JoinColumn(name="student_id", unique=true)
    private Student student;

    @Column(name="aptitude_score", precision=5, scale=2)
    private BigDecimal aptitudeScore = BigDecimal.ZERO;

    @Column(name="dsa_score", precision=5, scale=2)
    private BigDecimal dsaScore = BigDecimal.ZERO;

    @Column(name="coding_score", precision=5, scale=2)
    private BigDecimal codingScore = BigDecimal.ZERO;

    @Column(name="communication_score", precision=5, scale=2)
    private BigDecimal communicationScore = BigDecimal.ZERO;

    @Column(name="resume_score", precision=5, scale=2)
    private BigDecimal resumeScore = BigDecimal.ZERO;

    @Column(name="skills_gap", length=2000)
    private String skillsGap;

    @Column(name="interview_probability", precision=5, scale=2)
    private BigDecimal interviewProbability = BigDecimal.ZERO;

    public PlacementReadiness() {}

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public BigDecimal getAptitudeScore() { return aptitudeScore; }
    public void setAptitudeScore(BigDecimal aptitudeScore) { this.aptitudeScore = aptitudeScore; }

    public BigDecimal getDsaScore() { return dsaScore; }
    public void setDsaScore(BigDecimal dsaScore) { this.dsaScore = dsaScore; }

    public BigDecimal getCodingScore() { return codingScore; }
    public void setCodingScore(BigDecimal codingScore) { this.codingScore = codingScore; }

    public BigDecimal getCommunicationScore() { return communicationScore; }
    public void setCommunicationScore(BigDecimal communicationScore) { this.communicationScore = communicationScore; }

    public BigDecimal getResumeScore() { return resumeScore; }
    public void setResumeScore(BigDecimal resumeScore) { this.resumeScore = resumeScore; }

    public String getSkillsGap() { return skillsGap; }
    public void setSkillsGap(String skillsGap) { this.skillsGap = skillsGap; }

    public BigDecimal getInterviewProbability() { return interviewProbability; }
    public void setInterviewProbability(BigDecimal interviewProbability) { this.interviewProbability = interviewProbability; }
}
