INSERT INTO departments(code,name,created_at,updated_at) VALUES ('CSE','Computer Science and Engineering',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),('ECE','Electronics and Communication',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO users(email,password,role,enabled,created_at,updated_at) VALUES
('admin@sms.local','$2a$10$HW4MHBMT4NMEUdAMlOosFON6gnboLGaEQ5wQyhg9qkPacGXOTPKxO','ADMIN',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('faculty@sms.local','$2a$10$HW4MHBMT4NMEUdAMlOosFON6gnboLGaEQ5wQyhg9qkPacGXOTPKxO','FACULTY',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('student@sms.local','$2a$10$HW4MHBMT4NMEUdAMlOosFON6gnboLGaEQ5wQyhg9qkPacGXOTPKxO','STUDENT',TRUE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO faculty(user_id,employee_id,name,phone,designation,department_id,created_at,updated_at) SELECT u.id,'FAC001','Dr. Ananya Rao','9876543210','Associate Professor',d.id,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM users u JOIN departments d ON d.code='CSE' WHERE u.email='faculty@sms.local';
INSERT INTO students(user_id,usn,name,date_of_birth,phone,address,department_id,semester,previous_attendance,previous_gpa,created_at,updated_at) SELECT u.id,'1MS23CS001','Aarav Sharma',DATE '2005-03-12','9876500001','Bengaluru',d.id,3,87.50,8.20,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM users u JOIN departments d ON d.code='CSE' WHERE u.email='student@sms.local';
INSERT INTO courses(code,name,credits,semester,department_id,faculty_id,created_at,updated_at) SELECT 'CS301','Data Structures',4,3,d.id,f.id,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM departments d JOIN faculty f ON f.department_id=d.id WHERE d.code='CSE';
INSERT INTO enrollments(student_id,course_id,academic_year,created_at,updated_at) SELECT s.id,c.id,'2025-26',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM students s JOIN courses c ON c.code='CS301' WHERE s.usn='1MS23CS001';
INSERT INTO attendance(enrollment_id,attendance_date,status,created_at,updated_at) SELECT id,CURRENT_DATE,'PRESENT',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM enrollments FETCH FIRST 1 ROW ONLY;
INSERT INTO marks(enrollment_id,assessment,score,max_score,grade,created_at,updated_at) SELECT id,'Internal 1',42,50,'A',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM enrollments FETCH FIRST 1 ROW ONLY;
INSERT INTO notifications(user_id,message,type,is_read,created_at,updated_at) SELECT u.id,'Your overall attendance is currently at 87.5%. Keep it up!','INFO',FALSE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM users u WHERE u.email='student@sms.local';
INSERT INTO notifications(user_id,message,type,is_read,created_at,updated_at) SELECT u.id,'Assignment 1 is due next week. Ensure submission is on time!','WARNING',FALSE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM users u WHERE u.email='student@sms.local';

-- Seed assignments
INSERT INTO assignments(course_id,title,description,due_date,max_score,created_at,updated_at)
SELECT c.id, 'Implementation of Binary Search Tree', 'Implement standard insertion, deletion, and search algorithms for a Binary Search Tree (BST) in Java.', CURRENT_DATE + 5, 100.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM courses c WHERE c.code='CS301';

INSERT INTO assignments(course_id,title,description,due_date,max_score,created_at,updated_at)
SELECT c.id, 'Graph Algorithms - BFS & DFS', 'Implement Breadth-First Search (BFS) and Depth-First Search (DFS) traversal on an adjacency list graph.', CURRENT_DATE + 12, 100.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM courses c WHERE c.code='CS301';

-- Seed submissions
INSERT INTO assignment_submissions(assignment_id,student_id,file_path,score,feedback,improvement_suggestions,similarity_score,status,created_at,updated_at)
SELECT a.id, s.id, 'bst.java', 92.50, 'Excellent implementation of BST operations with proper indentation and naming conventions.', 'Optimize the delete recursive stack by replacing it with iteration if memory footprint is key.', 11.20, 'EVALUATED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM assignments a JOIN students s ON s.usn='1MS23CS001' WHERE a.title='Implementation of Binary Search Tree';

-- Seed placement readiness
INSERT INTO placement_readiness(student_id,aptitude_score,dsa_score,coding_score,communication_score,resume_score,skills_gap,interview_probability,created_at,updated_at)
SELECT s.id, 82.50, 85.00, 88.00, 78.00, 80.00, 'Focus on Low-Level Design patterns and System Design concepts. Practice more DP problems.', 84.50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM students s WHERE s.usn='1MS23CS001';


