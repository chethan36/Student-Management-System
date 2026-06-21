CREATE TABLE users (id BIGINT AUTO_INCREMENT PRIMARY KEY,email VARCHAR(120) NOT NULL UNIQUE,password VARCHAR(255) NOT NULL,role VARCHAR(20) NOT NULL,enabled BOOLEAN NOT NULL DEFAULT TRUE,created_at TIMESTAMP(6) NOT NULL,updated_at TIMESTAMP(6) NOT NULL);
CREATE TABLE departments (id BIGINT AUTO_INCREMENT PRIMARY KEY,code VARCHAR(20) NOT NULL UNIQUE,name VARCHAR(120) NOT NULL UNIQUE,created_at TIMESTAMP(6) NOT NULL,updated_at TIMESTAMP(6) NOT NULL);
CREATE TABLE students (id BIGINT AUTO_INCREMENT PRIMARY KEY,user_id BIGINT NOT NULL UNIQUE,usn VARCHAR(30) NOT NULL UNIQUE,name VARCHAR(120) NOT NULL,date_of_birth DATE,phone VARCHAR(20),address VARCHAR(500),department_id BIGINT NOT NULL,semester INT NOT NULL,previous_attendance DECIMAL(5,2) DEFAULT 85.00,previous_gpa DECIMAL(3,2) DEFAULT 7.50,created_at TIMESTAMP(6) NOT NULL,updated_at TIMESTAMP(6) NOT NULL,CONSTRAINT fk_student_user FOREIGN KEY(user_id) REFERENCES users(id),CONSTRAINT fk_student_dept FOREIGN KEY(department_id) REFERENCES departments(id));
CREATE TABLE faculty (id BIGINT AUTO_INCREMENT PRIMARY KEY,user_id BIGINT NOT NULL UNIQUE,employee_id VARCHAR(30) NOT NULL UNIQUE,name VARCHAR(120) NOT NULL,phone VARCHAR(20),designation VARCHAR(120),department_id BIGINT NOT NULL,created_at TIMESTAMP(6) NOT NULL,updated_at TIMESTAMP(6) NOT NULL,CONSTRAINT fk_faculty_user FOREIGN KEY(user_id) REFERENCES users(id),CONSTRAINT fk_faculty_dept FOREIGN KEY(department_id) REFERENCES departments(id));
CREATE TABLE courses (id BIGINT AUTO_INCREMENT PRIMARY KEY,code VARCHAR(30) NOT NULL UNIQUE,name VARCHAR(150) NOT NULL,credits INT NOT NULL,semester INT NOT NULL,department_id BIGINT NOT NULL,faculty_id BIGINT,created_at TIMESTAMP(6) NOT NULL,updated_at TIMESTAMP(6) NOT NULL,CONSTRAINT fk_course_dept FOREIGN KEY(department_id) REFERENCES departments(id),CONSTRAINT fk_course_faculty FOREIGN KEY(faculty_id) REFERENCES faculty(id) ON DELETE SET NULL);
CREATE TABLE enrollments (id BIGINT AUTO_INCREMENT PRIMARY KEY,student_id BIGINT NOT NULL,course_id BIGINT NOT NULL,academic_year VARCHAR(20) NOT NULL,created_at TIMESTAMP(6) NOT NULL,updated_at TIMESTAMP(6) NOT NULL,UNIQUE KEY uk_enrollment(student_id,course_id),CONSTRAINT fk_enrollment_student FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,CONSTRAINT fk_enrollment_course FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE);
CREATE TABLE attendance (id BIGINT AUTO_INCREMENT PRIMARY KEY,enrollment_id BIGINT NOT NULL,attendance_date DATE NOT NULL,status VARCHAR(10) NOT NULL,created_at TIMESTAMP(6) NOT NULL,updated_at TIMESTAMP(6) NOT NULL,UNIQUE KEY uk_attendance(enrollment_id,attendance_date),CONSTRAINT fk_attendance_enrollment FOREIGN KEY(enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE);
CREATE TABLE marks (id BIGINT AUTO_INCREMENT PRIMARY KEY,enrollment_id BIGINT NOT NULL,assessment VARCHAR(50) NOT NULL,score DECIMAL(6,2) NOT NULL,max_score DECIMAL(6,2) NOT NULL,grade VARCHAR(5),created_at TIMESTAMP(6) NOT NULL,updated_at TIMESTAMP(6) NOT NULL,UNIQUE KEY uk_mark(enrollment_id,assessment),CONSTRAINT fk_mark_enrollment FOREIGN KEY(enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE);
CREATE TABLE notifications (id BIGINT AUTO_INCREMENT PRIMARY KEY,user_id BIGINT NOT NULL,message VARCHAR(500) NOT NULL,type VARCHAR(20) NOT NULL,is_read BOOLEAN NOT NULL DEFAULT FALSE,created_at TIMESTAMP(6) NOT NULL,updated_at TIMESTAMP(6) NOT NULL,CONSTRAINT fk_notification_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
CREATE INDEX idx_students_name ON students(name);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);

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


