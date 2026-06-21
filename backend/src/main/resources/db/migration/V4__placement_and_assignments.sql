-- Add previous_gpa to students
ALTER TABLE students ADD COLUMN previous_gpa DECIMAL(3,2) DEFAULT 7.50;

-- Create assignments table
CREATE TABLE assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(1000),
    due_date DATE,
    max_score DECIMAL(6,2) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_assignment_course FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create assignment submissions table
CREATE TABLE assignment_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    file_path VARCHAR(255),
    score DECIMAL(6,2),
    feedback VARCHAR(2000),
    improvement_suggestions VARCHAR(2000),
    similarity_score DECIMAL(5,2),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_submission_assignment FOREIGN KEY(assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_student FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create placement readiness table
CREATE TABLE placement_readiness (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE,
    aptitude_score DECIMAL(5,2) DEFAULT 0.00,
    dsa_score DECIMAL(5,2) DEFAULT 0.00,
    coding_score DECIMAL(5,2) DEFAULT 0.00,
    communication_score DECIMAL(5,2) DEFAULT 0.00,
    resume_score DECIMAL(5,2) DEFAULT 0.00,
    skills_gap VARCHAR(2000),
    interview_probability DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_placement_student FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
);
