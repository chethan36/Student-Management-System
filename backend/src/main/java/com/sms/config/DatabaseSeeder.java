package com.sms.config;

import com.sms.entity.*;
import com.sms.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarkRepository markRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final PlacementReadinessRepository placementReadinessRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository uR, DepartmentRepository dR, FacultyRepository fR,
                          StudentRepository sR, CourseRepository cR, EnrollmentRepository eR,
                          AttendanceRepository aR, MarkRepository mR, AssignmentRepository asR,
                          AssignmentSubmissionRepository asSR, PlacementReadinessRepository pR,
                          NotificationRepository nR, PasswordEncoder pE) {
        this.userRepository = uR;
        this.departmentRepository = dR;
        this.facultyRepository = fR;
        this.studentRepository = sR;
        this.courseRepository = cR;
        this.enrollmentRepository = eR;
        this.attendanceRepository = aR;
        this.markRepository = mR;
        this.assignmentRepository = asR;
        this.assignmentSubmissionRepository = asSR;
        this.placementReadinessRepository = pR;
        this.notificationRepository = nR;
        this.passwordEncoder = pE;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (studentRepository.count() > 10) {
            System.out.println("Database already seeded with demo accounts. Skipping automatic seed.");
            return;
        }

        System.out.println("No demo accounts found. Seeding campus management system database...");

        // 1. Clean Database (proper foreign-key order)
        notificationRepository.deleteAllInBatch();
        placementReadinessRepository.deleteAllInBatch();
        assignmentSubmissionRepository.deleteAllInBatch();
        assignmentRepository.deleteAllInBatch();
        markRepository.deleteAllInBatch();
        attendanceRepository.deleteAllInBatch();
        enrollmentRepository.deleteAllInBatch();
        courseRepository.deleteAllInBatch();
        studentRepository.deleteAllInBatch();
        facultyRepository.deleteAllInBatch();
        departmentRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();

        // Passwords
        String pwHash = passwordEncoder.encode("password");

        // 2. Create Admin Account
        User adminUser = new User();
        adminUser.setEmail("admin@sms.local");
        adminUser.setPassword(pwHash);
        adminUser.setRole(Role.ADMIN);
        adminUser.setEnabled(true);
        userRepository.save(adminUser);

        // 3. Seed Departments
        Department cse = new Department();
        cse.setCode("CSE");
        cse.setName("Computer Science and Engineering");
        departmentRepository.save(cse);

        Department aiml = new Department();
        aiml.setCode("AIML");
        aiml.setName("Artificial Intelligence and Machine Learning");
        departmentRepository.save(aiml);

        // 4. Seed Faculty (20 members)
        List<Faculty> facultyList = new ArrayList<>();
        
        // Demo Faculty
        User demoFacultyUser = new User();
        demoFacultyUser.setEmail("faculty@sms.local");
        demoFacultyUser.setPassword(pwHash);
        demoFacultyUser.setRole(Role.FACULTY);
        demoFacultyUser.setEnabled(true);
        userRepository.save(demoFacultyUser);

        Faculty demoFaculty = new Faculty();
        demoFaculty.setUser(demoFacultyUser);
        demoFaculty.setEmployeeId("FAC001");
        demoFaculty.setName("Dr. Rajesh Kumar");
        demoFaculty.setPhone("9876543201");
        demoFaculty.setDesignation("Professor & Head");
        demoFaculty.setDepartment(cse);
        facultyRepository.save(demoFaculty);
        facultyList.add(demoFaculty);

        String[] facultyFirstNames = {"Amit", "Sanjay", "Meera", "Vikram", "Rohan", "Sunita", "Deepak", "Anjali", "Ramesh", "Kiran"};
        String[] facultyLastNames = {"Sharma", "Joshi", "Nair", "Rao", "Patel", "Singh", "Gupta", "Bose", "Mehta", "Iyer"};

        for (int i = 2; i <= 20; i++) {
            User fUser = new User();
            fUser.setEmail("faculty" + i + "@sms.local");
            fUser.setPassword(pwHash);
            fUser.setRole(Role.FACULTY);
            fUser.setEnabled(true);
            userRepository.save(fUser);

            Faculty f = new Faculty();
            f.setUser(fUser);
            f.setEmployeeId("FAC0" + (i < 10 ? "0" + i : i));
            f.setName("Dr. " + facultyFirstNames[i % facultyFirstNames.length] + " " + facultyLastNames[i % facultyLastNames.length]);
            f.setPhone("98765432" + (i < 10 ? "0" + i : i));
            f.setDesignation(i % 3 == 0 ? "Professor" : (i % 3 == 1 ? "Associate Professor" : "Assistant Professor"));
            f.setDepartment(i <= 10 ? cse : aiml);
            facultyRepository.save(f);
            facultyList.add(f);
        }

        // 5. Seed Courses (5 courses)
        Course ds = new Course();
        ds.setCode("CS301");
        ds.setName("Data Structures");
        ds.setCredits(4);
        ds.setSemester(3);
        ds.setDepartment(cse);
        ds.setFaculty(demoFaculty); // assign demo faculty to Data Structures
        courseRepository.save(ds);

        Course java = new Course();
        java.setCode("CS302");
        java.setName("Java Programming");
        java.setCredits(4);
        java.setSemester(3);
        java.setDepartment(cse);
        java.setFaculty(facultyList.get(1)); // FAC002
        courseRepository.save(java);

        Course dbms = new Course();
        dbms.setCode("CS401");
        dbms.setName("DBMS");
        dbms.setCredits(4);
        dbms.setSemester(4);
        dbms.setDepartment(cse);
        dbms.setFaculty(facultyList.get(2)); // FAC003
        courseRepository.save(dbms);

        Course python = new Course();
        python.setCode("AI201");
        python.setName("Python Programming");
        python.setCredits(3);
        python.setSemester(2);
        python.setDepartment(aiml);
        python.setFaculty(facultyList.get(10)); // FAC011
        courseRepository.save(python);

        Course ml = new Course();
        ml.setCode("AI601");
        ml.setName("Machine Learning");
        ml.setCredits(4);
        ml.setSemester(6);
        ml.setDepartment(aiml);
        ml.setFaculty(facultyList.get(11)); // FAC012
        courseRepository.save(ml);

        // Seed Course Assignments
        List<Course> coursesList = List.of(ds, java, dbms, python, ml);
        Map<Course, List<Assignment>> courseAssignmentsMap = new HashMap<>();

        for (Course c : coursesList) {
            List<Assignment> list = new ArrayList<>();
            
            Assignment a1 = new Assignment();
            a1.setCourse(c);
            a1.setTitle("Assignment 1 - Fundamentals");
            a1.setDescription("Covers basic logic and implementation of " + c.getName() + " concepts.");
            a1.setDueDate(LocalDate.now().plusDays(5));
            a1.setMaxScore(BigDecimal.valueOf(100.00));
            assignmentRepository.save(a1);
            list.add(a1);

            Assignment a2 = new Assignment();
            a2.setCourse(c);
            a2.setTitle("Assignment 2 - Practical Applications");
            a2.setDescription("Hands-on laboratory design challenge using standard tools for " + c.getName() + ".");
            a2.setDueDate(LocalDate.now().plusDays(15));
            a2.setMaxScore(BigDecimal.valueOf(100.00));
            assignmentRepository.save(a2);
            list.add(a2);

            courseAssignmentsMap.put(c, list);
        }

        // Names list for students
        String[] firstNames = {
            "Aarav", "Vihaan", "Aditya", "Arjun", "Sai", "Ishaan", "Ananya", "Diya", "Riya", "Shruti",
            "Sneha", "Rahul", "Rohan", "Tanvi", "Neha", "Preeti", "Karan", "Siddharth", "Pooja", "Aryan",
            "Kabir", "Meera", "Zara", "Dev", "Alok", "Nikhil", "Shreya", "Kriti", "Gaurav", "Nisha",
            "Pranav", "Maya", "Yash", "Ishita", "Rudra", "Sanjana", "Madhav", "Komal", "Rishi", "Snehal"
        };
        String[] lastNames = {
            "Sharma", "Verma", "Kumar", "Patel", "Reddy", "Nair", "Iyer", "Joshi", "Rao", "Shetty",
            "Gupta", "Singh", "Das", "Choudhury", "Bose", "Pillai", "Mehta", "Sen", "Menon", "Prasad",
            "Dubey", "Dwivedi", "Mishra", "Pandey", "Shukla", "Trivedi", "Pathak", "Chatterjee", "Mukherjee", "Banerjee"
        };

        Random rand = new Random(42); // Seed to make random values deterministic & reproducible

        // 6. Seed Students (300 total)
        for (int i = 1; i <= 300; i++) {
            User studentUser = new User();
            if (i == 1) {
                studentUser.setEmail("student@sms.local");
            } else {
                studentUser.setEmail("student" + i + "@sms.local");
            }
            studentUser.setPassword(pwHash);
            studentUser.setRole(Role.STUDENT);
            studentUser.setEnabled(true);
            userRepository.save(studentUser);

            // Determine semester and department
            int semester;
            Department dept;
            if (i <= 75) {
                semester = 2;
                dept = aiml;
            } else if (i <= 150) {
                semester = 3;
                dept = cse;
            } else if (i <= 225) {
                semester = 4;
                dept = cse;
            } else {
                semester = 6;
                dept = aiml;
            }

            // Generate USN
            String usnPrefix = (semester == 6) ? "1MS22" : ((semester == 4 || semester == 3) ? "1MS23" : "1MS24");
            String deptCode = dept.getCode();
            String usnSuffix = String.format("%03d", i);
            String usn = usnPrefix + deptCode + usnSuffix;

            // Generate name
            String firstName = firstNames[rand.nextInt(firstNames.length)];
            String lastName = lastNames[rand.nextInt(lastNames.length)];
            String name = firstName + " " + lastName;

            Student student = new Student();
            student.setUser(studentUser);
            student.setUsn(usn);
            student.setName(name);
            student.setDateOfBirth(LocalDate.of(2002 + (6 - semester) / 2, 1 + rand.nextInt(12), 1 + rand.nextInt(28)));
            student.setPhone("9876500" + String.format("%03d", i));
            student.setAddress(deptCode.equals("CSE") ? "Bengaluru, Karnataka" : "Mysuru, Karnataka");
            student.setDepartment(dept);
            student.setSemester(semester);

            // Academic Profiles:
            // 0: At Risk (10%), 1: Top Performer (10%), 2: Poor Attendance Only (10%), 3: Missing Assignments Only (10%), 4+: Average (60%)
            int profileType = i % 10;
            double targetAttendance;
            double targetInternals;
            double targetAssignments;
            double prevGpa;

            if (profileType == 0) { // At Risk
                targetAttendance = 45.0 + rand.nextDouble() * 20.0; // 45% - 65%
                targetInternals = 25.0 + rand.nextDouble() * 25.0;  // 25% - 50%
                targetAssignments = 20.0 + rand.nextDouble() * 30.0; // 20% - 50%
                prevGpa = 4.2 + rand.nextDouble() * 1.5;           // 4.2 - 5.7
            } else if (profileType == 1) { // Top Performer
                targetAttendance = 92.0 + rand.nextDouble() * 7.0;  // 92% - 99%
                targetInternals = 85.0 + rand.nextDouble() * 14.0;  // 85% - 99%
                targetAssignments = 90.0 + rand.nextDouble() * 10.0; // 90% - 100%
                prevGpa = 8.8 + rand.nextDouble() * 1.1;           // 8.8 - 9.9
            } else if (profileType == 2) { // Poor Attendance Only
                targetAttendance = 40.0 + rand.nextDouble() * 25.0; // 40% - 65%
                targetInternals = 70.0 + rand.nextDouble() * 15.0;  // 70% - 85%
                targetAssignments = 80.0 + rand.nextDouble() * 15.0; // 80% - 95%
                prevGpa = 6.8 + rand.nextDouble() * 1.2;           // 6.8 - 8.0
            } else if (profileType == 3) { // Missing Assignments Only
                targetAttendance = 82.0 + rand.nextDouble() * 13.0; // 82% - 95%
                targetInternals = 70.0 + rand.nextDouble() * 15.0;  // 70% - 85%
                targetAssignments = 20.0 + rand.nextDouble() * 25.0; // 20% - 45%
                prevGpa = 6.6 + rand.nextDouble() * 1.4;           // 6.6 - 8.0
            } else { // Average
                targetAttendance = 76.0 + rand.nextDouble() * 14.0; // 76% - 90%
                targetInternals = 60.0 + rand.nextDouble() * 20.0;  // 60% - 80%
                targetAssignments = 70.0 + rand.nextDouble() * 18.0; // 70% - 88%
                prevGpa = 6.4 + rand.nextDouble() * 1.8;           // 6.4 - 8.2
            }

            student.setPreviousAttendance(targetAttendance);
            student.setPreviousGpa(prevGpa);
            studentRepository.save(student);

            // Fetch course(s) based on semester
            List<Course> enrolledCourses = new ArrayList<>();
            if (semester == 2) {
                enrolledCourses.add(python);
            } else if (semester == 3) {
                enrolledCourses.add(ds);
                enrolledCourses.add(java);
            } else if (semester == 4) {
                enrolledCourses.add(dbms);
            } else {
                enrolledCourses.add(ml);
            }

            for (Course c : enrolledCourses) {
                Enrollment e = new Enrollment();
                e.setStudent(student);
                e.setCourse(c);
                e.setAcademicYear("2025-26");
                enrollmentRepository.save(e);

                // Seed Daily Attendance Records (last 30 weekdays)
                LocalDate day = LocalDate.now().minusDays(40);
                int recordsAdded = 0;
                while (recordsAdded < 30) {
                    if (day.getDayOfWeek() != DayOfWeek.SATURDAY && day.getDayOfWeek() != DayOfWeek.SUNDAY) {
                        Attendance att = new Attendance();
                        att.setEnrollment(e);
                        att.setDate(day);
                        att.setStatus(rand.nextDouble() * 100.0 <= targetAttendance ? Attendance.Status.PRESENT : Attendance.Status.ABSENT);
                        attendanceRepository.save(att);
                        recordsAdded++;
                    }
                    day = day.plusDays(1);
                }

                // Seed Internal Exam Marks
                BigDecimal i1Score = BigDecimal.valueOf(Math.round(50.0 * (targetInternals / 100.0) + (rand.nextDouble() * 6.0 - 3.0)));
                if (i1Score.compareTo(BigDecimal.valueOf(50.0)) > 0) i1Score = BigDecimal.valueOf(50.0);
                if (i1Score.compareTo(BigDecimal.ZERO) < 0) i1Score = BigDecimal.ZERO;

                BigDecimal i2Score = BigDecimal.valueOf(Math.round(50.0 * (targetInternals / 100.0) + (rand.nextDouble() * 6.0 - 3.0)));
                if (i2Score.compareTo(BigDecimal.valueOf(50.0)) > 0) i2Score = BigDecimal.valueOf(50.0);
                if (i2Score.compareTo(BigDecimal.ZERO) < 0) i2Score = BigDecimal.ZERO;

                Mark m1 = new Mark();
                m1.setEnrollment(e);
                m1.setAssessment("Internal 1");
                m1.setScore(i1Score);
                m1.setMaxScore(BigDecimal.valueOf(50.00));
                m1.setGrade(getLetterGrade(i1Score.doubleValue() * 2));
                markRepository.save(m1);

                Mark m2 = new Mark();
                m2.setEnrollment(e);
                m2.setAssessment("Internal 2");
                m2.setScore(i2Score);
                m2.setMaxScore(BigDecimal.valueOf(50.00));
                m2.setGrade(getLetterGrade(i2Score.doubleValue() * 2));
                markRepository.save(m2);

                // Seed Assignments Submissions & Mark entries
                List<Assignment> assignments = courseAssignmentsMap.get(c);
                for (int aIdx = 0; aIdx < assignments.size(); aIdx++) {
                    Assignment ass = assignments.get(aIdx);
                    boolean isSubmitted = rand.nextDouble() * 100.0 <= targetAssignments;

                    if (isSubmitted) {
                        BigDecimal assScore = BigDecimal.valueOf(Math.round(100.0 * (targetAssignments / 100.0) + (rand.nextDouble() * 10.0 - 5.0)));
                        if (assScore.compareTo(BigDecimal.valueOf(100.0)) > 0) assScore = BigDecimal.valueOf(100.0);
                        if (assScore.compareTo(BigDecimal.ZERO) < 0) assScore = BigDecimal.ZERO;

                        AssignmentSubmission sub = new AssignmentSubmission();
                        sub.setAssignment(ass);
                        sub.setStudent(student);
                        sub.setFilePath(ass.getTitle().toLowerCase().replace(" ", "_") + ".py");
                        sub.setScore(assScore);
                        sub.setStatus("EVALUATED");
                        sub.setSimilarityScore(BigDecimal.valueOf(Math.round(rand.nextDouble() * 20.0 * 10.0) / 10.0));
                        sub.setFeedback("Good structure. Follows principles and conventions.");
                        sub.setImprovementSuggestions("Refactor logic into smaller helper modules to keep it clean.");
                        assignmentSubmissionRepository.save(sub);

                        // Save corresponding mark record so AI Service counts it
                        Mark assMark = new Mark();
                        assMark.setEnrollment(e);
                        assMark.setAssessment(ass.getTitle());
                        assMark.setScore(assScore);
                        assMark.setMaxScore(BigDecimal.valueOf(100.00));
                        assMark.setGrade(getLetterGrade(assScore.doubleValue()));
                        markRepository.save(assMark);
                    } else if (aIdx == 0) {
                        // Create pending/missing submission for first assignment if target was missed
                        AssignmentSubmission sub = new AssignmentSubmission();
                        sub.setAssignment(ass);
                        sub.setStudent(student);
                        sub.setStatus("PENDING");
                        assignmentSubmissionRepository.save(sub);
                    }
                }
            }

            // Create Placement Readiness record for Semester 6 students
            if (semester == 6) {
                PlacementReadiness pr = new PlacementReadiness();
                pr.setStudent(student);
                double baseScore = 40.0 + (prevGpa / 10.0) * 55.0; // scale based on GPA
                
                pr.setAptitudeScore(BigDecimal.valueOf(Math.round((baseScore + rand.nextDouble() * 10.0 - 5.0) * 10.0) / 10.0));
                pr.setDsaScore(BigDecimal.valueOf(Math.round((baseScore + rand.nextDouble() * 12.0 - 6.0) * 10.0) / 10.0));
                pr.setCodingScore(BigDecimal.valueOf(Math.round((baseScore + rand.nextDouble() * 15.0 - 7.5) * 10.0) / 10.0));
                pr.setCommunicationScore(BigDecimal.valueOf(Math.round((55.0 + rand.nextDouble() * 40.0) * 10.0) / 10.0));
                pr.setResumeScore(BigDecimal.valueOf(Math.round((50.0 + rand.nextDouble() * 45.0) * 10.0) / 10.0));
                
                double probability = (pr.getAptitudeScore().doubleValue() + pr.getDsaScore().doubleValue() + pr.getCodingScore().doubleValue()) / 3.0;
                pr.setInterviewProbability(BigDecimal.valueOf(Math.round(probability * 10.0) / 10.0));
                pr.setSkillsGap(probability >= 80.0 ? "Excellent readiness. Suggested focus: advanced System Design and mock interviews." : "Revise key Data Structures (Graphs, Trees) and practice mock coding assessments.");
                placementReadinessRepository.save(pr);
            }
        }

        System.out.println("CampusCore database seeded successfully with 300 students, 20 faculty, and historical records.");
    }

    private String getLetterGrade(double scorePct) {
        if (scorePct >= 90.0) return "A+";
        if (scorePct >= 80.0) return "A";
        if (scorePct >= 70.0) return "B+";
        if (scorePct >= 60.0) return "B";
        if (scorePct >= 50.0) return "C";
        return "F";
    }
}
