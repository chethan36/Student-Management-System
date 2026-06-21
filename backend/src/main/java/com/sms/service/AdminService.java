package com.sms.service;

import com.sms.dto.ApiDtos.*;
import com.sms.entity.*;
import com.sms.exception.ApiException;
import com.sms.repository.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional
public class AdminService {
 private final UserRepository users;private final StudentRepository students;private final FacultyRepository faculty;private final DepartmentRepository departments;private final CourseRepository courses;private final EnrollmentRepository enrollments;private final PasswordEncoder encoder;
 public AdminService(UserRepository u,StudentRepository s,FacultyRepository f,DepartmentRepository d,CourseRepository c,EnrollmentRepository e,PasswordEncoder p){users=u;students=s;faculty=f;departments=d;courses=c;enrollments=e;encoder=p;}
 public Student saveStudent(Long id,PersonRequest r){Student s=id==null?new Student():students.findById(id).orElseThrow(()->ApiException.notFound("Student"));User u=id==null?new User():s.getUser();validatePassword(id,r.password());if(id==null&&users.existsByEmailIgnoreCase(r.email()))throw new ApiException(HttpStatus.CONFLICT,"Email already exists");u.setEmail(r.email().toLowerCase());u.setRole(Role.STUDENT);u.setEnabled(true);if(id==null||r.password()!=null&&!r.password().isBlank())u.setPassword(encoder.encode(r.password()));users.save(u);s.setUser(u);s.setUsn(r.identifier());s.setName(r.name());s.setPhone(r.phone());s.setSemester(r.semester());s.setDepartment(departments.findById(r.departmentId()).orElseThrow(()->ApiException.notFound("Department")));return students.save(s);}
 public Faculty saveFaculty(Long id,PersonRequest r){Faculty f=id==null?new Faculty():faculty.findById(id).orElseThrow(()->ApiException.notFound("Faculty"));User u=id==null?new User():f.getUser();validatePassword(id,r.password());if(id==null&&users.existsByEmailIgnoreCase(r.email()))throw new ApiException(HttpStatus.CONFLICT,"Email already exists");u.setEmail(r.email().toLowerCase());u.setRole(Role.FACULTY);u.setEnabled(true);if(id==null||r.password()!=null&&!r.password().isBlank())u.setPassword(encoder.encode(r.password()));users.save(u);f.setUser(u);f.setEmployeeId(r.identifier());f.setName(r.name());f.setPhone(r.phone());f.setDesignation(r.designation());f.setDepartment(departments.findById(r.departmentId()).orElseThrow(()->ApiException.notFound("Department")));return faculty.save(f);}
 public Course saveCourse(Long id,CourseRequest r){Course c=id==null?new Course():courses.findById(id).orElseThrow(()->ApiException.notFound("Course"));c.setCode(r.code());c.setName(r.name());c.setCredits(r.credits());c.setSemester(r.semester());c.setDepartment(departments.findById(r.departmentId()).orElseThrow(()->ApiException.notFound("Department")));c.setFaculty(r.facultyId()==null?null:faculty.findById(r.facultyId()).orElseThrow(()->ApiException.notFound("Faculty")));return courses.save(c);}
 public Enrollment enroll(EnrollmentRequest r){if(enrollments.findByStudentIdAndCourseId(r.studentId(),r.courseId()).isPresent())throw new ApiException(HttpStatus.CONFLICT,"Student already enrolled");var e=new Enrollment();e.setStudent(students.findById(r.studentId()).orElseThrow(()->ApiException.notFound("Student")));e.setCourse(courses.findById(r.courseId()).orElseThrow(()->ApiException.notFound("Course")));e.setAcademicYear(r.academicYear());return enrollments.save(e);}
 public Page<Student> students(String q,Pageable p){return q==null||q.isBlank()?students.findAll(p):students.search(q,p);}
 public void deleteStudent(Long id){var s=students.findById(id).orElseThrow(()->ApiException.notFound("Student"));students.delete(s);users.delete(s.getUser());}
 public void deleteFaculty(Long id){var f=faculty.findById(id).orElseThrow(()->ApiException.notFound("Faculty"));faculty.delete(f);users.delete(f.getUser());}
 private void validatePassword(Long id,String password){if(id==null&&(password==null||password.length()<8))throw new ApiException(HttpStatus.BAD_REQUEST,"Password must contain at least 8 characters");}
}
